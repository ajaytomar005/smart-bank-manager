package com.smartbank.manager.atm;

import java.time.Instant;
import java.util.List;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AtmOfflineSweepJob {

    private final AtmRepository atmRepository;

    public AtmOfflineSweepJob(AtmRepository atmRepository) {
        this.atmRepository = atmRepository;
    }

    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void flipStaleAtmsOffline() {
        Instant threshold = Instant.now().minus(AtmAvailabilityCalculator.HEARTBEAT_FRESHNESS);
        List<Atm> staleAtms = atmRepository.findByStatusAndLastHeartbeatAtBefore(AtmStatus.ONLINE, threshold);
        for (Atm atm : staleAtms) {
            atm.setStatus(AtmStatus.OFFLINE);
            atm.setUpdatedAt(Instant.now());
        }
        if (!staleAtms.isEmpty()) {
            atmRepository.saveAll(staleAtms);
        }
    }
}
