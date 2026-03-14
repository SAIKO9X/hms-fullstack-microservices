-- ============================================================
-- V2__seed_pharmacy.sql
-- Seed consolidado do pharmacy-service
-- Inclui medicamentos, estoque, read-model de pacientes,
-- prescrições processadas, vendas e baixa de estoque.
-- ============================================================

-- ============================================================
-- 1. CATÁLOGO DE MEDICAMENTOS
-- ============================================================
INSERT IGNORE INTO tb_medicines (name, dosage, category, type, manufacturer, unit_price, total_stock)
VALUES
    ('Paracetamol',           '500mg',  'ANALGESIC',    'TABLET',  'Genérico',        2.50,  100),
    ('Amoxicilina',           '500mg',  'ANTIBIOTIC',   'CAPSULE', 'EMS',             8.90,   60),
    ('Ibuprofeno',            '400mg',  'ANALGESIC',    'TABLET',  'Genérico',        3.20,   80),
    ('Omeprazol',             '20mg',   'OTHER',        'CAPSULE', 'Medley',          5.00,   50),
    ('Losartana',             '50mg',   'OTHER',        'TABLET',  'Genérico',        1.80,  120),
    ('Atorvastatina',         '20mg',   'OTHER',        'TABLET',  'Pfizer',         12.00,   60),
    ('Metformina',            '850mg',  'OTHER',        'TABLET',  'Merck',           4.50,   90),
    ('Fluconazol',            '150mg',  'OTHER',        'CAPSULE', 'Medley',         18.50,   40),
    ('Azitromicina',          '500mg',  'ANTIBIOTIC',   'TABLET',  'EMS',            14.80,   50),
    ('Dipirona Sódica',       '500mg',  'ANALGESIC',    'TABLET',  'Genérico',        1.50,  150),
    ('Ácido Acetilsalicílico','100mg',  'OTHER',        'TABLET',  'Bayer',           0.90,  200),
    ('Metoprolol Succinato',  '50mg',   'OTHER',        'TABLET',  'AstraZeneca',     8.20,   70),
    ('Lisinopril',            '10mg',   'OTHER',        'TABLET',  'Genérico',        2.90,   80);

-- ============================================================
-- 2. LOTES DE ESTOQUE
-- ============================================================
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

INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-ATOR-001',  60,  60, 'ACTIVE', '2027-06-01', CURDATE() FROM tb_medicines WHERE name = 'Atorvastatina';

INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-METF-001',  90,  90, 'ACTIVE', '2027-09-01', CURDATE() FROM tb_medicines WHERE name = 'Metformina';

INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-FLUC-001',  40,  40, 'ACTIVE', '2026-12-01', CURDATE() FROM tb_medicines WHERE name = 'Fluconazol';

INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-AZIT-001',  50,  50, 'ACTIVE', '2027-03-01', CURDATE() FROM tb_medicines WHERE name = 'Azitromicina';

INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-DIPI-001', 150, 150, 'ACTIVE', '2027-12-01', CURDATE() FROM tb_medicines WHERE name = 'Dipirona Sódica';

INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-AAS-001',  200, 200, 'ACTIVE', '2028-01-01', CURDATE() FROM tb_medicines WHERE name = 'Ácido Acetilsalicílico';

INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-METO-001',  70,  70, 'ACTIVE', '2027-08-01', CURDATE() FROM tb_medicines WHERE name = 'Metoprolol Succinato';

INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-LISI-001',  80,  80, 'ACTIVE', '2027-10-01', CURDATE() FROM tb_medicines WHERE name = 'Lisinopril';

-- ============================================================
-- 3. READ MODEL DE PACIENTES
-- ============================================================
INSERT IGNORE INTO patient_read_model (user_id, name, email, phone_number, cpf)
VALUES
    (3,  'Patient Demo',             'patient@hms.com',           '(11) 99999-0001', '000.000.000-00'),
    (9,  'João Victor Silva',        'joao.silva@email.com',      '(11) 98765-4001', '123.456.789-01'),
    (10, 'Maria Fernanda Santos',    'maria.santos@email.com',    '(11) 98765-4002', '234.567.890-12'),
    (11, 'Pedro Henrique Oliveira',  'pedro.oliveira@email.com',  '(11) 98765-4003', '345.678.901-23'),
    (12, 'Ana Beatriz Costa',        'ana.costa@email.com',       '(11) 98765-4004', '456.789.012-34'),
    (13, 'Lucas Gabriel Ferreira',   'lucas.ferreira@email.com',  '(11) 98765-4005', '567.890.123-45'),
    (14, 'Júlia Rodrigues Alves',    'julia.alves@email.com',     '(11) 98765-4006', '678.901.234-56'),
    (15, 'Marcos Vinícius Souza',    'marcos.souza@email.com',    '(11) 98765-4007', '789.012.345-67'),
    (16, 'Fernanda Cristina Lima',   'fernanda.lima@email.com',   '(11) 98765-4008', '890.123.456-78'),
    (17, 'Gabriel Augusto Rocha',    'gabriel.rocha@email.com',   '(11) 98765-4009', '901.234.567-89'),
    (18, 'Beatriz Caroline Mendes',  'beatriz.mendes@email.com',  '(11) 98765-4010', '012.345.678-90');

-- ============================================================
-- 4. PRESCRIÇÕES (MENSAGERIA)
-- ============================================================
INSERT IGNORE INTO tb_prescription_copy
    (prescription_id, patient_id, doctor_id, valid_until, notes, items_json, processed, received_at)
