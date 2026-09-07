package com.smartbank.manager.transfer;

import java.time.Instant;

public record BeneficiaryResponse(
        Long beneficiaryId,
        String nickname,
        BeneficiaryType beneficiaryType,
        Long internalAccountId,
        String accountNumber,
        String ifscCode,
        String upiId,
        BeneficiaryStatus status,
        Instant createdAt,
        Instant activatesAt
) {
    public static BeneficiaryResponse from(Beneficiary b) {
        return new BeneficiaryResponse(
                b.getBeneficiaryId(),
                b.getNickname(),
                b.getBeneficiaryType(),
                b.getInternalAccount() == null ? null : b.getInternalAccount().getAccountId(),
                b.getAccountNumber(),
                b.getIfscCode(),
                b.getUpiId(),
                b.getStatus(),
                b.getCreatedAt(),
                b.getActivatesAt());
    }
}
