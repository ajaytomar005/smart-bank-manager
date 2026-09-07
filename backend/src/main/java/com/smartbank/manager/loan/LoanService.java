package com.smartbank.manager.loan;

import com.smartbank.manager.audit.AuditService;
import com.smartbank.manager.common.BadRequestException;
import com.smartbank.manager.common.ResourceNotFoundException;
import com.smartbank.manager.customer.Customer;
import com.smartbank.manager.customer.CustomerRepository;
import com.smartbank.manager.employee.Employee;
import com.smartbank.manager.employee.EmployeeStatus;
import com.smartbank.manager.security.CurrentUserProvider;
import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LoanService {

    private final LoanRepository loanRepository;
    private final EmiRepository emiRepository;
    private final ApprovalRepository approvalRepository;
    private final CustomerRepository customerRepository;
    private final AuditService auditService;
    private final CurrentUserProvider currentUserProvider;
    private final BigDecimal managerApprovalThreshold;

    public LoanService(
            LoanRepository loanRepository,
            EmiRepository emiRepository,
            ApprovalRepository approvalRepository,
            CustomerRepository customerRepository,
            AuditService auditService,
            CurrentUserProvider currentUserProvider,
            @Value("${app.loan.manager-approval-threshold}") BigDecimal managerApprovalThreshold) {
        this.loanRepository = loanRepository;
        this.emiRepository = emiRepository;
        this.approvalRepository = approvalRepository;
        this.customerRepository = customerRepository;
        this.auditService = auditService;
        this.currentUserProvider = currentUserProvider;
        this.managerApprovalThreshold = managerApprovalThreshold;
    }

    public List<LoanResponse> listLoans() {
        return loanRepository.findAll().stream().map(LoanResponse::from).toList();
    }

    public LoanResponse getLoan(Long loanId) {
        return LoanResponse.from(findLoanOrThrow(loanId));
    }

    public List<EmiResponse> listEmis(Long loanId) {
        return emiRepository.findByLoanLoanId(loanId).stream().map(EmiResponse::from).toList();
    }

    public List<ApprovalResponse> listApprovals(Long loanId) {
        return approvalRepository.findByLoanLoanId(loanId).stream().map(ApprovalResponse::from).toList();
    }

    @Transactional
    public LoanResponse applyForLoan(LoanRequest request) {
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + request.customerId()));

        Loan loan = new Loan();
        loan.setCustomer(customer);
        loan.setAmount(request.amount());
        loan.setInterestRate(request.interestRate());
        loan.setCreditScore(request.creditScore());
        loan.setTermMonths(request.termMonths());
        loan.setStatus(LoanStatus.PENDING);
        loan = loanRepository.save(loan);

        auditService.record(currentUserProvider.getCurrentEmployee(), "APPLY_LOAN", "Loan#" + loan.getLoanId());
        return LoanResponse.from(loan);
    }

    @Transactional
    public LoanResponse decide(Long loanId, LoanDecisionRequest request) {
        Loan loan = findLoanOrThrow(loanId);
        if (loan.getStatus() != LoanStatus.PENDING && loan.getStatus() != LoanStatus.UNDER_REVIEW) {
            throw new BadRequestException("Loan is not awaiting a decision");
        }

        Employee reviewer = currentUserProvider.getCurrentEmployee();
        boolean requiresManager = loan.getAmount().compareTo(managerApprovalThreshold) > 0;
        boolean reviewerIsManager = "MANAGER".equals(reviewer.getRole().getRoleName());
        if (requiresManager && !reviewerIsManager) {
            throw new AccessDeniedException("Loans above the manager approval threshold require manager sign-off");
        }

        Approval approval = new Approval();
        approval.setLoan(loan);
        approval.setEmployee(reviewer);
        approval.setDecision(request.decision());
        approval.setReason(request.reason());
        approvalRepository.save(approval);

        if (request.decision() == ApprovalDecision.APPROVED) {
            loan.setStatus(LoanStatus.DISBURSED);
            loanRepository.save(loan);
            generateEmiSchedule(loan);
            auditService.record(reviewer, "APPROVE_LOAN", "Loan#" + loan.getLoanId());
        } else {
            loan.setStatus(LoanStatus.REJECTED);
            loanRepository.save(loan);
            auditService.record(reviewer, "REJECT_LOAN", "Loan#" + loan.getLoanId());
        }

        return LoanResponse.from(loan);
    }

    private void generateEmiSchedule(Loan loan) {
        int termMonths = loan.getTermMonths();
        BigDecimal principal = loan.getAmount();
        BigDecimal monthlyRate = loan.getInterestRate()
                .divide(BigDecimal.valueOf(100), MathContext.DECIMAL64)
                .divide(BigDecimal.valueOf(12), MathContext.DECIMAL64);

        BigDecimal installment;
        if (monthlyRate.signum() == 0) {
            installment = principal.divide(BigDecimal.valueOf(termMonths), 2, RoundingMode.HALF_UP);
        } else {
            BigDecimal onePlusR = BigDecimal.ONE.add(monthlyRate);
            BigDecimal onePlusRPowN = onePlusR.pow(termMonths, MathContext.DECIMAL64);
            installment = principal
                    .multiply(monthlyRate)
                    .multiply(onePlusRPowN)
                    .divide(onePlusRPowN.subtract(BigDecimal.ONE), MathContext.DECIMAL64)
                    .setScale(2, RoundingMode.HALF_UP);
        }

        List<Emi> schedule = new ArrayList<>();
        for (int i = 1; i <= termMonths; i++) {
            Emi emi = new Emi();
            emi.setLoan(loan);
            emi.setAmount(installment);
            emi.setDueDate(LocalDate.now().plusMonths(i));
            emi.setStatus(EmiStatus.PENDING);
            schedule.add(emi);
        }
        emiRepository.saveAll(schedule);
    }

    private Loan findLoanOrThrow(Long loanId) {
        return loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + loanId));
    }
}