VALUES
    (
        1, 1, 1, '2026-03-14',
        'Prescrição de rotina. Retorno em 30 dias com resultados dos exames.',
        '[{"name":"Paracetamol","dosage":"500mg","frequency":"1 comprimido a cada 8h se dor/febre","duration":7},{"name":"Omeprazol","dosage":"20mg","frequency":"1 cápsula em jejum pela manhã","duration":30}]',
        TRUE, '2026-02-12 11:00:00'
    ),
    (
        2, 2, 2, '2026-03-15',
        'Tratamento para hipertensão arterial estágio 1. Monitorar PA semanalmente.',
        '[{"name":"Losartana Potássica","dosage":"50mg","frequency":"1 comprimido ao dia pela manhã","duration":30},{"name":"Atorvastatina","dosage":"20mg","frequency":"1 comprimido à noite","duration":30}]',
        TRUE, '2026-02-15 15:30:00'
    ),
    (
        3, 3, 3, '2026-02-27',
        'Tratamento de infecção viral com antibioticoterapia empírica e antitérmico.',
        '[{"name":"Amoxicilina","dosage":"500mg","frequency":"1 cápsula a cada 8h","duration":7},{"name":"Paracetamol Pediátrico","dosage":"200mg/mL","frequency":"0,4mL/kg a cada 6h se febre","duration":5}]',
        TRUE, '2026-02-20 10:30:00'
    );

-- ============================================================
-- 5. VENDAS DE BALCÃO
-- ============================================================
INSERT IGNORE INTO tb_pharmacy_sales
    (id, original_prescription_id, patient_id, buyer_name, buyer_contact, sale_date, total_amount)
VALUES
    (1, 1, 3,  'Patient Demo',          '(11) 99999-0001', '2026-02-12 11:30:00', 200.00),
    (2, 2, 9,  'João Victor Silva',     '(11) 98765-4001', '2026-02-15 16:00:00', 414.00),
    (3, 3, 10, 'Maria Fernanda Santos', '(11) 98765-4002', '2026-02-20 11:00:00', 211.90);

-- ============================================================
-- 6. ITENS DAS VENDAS
-- ============================================================
INSERT IGNORE INTO tb_pharmacy_sale_items (sale_id, medicine_id, medicine_name, batch_no, quantity, unit_price, total_price)
SELECT 1, id, 'Paracetamol',  'LOTE-PARA-001', 20, 2.50, 50.00 FROM tb_medicines WHERE name = 'Paracetamol';
INSERT IGNORE INTO tb_pharmacy_sale_items (sale_id, medicine_id, medicine_name, batch_no, quantity, unit_price, total_price)
SELECT 1, id, 'Omeprazol',    'LOTE-OMEP-001', 30, 5.00, 150.00 FROM tb_medicines WHERE name = 'Omeprazol';

INSERT IGNORE INTO tb_pharmacy_sale_items (sale_id, medicine_id, medicine_name, batch_no, quantity, unit_price, total_price)
SELECT 2, id, 'Losartana Potássica', 'LOTE-LOSA-001', 30, 1.80, 54.00 FROM tb_medicines WHERE name = 'Losartana';
INSERT IGNORE INTO tb_pharmacy_sale_items (sale_id, medicine_id, medicine_name, batch_no, quantity, unit_price, total_price)
SELECT 2, id, 'Atorvastatina',       'LOTE-ATOR-001', 30, 12.00, 360.00 FROM tb_medicines WHERE name = 'Atorvastatina';

INSERT IGNORE INTO tb_pharmacy_sale_items (sale_id, medicine_id, medicine_name, batch_no, quantity, unit_price, total_price)
SELECT 3, id, 'Amoxicilina',  'LOTE-AMOX-001', 21, 8.90, 186.90 FROM tb_medicines WHERE name = 'Amoxicilina';
INSERT IGNORE INTO tb_pharmacy_sale_items (sale_id, medicine_id, medicine_name, batch_no, quantity, unit_price, total_price)
SELECT 3, id, 'Paracetamol',  'LOTE-PARA-001', 10, 2.50, 25.00 FROM tb_medicines WHERE name = 'Paracetamol';

-- ============================================================
-- 7. AJUSTE DE ESTOQUE PÓS-VENDAS
-- ============================================================
UPDATE tb_medicine_inventory SET quantity = quantity - 30 WHERE batch_no = 'LOTE-PARA-001';
UPDATE tb_medicine_inventory SET quantity = quantity - 30 WHERE batch_no = 'LOTE-OMEP-001';
UPDATE tb_medicine_inventory SET quantity = quantity - 30 WHERE batch_no = 'LOTE-LOSA-001';
UPDATE tb_medicine_inventory SET quantity = quantity - 30 WHERE batch_no = 'LOTE-ATOR-001';
UPDATE tb_medicine_inventory SET quantity = quantity - 21 WHERE batch_no = 'LOTE-AMOX-001';

UPDATE tb_medicines SET total_stock = total_stock - 30 WHERE name = 'Paracetamol';
UPDATE tb_medicines SET total_stock = total_stock - 30 WHERE name = 'Omeprazol';
UPDATE tb_medicines SET total_stock = total_stock - 30 WHERE name = 'Losartana';
UPDATE tb_medicines SET total_stock = total_stock - 30 WHERE name = 'Atorvastatina';
UPDATE tb_medicines SET total_stock = total_stock - 21 WHERE name = 'Amoxicilina';