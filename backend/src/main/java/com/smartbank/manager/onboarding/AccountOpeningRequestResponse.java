package com.smartbank.manager.onboarding;

import com.smartbank.manager.account.AccountType;
import java.math.BigDecimal;
import java.time.Instant;

public record AccountOpeningRequestResponse(
        Long requestId,
        Long customerId,
        String customerName,
        AccountType accountType,
        BigDecimal initialDeposit,
        AccountRequestStatus status,
        String tellerReviewedByName,
        Instant tellerReviewedAt,
        String tellerNotes,
        String managerDecidedByName,
        Instant managerDecidedAt,
        String managerNotes,
        Long createdAccountId,
        Instant requestedAt
) {
    public static AccountOpeningRequestResponse from(AccountOpeningRequest r) {
        return new AccountOpeningRequestResponse(
                r.getRequestId(),
                r.getCustomer().getCustomerId(),
                r.getCustomer().getName(),
                r.getAccountType(),
                r.getInitialDeposit(),
                r.getStatus(),
                r.getTellerReviewedBy() == null ? null : r.getTellerReviewedBy().getName(),
                r.getTellerReviewedAt(),
                r.getTellerNotes(),
                r.getManagerDecidedBy() == null ? null : r.getManagerDecidedBy().getName(),
                r.getManagerDecidedAt(),
                r.getManagerNotes(),
                r.getCreatedAccount() == null ? null : r.getCreatedAccount().getAccountId(),
                r.getRequestedAt());
    }
}
