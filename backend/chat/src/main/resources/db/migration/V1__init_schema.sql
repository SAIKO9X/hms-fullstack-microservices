-- ============================================================
-- V1__init_schema.sql
-- Estrutura das tabelas do chat-service
-- ============================================================

CREATE TABLE IF NOT EXISTS tb_chat_messages (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    chat_id         VARCHAR(100)    NOT NULL,
    sender_id       BIGINT          NOT NULL,
    recipient_id    BIGINT          NOT NULL,
    content         TEXT            NOT NULL,
    status          VARCHAR(50)     NULL,
    timestamp       DATETIME(6)     NULL,

    CONSTRAINT pk_tb_chat_messages PRIMARY KEY (id)
);