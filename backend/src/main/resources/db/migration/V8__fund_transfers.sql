CREATE TABLE beneficiaries (
    beneficiary_id      BIGSERIAL PRIMARY KEY,
    customer_id         BIGINT NOT NULL REFERENCES customers (customer_id),
    nickname            VARCHAR(100) NOT NULL,
    beneficiary_type    VARCHAR(20) NOT NULL,
    internal_account_id BIGINT REFERENCES accounts (account_id),
    account_number      VARCHAR(50),
    ifsc_code           VARCHAR(20),
    upi_id              VARCHAR(100),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING_ACTIVATION',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    activates_at        TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_beneficiaries_customer_id ON beneficiaries (customer_id);

CREATE TABLE fund_transfers (
    transfer_id            BIGSERIAL PRIMARY KEY,
    source_account_id      BIGINT NOT NULL REFERENCES accounts (account_id),
    destination_account_id BIGINT REFERENCES accounts (account_id),
    beneficiary_id          BIGINT REFERENCES beneficiaries (beneficiary_id),
    initiated_by_customer_id BIGINT NOT NULL REFERENCES customers (customer_id),
    mode                    VARCHAR(20) NOT NULL,
    amount                  NUMERIC(19, 2) NOT NULL,
    remarks                 VARCHAR(280),
    status                  VARCHAR(20) NOT NULL DEFAULT 'INITIATED',
    failure_reason          VARCHAR(500),
    initiated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at            TIMESTAMPTZ
);

CREATE INDEX idx_fund_transfers_source_account_id ON fund_transfers (source_account_id);
CREATE INDEX idx_fund_transfers_status ON fund_transfers (status);

ALTER TABLE transactions ADD COLUMN transfer_id BIGINT REFERENCES fund_transfers (transfer_id);
ALTER TABLE transactions ADD COLUMN direction VARCHAR(10);
ALTER TABLE transactions ADD COLUMN counterparty_label VARCHAR(255);
