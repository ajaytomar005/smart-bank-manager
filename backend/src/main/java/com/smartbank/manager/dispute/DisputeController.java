package com.smartbank.manager.dispute;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/disputes")
@PreAuthorize("hasAnyRole('COMPLIANCE_OFFICER', 'MANAGER', 'ADMIN')")
public class DisputeController {

    private final DisputeService disputeService;

    public DisputeController(DisputeService disputeService) {
        this.disputeService = disputeService;
    }

    @GetMapping
    public List<DisputeResponse> listDisputes() {
        return disputeService.listDisputes();
    }

    @PatchMapping("/{disputeId}/resolve")
    public DisputeResponse resolve(@PathVariable Long disputeId, @Valid @RequestBody DisputeResolutionRequest request) {
        return disputeService.resolve(disputeId, request);
    }
}
