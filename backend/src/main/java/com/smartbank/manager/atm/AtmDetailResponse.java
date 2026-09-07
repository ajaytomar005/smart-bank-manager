package com.smartbank.manager.atm;

import java.time.Instant;
import java.time.LocalTime;
import java.util.Set;

public record AtmDetailResponse(
        Long atmId,
        String name,
        String code,
        String address,
        double latitude,
        double longitude,
        AtmStatus status,
        CashStatus cashStatus,
        boolean is24x7,
        LocalTime openTime,
        LocalTime closeTime,
        Set<AtmServiceType> services,
        boolean openNow,
        boolean availableForWithdrawal,
        Instant lastHeartbeatAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static AtmDetailResponse from(Atm atm, boolean openNow, boolean availableForWithdrawal) {
        return new AtmDetailResponse(
                atm.getAtmId(),
                atm.getName(),
                atm.getCode(),
                atm.getAddress(),
                atm.getLatitude(),
                atm.getLongitude(),
                atm.getStatus(),
                atm.getCashStatus(),
                atm.isOpen24x7(),
                atm.getOpenTime(),
                atm.getCloseTime(),
                atm.getServices(),
                openNow,
                availableForWithdrawal,
                atm.getLastHeartbeatAt(),
                atm.getCreatedAt(),
                atm.getUpdatedAt());
    }
}
