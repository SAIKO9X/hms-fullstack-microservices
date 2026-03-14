-- ============================================================
-- V2__seed_users.sql
-- Carga inicial de usuários (Administrador, Médicos e Pacientes)
-- Senha padrão para todos: Admin@123
-- Hash BCrypt (cost 10): $2a$10$.wUk7jrDk9veFciuPmM1nusdlS.j5Wj6eUEr9TiLkm2p1ktNHYE3S
-- ============================================================

INSERT IGNORE INTO tb_users (
    name, email, password, role, active,
    verification_code, verification_code_expires_at,
    refresh_token, reset_password_token, reset_password_token_expires_at,
    failed_login_attempts, account_locked_until,
    password_reset_requests, last_password_reset_request
) VALUES
    -- --------------------------------------------------------
    -- Administrador
    -- --------------------------------------------------------
    ('System Administrator', 'admin@hms.com', '$2a$10$.wUk7jrDk9veFciuPmM1nusdlS.j5Wj6eUEr9TiLkm2p1ktNHYE3S', 'ADMIN', TRUE, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL),

    -- --------------------------------------------------------
    -- Médico Demo (id=2)
    -- --------------------------------------------------------
    ('Doctor Demo', 'doctor@hms.com', '$2a$10$.wUk7jrDk9veFciuPmM1nusdlS.j5Wj6eUEr9TiLkm2p1ktNHYE3S', 'DOCTOR', TRUE, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL),

    -- --------------------------------------------------------
    -- Paciente Demo (id=3 — referenciado diretamente nos seeds de profile, appointment e pharmacy)
    -- --------------------------------------------------------
    ('Patient Demo', 'patient@hms.com', '$2a$10$.wUk7jrDk9veFciuPmM1nusdlS.j5Wj6eUEr9TiLkm2p1ktNHYE3S', 'PATIENT', TRUE, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL),

    -- --------------------------------------------------------
    -- Demais Médicos (ids 4–8)
    -- --------------------------------------------------------
    ('Dr. Carlos Eduardo Ribeiro', 'dr.carlos@hms.com', '$2a$10$.wUk7jrDk9veFciuPmM1nusdlS.j5Wj6eUEr9TiLkm2p1ktNHYE3S', 'DOCTOR', TRUE, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL),
    ('Dra. Ana Paula Ferreira', 'dr.ana@hms.com', '$2a$10$.wUk7jrDk9veFciuPmM1nusdlS.j5Wj6eUEr9TiLkm2p1ktNHYE3S', 'DOCTOR', TRUE, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL),
    ('Dr. Roberto Nascimento', 'dr.roberto@hms.com', '$2a$10$.wUk7jrDk9veFciuPmM1nusdlS.j5Wj6eUEr9TiLkm2p1ktNHYE3S', 'DOCTOR', TRUE, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL),
    ('Dra. Mariana Cavalcante', 'dr.mariana@hms.com', '$2a$10$.wUk7jrDk9veFciuPmM1nusdlS.j5Wj6eUEr9TiLkm2p1ktNHYE3S', 'DOCTOR', TRUE, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL),
    ('Dr. Paulo Henrique Almeida', 'dr.paulo@hms.com', '$2a$10$.wUk7jrDk9veFciuPmM1nusdlS.j5Wj6eUEr9TiLkm2p1ktNHYE3S', 'DOCTOR', TRUE, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL),

    -- --------------------------------------------------------
    -- Demais Pacientes (ids 9–18)
    -- --------------------------------------------------------
    ('João Victor Silva', 'joao.silva@email.com', '$2a$10$.wUk7jrDk9veFciuPmM1nusdlS.j5Wj6eUEr9TiLkm2p1ktNHYE3S', 'PATIENT', TRUE, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL),
    ('Maria Fernanda Santos', 'maria.santos@email.com', '$2a$10$.wUk7jrDk9veFciuPmM1nusdlS.j5Wj6eUEr9TiLkm2p1ktNHYE3S', 'PATIENT', TRUE, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL),
    ('Pedro Henrique Oliveira', 'pedro.oliveira@email.com', '$2a$10$.wUk7jrDk9veFciuPmM1nusdlS.j5Wj6eUEr9TiLkm2p1ktNHYE3S', 'PATIENT', TRUE, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL),
    ('Ana Beatriz Costa', 'ana.costa@email.com', '$2a$10$.wUk7jrDk9veFciuPmM1nusdlS.j5Wj6eUEr9TiLkm2p1ktNHYE3S', 'PATIENT', TRUE, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL),
    ('Lucas Gabriel Ferreira', 'lucas.ferreira@email.com', '$2a$10$.wUk7jrDk9veFciuPmM1nusdlS.j5Wj6eUEr9TiLkm2p1ktNHYE3S', 'PATIENT', TRUE, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL),
    ('Júlia Rodrigues Alves', 'julia.alves@email.com', '$2a$10$.wUk7jrDk9veFciuPmM1nusdlS.j5Wj6eUEr9TiLkm2p1ktNHYE3S', 'PATIENT', TRUE, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL),
    ('Marcos Vinícius Souza', 'marcos.souza@email.com', '$2a$10$.wUk7jrDk9veFciuPmM1nusdlS.j5Wj6eUEr9TiLkm2p1ktNHYE3S', 'PATIENT', TRUE, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL),
    ('Fernanda Cristina Lima', 'fernanda.lima@email.com', '$2a$10$.wUk7jrDk9veFciuPmM1nusdlS.j5Wj6eUEr9TiLkm2p1ktNHYE3S', 'PATIENT', TRUE, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL),
    ('Gabriel Augusto Rocha', 'gabriel.rocha@email.com', '$2a$10$.wUk7jrDk9veFciuPmM1nusdlS.j5Wj6eUEr9TiLkm2p1ktNHYE3S', 'PATIENT', TRUE, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL),
    ('Beatriz Caroline Mendes', 'beatriz.mendes@email.com', '$2a$10$.wUk7jrDk9veFciuPmM1nusdlS.j5Wj6eUEr9TiLkm2p1ktNHYE3S', 'PATIENT', TRUE, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL);