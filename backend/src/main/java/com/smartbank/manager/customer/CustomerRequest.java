package com.smartbank.manager.customer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotBlank String phone,
        String segment,
        @NotBlank @Size(min = 8, message = "Password must be at least 8 characters") String password
) {
}
