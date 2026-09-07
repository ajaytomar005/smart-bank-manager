package com.smartbank.manager.atm;

import jakarta.validation.constraints.NotNull;

public record AtmStatusUpdateRequest(
        @NotNull AtmStatus status,
        @NotNull CashStatus cashStatus
) {
}
