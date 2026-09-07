package com.smartbank.manager.transfer;

import com.smartbank.manager.account.Account;
import com.smartbank.manager.account.AccountRepository;
import com.smartbank.manager.account.AccountStatus;
import com.smartbank.manager.audit.AuditService;
import com.smartbank.manager.common.BadRequestException;
import com.smartbank.manager.common.ResourceNotFoundException;
import com.smartbank.manager.customer.Customer;
import com.smartbank.manager.security.CurrentUserProvider;
import com.smartbank.manager.transaction.Transaction;
import com.smartbank.manager.transaction.TransactionDirection;
import com.smartbank.manager.transaction.TransactionRepository;
import com.smartbank.manager.transaction.TransactionStatus;
import com.smartbank.manager.transaction.TransactionType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FundTransferService {

    private static final BigDecimal RTGS_MINIMUM = new BigDecimal("200000");
    private static final BigDecimal IMPS_MAXIMUM = new BigDecimal("500000");

    private final FundTransferRepository fundTransferRepository;
    private final AccountRepository accountRepository;
    private final BeneficiaryService beneficiaryService;
    private final TransactionRepository transactionRepository;
    private final AuditService auditService;
    private final CurrentUserProvider currentUserProvider;

    public FundTransferService(
            FundTransferRepository fundTransferRepository,
            AccountRepository accountRepository,
            BeneficiaryService beneficiaryService,
            TransactionRepository transactionRepository,
            AuditService auditService,
            CurrentUserProvider currentUserProvider) {
        this.fundTransferRepository = fundTransferRepository;
        this.accountRepository = accountRepository;
        this.beneficiaryService = beneficiaryService;
        this.transactionRepository = transactionRepository;
        this.auditService = auditService;
        this.currentUserProvider = currentUserProvider;
    }

    public List<TransferResponse> listMyTransfers() {
        Long customerId = currentUserProvider.getCurrentCustomer().getCustomerId();
        return fundTransferRepository.findBySourceAccountCustomerCustomerId(customerId).stream()
                .map(t -> TransferResponse.from(t, resolveCounterpartyLabel(t)))
                .toList();
    }

    @Transactional
    public TransferResponse initiateTransfer(TransferRequest request) {
        Customer customer = currentUserProvider.getCurrentCustomer();

        Account source = accountRepository.findById(request.sourceAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + request.sourceAccountId()));
        if (!source.getCustomer().getCustomerId().equals(customer.getCustomerId())) {
            throw new ResourceNotFoundException("Account not found: " + request.sourceAccountId());
        }
        if (source.getStatus() != AccountStatus.ACTIVE) {
            throw new BadRequestException("Source account is not active");
        }

        validateModeLimits(request.mode(), request.amount());

        Account destination = resolveDestination(request, customer);

        if (source.getBalance().compareTo(request.amount()) < 0) {
            throw new BadRequestException("Insufficient balance for this transfer");
        }

        FundTransfer transfer = new FundTransfer();
        transfer.setSourceAccount(source);
        transfer.setDestinationAccount(destination);
        transfer.setInitiatedByCustomer(customer);
        transfer.setMode(request.mode());
        transfer.setAmount(request.amount());
        transfer.setRemarks(request.remarks());

        if (request.beneficiaryId() != null) {
            Beneficiary beneficiary = beneficiaryService.findOwnBeneficiaryOrThrow(request.beneficiaryId(), customer.getCustomerId());
            activateIfCooldownElapsed(beneficiary);
            if (beneficiary.getStatus() != BeneficiaryStatus.ACTIVE) {
                throw new BadRequestException("This beneficiary is still in its activation cooldown period");
            }
            transfer.setBeneficiary(beneficiary);
        }

        // Debit is committed immediately for every mode; only the COMPLETED marker is deferred for NEFT.
        source.setBalance(source.getBalance().subtract(request.amount()));
        accountRepository.save(source);

        String counterpartyLabel = buildCounterpartyLabel(request, destination);

        transfer.setStatus(request.mode() == TransferMode.NEFT ? TransferStatus.PROCESSING : TransferStatus.COMPLETED);
        if (transfer.getStatus() == TransferStatus.COMPLETED) {
            transfer.setCompletedAt(Instant.now());
        }
        transfer = fundTransferRepository.save(transfer);

        recordTransaction(source, request.amount(), TransactionDirection.DEBIT, transfer.getTransferId(), counterpartyLabel);

        if (destination != null) {
            destination.setBalance(destination.getBalance().add(request.amount()));
            accountRepository.save(destination);
            recordTransaction(
                    destination, request.amount(), TransactionDirection.CREDIT, transfer.getTransferId(),
                    "Transfer from " + source.getCustomer().getName());
        }

        auditService.recordCustomerAction(customer, "INITIATE_TRANSFER", "FundTransfer#" + transfer.getTransferId());
        return TransferResponse.from(transfer, counterpartyLabel);
    }

    private Account resolveDestination(TransferRequest request, Customer customer) {
        if (request.destinationAccountId() != null && request.beneficiaryId() != null) {
            throw new BadRequestException("Specify either destinationAccountId or beneficiaryId, not both");
        }
        if (request.destinationAccountId() == null && request.beneficiaryId() == null) {
            throw new BadRequestException("Specify a destinationAccountId (your own account) or a beneficiaryId");
        }

        if (request.destinationAccountId() != null) {
            Account destination = accountRepository.findById(request.destinationAccountId())
                    .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + request.destinationAccountId()));
            if (!destination.getCustomer().getCustomerId().equals(customer.getCustomerId())) {
                throw new ResourceNotFoundException("Account not found: " + request.destinationAccountId());
            }
            if (destination.getAccountId().equals(request.sourceAccountId())) {
                throw new BadRequestException("Source and destination accounts must be different");
            }
            return destination;
        }

        // beneficiaryId path: only INTERNAL_ACCOUNT beneficiaries resolve to a creditable in-bank account.
        Beneficiary beneficiary = beneficiaryService.findOwnBeneficiaryOrThrow(request.beneficiaryId(), customer.getCustomerId());
        return beneficiary.getBeneficiaryType() == BeneficiaryType.INTERNAL_ACCOUNT ? beneficiary.getInternalAccount() : null;
    }

    private void activateIfCooldownElapsed(Beneficiary beneficiary) {
        if (beneficiary.getStatus() == BeneficiaryStatus.PENDING_ACTIVATION
                && !Instant.now().isBefore(beneficiary.getActivatesAt())) {
            beneficiary.setStatus(BeneficiaryStatus.ACTIVE);
        }
    }

    private void validateModeLimits(TransferMode mode, BigDecimal amount) {
        if (mode == TransferMode.RTGS && amount.compareTo(RTGS_MINIMUM) < 0) {
            throw new BadRequestException("RTGS transfers require a minimum amount of Rs. " + RTGS_MINIMUM);
        }
        if (mode == TransferMode.IMPS && amount.compareTo(IMPS_MAXIMUM) > 0) {
            throw new BadRequestException("IMPS transfers are capped at Rs. " + IMPS_MAXIMUM);
        }
    }

    private String buildCounterpartyLabel(TransferRequest request, Account destination) {
        if (destination != null) {
            return "Transfer to account #" + destination.getAccountId();
        }
        return "Transfer via " + request.mode();
    }

    private void recordTransaction(
            Account account, BigDecimal amount, TransactionDirection direction, Long transferId, String counterpartyLabel) {
        Transaction transaction = new Transaction();
        transaction.setAccount(account);
        transaction.setType(TransactionType.TRANSFER);
        transaction.setAmount(amount);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setTransferId(transferId);
        transaction.setDirection(direction);
        transaction.setCounterpartyLabel(counterpartyLabel);
        transactionRepository.save(transaction);
    }

    private String resolveCounterpartyLabel(FundTransfer transfer) {
        if (transfer.getDestinationAccount() != null) {
            return "Account #" + transfer.getDestinationAccount().getAccountId();
        }
        if (transfer.getBeneficiary() != null) {
            return transfer.getBeneficiary().getNickname();
        }
        return transfer.getMode().name();
    }
}
