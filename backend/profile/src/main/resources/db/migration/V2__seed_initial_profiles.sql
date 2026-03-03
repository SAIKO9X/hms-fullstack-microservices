-- ============================================================
-- V2__seed_initial_profiles.sql
-- Seed inicial de perfis vinculados aos usuários do user-service
-- IDs de usuário: Admin=1, Doctor=2, Patient=3 (gerados pelo Flyway do user-service)
-- ============================================================

INSERT INTO tb_doctors (
    user_id,
    name,
    crm_number,
    specialization,
    department,
    years_of_experience,
    consultation_fee
)
VALUES (
    2,                      -- userId do 'Doctor Demo' (user-service)
    'Doctor Demo',
    'CRM-SP-123456',
    'Clínica Geral',
    'Ambulatório',
    5,
    150.00
);

INSERT INTO tb_patients (
    user_id,
    name,
    cpf,
    blood_group,
    gender
)
VALUES (
    3,                      -- userId do 'Patient Demo' (user-service)
    'Patient Demo',
    '000.000.000-00',
    'O_POSITIVE',
    'MALE'
);
