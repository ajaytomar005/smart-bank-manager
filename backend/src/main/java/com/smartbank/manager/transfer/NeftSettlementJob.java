package com.smartbank.manager.transfer;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Simulates NEFT's batched settlement: PROCESSING transfers complete shortly after initiation. */
@Component
public class NeftSettlementJob {

    private static final Duration SETTLEMENT_DELAY = Duration.ofSeconds(90);

    private final FundTransferRepository fundTransferRepository;

    public NeftSettlementJob(FundTransferRepository fundTransferRepository) {
        this.fundTransferRepository = fundTransferRepository;
    }

    @Scheduled(fixedRate = 30_000)
    @Transactional
    public void settleDueNeftTransfers() {
        Instant now = Instant.now();
        List<FundTransfer> processing = fundTransferRepository.findByStatus(TransferStatus.PROCESSING);
        for (FundTransfer transfer : processing) {
            if (Duration.between(transfer.getInitiatedAt(), now).compareTo(SETTLEMENT_DELAY) >= 0) {
                transfer.setStatus(TransferStatus.COMPLETED);
                transfer.setCompletedAt(now);
            }
        }
        fundTransferRepository.saveAll(processing);
    }
}
