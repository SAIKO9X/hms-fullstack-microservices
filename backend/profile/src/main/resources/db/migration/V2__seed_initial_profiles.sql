-- ============================================================
-- V2__seed_initial_profiles.sql
-- Seed inicial de perfis vinculados aos usuários do user-service
--
-- Nota: os user_ids são referenciados diretamente (sem subquery) pois
-- o Profile Service possui seu próprio banco isolado (ms_profile_db) e
-- não tem acesso à tabela tb_users do User Service (ms_user_db).
-- Os IDs abaixo correspondem à ordem de inserção do seed do user-service:
--   1 = admin@hms.com  (ADMIN)
--   2 = doctor@hms.com (DOCTOR)
--   3 = patient@hms.com (PATIENT)
-- Os INSERTs são ignorados caso o perfil já exista (uq_*_user_id).
-- ============================================================

INSERT IGNORE INTO tb_doctors (
    user_id,
    name,
    crm_number,
    specialization,
    department,
    years_of_experience,
    consultation_fee
)
VALUES (
    2,
    'Doctor Demo',
    'CRM-SP-123456',
    'Clínica Geral',
    'Ambulatório',
    5,
    150.00
);

INSERT IGNORE INTO tb_patients (
    user_id,
    name,
    cpf,
    blood_group,
    gender
)
VALUES (
    3,
    'Patient Demo',
    '000.000.000-00',
    'O_POSITIVE',
    'MALE'
);
