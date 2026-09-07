package com.smartbank.manager.employee;

public record EmployeeResponse(
        Long employeeId,
        String name,
        String email,
        String roleName,
        EmployeeStatus status
) {
    public static EmployeeResponse from(Employee employee) {
        return new EmployeeResponse(
                employee.getEmployeeId(),
                employee.getName(),
                employee.getEmail(),
                employee.getRole().getRoleName(),
                employee.getStatus());
    }
}
