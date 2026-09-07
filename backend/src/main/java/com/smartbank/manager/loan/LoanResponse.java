package com.smartbank.manager.loan;

import java.math.BigDecimal;
import java.time.Instant;

public record LoanResponse(
        Long loanId,
        Long customerId,
        BigDecimal amount,
        BigDecimal interestRate,
        Integer creditScore,
        RiskFlag riskFlag,
        LoanStatus status,
        Integer termMonths,
        Instant createdAt
) {
    public static LoanResponse from(Loan loan) {
        return new LoanResponse(
                loan.getLoanId(),
                loan.getCustomer().getCustomerId(),
                loan.getAmount(),
                loan.getInterestRate(),
                loan.getCreditScore(),
                loan.getRiskFlag(),
                loan.getStatus(),
                loan.getTermMonths(),
                loan.getCreatedAt());
    }
}
