package com.smartbank.manager.account;

import java.math.BigDecimal;
import java.time.Instant;

public record AccountResponse(
        Long accountId,
        Long customerId,
        AccountType accountType,
        BigDecimal balance,
        AccountStatus status,
        Instant openedAt
) {
    public static AccountResponse from(Account account) {
        return new AccountResponse(
                account.getAccountId(),
                account.getCustomer().getCustomerId(),
                account.getAccountType(),
                account.getBalance(),
                account.getStatus(),
                account.getOpenedAt());
    }
}
