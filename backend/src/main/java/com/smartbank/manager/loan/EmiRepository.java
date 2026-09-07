package com.smartbank.manager.loan;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmiRepository extends JpaRepository<Emi, Long> {
    List<Emi> findByLoanLoanId(Long loanId);
}
