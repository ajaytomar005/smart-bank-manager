package com.smartbank.manager.fraud;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FraudAlertRequest(
        @NotNull Long accountId,
        @NotBlank String reason,
        @NotNull FraudSeverity severity
) {
}
