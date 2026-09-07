package com.smartbank.manager.portal;

import com.smartbank.manager.audit.AuditService;
import com.smartbank.manager.customer.Customer;
import com.smartbank.manager.customer.CustomerRepository;
import com.smartbank.manager.customer.CustomerResponse;
import com.smartbank.manager.customer.KycStatus;
import com.smartbank.manager.security.CurrentUserProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MyProfileService {

    private final CustomerRepository customerRepository;
    private final AuditService auditService;
    private final CurrentUserProvider currentUserProvider;

    public MyProfileService(
            CustomerRepository customerRepository,
            AuditService auditService,
            CurrentUserProvider currentUserProvider) {
        this.customerRepository = customerRepository;
        this.auditService = auditService;
        this.currentUserProvider = currentUserProvider;
    }

    public CustomerResponse getMyProfile() {
        return CustomerResponse.from(currentUserProvider.getCurrentCustomer());
    }

    @Transactional
    public CustomerResponse updateMyProfile(MyProfileRequest request) {
        Customer customer = currentUserProvider.getCurrentCustomer();
        customer.setName(request.name());
        customer.setPhone(request.phone());
        customer.setSegment(request.segment());
        // Contact/profile changes require compliance to re-verify KYC.
        customer.setKycStatus(KycStatus.PENDING);
        customer = customerRepository.save(customer);

        auditService.recordCustomerAction(customer, "UPDATE_PROFILE", "Customer#" + customer.getCustomerId());
        return CustomerResponse.from(customer);
    }
}
