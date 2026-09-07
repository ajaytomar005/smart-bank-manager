package com.smartbank.manager.audit;

import com.smartbank.manager.customer.Customer;
import com.smartbank.manager.employee.Employee;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void record(Employee employee, String action, String entity) {
        AuditLog log = new AuditLog();
        log.setEmployee(employee);
        log.setAction(action);
        log.setEntity(entity);
        auditLogRepository.save(log);
    }

    public void recordCustomerAction(Customer customer, String action, String entity) {
        AuditLog log = new AuditLog();
        log.setCustomer(customer);
        log.setAction(action);
        log.setEntity(entity);
        auditLogRepository.save(log);
    }
}
