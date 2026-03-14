-- ============================================================
-- V1__init_schema.sql
-- Criação da estrutura da tabela de usuários
-- ============================================================

CREATE TABLE IF NOT EXISTS tb_users (
    id                          BIGINT          NOT NULL AUTO_INCREMENT,
    name                        VARCHAR(255)    NOT NULL,
    email                       VARCHAR(255)    NOT NULL,
    password                    VARCHAR(255)    NOT NULL,
    role                        VARCHAR(50)     NOT NULL,
    active                      BOOLEAN         NOT NULL DEFAULT FALSE,
    verification_code           VARCHAR(255)    NULL,
    verification_code_expires_at DATETIME(6)   NULL,

    CONSTRAINT pk_tb_users      PRIMARY KEY (id),
    CONSTRAINT uq_users_email   UNIQUE      (email)
);