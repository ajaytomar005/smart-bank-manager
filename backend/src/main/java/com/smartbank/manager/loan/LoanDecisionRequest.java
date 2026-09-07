package com.smartbank.manager.loan;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LoanDecisionRequest(
        @NotNull ApprovalDecision decision,
        @Size(max = 500) String reason
) {
}
