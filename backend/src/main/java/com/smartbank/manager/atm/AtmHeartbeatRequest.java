package com.smartbank.manager.atm;

import jakarta.validation.constraints.NotNull;

public record AtmHeartbeatRequest(
        @NotNull CashStatus cashStatus
) {
}
