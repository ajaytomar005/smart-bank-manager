package com.smartbank.manager.dashboard;

public record DashboardSummaryResponse(
        long totalCustomers,
        long totalAccounts,
        long frozenAccounts,
        long pendingKycReviews,
        long pendingLoanApprovals,
        long openFraudAlerts
) {
}
