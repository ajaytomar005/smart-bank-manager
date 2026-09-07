package com.smartbank.manager.account;

import com.smartbank.manager.audit.AuditService;
import com.smartbank.manager.common.BadRequestException;
import com.smartbank.manager.common.ResourceNotFoundException;
import com.smartbank.manager.customer.Customer;
import com.smartbank.manager.customer.CustomerRepository;
import com.smartbank.manager.security.CurrentUserProvider;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final AuditService auditService;
    private final CurrentUserProvider currentUserProvider;

    public AccountService(
            AccountRepository accountRepository,
            CustomerRepository customerRepository,
            AuditService auditService,
            CurrentUserProvider currentUserProvider) {
        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
        this.auditService = auditService;
        this.currentUserProvider = currentUserProvider;
    }

    public List<AccountResponse> listAccounts() {
        return accountRepository.findAll().stream()
                .map(AccountResponse::from)
                .toList();
    }

    public AccountResponse getAccount(Long accountId) {
        return AccountResponse.from(findAccountOrThrow(accountId));
    }

    @Transactional
    public AccountResponse openAccount(AccountRequest request) {
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + request.customerId()));

        Account account = new Account();
        account.setCustomer(customer);
        account.setAccountType(request.accountType());
        account.setBalance(request.initialDeposit() == null ? BigDecimal.ZERO : request.initialDeposit());
        account = accountRepository.save(account);

        auditService.record(currentUserProvider.getCurrentEmployee(), "OPEN_ACCOUNT", "Account#" + account.getAccountId());
        return AccountResponse.from(account);
    }

    @Transactional
    public AccountResponse freeze(Long accountId) {
        Account account = findAccountOrThrow(accountId);
        if (account.getStatus() == AccountStatus.CLOSED) {
            throw new BadRequestException("Cannot freeze a closed account");
        }
        account.setStatus(AccountStatus.FROZEN);
        account = accountRepository.save(account);

        auditService.record(currentUserProvider.getCurrentEmployee(), "FREEZE_ACCOUNT", "Account#" + account.getAccountId());
        return AccountResponse.from(account);
    }

    @Transactional
    public AccountResponse unfreeze(Long accountId) {
        Account account = findAccountOrThrow(accountId);
        if (account.getStatus() != AccountStatus.FROZEN) {
            throw new BadRequestException("Account is not frozen");
        }
        account.setStatus(AccountStatus.ACTIVE);
        account = accountRepository.save(account);

        auditService.record(currentUserProvider.getCurrentEmployee(), "UNFREEZE_ACCOUNT", "Account#" + account.getAccountId());
        return AccountResponse.from(account);
    }

    private Account findAccountOrThrow(Long accountId) {
        return accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountId));
    }
}
