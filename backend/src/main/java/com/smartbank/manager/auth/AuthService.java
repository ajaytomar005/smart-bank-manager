package com.smartbank.manager.auth;

import com.smartbank.manager.security.AppUserDetails;
import com.smartbank.manager.security.AppUserDetailsService;
import com.smartbank.manager.security.JwtService;
import com.smartbank.manager.security.PrincipalType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final AppUserDetailsService userDetailsService;
    private final JwtService jwtService;

    public AuthService(
            AuthenticationManager authenticationManager,
            AppUserDetailsService userDetailsService,
            JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        AppUserDetails userDetails = (AppUserDetails) userDetailsService.loadUserByUsername(request.email());
        return buildAuthResponse(userDetails);
    }

    public AuthResponse refresh(RefreshRequest request) {
        String token = request.refreshToken();
        String email = jwtService.extractEmail(token);
        if (!"REFRESH".equals(jwtService.extractTokenType(token))
                || jwtService.extractPrincipalType(token) != PrincipalType.STAFF
                || !jwtService.isTokenValid(token, email)) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

        AppUserDetails userDetails = (AppUserDetails) userDetailsService.loadUserByUsername(email);
        return buildAuthResponse(userDetails);
    }

    private AuthResponse buildAuthResponse(AppUserDetails userDetails) {
        String role = userDetails.getEmployee().getRole().getRoleName();
        String accessToken = jwtService.generateAccessToken(userDetails.getUsername(), role, PrincipalType.STAFF);
        String refreshToken = jwtService.generateRefreshToken(userDetails.getUsername(), role, PrincipalType.STAFF);
        return new AuthResponse(
                accessToken,
                refreshToken,
                userDetails.getUsername(),
                role,
                userDetails.getEmployee().getName());
    }
}
