package com.smartbank.manager.dashboard;

import com.smartbank.manager.account.AccountRepository;
import com.smartbank.manager.account.AccountStatus;
import com.smartbank.manager.customer.CustomerRepository;
import com.smartbank.manager.customer.KycStatus;
import com.smartbank.manager.fraud.FraudAlertRepository;
import com.smartbank.manager.fraud.FraudAlertStatus;
import com.smartbank.manager.loan.LoanRepository;
import com.smartbank.manager.loan.LoanStatus;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final LoanRepository loanRepository;
    private final FraudAlertRepository fraudAlertRepository;

    public DashboardService(
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            LoanRepository loanRepository,
            FraudAlertRepository fraudAlertRepository) {
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.loanRepository = loanRepository;
        this.fraudAlertRepository = fraudAlertRepository;
    }

    public DashboardSummaryResponse getSummary() {
        return new DashboardSummaryResponse(
                customerRepository.count(),
                accountRepository.count(),
                accountRepository.countByStatus(AccountStatus.FROZEN),
                customerRepository.countByKycStatus(KycStatus.PENDING),
                loanRepository.countByStatusIn(List.of(LoanStatus.PENDING, LoanStatus.UNDER_REVIEW)),
                fraudAlertRepository.countByStatus(FraudAlertStatus.OPEN));
    }
}
