package com.smartbank.manager.transfer;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {
    List<Beneficiary> findByCustomerCustomerIdAndStatusNot(Long customerId, BeneficiaryStatus status);
}
