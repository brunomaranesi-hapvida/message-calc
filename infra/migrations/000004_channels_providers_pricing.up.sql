CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS provider_channel_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    price DECIMAL(10,6) NOT NULL,
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_to DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS default_provider_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID UNIQUE NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed channels
INSERT INTO channels (name, code) VALUES
    ('SMS', 'SMS'),
    ('RCS', 'RCS'),
    ('HSM - Marketing', 'HSM_MARKETING'),
    ('HSM - Utility', 'HSM_UTILITY'),
    ('Email', 'EMAIL'),
    ('Push Notification', 'PUSH_NOTIFICATION')
ON CONFLICT (code) DO NOTHING;

-- Seed providers
INSERT INTO providers (name) VALUES
    ('Zenvia'), ('Twilio'), ('Gupshup'), ('Health ID'), ('Sapios'),
    ('Docusign'), ('ASC'), ('Salesforce'), ('Interaxa'), ('Bemobi')
ON CONFLICT (name) DO NOTHING;

-- Seed prices (valid_to = NULL means currently active)
INSERT INTO provider_channel_prices (provider_id, channel_id, price, valid_from)
SELECT p.id, c.id, v.price, CURRENT_DATE
FROM (VALUES
    ('Zenvia','SMS',0.065),('Twilio','SMS',0.07),('Gupshup','SMS',0.06),('Health ID','SMS',0.055),('Sapios','SMS',0.058),('Docusign','SMS',0.08),('ASC','SMS',0.062),('Salesforce','SMS',0.075),('Interaxa','SMS',0.068),('Bemobi','SMS',0.059),
    ('Zenvia','RCS',0.08),('Twilio','RCS',0.09),('Gupshup','RCS',0.075),('Health ID','RCS',0.07),('Sapios','RCS',0.072),('Docusign','RCS',0.095),('ASC','RCS',0.078),('Salesforce','RCS',0.088),('Interaxa','RCS',0.082),('Bemobi','RCS',0.074),
    ('Zenvia','HSM_MARKETING',0.052),('Twilio','HSM_MARKETING',0.055),('Gupshup','HSM_MARKETING',0.048),('Health ID','HSM_MARKETING',0.045),('Sapios','HSM_MARKETING',0.047),('Docusign','HSM_MARKETING',0.06),('ASC','HSM_MARKETING',0.05),('Salesforce','HSM_MARKETING',0.058),('Interaxa','HSM_MARKETING',0.053),('Bemobi','HSM_MARKETING',0.046),
    ('Zenvia','HSM_UTILITY',0.035),('Twilio','HSM_UTILITY',0.038),('Gupshup','HSM_UTILITY',0.032),('Health ID','HSM_UTILITY',0.03),('Sapios','HSM_UTILITY',0.031),('Docusign','HSM_UTILITY',0.042),('ASC','HSM_UTILITY',0.034),('Salesforce','HSM_UTILITY',0.04),('Interaxa','HSM_UTILITY',0.036),('Bemobi','HSM_UTILITY',0.029),
    ('Zenvia','EMAIL',0.005),('Twilio','EMAIL',0.006),('Gupshup','EMAIL',0.0045),('Health ID','EMAIL',0.004),('Sapios','EMAIL',0.0042),('Docusign','EMAIL',0.007),('ASC','EMAIL',0.0048),('Salesforce','EMAIL',0.0055),('Interaxa','EMAIL',0.005),('Bemobi','EMAIL',0.0038),
    ('Zenvia','PUSH_NOTIFICATION',0.002),('Twilio','PUSH_NOTIFICATION',0.0025),('Gupshup','PUSH_NOTIFICATION',0.0018),('Health ID','PUSH_NOTIFICATION',0.0015),('Sapios','PUSH_NOTIFICATION',0.0016),('Docusign','PUSH_NOTIFICATION',0.003),('ASC','PUSH_NOTIFICATION',0.0019),('Salesforce','PUSH_NOTIFICATION',0.0022),('Interaxa','PUSH_NOTIFICATION',0.002),('Bemobi','PUSH_NOTIFICATION',0.0014)
) AS v(provider_name, channel_code, price)
JOIN providers p ON p.name = v.provider_name
JOIN channels c ON c.code = v.channel_code;

-- Seed default providers (all default to Zenvia)
INSERT INTO default_provider_configs (channel_id, provider_id)
SELECT c.id, p.id
FROM channels c
CROSS JOIN providers p
WHERE p.name = 'Zenvia'
ON CONFLICT (channel_id) DO NOTHING;
