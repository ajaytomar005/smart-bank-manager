package com.smartbank.manager.auth;

import com.smartbank.manager.customer.Customer;
import com.smartbank.manager.customer.CustomerRequest;
import com.smartbank.manager.customer.CustomerService;
import com.smartbank.manager.security.CustomerPrincipal;
import com.smartbank.manager.security.CustomerUserDetailsService;
import com.smartbank.manager.security.JwtService;
import com.smartbank.manager.security.PrincipalType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class CustomerAuthService {

    private static final String CUSTOMER_ROLE = "CUSTOMER";

    private final CustomerUserDetailsService customerUserDetailsService;
    private final CustomerService customerService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public CustomerAuthService(
            CustomerUserDetailsService customerUserDetailsService,
            CustomerService customerService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.customerUserDetailsService = customerUserDetailsService;
        this.customerService = customerService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse login(LoginRequest request) {
        CustomerPrincipal principal = customerUserDetailsService.loadByEmail(request.email());
        if (principal.getPassword() == null
                || !passwordEncoder.matches(request.password(), principal.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        if (!principal.isEnabled()) {
            throw new BadCredentialsException("This account is inactive");
        }
        return buildAuthResponse(principal);
    }

    public AuthResponse register(CustomerRequest request) {
        Customer customer = customerService.selfRegister(request);
        return buildAuthResponse(new CustomerPrincipal(customer));
    }

    public AuthResponse refresh(RefreshRequest request) {
        String token = request.refreshToken();
        String email = jwtService.extractEmail(token);
        if (!"REFRESH".equals(jwtService.extractTokenType(token))
                || jwtService.extractPrincipalType(token) != PrincipalType.CUSTOMER
                || !jwtService.isTokenValid(token, email)) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

        CustomerPrincipal principal = customerUserDetailsService.loadByEmail(email);
        return buildAuthResponse(principal);
    }

    private AuthResponse buildAuthResponse(CustomerPrincipal principal) {
        String accessToken = jwtService.generateAccessToken(principal.getUsername(), CUSTOMER_ROLE, PrincipalType.CUSTOMER);
        String refreshToken = jwtService.generateRefreshToken(principal.getUsername(), CUSTOMER_ROLE, PrincipalType.CUSTOMER);
        return new AuthResponse(
                accessToken,
                refreshToken,
                principal.getUsername(),
                CUSTOMER_ROLE,
                principal.getCustomer().getName());
    }
}
