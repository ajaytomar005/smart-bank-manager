package com.smartbank.manager.loan;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EmiResponse(
        Long emiId,
        Long loanId,
        BigDecimal amount,
        LocalDate dueDate,
        EmiStatus status
) {
    public static EmiResponse from(Emi emi) {
        return new EmiResponse(
                emi.getEmiId(),
                emi.getLoan().getLoanId(),
                emi.getAmount(),
                emi.getDueDate(),
                emi.getStatus());
    }
}
