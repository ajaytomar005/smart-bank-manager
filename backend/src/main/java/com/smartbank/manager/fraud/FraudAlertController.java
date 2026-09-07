package com.smartbank.manager.fraud;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/fraud/alerts")
public class FraudAlertController {

    private final FraudAlertService fraudAlertService;

    public FraudAlertController(FraudAlertService fraudAlertService) {
        this.fraudAlertService = fraudAlertService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('COMPLIANCE_OFFICER', 'MANAGER', 'ADMIN')")
    public List<FraudAlertResponse> listAlerts(@RequestParam(required = false) FraudAlertStatus status) {
        return fraudAlertService.listAlerts(status);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('TELLER', 'COMPLIANCE_OFFICER', 'MANAGER', 'ADMIN')")
    public FraudAlertResponse raiseAlert(@Valid @RequestBody FraudAlertRequest request) {
        return fraudAlertService.raiseAlert(request);
    }

    @PatchMapping("/{alertId}/status")
    @PreAuthorize("hasAnyRole('COMPLIANCE_OFFICER', 'MANAGER', 'ADMIN')")
    public FraudAlertResponse updateStatus(
            @PathVariable Long alertId, @Valid @RequestBody FraudAlertStatusRequest request) {
        return fraudAlertService.updateStatus(alertId, request);
    }
}
