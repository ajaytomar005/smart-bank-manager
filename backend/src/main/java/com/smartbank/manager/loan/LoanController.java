package com.smartbank.manager.loan;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/loans")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @GetMapping
    public List<LoanResponse> listLoans() {
        return loanService.listLoans();
    }

    @GetMapping("/{loanId}")
    public LoanResponse getLoan(@PathVariable Long loanId) {
        return loanService.getLoan(loanId);
    }

    @GetMapping("/{loanId}/emis")
    public List<EmiResponse> listEmis(@PathVariable Long loanId) {
        return loanService.listEmis(loanId);
    }

    @GetMapping("/{loanId}/approvals")
    public List<ApprovalResponse> listApprovals(@PathVariable Long loanId) {
        return loanService.listApprovals(loanId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('LOAN_OFFICER', 'MANAGER', 'ADMIN')")
    public LoanResponse applyForLoan(@Valid @RequestBody LoanRequest request) {
        return loanService.applyForLoan(request);
    }

    @PostMapping("/{loanId}/approve")
    @PreAuthorize("hasAnyRole('LOAN_OFFICER', 'MANAGER')")
    public LoanResponse decide(@PathVariable Long loanId, @Valid @RequestBody LoanDecisionRequest request) {
        return loanService.decide(loanId, request);
    }
}
