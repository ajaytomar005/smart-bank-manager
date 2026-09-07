package com.smartbank.manager.transaction;

import java.math.BigDecimal;
import java.time.Instant;

public record TransactionResponse(
        Long txnId,
        Long accountId,
        TransactionType type,
        BigDecimal amount,
        TransactionStatus status,
        Instant txnTime,
        Long transferId,
        TransactionDirection direction,
        String counterpartyLabel
) {
    public static TransactionResponse from(Transaction transaction) {
        return new TransactionResponse(
                transaction.getTxnId(),
                transaction.getAccount().getAccountId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getStatus(),
                transaction.getTxnTime(),
                transaction.getTransferId(),
                transaction.getDirection(),
                transaction.getCounterpartyLabel());
    }
}
