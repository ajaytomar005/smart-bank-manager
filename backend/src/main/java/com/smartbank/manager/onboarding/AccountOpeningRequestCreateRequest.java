package com.smartbank.manager.onboarding;

import com.smartbank.manager.account.AccountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record AccountOpeningRequestCreateRequest(
        @NotNull AccountType accountType,
        @DecimalMin(value = "0.0", message = "Initial deposit cannot be negative") BigDecimal initialDeposit
) {
}
