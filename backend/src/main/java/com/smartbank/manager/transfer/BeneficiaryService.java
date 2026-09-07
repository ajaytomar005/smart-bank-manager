package com.smartbank.manager.transfer;

import com.smartbank.manager.account.Account;
import com.smartbank.manager.account.AccountRepository;
import com.smartbank.manager.audit.AuditService;
import com.smartbank.manager.common.BadRequestException;
import com.smartbank.manager.common.ResourceNotFoundException;
import com.smartbank.manager.customer.Customer;
import com.smartbank.manager.security.CurrentUserProvider;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BeneficiaryService {

    static final Duration ACTIVATION_COOLDOWN = Duration.ofMinutes(30);

    private final BeneficiaryRepository beneficiaryRepository;
    private final AccountRepository accountRepository;
    private final AuditService auditService;
    private final CurrentUserProvider currentUserProvider;

    public BeneficiaryService(
            BeneficiaryRepository beneficiaryRepository,
            AccountRepository accountRepository,
            AuditService auditService,
            CurrentUserProvider currentUserProvider) {
        this.beneficiaryRepository = beneficiaryRepository;
        this.accountRepository = accountRepository;
        this.auditService = auditService;
        this.currentUserProvider = currentUserProvider;
    }

    public List<BeneficiaryResponse> listMyBeneficiaries() {
        Long customerId = currentUserProvider.getCurrentCustomer().getCustomerId();
        return beneficiaryRepository.findByCustomerCustomerIdAndStatusNot(customerId, BeneficiaryStatus.REMOVED)
                .stream()
                .map(BeneficiaryResponse::from)
                .toList();
    }

    @Transactional
    public BeneficiaryResponse addBeneficiary(BeneficiaryRequest request) {
        Customer customer = currentUserProvider.getCurrentCustomer();

        Beneficiary beneficiary = new Beneficiary();
        beneficiary.setCustomer(customer);
        beneficiary.setNickname(request.nickname());
        beneficiary.setBeneficiaryType(request.beneficiaryType());
        beneficiary.setStatus(BeneficiaryStatus.PENDING_ACTIVATION);
        beneficiary.setActivatesAt(Instant.now().plus(ACTIVATION_COOLDOWN));

        switch (request.beneficiaryType()) {
            case INTERNAL_ACCOUNT -> {
                if (request.internalAccountId() == null) {
                    throw new BadRequestException("internalAccountId is required for an internal account beneficiary");
                }
                Account account = accountRepository.findById(request.internalAccountId())
                        .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + request.internalAccountId()));
                beneficiary.setInternalAccount(account);
            }
            case EXTERNAL_BANK -> {
                if (request.accountNumber() == null || request.ifscCode() == null) {
                    throw new BadRequestException("accountNumber and ifscCode are required for an external bank beneficiary");
                }
                beneficiary.setAccountNumber(request.accountNumber());
                beneficiary.setIfscCode(request.ifscCode());
            }
            case UPI -> {
                if (request.upiId() == null || request.upiId().isBlank()) {
                    throw new BadRequestException("upiId is required for a UPI beneficiary");
                }
                beneficiary.setUpiId(request.upiId());
            }
        }

        beneficiary = beneficiaryRepository.save(beneficiary);
        auditService.recordCustomerAction(customer, "ADD_BENEFICIARY", "Beneficiary#" + beneficiary.getBeneficiaryId());
        return BeneficiaryResponse.from(beneficiary);
    }

    @Transactional
    public void removeBeneficiary(Long beneficiaryId) {
        Customer customer = currentUserProvider.getCurrentCustomer();
        Beneficiary beneficiary = findOwnBeneficiaryOrThrow(beneficiaryId, customer.getCustomerId());
        beneficiary.setStatus(BeneficiaryStatus.REMOVED);
        beneficiaryRepository.save(beneficiary);
        auditService.recordCustomerAction(customer, "REMOVE_BENEFICIARY", "Beneficiary#" + beneficiary.getBeneficiaryId());
    }

    Beneficiary findOwnBeneficiaryOrThrow(Long beneficiaryId, Long customerId) {
        Beneficiary beneficiary = beneficiaryRepository.findById(beneficiaryId)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found: " + beneficiaryId));
        if (!beneficiary.getCustomer().getCustomerId().equals(customerId)) {
            throw new ResourceNotFoundException("Beneficiary not found: " + beneficiaryId);
        }
        return beneficiary;
    }
}
