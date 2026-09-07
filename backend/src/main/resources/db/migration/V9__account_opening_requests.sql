CREATE TABLE account_opening_requests (
    request_id           BIGSERIAL PRIMARY KEY,
    customer_id           BIGINT NOT NULL REFERENCES customers (customer_id),
    account_type          VARCHAR(20) NOT NULL,
    initial_deposit        NUMERIC(19, 2) NOT NULL DEFAULT 0,
    status                 VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    teller_reviewed_by     BIGINT REFERENCES employees (employee_id),
    teller_reviewed_at     TIMESTAMPTZ,
    teller_notes           VARCHAR(500),
    manager_decided_by     BIGINT REFERENCES employees (employee_id),
    manager_decided_at     TIMESTAMPTZ,
    manager_notes          VARCHAR(500),
    created_account_id     BIGINT REFERENCES accounts (account_id),
    requested_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_account_opening_requests_customer_id ON account_opening_requests (customer_id);
CREATE INDEX idx_account_opening_requests_status ON account_opening_requests (status);

CREATE TABLE kyc_documents (
    document_id       BIGSERIAL PRIMARY KEY,
    request_id        BIGINT NOT NULL REFERENCES account_opening_requests (request_id),
    customer_id       BIGINT NOT NULL REFERENCES customers (customer_id),
    document_type     VARCHAR(30) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    storage_key       VARCHAR(500) NOT NULL,
    content_type      VARCHAR(100) NOT NULL,
    size_bytes        BIGINT NOT NULL,
    uploaded_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kyc_documents_request_id ON kyc_documents (request_id);
