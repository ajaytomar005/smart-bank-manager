package com.smartbank.manager.fraud;

import java.time.Instant;

public record FraudAlertResponse(
        Long alertId,
        Long accountId,
        String reason,
        FraudSeverity severity,
        FraudAlertStatus status,
        Instant raisedAt
) {
    public static FraudAlertResponse from(FraudAlert alert) {
        return new FraudAlertResponse(
                alert.getAlertId(),
                alert.getAccount().getAccountId(),
                alert.getReason(),
                alert.getSeverity(),
                alert.getStatus(),
                alert.getRaisedAt());
    }
}
