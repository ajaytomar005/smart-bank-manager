package com.smartbank.manager.atm;

import java.io.Serializable;
import java.time.LocalTime;
import java.util.Set;

public record AtmNearbyResponse(
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
        double distanceMeters
) implements Serializable {
}
