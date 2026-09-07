package com.smartbank.manager.audit;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a LEFT JOIN FETCH a.employee LEFT JOIN FETCH a.customer ORDER BY a.timestamp DESC")
    List<AuditLog> findAllWithActors();

    @Query("SELECT a FROM AuditLog a LEFT JOIN FETCH a.employee LEFT JOIN FETCH a.customer WHERE a.customer.customerId = :customerId ORDER BY a.timestamp DESC")
    List<AuditLog> findByCustomerId(Long customerId);
}
