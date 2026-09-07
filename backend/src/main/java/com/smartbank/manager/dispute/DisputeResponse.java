package com.smartbank.manager.dispute;

import java.time.Instant;

public record DisputeResponse(
        Long disputeId,
        Long customerId,
        Long txnId,
        String reason,
        DisputeStatus status,
        String resolutionNotes,
        Instant raisedAt,
        Instant resolvedAt
) {
    public static DisputeResponse from(Dispute dispute) {
        return new DisputeResponse(
                dispute.getDisputeId(),
                dispute.getCustomer().getCustomerId(),
                dispute.getTransaction() == null ? null : dispute.getTransaction().getTxnId(),
                dispute.getReason(),
                dispute.getStatus(),
                dispute.getResolutionNotes(),
                dispute.getRaisedAt(),
                dispute.getResolvedAt());
    }
}
