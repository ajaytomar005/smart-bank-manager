package com.smartbank.manager.portal;

import com.smartbank.manager.audit.AuditService;
import com.smartbank.manager.common.ResourceNotFoundException;
import com.smartbank.manager.customer.Customer;
import com.smartbank.manager.dispute.Dispute;
import com.smartbank.manager.dispute.DisputeRepository;
import com.smartbank.manager.dispute.DisputeResponse;
import com.smartbank.manager.dispute.DisputeStatus;
import com.smartbank.manager.security.CurrentUserProvider;
import com.smartbank.manager.transaction.Transaction;
import com.smartbank.manager.transaction.TransactionRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MyDisputeService {

    private final DisputeRepository disputeRepository;
    private final TransactionRepository transactionRepository;
    private final AuditService auditService;
    private final CurrentUserProvider currentUserProvider;

    public MyDisputeService(
            DisputeRepository disputeRepository,
            TransactionRepository transactionRepository,
            AuditService auditService,
            CurrentUserProvider currentUserProvider) {
        this.disputeRepository = disputeRepository;
        this.transactionRepository = transactionRepository;
        this.auditService = auditService;
        this.currentUserProvider = currentUserProvider;
    }

    public List<DisputeResponse> listMyDisputes() {
        Long customerId = currentUserProvider.getCurrentCustomer().getCustomerId();
        return disputeRepository.findByCustomerCustomerId(customerId).stream().map(DisputeResponse::from).toList();
    }

    @Transactional
    public DisputeResponse raiseDispute(MyDisputeRequest request) {
        Customer customer = currentUserProvider.getCurrentCustomer();

        Dispute dispute = new Dispute();
        dispute.setCustomer(customer);
        dispute.setReason(request.reason());
        dispute.setStatus(DisputeStatus.OPEN);
        if (request.txnId() != null) {
            Transaction transaction = transactionRepository.findById(request.txnId())
                    .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + request.txnId()));
            dispute.setTransaction(transaction);
        }
        dispute = disputeRepository.save(dispute);

        auditService.recordCustomerAction(customer, "RAISE_DISPUTE", "Dispute#" + dispute.getDisputeId());
        return DisputeResponse.from(dispute);
    }
}
