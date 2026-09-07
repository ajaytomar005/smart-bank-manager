-- Dev/test accounts only. All share password: Password123!
INSERT INTO employees (role_id, name, email, password_hash, status)
SELECT r.role_id, e.name, e.email, '$2a$10$1qT7FjTA5mTLYki1NEvX6ewj7nbfuB.J846D0OHpFQ6kFDiZFsAfy', 'ACTIVE'
FROM (VALUES
    ('Manager', 'manager@smartbank.test', 'MANAGER'),
    ('Loan Officer', 'loanofficer@smartbank.test', 'LOAN_OFFICER'),
    ('Teller', 'teller@smartbank.test', 'TELLER'),
    ('Compliance Officer', 'compliance@smartbank.test', 'COMPLIANCE_OFFICER'),
    ('Admin', 'admin@smartbank.test', 'ADMIN')
) AS e(name, email, role_name)
JOIN roles r ON r.role_name = e.role_name;
