package com.smartbank.manager.employee;

import jakarta.validation.constraints.NotNull;

public record EmployeeStatusRequest(
        @NotNull EmployeeStatus status
) {
}
