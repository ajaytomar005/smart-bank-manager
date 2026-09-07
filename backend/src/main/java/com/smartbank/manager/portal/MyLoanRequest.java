package com.smartbank.manager.portal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record MyLoanRequest(
        @NotNull @DecimalMin(value = "0.01", message = "Amount must be positive") BigDecimal amount,
        @NotNull @DecimalMin(value = "0.0", message = "Interest rate cannot be negative") BigDecimal interestRate,
        @Min(300) @Max(900) Integer creditScore,
        @NotNull @Min(1) @Max(360) Integer termMonths
) {
}
