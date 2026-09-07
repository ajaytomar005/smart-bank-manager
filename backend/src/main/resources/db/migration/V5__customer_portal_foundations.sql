-- Customer login credentials (staff-issued, not self-registered)
ALTER TABLE customers ADD COLUMN password_hash VARCHAR(255);
ALTER TABLE customers ADD COLUMN account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

-- Audit log: support both staff and customer actors
ALTER TABLE audit_logs ALTER COLUMN employee_id DROP NOT NULL;
ALTER TABLE audit_logs ADD COLUMN customer_id BIGINT REFERENCES customers (customer_id);
ALTER TABLE audit_logs ADD CONSTRAINT chk_audit_logs_actor
    CHECK (
        (employee_id IS NOT NULL AND customer_id IS NULL)
        OR (employee_id IS NULL AND customer_id IS NOT NULL)
    );
CREATE INDEX idx_audit_logs_customer_id ON audit_logs (customer_id);

-- Disputes (customer-raised, staff-resolved)
CREATE TABLE disputes (
    dispute_id     BIGSERIAL PRIMARY KEY,
    customer_id    BIGINT NOT NULL REFERENCES customers (customer_id),
    txn_id         BIGINT REFERENCES transactions (txn_id),
    reason         VARCHAR(1000) NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    resolution_notes VARCHAR(1000),
    raised_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at    TIMESTAMPTZ
);
CREATE INDEX idx_disputes_customer_id ON disputes (customer_id);
CREATE INDEX idx_disputes_status ON disputes (status);
