package com.smartbank.manager.security;

import com.smartbank.manager.customer.CustomerRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomerUserDetailsService {

    private final CustomerRepository customerRepository;

    public CustomerUserDetailsService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public CustomerPrincipal loadByEmail(String email) {
        return customerRepository.findByEmail(email)
                .map(CustomerPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("No customer found with email " + email));
    }
}
