package com.smartbank.manager.portal;

import jakarta.validation.constraints.NotBlank;

public record MyProfileRequest(
        @NotBlank String name,
        @NotBlank String phone,
        String segment
) {
}
