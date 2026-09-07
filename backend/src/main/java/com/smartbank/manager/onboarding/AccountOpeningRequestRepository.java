package com.smartbank.manager.onboarding;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AccountOpeningRequestRepository extends JpaRepository<AccountOpeningRequest, Long> {

    @Query("""
            SELECT r FROM AccountOpeningRequest r
            JOIN FETCH r.customer
            LEFT JOIN FETCH r.tellerReviewedBy
            LEFT JOIN FETCH r.managerDecidedBy
            LEFT JOIN FETCH r.createdAccount
            WHERE r.customer.customerId = :customerId
            """)
    List<AccountOpeningRequest> findByCustomerCustomerId(Long customerId);

    @Query("""
            SELECT r FROM AccountOpeningRequest r
            JOIN FETCH r.customer
            LEFT JOIN FETCH r.tellerReviewedBy
            LEFT JOIN FETCH r.managerDecidedBy
            LEFT JOIN FETCH r.createdAccount
            """)
    List<AccountOpeningRequest> findAllWithDetails();
}
