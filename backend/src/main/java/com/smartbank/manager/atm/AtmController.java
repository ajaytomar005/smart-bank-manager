package com.smartbank.manager.atm;

import com.smartbank.manager.common.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/atms")
@Tag(name = "ATMs", description = "Nearby ATM finder with live cash availability")
public class AtmController {

    private final AtmService atmService;

    public AtmController(AtmService atmService) {
        this.atmService = atmService;
    }

    @GetMapping("/nearby")
    @Operation(summary = "List ATMs near a location, sorted by distance, with optional filters")
    public PageResponse<AtmNearbyResponse> nearby(
            @RequestParam @NotNull @DecimalMin("-90") @DecimalMax("90") Double lat,
            @RequestParam @NotNull @DecimalMin("-180") @DecimalMax("180") Double lng,
            @RequestParam(defaultValue = "2000") @Min(100) @Max(20000) double radiusMeters,
            @RequestParam(required = false) Boolean openNow,
            @RequestParam(required = false) AtmServiceType service,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int pageSize) {
        return atmService.findNearby(lat, lng, radiusMeters, openNow, service, page, pageSize);
    }

    @GetMapping("/nearby/count")
    @Operation(summary = "Count ATMs near a location, and how many are currently available for withdrawal")
    public NearbyCountResponse nearbyCount(
            @RequestParam @NotNull @DecimalMin("-90") @DecimalMax("90") Double lat,
            @RequestParam @NotNull @DecimalMin("-180") @DecimalMax("180") Double lng,
            @RequestParam(defaultValue = "2000") @Min(100) @Max(20000) double radiusMeters) {
        return atmService.countNearby(lat, lng, radiusMeters);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get full details for one ATM")
    public AtmDetailResponse getById(@PathVariable Long id) {
        return atmService.getById(id);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Update an ATM's operational status and cash status (staff only)")
    public AtmDetailResponse updateStatus(@PathVariable Long id, @Valid @RequestBody AtmStatusUpdateRequest request) {
        return atmService.updateStatus(id, request);
    }

    @PostMapping("/{id}/heartbeat")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Record a heartbeat + cash level report from an ATM device")
    public void heartbeat(@PathVariable Long id, @Valid @RequestBody AtmHeartbeatRequest request) {
        atmService.recordHeartbeat(id, request);
    }
}
