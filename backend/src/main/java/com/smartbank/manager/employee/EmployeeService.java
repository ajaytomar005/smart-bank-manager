package com.smartbank.manager.employee;

import com.smartbank.manager.audit.AuditService;
import com.smartbank.manager.common.BadRequestException;
import com.smartbank.manager.common.ResourceNotFoundException;
import com.smartbank.manager.role.Role;
import com.smartbank.manager.role.RoleRepository;
import com.smartbank.manager.security.CurrentUserProvider;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final CurrentUserProvider currentUserProvider;

    public EmployeeService(
            EmployeeRepository employeeRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuditService auditService,
            CurrentUserProvider currentUserProvider) {
        this.employeeRepository = employeeRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.currentUserProvider = currentUserProvider;
    }

    public List<EmployeeResponse> listEmployees() {
        return employeeRepository.findAllWithRole().stream().map(EmployeeResponse::from).toList();
    }

    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        if (employeeRepository.existsByEmail(request.email())) {
            throw new BadRequestException("An employee with this email already exists");
        }
        Role role = roleRepository.findById(request.roleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.roleId()));

        Employee employee = new Employee();
        employee.setName(request.name());
        employee.setEmail(request.email());
        employee.setPasswordHash(passwordEncoder.encode(request.password()));
        employee.setRole(role);
        employee.setStatus(EmployeeStatus.ACTIVE);
        employee = employeeRepository.save(employee);

        auditService.record(currentUserProvider.getCurrentEmployee(), "CREATE_EMPLOYEE", "Employee#" + employee.getEmployeeId());
        return EmployeeResponse.from(employee);
    }

    @Transactional
    public EmployeeResponse updateStatus(Long employeeId, EmployeeStatusRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + employeeId));
        employee.setStatus(request.status());
        employee = employeeRepository.save(employee);

        auditService.record(currentUserProvider.getCurrentEmployee(), "UPDATE_EMPLOYEE_STATUS", "Employee#" + employee.getEmployeeId());
        return EmployeeResponse.from(employee);
    }
}
