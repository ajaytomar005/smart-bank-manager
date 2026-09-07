package com.smartbank.manager.portal;

import com.smartbank.manager.transfer.BeneficiaryRequest;
import com.smartbank.manager.transfer.BeneficiaryResponse;
import com.smartbank.manager.transfer.BeneficiaryService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/me/beneficiaries")
public class MyBeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    public MyBeneficiaryController(BeneficiaryService beneficiaryService) {
        this.beneficiaryService = beneficiaryService;
    }

    @GetMapping
    public List<BeneficiaryResponse> listMyBeneficiaries() {
        return beneficiaryService.listMyBeneficiaries();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BeneficiaryResponse addBeneficiary(@Valid @RequestBody BeneficiaryRequest request) {
        return beneficiaryService.addBeneficiary(request);
    }

    @DeleteMapping("/{beneficiaryId}")
    public void removeBeneficiary(@PathVariable Long beneficiaryId) {
        beneficiaryService.removeBeneficiary(beneficiaryId);
    }
}
