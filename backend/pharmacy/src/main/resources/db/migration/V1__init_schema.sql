-- ============================================================
-- V1__init_schema.sql
-- Estrutura das tabelas do pharmacy-service
-- ============================================================

CREATE TABLE IF NOT EXISTS tb_medicines (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    name            VARCHAR(255)    NOT NULL,
    dosage          VARCHAR(100)    NULL,
    category        VARCHAR(100)    NULL,
    type            VARCHAR(100)    NULL,
    manufacturer    VARCHAR(255)    NULL,
    unit_price      DECIMAL(10, 2)  NULL,
    total_stock     INT             NOT NULL DEFAULT 0,
    created_at      DATETIME(6)     NULL,

    CONSTRAINT pk_tb_medicines      PRIMARY KEY (id),
    CONSTRAINT uq_medicines_name    UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS tb_medicine_inventory (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    medicine_id         BIGINT          NOT NULL,
    batch_no            VARCHAR(255)    NULL,
    quantity            INT             NULL,
    initial_quantity    INT             NULL,
    status              VARCHAR(50)     NULL,
    expiry_date         DATE            NULL,
    added_date          DATE            NULL,

    CONSTRAINT pk_tb_medicine_inventory         PRIMARY KEY (id),
    CONSTRAINT uq_inventory_batch_no            UNIQUE (batch_no),
    CONSTRAINT fk_inventory_medicine            FOREIGN KEY (medicine_id) REFERENCES tb_medicines (id)
);

CREATE TABLE IF NOT EXISTS tb_pharmacy_sales (
    id                      BIGINT          NOT NULL AUTO_INCREMENT,
    original_prescription_id BIGINT         NULL,
    patient_id              BIGINT          NOT NULL,
    buyer_name              VARCHAR(255)    NOT NULL,
    buyer_contact           VARCHAR(255)    NULL,
    sale_date               DATETIME(6)     NULL,
    total_amount            DECIMAL(10, 2)  NOT NULL,

    CONSTRAINT pk_tb_pharmacy_sales PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS tb_pharmacy_sale_items (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    sale_id         BIGINT          NOT NULL,
    medicine_id     BIGINT          NOT NULL,
    medicine_name   VARCHAR(255)    NOT NULL,
    batch_no        VARCHAR(255)    NULL,
    quantity        INT             NOT NULL,
    unit_price      DECIMAL(10, 2)  NOT NULL,
    total_price     DECIMAL(10, 2)  NOT NULL,

    CONSTRAINT pk_tb_pharmacy_sale_items    PRIMARY KEY (id),
    CONSTRAINT fk_sale_items_sale           FOREIGN KEY (sale_id) REFERENCES tb_pharmacy_sales (id)
);

CREATE TABLE IF NOT EXISTS tb_prescription_copy (
    prescription_id BIGINT          NOT NULL,
    patient_id      BIGINT          NULL,
    doctor_id       BIGINT          NULL,
    valid_until     DATE            NULL,
    notes           LONGTEXT        NULL,
    items_json      TEXT            NULL,
    processed       BOOLEAN         NOT NULL DEFAULT FALSE,
    received_at     DATETIME(6)     NULL,

    CONSTRAINT pk_tb_prescription_copy PRIMARY KEY (prescription_id)
);

CREATE TABLE IF NOT EXISTS patient_read_model (
    user_id         BIGINT          NOT NULL,
    name            VARCHAR(255)    NULL,
    email           VARCHAR(255)    NULL,
    phone_number    VARCHAR(255)    NULL,
    cpf             VARCHAR(14)     NULL,

    CONSTRAINT pk_patient_read_model PRIMARY KEY (user_id)
);