package com.smartbank.manager.transfer;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/transfers")
@PreAuthorize("hasAnyRole('COMPLIANCE_OFFICER', 'MANAGER', 'ADMIN')")
public class TransferController {

    private final FundTransferRepository fundTransferRepository;

    public TransferController(FundTransferRepository fundTransferRepository) {
        this.fundTransferRepository = fundTransferRepository;
    }

    @GetMapping
    public List<TransferResponse> listAllTransfers() {
        return fundTransferRepository.findAll().stream()
                .map(t -> TransferResponse.from(t, null))
                .toList();
    }
}
