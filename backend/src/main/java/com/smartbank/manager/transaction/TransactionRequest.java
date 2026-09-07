package com.smartbank.manager.transaction;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record TransactionRequest(
        @NotNull Long accountId,
        @NotNull TransactionType type,
        @NotNull @DecimalMin(value = "0.01", message = "Amount must be positive") BigDecimal amount
) {
}
