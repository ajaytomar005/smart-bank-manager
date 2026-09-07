package com.smartbank.manager.customer;

import jakarta.validation.constraints.NotNull;

public record KycStatusRequest(
        @NotNull KycStatus kycStatus
) {
}
