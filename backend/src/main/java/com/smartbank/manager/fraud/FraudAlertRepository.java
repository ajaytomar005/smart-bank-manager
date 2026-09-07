package com.smartbank.manager.fraud;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FraudAlertRepository extends JpaRepository<FraudAlert, Long> {
    List<FraudAlert> findByStatus(FraudAlertStatus status);

    long countByStatus(FraudAlertStatus status);
}
