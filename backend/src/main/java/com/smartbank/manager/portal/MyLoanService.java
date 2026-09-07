package com.smartbank.manager.portal;

import com.smartbank.manager.audit.AuditService;
import com.smartbank.manager.common.ResourceNotFoundException;
import com.smartbank.manager.customer.Customer;
import com.smartbank.manager.loan.Emi;
import com.smartbank.manager.loan.EmiRepository;
import com.smartbank.manager.loan.EmiResponse;
import com.smartbank.manager.loan.Loan;
import com.smartbank.manager.loan.LoanRepository;
import com.smartbank.manager.loan.LoanResponse;
import com.smartbank.manager.loan.LoanStatus;
import com.smartbank.manager.security.CurrentUserProvider;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MyLoanService {

    private final LoanRepository loanRepository;
    private final EmiRepository emiRepository;
    private final AuditService auditService;
    private final CurrentUserProvider currentUserProvider;

    public MyLoanService(
            LoanRepository loanRepository,
            EmiRepository emiRepository,
            AuditService auditService,
            CurrentUserProvider currentUserProvider) {
        this.loanRepository = loanRepository;
        this.emiRepository = emiRepository;
        this.auditService = auditService;
        this.currentUserProvider = currentUserProvider;
    }

    public List<LoanResponse> listMyLoans() {
        Long customerId = currentUserProvider.getCurrentCustomer().getCustomerId();
        return loanRepository.findByCustomerCustomerId(customerId).stream().map(LoanResponse::from).toList();
    }

    public List<EmiResponse> listMyLoanEmis(Long loanId) {
        Loan loan = findOwnLoanOrThrow(loanId);
        return emiRepository.findByLoanLoanId(loan.getLoanId()).stream().map(EmiResponse::from).toList();
    }

    @Transactional
    public LoanResponse applyForLoan(MyLoanRequest request) {
        Customer customer = currentUserProvider.getCurrentCustomer();

        Loan loan = new Loan();
        loan.setCustomer(customer);
        loan.setAmount(request.amount());
        loan.setInterestRate(request.interestRate());
        loan.setCreditScore(request.creditScore());
        loan.setTermMonths(request.termMonths());
        loan.setStatus(LoanStatus.PENDING);
        loan = loanRepository.save(loan);

        auditService.recordCustomerAction(customer, "APPLY_LOAN", "Loan#" + loan.getLoanId());
        return LoanResponse.from(loan);
    }

    private Loan findOwnLoanOrThrow(Long loanId) {
        Long customerId = currentUserProvider.getCurrentCustomer().getCustomerId();
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + loanId));
        if (!loan.getCustomer().getCustomerId().equals(customerId)) {
            throw new ResourceNotFoundException("Loan not found: " + loanId);
        }
        return loan;
    }
}
