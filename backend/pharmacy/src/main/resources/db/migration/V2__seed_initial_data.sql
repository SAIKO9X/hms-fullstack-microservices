-- ============================================================
-- V2__seed_initial_data.sql
-- Seed inicial de medicamentos para o pharmacy-service
-- ============================================================

INSERT INTO tb_medicines (name, dosage, category, type, manufacturer, unit_price, total_stock)
VALUES('Paracetamol',     '500mg',  'ANALGESIC',    'TABLET',  'Genérico',        2.50,  100),
    ('Amoxicilina',     '500mg',  'ANTIBIOTIC',   'CAPSULE', 'EMS',             8.90,   60),
    ('Ibuprofeno',      '400mg',  'ANALGESIC',    'TABLET',  'Genérico',        3.20,   80),
    ('Omeprazol',       '20mg',   'GASTRIC',      'CAPSULE', 'Medley',          5.00,   50),
    ('Losartana',       '50mg',   'CARDIOVASCULAR','TABLET', 'Genérico',        1.80,  120);

INSERT INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
VALUES
    (1, 'LOTE-PARA-001', 100, 100, 'ACTIVE', '2027-01-01', CURDATE()),
    (2, 'LOTE-AMOX-001',  60,  60, 'ACTIVE', '2026-06-01', CURDATE()),
    (3, 'LOTE-IBUP-001',  80,  80, 'ACTIVE', '2026-12-01', CURDATE()),
    (4, 'LOTE-OMEP-001',  50,  50, 'ACTIVE', '2026-09-01', CURDATE()),
    (5, 'LOTE-LOSA-001', 120, 120, 'ACTIVE', '2027-03-01', CURDATE());

INSERT INTO patient_read_model (user_id, name, email, phone_number, cpf)
VALUES
    (3, 'Patient Demo', 'patient@hms.com', NULL, '000.000.000-00');
