package com.smartbank.manager.atm;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalTime;

public final class AtmAvailabilityCalculator {

    public static final Duration HEARTBEAT_FRESHNESS = Duration.ofMinutes(5);

    private AtmAvailabilityCalculator() {
    }

    public static boolean isOpenNow(Atm atm, LocalTime nowTime) {
        if (atm.isOpen24x7()) {
            return true;
        }
        LocalTime open = atm.getOpenTime();
        LocalTime close = atm.getCloseTime();
        if (open == null || close == null) {
            return false;
        }
        if (open.isBefore(close)) {
            return !nowTime.isBefore(open) && !nowTime.isAfter(close);
        }
        // Overnight window, e.g. open=22:00, close=06:00
        return !nowTime.isBefore(open) || !nowTime.isAfter(close);
    }

    public static boolean isHeartbeatFresh(Atm atm, Instant now) {
        if (atm.getLastHeartbeatAt() == null) {
            return false;
        }
        return Duration.between(atm.getLastHeartbeatAt(), now).compareTo(HEARTBEAT_FRESHNESS) <= 0;
    }

    public static boolean isAvailableForWithdrawal(Atm atm, Instant now, LocalTime nowTime) {
        return atm.getStatus() == AtmStatus.ONLINE
                && isHeartbeatFresh(atm, now)
                && atm.getCashStatus() != CashStatus.OUT_OF_CASH
                && isOpenNow(atm, nowTime)
                && atm.getServices().contains(AtmServiceType.WITHDRAWAL);
    }
}
