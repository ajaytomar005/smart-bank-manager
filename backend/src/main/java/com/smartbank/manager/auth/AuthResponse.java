package com.smartbank.manager.auth;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String email,
        String role,
        String name
) {
}
