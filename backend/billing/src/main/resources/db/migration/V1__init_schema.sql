-- ============================================================
-- V1__init_schema.sql
-- Estrutura das tabelas do billing-service
-- ============================================================

CREATE TABLE IF NOT EXISTS tb_insurance_providers (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    name                VARCHAR(255)    NOT NULL,
    coverage_percentage DECIMAL(5,2)    NOT NULL,
    active              BOOLEAN         NOT NULL DEFAULT TRUE,

    CONSTRAINT pk_tb_insurance_providers PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS tb_invoices (
    id                      BIGINT          NOT NULL AUTO_INCREMENT,
    appointment_id          BIGINT          NULL,
    patient_id              VARCHAR(255)    NOT NULL,
    doctor_id               VARCHAR(255)    NOT NULL,
    total_amount            DECIMAL(10,2)   NOT NULL,
    insurance_coverage      DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    patient_responsibility  DECIMAL(10,2)   NOT NULL,
    status                  VARCHAR(50)     NOT NULL,
    issue_date              DATETIME(6)     NULL,
    due_date                DATE            NULL,
    description             VARCHAR(500)    NULL,
    insurance_provider_id   BIGINT          NULL,

    CONSTRAINT pk_tb_invoices               PRIMARY KEY (id),
    CONSTRAINT fk_invoices_insurance        FOREIGN KEY (insurance_provider_id)
        REFERENCES tb_insurance_providers (id)
);

CREATE TABLE IF NOT EXISTS tb_patient_insurance (
    id                      BIGINT          NOT NULL AUTO_INCREMENT,
    patient_id              VARCHAR(255)    NOT NULL,
    insurance_provider_id   BIGINT          NOT NULL,
    policy_number           VARCHAR(255)    NULL,
    active                  BOOLEAN         NOT NULL DEFAULT TRUE,

    CONSTRAINT pk_tb_patient_insurance      PRIMARY KEY (id),
    CONSTRAINT fk_pat_insurance_provider    FOREIGN KEY (insurance_provider_id)
        REFERENCES tb_insurance_providers (id)
);

