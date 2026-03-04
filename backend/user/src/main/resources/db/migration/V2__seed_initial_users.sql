-- ============================================================
-- V2__seed_initial_users.sql
-- Seed inicial de usuários para o user-service
-- Senha padrão para todos: Admin@123
-- Hash BCrypt (cost 12):
-- $2a$12$hqCCTwBwsPwwAZUGABi3OeR6UMSr4PwKF0ZJG5LL7RAq0dSKP0hAi
--
-- Nota: usa INSERT IGNORE para não falhar caso os usuários já existam
-- (cenário onde o banco já foi populado antes da adoção do Flyway).
-- ============================================================

INSERT IGNORE INTO tb_users (
    name,
    email,
    password,
    role,
    active,
    verification_code,
    verification_code_expires_at
)
VALUES
    (
        'System Administrator',
        'admin@hms.com',
        '$2a$12$hqCCTwBwsPwwAZUGABi3OeR6UMSr4PwKF0ZJG5LL7RAq0dSKP0hAi',
        'ADMIN',
        TRUE,
        NULL,
        NULL
    ),
    (
        'Doctor Demo',
        'doctor@hms.com',
        '$2a$12$hqCCTwBwsPwwAZUGABi3OeR6UMSr4PwKF0ZJG5LL7RAq0dSKP0hAi',
        'DOCTOR',
        TRUE,
        NULL,
        NULL
    ),
    (
        'Patient Demo',
        'patient@hms.com',
        '$2a$12$hqCCTwBwsPwwAZUGABi3OeR6UMSr4PwKF0ZJG5LL7RAq0dSKP0hAi',
        'PATIENT',
        TRUE,
        NULL,
        NULL
    );
