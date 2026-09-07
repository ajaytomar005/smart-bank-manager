package com.smartbank.manager.portal;

import com.smartbank.manager.account.Account;
import com.smartbank.manager.account.AccountRepository;
import com.smartbank.manager.account.AccountResponse;
import com.smartbank.manager.common.ResourceNotFoundException;
import com.smartbank.manager.security.CurrentUserProvider;
import com.smartbank.manager.transaction.TransactionRepository;
import com.smartbank.manager.transaction.TransactionResponse;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class MyAccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final CurrentUserProvider currentUserProvider;

    public MyAccountService(
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            CurrentUserProvider currentUserProvider) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.currentUserProvider = currentUserProvider;
    }

    public List<AccountResponse> listMyAccounts() {
        Long customerId = currentUserProvider.getCurrentCustomer().getCustomerId();
        return accountRepository.findByCustomerCustomerId(customerId).stream()
                .map(AccountResponse::from)
                .toList();
    }

    public List<TransactionResponse> listMyAccountTransactions(Long accountId) {
        Account account = findOwnAccountOrThrow(accountId);
        return transactionRepository.findByAccountAccountId(account.getAccountId()).stream()
                .map(TransactionResponse::from)
                .toList();
    }

    Account findOwnAccountOrThrow(Long accountId) {
        Long customerId = currentUserProvider.getCurrentCustomer().getCustomerId();
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountId));
        if (!account.getCustomer().getCustomerId().equals(customerId)) {
            throw new ResourceNotFoundException("Account not found: " + accountId);
        }
        return account;
    }
}
