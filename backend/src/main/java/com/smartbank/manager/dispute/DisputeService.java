package com.smartbank.manager.dispute;

import com.smartbank.manager.audit.AuditService;
import com.smartbank.manager.common.ResourceNotFoundException;
import com.smartbank.manager.security.CurrentUserProvider;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final AuditService auditService;
    private final CurrentUserProvider currentUserProvider;

    public DisputeService(
            DisputeRepository disputeRepository,
            AuditService auditService,
            CurrentUserProvider currentUserProvider) {
        this.disputeRepository = disputeRepository;
        this.auditService = auditService;
        this.currentUserProvider = currentUserProvider;
    }

    public List<DisputeResponse> listDisputes() {
        return disputeRepository.findAll().stream().map(DisputeResponse::from).toList();
    }

    @Transactional
    public DisputeResponse resolve(Long disputeId, DisputeResolutionRequest request) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found: " + disputeId));
        dispute.setStatus(request.status());
        dispute.setResolutionNotes(request.resolutionNotes());
        if (request.status() == DisputeStatus.RESOLVED || request.status() == DisputeStatus.REJECTED) {
            dispute.setResolvedAt(Instant.now());
        }
        dispute = disputeRepository.save(dispute);

        auditService.record(currentUserProvider.getCurrentEmployee(), "RESOLVE_DISPUTE", "Dispute#" + dispute.getDisputeId());
        return DisputeResponse.from(dispute);
    }
}
