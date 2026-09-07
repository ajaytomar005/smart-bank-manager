CREATE TABLE roles (
    role_id     BIGSERIAL PRIMARY KEY,
    role_name   VARCHAR(50) NOT NULL UNIQUE,
    permissions JSONB
);

CREATE TABLE employees (
    employee_id   BIGSERIAL PRIMARY KEY,
    role_id       BIGINT NOT NULL REFERENCES roles (role_id),
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE customers (
    customer_id BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    phone       VARCHAR(20) NOT NULL,
    kyc_status  VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    segment     VARCHAR(50),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE accounts (
    account_id   BIGSERIAL PRIMARY KEY,
    customer_id  BIGINT NOT NULL REFERENCES customers (customer_id),
    account_type VARCHAR(20) NOT NULL,
    balance      NUMERIC(19, 2) NOT NULL DEFAULT 0,
    status       VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    opened_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE transactions (
    txn_id     BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL REFERENCES accounts (account_id),
    type       VARCHAR(20) NOT NULL,
    amount     NUMERIC(19, 2) NOT NULL,
    status     VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    txn_time   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE loans (
    loan_id       BIGSERIAL PRIMARY KEY,
    customer_id   BIGINT NOT NULL REFERENCES customers (customer_id),
    amount        NUMERIC(19, 2) NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL,
    credit_score  INTEGER,
    risk_flag     VARCHAR(20),
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE emis (
    emi_id   BIGSERIAL PRIMARY KEY,
    loan_id  BIGINT NOT NULL REFERENCES loans (loan_id),
    amount   NUMERIC(19, 2) NOT NULL,
    due_date DATE NOT NULL,
    status   VARCHAR(20) NOT NULL DEFAULT 'PENDING'
);

CREATE TABLE approvals (
    approval_id BIGSERIAL PRIMARY KEY,
    loan_id     BIGINT NOT NULL REFERENCES loans (loan_id),
    employee_id BIGINT NOT NULL REFERENCES employees (employee_id),
    decision    VARCHAR(20) NOT NULL,
    reason      VARCHAR(500),
    decided_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fraud_alerts (
    alert_id   BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL REFERENCES accounts (account_id),
    reason     VARCHAR(500) NOT NULL,
    severity   VARCHAR(20) NOT NULL,
    status     VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    raised_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
    log_id      BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees (employee_id),
    action      VARCHAR(255) NOT NULL,
    entity      VARCHAR(255) NOT NULL,
    timestamp   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_accounts_customer_id ON accounts (customer_id);
CREATE INDEX idx_transactions_account_id ON transactions (account_id);
CREATE INDEX idx_loans_customer_id ON loans (customer_id);
CREATE INDEX idx_emis_loan_id ON emis (loan_id);
CREATE INDEX idx_approvals_loan_id ON approvals (loan_id);
CREATE INDEX idx_fraud_alerts_account_id ON fraud_alerts (account_id);
CREATE INDEX idx_fraud_alerts_status ON fraud_alerts (status);
CREATE INDEX idx_audit_logs_employee_id ON audit_logs (employee_id);
