package com.smartbank.manager.portal;

import com.smartbank.manager.transfer.FundTransferService;
import com.smartbank.manager.transfer.TransferRequest;
import com.smartbank.manager.transfer.TransferResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/me/transfers")
public class MyTransferController {

    private final FundTransferService fundTransferService;

    public MyTransferController(FundTransferService fundTransferService) {
        this.fundTransferService = fundTransferService;
    }

    @GetMapping
    public List<TransferResponse> listMyTransfers() {
        return fundTransferService.listMyTransfers();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransferResponse initiateTransfer(@Valid @RequestBody TransferRequest request) {
        return fundTransferService.initiateTransfer(request);
    }
}
