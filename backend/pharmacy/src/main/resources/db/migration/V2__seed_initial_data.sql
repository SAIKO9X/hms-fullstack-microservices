-- ============================================================
-- V2__seed_initial_data.sql
-- Seed inicial de medicamentos para o pharmacy-service
--
-- Nota: os medicine_ids no inventory são resolvidos via subquery pelo
-- nome para que este seed funcione independentemente do AUTO_INCREMENT.
-- O user_id do patient_read_model também é resolvido via subquery.
-- ============================================================

INSERT IGNORE INTO tb_medicines (name, dosage, category, type, manufacturer, unit_price, total_stock)
VALUES('Paracetamol',     '500mg',  'ANALGESIC',    'TABLET',  'Genérico',        2.50,  100),
    ('Amoxicilina',     '500mg',  'ANTIBIOTIC',   'CAPSULE', 'EMS',             8.90,   60),
    ('Ibuprofeno',      '400mg',  'ANALGESIC',    'TABLET',  'Genérico',        3.20,   80),
    ('Omeprazol',       '20mg',   'OTHER',        'CAPSULE', 'Medley',          5.00,   50),
    ('Losartana',       '50mg',   'OTHER',        'TABLET',  'Genérico',        1.80,  120);

INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-PARA-001', 100, 100, 'ACTIVE', '2027-01-01', CURDATE() FROM tb_medicines WHERE name = 'Paracetamol';
INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-AMOX-001',  60,  60, 'ACTIVE', '2026-06-01', CURDATE() FROM tb_medicines WHERE name = 'Amoxicilina';
INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-IBUP-001',  80,  80, 'ACTIVE', '2026-12-01', CURDATE() FROM tb_medicines WHERE name = 'Ibuprofeno';
INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-OMEP-001',  50,  50, 'ACTIVE', '2026-09-01', CURDATE() FROM tb_medicines WHERE name = 'Omeprazol';
INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-LOSA-001', 120, 120, 'ACTIVE', '2027-03-01', CURDATE() FROM tb_medicines WHERE name = 'Losartana';

-- patient_read_model é populado automaticamente via eventos de mensageria (RabbitMQ)
-- quando um paciente se registra no sistema. Não há necessidade de seed aqui.
