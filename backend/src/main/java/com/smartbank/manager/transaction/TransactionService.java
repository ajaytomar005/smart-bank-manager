package com.smartbank.manager.transaction;

import com.smartbank.manager.account.Account;
import com.smartbank.manager.account.AccountRepository;
import com.smartbank.manager.account.AccountStatus;
import com.smartbank.manager.audit.AuditService;
import com.smartbank.manager.common.BadRequestException;
import com.smartbank.manager.common.ResourceNotFoundException;
import com.smartbank.manager.security.CurrentUserProvider;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final AuditService auditService;
    private final CurrentUserProvider currentUserProvider;

    public TransactionService(
            TransactionRepository transactionRepository,
            AccountRepository accountRepository,
            AuditService auditService,
            CurrentUserProvider currentUserProvider) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.auditService = auditService;
        this.currentUserProvider = currentUserProvider;
    }

    public List<TransactionResponse> listTransactions() {
        return transactionRepository.findAll().stream().map(TransactionResponse::from).toList();
    }

    public List<TransactionResponse> listByAccount(Long accountId) {
        return transactionRepository.findByAccountAccountId(accountId).stream()
                .map(TransactionResponse::from)
                .toList();
    }

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request) {
        Account account = accountRepository.findById(request.accountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + request.accountId()));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BadRequestException("Cannot transact on an account that is not active");
        }

        if (request.type() == TransactionType.TRANSFER) {
            throw new BadRequestException("Transfers are not supported yet");
        }

        if (request.type() == TransactionType.WITHDRAWAL && account.getBalance().compareTo(request.amount()) < 0) {
            throw new BadRequestException("Insufficient balance for this withdrawal");
        }

        Transaction transaction = new Transaction();
        transaction.setAccount(account);
        transaction.setType(request.type());
        transaction.setAmount(request.amount());
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction = transactionRepository.save(transaction);

        if (request.type() == TransactionType.DEPOSIT) {
            account.setBalance(account.getBalance().add(request.amount()));
        } else {
            account.setBalance(account.getBalance().subtract(request.amount()));
        }
        accountRepository.save(account);

        auditService.record(
                currentUserProvider.getCurrentEmployee(),
                request.type() + "_TRANSACTION",
                "Account#" + account.getAccountId());
        return TransactionResponse.from(transaction);
    }
}
