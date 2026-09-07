package com.smartbank.manager.atm;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import org.junit.jupiter.api.Test;

class AtmAvailabilityCalculatorTest {

    private Atm baseAtm() {
        Atm atm = new Atm();
        atm.setStatus(AtmStatus.ONLINE);
        atm.setCashStatus(CashStatus.AVAILABLE);
        atm.setOpen24x7(true);
        atm.setLastHeartbeatAt(Instant.now());
        atm.setServices(Set.of(AtmServiceType.WITHDRAWAL));
        return atm;
    }

    @Test
    void isOpenNow_24x7_alwaysTrue() {
        Atm atm = baseAtm();
        assertThat(AtmAvailabilityCalculator.isOpenNow(atm, LocalTime.of(3, 0))).isTrue();
    }

    @Test
    void isOpenNow_withinNormalHours_isTrue() {
        Atm atm = baseAtm();
        atm.setOpen24x7(false);
        atm.setOpenTime(LocalTime.of(9, 0));
        atm.setCloseTime(LocalTime.of(21, 0));
        assertThat(AtmAvailabilityCalculator.isOpenNow(atm, LocalTime.of(15, 0))).isTrue();
    }

    @Test
    void isOpenNow_outsideNormalHours_isFalse() {
        Atm atm = baseAtm();
        atm.setOpen24x7(false);
        atm.setOpenTime(LocalTime.of(9, 0));
        atm.setCloseTime(LocalTime.of(21, 0));
        assertThat(AtmAvailabilityCalculator.isOpenNow(atm, LocalTime.of(22, 0))).isFalse();
    }

    @Test
    void isOpenNow_overnightWindow_wrapsCorrectly() {
        Atm atm = baseAtm();
        atm.setOpen24x7(false);
        atm.setOpenTime(LocalTime.of(22, 0));
        atm.setCloseTime(LocalTime.of(6, 0));
        assertThat(AtmAvailabilityCalculator.isOpenNow(atm, LocalTime.of(23, 30))).isTrue();
        assertThat(AtmAvailabilityCalculator.isOpenNow(atm, LocalTime.of(3, 0))).isTrue();
        assertThat(AtmAvailabilityCalculator.isOpenNow(atm, LocalTime.of(12, 0))).isFalse();
    }

    @Test
    void isHeartbeatFresh_withinFiveMinutes_isTrue() {
        Atm atm = baseAtm();
        atm.setLastHeartbeatAt(Instant.now().minus(4, ChronoUnit.MINUTES));
        assertThat(AtmAvailabilityCalculator.isHeartbeatFresh(atm, Instant.now())).isTrue();
    }

    @Test
    void isHeartbeatFresh_staleHeartbeat_isFalse() {
        Atm atm = baseAtm();
        atm.setLastHeartbeatAt(Instant.now().minus(6, ChronoUnit.MINUTES));
        assertThat(AtmAvailabilityCalculator.isHeartbeatFresh(atm, Instant.now())).isFalse();
    }

    @Test
    void availableForWithdrawal_allConditionsMet_isTrue() {
        Atm atm = baseAtm();
        assertThat(AtmAvailabilityCalculator.isAvailableForWithdrawal(atm, Instant.now(), LocalTime.of(12, 0)))
                .isTrue();
    }

    @Test
    void availableForWithdrawal_staleHeartbeat_isFalse() {
        Atm atm = baseAtm();
        atm.setLastHeartbeatAt(Instant.now().minus(10, ChronoUnit.MINUTES));
        assertThat(AtmAvailabilityCalculator.isAvailableForWithdrawal(atm, Instant.now(), LocalTime.of(12, 0)))
                .isFalse();
    }

    @Test
    void availableForWithdrawal_outOfCash_isFalse() {
        Atm atm = baseAtm();
        atm.setCashStatus(CashStatus.OUT_OF_CASH);
        assertThat(AtmAvailabilityCalculator.isAvailableForWithdrawal(atm, Instant.now(), LocalTime.of(12, 0)))
                .isFalse();
    }

    @Test
    void availableForWithdrawal_lowCash_isStillTrue() {
        Atm atm = baseAtm();
        atm.setCashStatus(CashStatus.LOW);
        assertThat(AtmAvailabilityCalculator.isAvailableForWithdrawal(atm, Instant.now(), LocalTime.of(12, 0)))
                .isTrue();
    }

    @Test
    void availableForWithdrawal_outsideHours_isFalse() {
        Atm atm = baseAtm();
        atm.setOpen24x7(false);
        atm.setOpenTime(LocalTime.of(9, 0));
        atm.setCloseTime(LocalTime.of(21, 0));
        assertThat(AtmAvailabilityCalculator.isAvailableForWithdrawal(atm, Instant.now(), LocalTime.of(23, 0)))
                .isFalse();
    }

    @Test
    void availableForWithdrawal_noWithdrawalService_isFalse() {
        Atm atm = baseAtm();
        atm.setServices(Set.of(AtmServiceType.BALANCE_INQUIRY));
        assertThat(AtmAvailabilityCalculator.isAvailableForWithdrawal(atm, Instant.now(), LocalTime.of(12, 0)))
                .isFalse();
    }

    @Test
    void availableForWithdrawal_offlineStatus_isFalse() {
        Atm atm = baseAtm();
        atm.setStatus(AtmStatus.OFFLINE);
        assertThat(AtmAvailabilityCalculator.isAvailableForWithdrawal(atm, Instant.now(), LocalTime.of(12, 0)))
                .isFalse();
    }

    @Test
    void availableForWithdrawal_maintenanceStatus_isFalse() {
        Atm atm = baseAtm();
        atm.setStatus(AtmStatus.MAINTENANCE);
        assertThat(AtmAvailabilityCalculator.isAvailableForWithdrawal(atm, Instant.now(), LocalTime.of(12, 0)))
                .isFalse();
    }
}
