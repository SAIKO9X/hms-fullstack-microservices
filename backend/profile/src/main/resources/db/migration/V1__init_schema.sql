-- ============================================================
-- V1__init_schema.sql
-- Estrutura das tabelas do profile-service
-- ============================================================

CREATE TABLE IF NOT EXISTS tb_doctors (
    id                      BIGINT          NOT NULL AUTO_INCREMENT,
    user_id                 BIGINT          NOT NULL,
    name                    VARCHAR(255)    NULL,
    date_of_birth           DATE            NULL,
    crm_number              VARCHAR(255)    NOT NULL,
    specialization          VARCHAR(255)    NULL,
    department              VARCHAR(255)    NULL,
    phone_number            VARCHAR(255)    NULL,
    years_of_experience     INT             NOT NULL DEFAULT 0,
    qualifications          LONGTEXT        NULL,
    biography               LONGTEXT        NULL,
    profile_picture_url     VARCHAR(255)    NULL,
    consultation_fee        DECIMAL(19, 2)  NULL,

    CONSTRAINT pk_tb_doctors        PRIMARY KEY (id),
    CONSTRAINT uq_doctors_user_id   UNIQUE (user_id),
    CONSTRAINT uq_doctors_crm       UNIQUE (crm_number)
);

CREATE TABLE IF NOT EXISTS tb_patients (
    id                          BIGINT          NOT NULL AUTO_INCREMENT,
    user_id                     BIGINT          NOT NULL,
    cpf                         VARCHAR(14)     NOT NULL,
    date_of_birth               DATE            NULL,
    phone_number                VARCHAR(255)    NULL,
    name                        VARCHAR(255)    NULL,
    blood_group                 VARCHAR(10)     NULL,
    gender                      VARCHAR(20)     NULL,
    address                     VARCHAR(255)    NULL,
    emergency_contact_name      VARCHAR(255)    NULL,
    emergency_contact_phone     VARCHAR(255)    NULL,
    family_history              TEXT            NULL,
    chronic_conditions          TEXT            NULL,
    profile_picture_url         VARCHAR(255)    NULL,

    CONSTRAINT pk_tb_patients       PRIMARY KEY (id),
    CONSTRAINT uq_patients_user_id  UNIQUE (user_id),
    CONSTRAINT uq_patients_cpf      UNIQUE (cpf)
);

CREATE TABLE IF NOT EXISTS patient_allergies (
    patient_id  BIGINT          NOT NULL,
    allergy     VARCHAR(255)    NOT NULL,

    CONSTRAINT fk_allergies_patient FOREIGN KEY (patient_id) REFERENCES tb_patients (id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id              BIGINT      NOT NULL AUTO_INCREMENT,
    doctor_id       BIGINT      NOT NULL,
    patient_id      BIGINT      NOT NULL,
    appointment_id  BIGINT      NOT NULL,
    rating          INT         NOT NULL,
    comment         TEXT        NULL,
    created_at      DATETIME(6) NULL,

    CONSTRAINT pk_reviews               PRIMARY KEY (id),
    CONSTRAINT uq_reviews_appointment   UNIQUE (appointment_id)
);