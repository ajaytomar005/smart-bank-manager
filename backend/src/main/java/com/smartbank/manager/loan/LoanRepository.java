package com.smartbank.manager.loan;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByCustomerCustomerId(Long customerId);

    long countByStatusIn(List<LoanStatus> statuses);
}
