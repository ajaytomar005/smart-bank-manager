package com.smartbank.manager.transfer;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FundTransferRepository extends JpaRepository<FundTransfer, Long> {
    List<FundTransfer> findBySourceAccountCustomerCustomerId(Long customerId);

    List<FundTransfer> findByStatus(TransferStatus status);
}
