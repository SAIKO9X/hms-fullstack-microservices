-- ============================================================
-- V1__init_schema.sql
-- Criação da estrutura da tabela de usuários
-- ============================================================

CREATE TABLE IF NOT EXISTS tb_users (
    id                              BIGINT          NOT NULL AUTO_INCREMENT,
    name                            VARCHAR(255)    NOT NULL,
    email                           VARCHAR(255)    NOT NULL,
    password                        VARCHAR(255)    NOT NULL,
    role                            VARCHAR(50)     NOT NULL,
    active                          BOOLEAN         NOT NULL DEFAULT FALSE,

    -- Verificação de conta
    verification_code               VARCHAR(255)    NULL,
    verification_code_expires_at    DATETIME(6)     NULL,

    -- Controle de Tokens (Access/Refresh e Reset)
    refresh_token                   VARCHAR(512)    NULL,
    reset_password_token            VARCHAR(255)    NULL,
    reset_password_token_expires_at DATETIME(6)     NULL,

    -- Segurança e Lockout
    failed_login_attempts           INT             NOT NULL DEFAULT 0,
    account_locked_until            DATETIME(6)     NULL,
    password_reset_requests         INT             NOT NULL DEFAULT 0,
    last_password_reset_request     DATETIME(6)     NULL,

    CONSTRAINT pk_tb_users          PRIMARY KEY (id),
    CONSTRAINT uq_users_email       UNIQUE      (email)
);