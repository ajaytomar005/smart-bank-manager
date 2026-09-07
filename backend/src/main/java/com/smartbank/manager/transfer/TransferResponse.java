package com.smartbank.manager.transfer;

import java.math.BigDecimal;
import java.time.Instant;

public record TransferResponse(
        Long transferId,
        Long sourceAccountId,
        Long destinationAccountId,
        Long beneficiaryId,
        String counterpartyLabel,
        TransferMode mode,
        BigDecimal amount,
        String remarks,
        TransferStatus status,
        String failureReason,
        Instant initiatedAt,
        Instant completedAt
) {
    public static TransferResponse from(FundTransfer t, String counterpartyLabel) {
        return new TransferResponse(
                t.getTransferId(),
                t.getSourceAccount().getAccountId(),
                t.getDestinationAccount() == null ? null : t.getDestinationAccount().getAccountId(),
                t.getBeneficiary() == null ? null : t.getBeneficiary().getBeneficiaryId(),
                counterpartyLabel,
                t.getMode(),
                t.getAmount(),
                t.getRemarks(),
                t.getStatus(),
                t.getFailureReason(),
                t.getInitiatedAt(),
                t.getCompletedAt());
    }
}
