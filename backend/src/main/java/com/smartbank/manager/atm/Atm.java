package com.smartbank.manager.atm;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "atms")
@Getter
@Setter
@NoArgsConstructor
public class Atm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "atm_id")
    private Long atmId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "latitude", nullable = false)
    private double latitude;

    @Column(name = "longitude", nullable = false)
    private double longitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AtmStatus status = AtmStatus.ONLINE;

    @Enumerated(EnumType.STRING)
    @Column(name = "cash_status", nullable = false)
    private CashStatus cashStatus = CashStatus.AVAILABLE;

    @Column(name = "is_24x7", nullable = false)
    private boolean open24x7;

    @Column(name = "open_time")
    private LocalTime openTime;

    @Column(name = "close_time")
    private LocalTime closeTime;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "atm_services", joinColumns = @JoinColumn(name = "atm_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "service")
    private Set<AtmServiceType> services = new HashSet<>();

    @Column(name = "last_heartbeat_at", nullable = false)
    private Instant lastHeartbeatAt = Instant.now();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
