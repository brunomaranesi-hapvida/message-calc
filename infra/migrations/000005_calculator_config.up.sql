CREATE TABLE IF NOT EXISTS calculator_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    default_people_reached INT NOT NULL DEFAULT 100000,
    default_start_month INT NOT NULL DEFAULT 1,
    default_opt_in_rate DECIMAL(5,4) NOT NULL DEFAULT 0.7,
    default_whatsapp_delivery_rate DECIMAL(5,4) NOT NULL DEFAULT 0.95,
    default_sms_delivery_rate DECIMAL(5,4) NOT NULL DEFAULT 0.9,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO calculator_configs (default_people_reached, default_start_month, default_opt_in_rate, default_whatsapp_delivery_rate, default_sms_delivery_rate)
SELECT 100000, 1, 0.7, 0.95, 0.9
WHERE NOT EXISTS (SELECT 1 FROM calculator_configs);
