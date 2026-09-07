package com.smartbank.manager.customer;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    boolean existsByEmail(String email);

    long countByKycStatus(KycStatus kycStatus);

    Optional<Customer> findByEmail(String email);
}
