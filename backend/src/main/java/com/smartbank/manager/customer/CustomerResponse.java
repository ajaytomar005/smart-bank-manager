package com.smartbank.manager.customer;

import java.time.Instant;

public record CustomerResponse(
        Long customerId,
        String name,
        String email,
        String phone,
        KycStatus kycStatus,
        String segment,
        Instant createdAt
) {
    public static CustomerResponse from(Customer customer) {
        return new CustomerResponse(
                customer.getCustomerId(),
                customer.getName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getKycStatus(),
                customer.getSegment(),
                customer.getCreatedAt());
    }
}
