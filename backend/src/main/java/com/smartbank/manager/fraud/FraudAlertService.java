package com.smartbank.manager.fraud;

import com.smartbank.manager.account.Account;
import com.smartbank.manager.account.AccountRepository;
import com.smartbank.manager.audit.AuditService;
import com.smartbank.manager.common.ResourceNotFoundException;
import com.smartbank.manager.security.CurrentUserProvider;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FraudAlertService {

    private final FraudAlertRepository fraudAlertRepository;
    private final AccountRepository accountRepository;
    private final AuditService auditService;
    private final CurrentUserProvider currentUserProvider;

    public FraudAlertService(
            FraudAlertRepository fraudAlertRepository,
            AccountRepository accountRepository,
            AuditService auditService,
            CurrentUserProvider currentUserProvider) {
        this.fraudAlertRepository = fraudAlertRepository;
        this.accountRepository = accountRepository;
        this.auditService = auditService;
        this.currentUserProvider = currentUserProvider;
    }

    public List<FraudAlertResponse> listAlerts(FraudAlertStatus status) {
        List<FraudAlert> alerts = status == null
                ? fraudAlertRepository.findAll()
                : fraudAlertRepository.findByStatus(status);
        return alerts.stream().map(FraudAlertResponse::from).toList();
    }

    @Transactional
    public FraudAlertResponse raiseAlert(FraudAlertRequest request) {
        Account account = accountRepository.findById(request.accountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + request.accountId()));

        FraudAlert alert = new FraudAlert();
        alert.setAccount(account);
        alert.setReason(request.reason());
        alert.setSeverity(request.severity());
        alert.setStatus(FraudAlertStatus.OPEN);
        alert = fraudAlertRepository.save(alert);

        auditService.record(currentUserProvider.getCurrentEmployee(), "RAISE_FRAUD_ALERT", "FraudAlert#" + alert.getAlertId());
        return FraudAlertResponse.from(alert);
    }

    @Transactional
    public FraudAlertResponse updateStatus(Long alertId, FraudAlertStatusRequest request) {
        FraudAlert alert = fraudAlertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Fraud alert not found: " + alertId));
        alert.setStatus(request.status());
        alert = fraudAlertRepository.save(alert);

        auditService.record(currentUserProvider.getCurrentEmployee(), "UPDATE_FRAUD_ALERT_STATUS", "FraudAlert#" + alert.getAlertId());
        return FraudAlertResponse.from(alert);
    }
}
