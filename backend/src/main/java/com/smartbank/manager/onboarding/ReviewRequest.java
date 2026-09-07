package com.smartbank.manager.onboarding;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReviewRequest(
        @NotNull ReviewDecision decision,
        @Size(max = 500) String notes
) {
}
