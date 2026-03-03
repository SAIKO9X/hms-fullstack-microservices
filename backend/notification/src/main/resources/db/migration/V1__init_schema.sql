-- ============================================================
-- V1__init_schema.sql
-- Estrutura das tabelas do notification-service
-- ============================================================

CREATE TABLE IF NOT EXISTS notification (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    recipient_id    VARCHAR(255)    NOT NULL,
    title           VARCHAR(255)    NULL,
    message         VARCHAR(500)    NULL,
    type            VARCHAR(50)     NULL,
    is_read         BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      DATETIME(6)     NULL,

    CONSTRAINT pk_notification PRIMARY KEY (id)
);

