package com.smartbank.manager.onboarding;

import com.smartbank.manager.account.Account;
import com.smartbank.manager.account.AccountType;
import com.smartbank.manager.customer.Customer;
import com.smartbank.manager.employee.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "account_opening_requests")
@Getter
@Setter
@NoArgsConstructor
public class AccountOpeningRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false)
    private AccountType accountType;

    @Column(name = "initial_deposit", nullable = false, precision = 19, scale = 2)
    private BigDecimal initialDeposit = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AccountRequestStatus status = AccountRequestStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teller_reviewed_by")
    private Employee tellerReviewedBy;

    @Column(name = "teller_reviewed_at")
    private Instant tellerReviewedAt;

    @Column(name = "teller_notes")
    private String tellerNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_decided_by")
    private Employee managerDecidedBy;

    @Column(name = "manager_decided_at")
    private Instant managerDecidedAt;

    @Column(name = "manager_notes")
    private String managerNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_account_id")
    private Account createdAccount;

    @Column(name = "requested_at", nullable = false, updatable = false)
    private Instant requestedAt = Instant.now();
}
