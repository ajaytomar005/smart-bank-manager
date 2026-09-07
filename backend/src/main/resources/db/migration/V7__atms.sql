CREATE TABLE atms (
    atm_id            BIGSERIAL PRIMARY KEY,
    name              VARCHAR(255) NOT NULL,
    code              VARCHAR(50) NOT NULL UNIQUE,
    address           VARCHAR(500) NOT NULL,
    latitude          DOUBLE PRECISION NOT NULL,
    longitude         DOUBLE PRECISION NOT NULL,
    status            VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
    cash_status       VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    is_24x7           BOOLEAN NOT NULL DEFAULT false,
    open_time         TIME,
    close_time        TIME,
    last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_atms_lat_lng ON atms (latitude, longitude);
CREATE INDEX idx_atms_status_heartbeat ON atms (status, last_heartbeat_at);

CREATE TABLE atm_services (
    atm_id  BIGINT NOT NULL REFERENCES atms (atm_id),
    service VARCHAR(30) NOT NULL,
    PRIMARY KEY (atm_id, service)
);

INSERT INTO atms (name, code, address, latitude, longitude, status, cash_status, is_24x7, open_time, close_time, last_heartbeat_at) VALUES
    ('MG Road ATM',          'ATM-001', '1 MG Road, Bengaluru',            12.9716, 77.6046, 'ONLINE',      'AVAILABLE',   true,  NULL,     NULL,     now()),
    ('Brigade Road ATM',     'ATM-002', '22 Brigade Road, Bengaluru',      12.9698, 77.6070, 'ONLINE',      'LOW',         true,  NULL,     NULL,     now()),
    ('Koramangala ATM',      'ATM-003', '80 Ft Road, Koramangala',         12.9352, 77.6245, 'ONLINE',      'AVAILABLE',   false, '09:00',  '21:00',  now()),
    ('Indiranagar ATM',      'ATM-004', '100 Ft Road, Indiranagar',        12.9784, 77.6408, 'OFFLINE',     'OUT_OF_CASH', true,  NULL,     NULL,     now() - INTERVAL '20 minutes'),
    ('Whitefield ATM',       'ATM-005', 'ITPL Main Road, Whitefield',      12.9698, 77.7500, 'ONLINE',      'AVAILABLE',   true,  NULL,     NULL,     now()),
    ('Electronic City ATM',  'ATM-006', 'Hosur Road, Electronic City',     12.8452, 77.6602, 'MAINTENANCE', 'AVAILABLE',   true,  NULL,     NULL,     now()),
    ('Jayanagar ATM',        'ATM-007', '4th Block, Jayanagar',            12.9250, 77.5938, 'ONLINE',      'AVAILABLE',   false, '08:00',  '22:00',  now()),
    ('HSR Layout ATM',       'ATM-008', 'Sector 2, HSR Layout',            12.9121, 77.6446, 'ONLINE',      'LOW',         true,  NULL,     NULL,     now()),
    ('Malleshwaram ATM',     'ATM-009', 'Sampige Road, Malleshwaram',      13.0027, 77.5697, 'ONLINE',      'AVAILABLE',   true,  NULL,     NULL,     now()),
    ('Rajajinagar ATM',      'ATM-010', '1st Block, Rajajinagar',          12.9910, 77.5550, 'ONLINE',      'OUT_OF_CASH', true,  NULL,     NULL,     now()),
    ('Basavanagudi ATM',     'ATM-011', 'Bull Temple Road, Basavanagudi',  12.9422, 77.5760, 'ONLINE',      'AVAILABLE',   false, '06:00',  '23:00',  now()),
    ('Yeshwanthpur ATM',     'ATM-012', 'Tumkur Road, Yeshwanthpur',       13.0284, 77.5540, 'OFFLINE',     'AVAILABLE',   true,  NULL,     NULL,     now() - INTERVAL '15 minutes'),
    ('Banashankari ATM',     'ATM-013', '2nd Stage, Banashankari',         12.9250, 77.5667, 'ONLINE',      'AVAILABLE',   true,  NULL,     NULL,     now()),
    ('Marathahalli ATM',     'ATM-014', 'Outer Ring Road, Marathahalli',   12.9569, 77.7011, 'ONLINE',      'LOW',         false, '09:00',  '18:00',  now()),
    ('BTM Layout ATM',       'ATM-015', '2nd Stage, BTM Layout',           12.9166, 77.6101, 'ONLINE',      'AVAILABLE',   true,  NULL,     NULL,     now());

INSERT INTO atm_services (atm_id, service)
SELECT atm_id, s.service FROM atms a
CROSS JOIN LATERAL (VALUES ('WITHDRAWAL'), ('DEPOSIT'), ('BALANCE_INQUIRY')) AS s(service)
WHERE a.code = 'ATM-001';

INSERT INTO atm_services (atm_id, service)
SELECT atm_id, 'WITHDRAWAL' FROM atms WHERE code = 'ATM-002';

INSERT INTO atm_services (atm_id, service)
SELECT atm_id, s.service FROM atms a
CROSS JOIN LATERAL (VALUES ('WITHDRAWAL'), ('CARDLESS')) AS s(service)
WHERE a.code = 'ATM-003';

INSERT INTO atm_services (atm_id, service)
SELECT atm_id, 'WITHDRAWAL' FROM atms WHERE code = 'ATM-004';

INSERT INTO atm_services (atm_id, service)
SELECT atm_id, s.service FROM atms a
CROSS JOIN LATERAL (VALUES ('WITHDRAWAL'), ('DEPOSIT')) AS s(service)
WHERE a.code = 'ATM-005';

INSERT INTO atm_services (atm_id, service)
SELECT atm_id, 'WITHDRAWAL' FROM atms WHERE code = 'ATM-006';

INSERT INTO atm_services (atm_id, service)
SELECT atm_id, s.service FROM atms a
CROSS JOIN LATERAL (VALUES ('WITHDRAWAL'), ('BALANCE_INQUIRY')) AS s(service)
WHERE a.code = 'ATM-007';

INSERT INTO atm_services (atm_id, service)
SELECT atm_id, s.service FROM atms a
CROSS JOIN LATERAL (VALUES ('WITHDRAWAL'), ('CARDLESS')) AS s(service)
WHERE a.code = 'ATM-008';

INSERT INTO atm_services (atm_id, service)
SELECT atm_id, s.service FROM atms a
CROSS JOIN LATERAL (VALUES ('WITHDRAWAL'), ('DEPOSIT'), ('CARDLESS'), ('BALANCE_INQUIRY')) AS s(service)
WHERE a.code = 'ATM-009';

INSERT INTO atm_services (atm_id, service)
SELECT atm_id, 'WITHDRAWAL' FROM atms WHERE code = 'ATM-010';

INSERT INTO atm_services (atm_id, service)
SELECT atm_id, 'WITHDRAWAL' FROM atms WHERE code = 'ATM-011';

INSERT INTO atm_services (atm_id, service)
SELECT atm_id, s.service FROM atms a
CROSS JOIN LATERAL (VALUES ('WITHDRAWAL'), ('DEPOSIT')) AS s(service)
WHERE a.code = 'ATM-012';

INSERT INTO atm_services (atm_id, service)
SELECT atm_id, s.service FROM atms a
CROSS JOIN LATERAL (VALUES ('WITHDRAWAL'), ('BALANCE_INQUIRY')) AS s(service)
WHERE a.code = 'ATM-013';

INSERT INTO atm_services (atm_id, service)
SELECT atm_id, 'WITHDRAWAL' FROM atms WHERE code = 'ATM-014';

INSERT INTO atm_services (atm_id, service)
SELECT atm_id, s.service FROM atms a
CROSS JOIN LATERAL (VALUES ('WITHDRAWAL'), ('DEPOSIT'), ('CARDLESS')) AS s(service)
WHERE a.code = 'ATM-015';
