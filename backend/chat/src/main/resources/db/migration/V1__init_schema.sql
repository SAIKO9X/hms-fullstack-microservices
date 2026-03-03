-- ============================================================
-- V1__init_schema.sql
-- Estrutura das tabelas do chat-service
-- ============================================================

CREATE TABLE IF NOT EXISTS tb_chat_messages (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    sender_id       VARCHAR(255)    NOT NULL,
    receiver_id     VARCHAR(255)    NOT NULL,
    content         VARCHAR(1000)   NULL,
    status          VARCHAR(50)     NOT NULL,
    timestamp       DATETIME(6)     NULL,

    CONSTRAINT pk_tb_chat_messages PRIMARY KEY (id)
);

