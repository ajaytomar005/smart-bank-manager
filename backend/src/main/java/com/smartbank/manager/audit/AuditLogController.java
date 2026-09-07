package com.smartbank.manager.audit;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/audit-logs")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('COMPLIANCE_OFFICER', 'MANAGER', 'ADMIN')")
    public List<AuditLogResponse> listAuditLogs() {
        return auditLogRepository.findAllWithActors().stream().map(AuditLogResponse::from).toList();
    }
}
