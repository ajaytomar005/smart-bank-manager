package com.smartbank.manager.dispute;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DisputeRepository extends JpaRepository<Dispute, Long> {
    List<Dispute> findByCustomerCustomerId(Long customerId);
}
