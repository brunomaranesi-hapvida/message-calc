INSERT INTO users (email, password) VALUES 
('admin@admin.com', '$2a$10$yXr4WfqZDguakpQW9yGBVuDuCz.rAVnGS0vlbZqnk2CbX.ahCF7Zq')
ON CONFLICT (email) DO NOTHING;
