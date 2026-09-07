package com.smartbank.manager.portal;

import com.smartbank.manager.loan.EmiResponse;
import com.smartbank.manager.loan.LoanResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/me/loans")
public class MyLoanController {

    private final MyLoanService myLoanService;

    public MyLoanController(MyLoanService myLoanService) {
        this.myLoanService = myLoanService;
    }

    @GetMapping
    public List<LoanResponse> listMyLoans() {
        return myLoanService.listMyLoans();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LoanResponse applyForLoan(@Valid @RequestBody MyLoanRequest request) {
        return myLoanService.applyForLoan(request);
    }

    @GetMapping("/{loanId}/emis")
    public List<EmiResponse> listMyLoanEmis(@PathVariable Long loanId) {
        return myLoanService.listMyLoanEmis(loanId);
    }
}
