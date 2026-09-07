package com.smartbank.manager.fraud;

import jakarta.validation.constraints.NotNull;

public record FraudAlertStatusRequest(
        @NotNull FraudAlertStatus status
) {
}
