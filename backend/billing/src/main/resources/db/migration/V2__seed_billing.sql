-- ============================================================
-- V2__seed_billing.sql
-- Seed inicial do billing-service: Seguros e Faturas
--
-- NOTAS:
-- * patient_id e doctor_id referenciam o profile_id (profile-service) como string.
-- * appointment_id referencia o ID da consulta (appointment-service).
-- * Coberturas: Unimed (80%), Amil (50%).
-- * Taxas base: Demo (150), Carlos (250), Ana Paula (180), Roberto (200), Mariana (170), Paulo (220).
-- ============================================================

-- ============================================================
-- 1. SEGUROS DE SAÚDE DOS PACIENTES
-- ============================================================
INSERT IGNORE INTO tb_patient_insurances (patient_id, provider_id, policy_number, valid_until)
VALUES
    ('1', 1, 'UNIMED-POL-2024-0001', '2027-12-31'), -- Unimed 80% (Patient Demo)
    ('2', 2, 'AMIL-POL-2025-0009',   '2026-12-31'), -- Amil 50%   (João Silva)
    ('3', 1, 'UNIMED-POL-2025-0010', '2028-06-30'), -- Unimed 80% (Maria Santos)
    ('5', 1, 'UNIMED-POL-2025-0012', '2027-03-31'), -- Unimed 80% (Ana Costa)
    ('6', 2, 'AMIL-POL-2025-0013',   '2026-09-30'); -- Amil 50%   (Lucas Ferreira)


-- ============================================================
-- 2. FATURAS DE CONSULTAS CONCLUÍDAS
-- Status: PAID (Tudo pago), INSURANCE_PENDING (Aguardando seguro), PENDING (Aguardando paciente)
-- ============================================================
INSERT IGNORE INTO tb_invoices
    (appointment_id, pharmacy_sale_id, patient_id, doctor_id,
     total_amount, insurance_covered, patient_payable,
     status, issued_at, paid_at, patient_paid_at, insurance_paid_at)
VALUES
    -- 1. Demo + Demo | R$ 150 (Unimed 80% cobre 120, Paciente 30) -> PAID
    (1, NULL, '1', '1', 150.00, 120.00, 30.00, 'PAID',
     '2026-02-12 10:35:00', '2026-02-13 14:00:00', '2026-02-12 11:00:00', '2026-02-13 14:00:00'),

    -- 2. João + Carlos | R$ 250 (Amil 50% cobre 125, Paciente 125) -> INSURANCE_PENDING
    (2, NULL, '2', '2', 250.00, 125.00, 125.00, 'INSURANCE_PENDING',
     '2026-02-15 14:35:00', NULL, NULL, NULL),

    -- 3. Maria + Ana Paula | R$ 180 (Unimed 80% cobre 144, Paciente 36) -> PAID
    (3, NULL, '3', '3', 180.00, 144.00, 36.00, 'PAID',
     '2026-02-20 09:35:00', '2026-02-21 10:00:00', '2026-02-20 10:00:00', '2026-02-21 10:00:00'),

    -- 4. Pedro + Roberto | R$ 200 (Sem seguro, Paciente 200) -> PAID
    (4, NULL, '4', '4', 200.00, 0.00, 200.00, 'PAID',
     '2026-02-25 11:50:00', '2026-02-25 12:30:00', '2026-02-25 12:30:00', NULL),

    -- 5. Ana + Mariana | R$ 170 (Unimed 80% cobre 136, Paciente 34) -> PAID
    (5, NULL, '5', '5', 170.00, 136.00, 34.00, 'PAID',
     '2026-03-01 15:35:00', '2026-03-02 16:00:00', '2026-03-01 16:00:00', '2026-03-02 16:00:00'),

    -- 6. Lucas + Paulo | R$ 220 (Amil 50% cobre 110, Paciente 110) -> INSURANCE_PENDING
    (6, NULL, '6', '6', 220.00, 110.00, 110.00, 'INSURANCE_PENDING',
     '2026-03-05 10:35:00', NULL, NULL, NULL);