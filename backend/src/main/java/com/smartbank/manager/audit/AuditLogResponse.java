package com.smartbank.manager.audit;

import java.time.Instant;

public record AuditLogResponse(
        Long logId,
        String actorType,
        Long actorId,
        String actorName,
        String action,
        String entity,
        Instant timestamp
) {
    public static AuditLogResponse from(AuditLog log) {
        if (log.getEmployee() != null) {
            return new AuditLogResponse(
                    log.getLogId(),
                    "STAFF",
                    log.getEmployee().getEmployeeId(),
                    log.getEmployee().getName(),
                    log.getAction(),
                    log.getEntity(),
                    log.getTimestamp());
        }
        return new AuditLogResponse(
                log.getLogId(),
                "CUSTOMER",
                log.getCustomer().getCustomerId(),
                log.getCustomer().getName(),
                log.getAction(),
                log.getEntity(),
                log.getTimestamp());
    }
}
