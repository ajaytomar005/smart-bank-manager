package com.smartbank.manager.transfer;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record TransferRequest(
        @NotNull Long sourceAccountId,
        Long destinationAccountId,
        Long beneficiaryId,
        @NotNull TransferMode mode,
        @NotNull @DecimalMin(value = "0.01", message = "Amount must be positive") BigDecimal amount,
        @Size(max = 280) String remarks
) {
}
