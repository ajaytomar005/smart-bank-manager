package com.smartbank.manager.portal;

import jakarta.validation.constraints.NotBlank;

public record MyDisputeRequest(
        Long txnId,
        @NotBlank String reason
) {
}
