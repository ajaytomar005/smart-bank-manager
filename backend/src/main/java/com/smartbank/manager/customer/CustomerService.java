package com.smartbank.manager.customer;

import com.smartbank.manager.audit.AuditService;
import com.smartbank.manager.common.BadRequestException;
import com.smartbank.manager.common.ResourceNotFoundException;
import com.smartbank.manager.security.CurrentUserProvider;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final CurrentUserProvider currentUserProvider;

    public CustomerService(
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder,
            AuditService auditService,
            CurrentUserProvider currentUserProvider) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.currentUserProvider = currentUserProvider;
    }

    public List<CustomerResponse> listCustomers() {
        return customerRepository.findAll().stream()
                .map(CustomerResponse::from)
                .toList();
    }

    public CustomerResponse getCustomer(Long customerId) {
        return CustomerResponse.from(findCustomerOrThrow(customerId));
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        Customer customer = buildAndSaveCustomer(request);
        auditService.record(currentUserProvider.getCurrentEmployee(), "CREATE_CUSTOMER", "Customer#" + customer.getCustomerId());
        return CustomerResponse.from(customer);
    }

    /** Public self-registration: no staff actor, so the audit entry is attributed to the new customer. */
    @Transactional
    public Customer selfRegister(CustomerRequest request) {
        Customer customer = buildAndSaveCustomer(request);
        auditService.recordCustomerAction(customer, "SELF_REGISTER", "Customer#" + customer.getCustomerId());
        return customer;
    }

    private Customer buildAndSaveCustomer(CustomerRequest request) {
        if (customerRepository.existsByEmail(request.email())) {
            throw new BadRequestException("An account with this email already exists");
        }

        Customer customer = new Customer();
        customer.setName(request.name());
        customer.setEmail(request.email());
        customer.setPhone(request.phone());
        customer.setSegment(request.segment());
        customer.setPasswordHash(passwordEncoder.encode(request.password()));
        return customerRepository.save(customer);
    }

    @Transactional
    public CustomerResponse updateKycStatus(Long customerId, KycStatusRequest request) {
        Customer customer = findCustomerOrThrow(customerId);
        customer.setKycStatus(request.kycStatus());
        customer = customerRepository.save(customer);

        auditService.record(currentUserProvider.getCurrentEmployee(), "UPDATE_KYC_STATUS", "Customer#" + customer.getCustomerId());
        return CustomerResponse.from(customer);
    }

    private Customer findCustomerOrThrow(Long customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerId));
    }
}
