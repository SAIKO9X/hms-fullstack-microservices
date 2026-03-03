-- ============================================================
-- V1__init_schema.sql
-- Estrutura das tabelas do audit-service
-- ============================================================

CREATE TABLE IF NOT EXISTS tb_audit_logs (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    actor_id        VARCHAR(255)    NULL,
    actor_role      VARCHAR(255)    NULL,
    action          VARCHAR(255)    NULL,
    resource_name   VARCHAR(255)    NULL,
    resource_id     VARCHAR(255)    NULL,
    details         LONGTEXT        NULL,
    ip_address      VARCHAR(255)    NULL,
    timestamp       DATETIME(6)     NULL,

    CONSTRAINT pk_tb_audit_logs PRIMARY KEY (id)
);

