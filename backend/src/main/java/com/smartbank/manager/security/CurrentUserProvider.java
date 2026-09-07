package com.smartbank.manager.security;

import com.smartbank.manager.customer.Customer;
import com.smartbank.manager.employee.Employee;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserProvider {

    public Employee getCurrentEmployee() {
        AppUserDetails userDetails = (AppUserDetails) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
        return userDetails.getEmployee();
    }

    public Customer getCurrentCustomer() {
        CustomerPrincipal principal = (CustomerPrincipal) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
        return principal.getCustomer();
    }
}
