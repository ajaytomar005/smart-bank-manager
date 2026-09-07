package com.smartbank.manager.transfer;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BeneficiaryRequest(
        @NotBlank String nickname,
        @NotNull BeneficiaryType beneficiaryType,
        Long internalAccountId,
        String accountNumber,
        String ifscCode,
        String upiId
) {
}
