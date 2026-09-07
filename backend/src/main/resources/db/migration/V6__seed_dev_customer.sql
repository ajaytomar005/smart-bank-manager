-- Dev/test customer account only. Password: Password123!
INSERT INTO customers (name, email, phone, kyc_status, segment, password_hash, account_status)
VALUES (
    'Dev Customer',
    'customer@smartbank.test',
    '7000000000',
    'VERIFIED',
    'retail',
    '$2a$10$1qT7FjTA5mTLYki1NEvX6ewj7nbfuB.J846D0OHpFQ6kFDiZFsAfy',
    'ACTIVE'
);
