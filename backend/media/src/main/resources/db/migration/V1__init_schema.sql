-- ============================================================
-- V1__init_schema.sql
-- Estrutura das tabelas do media-service
-- ============================================================

CREATE TABLE IF NOT EXISTS tb_media_files (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    name            VARCHAR(255)    NULL,
    type            VARCHAR(255)    NULL,
    size            BIGINT          NULL,
    data            LONGBLOB        NULL,
    storage         VARCHAR(50)     NULL,
    creation_date   DATETIME(6)     NULL,

    CONSTRAINT pk_tb_media_files PRIMARY KEY (id)
);

