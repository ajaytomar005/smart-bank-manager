package com.smartbank.manager.loan;

import java.time.Instant;

public record ApprovalResponse(
        Long approvalId,
        Long loanId,
        Long employeeId,
        String employeeName,
        ApprovalDecision decision,
        String reason,
        Instant decidedAt
) {
    public static ApprovalResponse from(Approval approval) {
        return new ApprovalResponse(
                approval.getApprovalId(),
                approval.getLoan().getLoanId(),
                approval.getEmployee().getEmployeeId(),
                approval.getEmployee().getName(),
                approval.getDecision(),
                approval.getReason(),
                approval.getDecidedAt());
    }
}
