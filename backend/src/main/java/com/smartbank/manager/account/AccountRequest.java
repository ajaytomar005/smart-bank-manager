package com.smartbank.manager.account;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record AccountRequest(
        @NotNull Long customerId,
        @NotNull AccountType accountType,
        @DecimalMin(value = "0.0", message = "Initial deposit cannot be negative") BigDecimal initialDeposit
) {
}
