-- ============================================================
-- V1__init_schema.sql
-- ============================================================

-- 1. Tabela de Provedores de Seguro
CREATE TABLE tb_insurance_providers (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    name                VARCHAR(255)    NOT NULL,
    coverage_percentage DECIMAL(5,2)    NOT NULL,
    active              BOOLEAN         NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_tb_insurance_providers PRIMARY KEY (id)
);

-- 2. Tabela de Invoices
CREATE TABLE tb_invoices (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    pharmacy_sale_id    BIGINT          NULL,
    appointment_id      BIGINT          NULL,
    patient_id          VARCHAR(255)    NOT NULL,
    doctor_id           VARCHAR(255)    NOT NULL,
    total_amount        DECIMAL(10,2)   NOT NULL,
    insurance_covered   DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    patient_payable     DECIMAL(10,2)   NOT NULL,
    status              VARCHAR(50)     NOT NULL,
    issued_at           DATETIME(6)     NULL,
    paid_at             DATETIME(6)     NULL,
    patient_paid_at     DATETIME(6)     NULL,
    insurance_paid_at   DATETIME(6)     NULL,
    CONSTRAINT pk_tb_invoices PRIMARY KEY (id),
    CONSTRAINT uq_tb_invoices_appointment_id UNIQUE (appointment_id)
);

-- 3. Tabela de Seguros de Pacientes
CREATE TABLE tb_patient_insurances (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    patient_id          VARCHAR(255)    NOT NULL,
    provider_id         BIGINT          NOT NULL,
    policy_number       VARCHAR(255)    NULL,
    valid_until         DATE            NULL,
    CONSTRAINT pk_tb_patient_insurance PRIMARY KEY (id),
    CONSTRAINT fk_pat_insurance_provider FOREIGN KEY (provider_id)
        REFERENCES tb_insurance_providers (id)
);

-- 4. Seed de dados iniciais
INSERT INTO tb_insurance_providers (id, name, coverage_percentage, active)
VALUES
    (1, 'Unimed',                  0.80, true),
    (2, 'Amil',                    0.50, true),
    (3, 'Particular (Sem Convênio)', 0.00, true);