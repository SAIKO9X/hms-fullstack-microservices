-- ============================================================
-- V1__init_schema.sql
-- Estrutura das tabelas do appointment-service
-- Ordem: tabelas pai antes das filhas (respeito às FKs)
-- ============================================================

-- 1. Tabela principal de consultas
CREATE TABLE IF NOT EXISTS tb_appointments (
    id                      BIGINT          NOT NULL AUTO_INCREMENT,
    patient_id              BIGINT          NOT NULL,
    doctor_id               BIGINT          NOT NULL,
    appointment_date_time   DATETIME(6)     NOT NULL,
    duration                INT             NOT NULL,
    appointment_end_time    DATETIME(6)     NOT NULL,
    reason                  LONGTEXT        NULL,
    status                  VARCHAR(50)     NOT NULL,
    notes                   VARCHAR(255)    NULL,
    reminder_24h_sent       BOOLEAN         NOT NULL DEFAULT FALSE,
    reminder_1h_sent        BOOLEAN         NOT NULL DEFAULT FALSE,
    type                    VARCHAR(50)     NULL,
    meeting_url             VARCHAR(255)    NULL,

    CONSTRAINT pk_tb_appointments PRIMARY KEY (id)
);

-- 2. Prescrições (1-to-1 com Appointment)
CREATE TABLE IF NOT EXISTS tb_prescriptions (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    appointment_id  BIGINT          NOT NULL UNIQUE,
    notes           LONGTEXT        NULL,
    created_at      DATETIME(6)     NULL,
    status          VARCHAR(50)     NOT NULL DEFAULT 'ISSUED',

    CONSTRAINT pk_tb_prescriptions         PRIMARY KEY (id),
    CONSTRAINT fk_prescriptions_appointment FOREIGN KEY (appointment_id)
        REFERENCES tb_appointments (id)
);

-- 3. Medicamentos da prescrição (N-to-1 com Prescription)
CREATE TABLE IF NOT EXISTS tb_medicines (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    name            VARCHAR(255)    NULL,
    dosage          VARCHAR(255)    NULL,
    frequency       VARCHAR(255)    NULL,
    duration        INT             NULL,
    prescription_id BIGINT          NOT NULL,

    CONSTRAINT pk_tb_medicines              PRIMARY KEY (id),
    CONSTRAINT fk_medicines_prescription    FOREIGN KEY (prescription_id)
        REFERENCES tb_prescriptions (id)
);

-- 4. Pedidos de exame (N-to-1 com Appointment)
CREATE TABLE IF NOT EXISTS tb_lab_orders (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    order_number    VARCHAR(255)    NULL UNIQUE,
    appointment_id  BIGINT          NULL,
    patient_id      BIGINT          NULL,
    order_date      DATETIME(6)     NULL,
    notes           VARCHAR(255)    NULL,
    status          VARCHAR(50)     NULL,

    CONSTRAINT pk_tb_lab_orders             PRIMARY KEY (id),
    CONSTRAINT fk_lab_orders_appointment    FOREIGN KEY (appointment_id)
        REFERENCES tb_appointments (id)
);

-- 5. Itens do pedido de exame (N-to-1 com LabOrder via @JoinColumn)
CREATE TABLE IF NOT EXISTS lab_test_items (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    test_name           VARCHAR(255)    NULL,
    category            VARCHAR(255)    NULL,
    clinical_indication VARCHAR(255)    NULL,
    instructions        VARCHAR(255)    NULL,
    result_notes        TEXT            NULL,
    attachment_id       VARCHAR(255)    NULL,
    status              VARCHAR(50)     NOT NULL DEFAULT 'PENDING',
    lab_order_id        BIGINT          NULL,

    CONSTRAINT pk_lab_test_items            PRIMARY KEY (id),
    CONSTRAINT fk_lab_test_items_order      FOREIGN KEY (lab_order_id)
        REFERENCES tb_lab_orders (id)
);

-- 6. Registros clínicos da consulta (1-to-1 com Appointment)
CREATE TABLE IF NOT EXISTS tb_appointment_records (
    id                          BIGINT          NOT NULL AUTO_INCREMENT,
    appointment_id              BIGINT          NOT NULL UNIQUE,
    chief_complaint             VARCHAR(255)    NOT NULL,
    history_of_present_illness  TEXT            NULL,
    physical_exam_notes         TEXT            NULL,
    symptoms                    VARCHAR(255)    NULL,
    diagnosis_cid10             VARCHAR(50)     NULL,
    diagnosis_description       VARCHAR(255)    NULL,
    treatment_plan              TEXT            NULL,
    requested_tests             VARCHAR(255)    NULL,
    notes                       TEXT            NULL,
    created_at                  DATETIME(6)     NULL,
    updated_at                  DATETIME(6)     NULL,

    CONSTRAINT pk_tb_appointment_records        PRIMARY KEY (id),
    CONSTRAINT fk_appointment_records_appt      FOREIGN KEY (appointment_id)
        REFERENCES tb_appointments (id)
);

-- 7. Métricas de saúde do paciente
CREATE TABLE IF NOT EXISTS tb_health_metrics (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    patient_id      BIGINT          NOT NULL,
    blood_pressure  VARCHAR(20)     NULL,
    glucose_level   DOUBLE          NULL,
    weight          DOUBLE          NULL,
    height          DOUBLE          NULL,
    bmi             DOUBLE          NULL,
    heart_rate      INT             NULL,
    recorded_at     DATETIME(6)     NULL,

    CONSTRAINT pk_tb_health_metrics         PRIMARY KEY (id)
);

-- 8. Documentos médicos (laudos, exames, etc.)
CREATE TABLE IF NOT EXISTS tb_medical_documents (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    patient_id          BIGINT          NOT NULL,
    uploaded_by_user_id BIGINT          NOT NULL,
    appointment_id      BIGINT          NULL,
    document_name       VARCHAR(255)    NOT NULL,
    document_type       VARCHAR(50)     NOT NULL,
    media_url           VARCHAR(255)    NOT NULL,
    uploaded_at         DATETIME(6)     NULL,
    is_verified         BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT pk_tb_medical_documents PRIMARY KEY (id)
);

-- 9. Relatórios de efeitos adversos
CREATE TABLE IF NOT EXISTS tb_adverse_effect_reports (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    patient_id      BIGINT          NOT NULL,
    doctor_id       BIGINT          NOT NULL,
    prescription_id BIGINT          NULL,
    description     LONGTEXT        NULL,
    status          VARCHAR(50)     NULL,
    reported_at     DATETIME(6)     NULL,

    CONSTRAINT pk_tb_adverse_effect_reports PRIMARY KEY (id)
);

-- 10. Disponibilidade dos médicos
CREATE TABLE IF NOT EXISTS tb_doctor_availability (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    doctor_id   BIGINT          NOT NULL,
    day_of_week VARCHAR(20)     NULL,
    start_time  TIME            NULL,
    end_time    TIME            NULL,

    CONSTRAINT pk_tb_doctor_availability PRIMARY KEY (id)
);

-- 11. Indisponibilidade dos médicos (férias, bloqueios)
CREATE TABLE IF NOT EXISTS tb_doctor_unavailability (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    doctor_id       BIGINT          NOT NULL,
    start_date_time DATETIME(6)     NOT NULL,
    end_date_time   DATETIME(6)     NOT NULL,
    reason          VARCHAR(255)    NULL,

    CONSTRAINT pk_tb_doctor_unavailability PRIMARY KEY (id)
);

-- 12. Fila de espera
CREATE TABLE IF NOT EXISTS waitlist_entries (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    doctor_id       BIGINT          NOT NULL,
    patient_id      BIGINT          NOT NULL,
    patient_name    VARCHAR(255)    NULL,
    patient_email   VARCHAR(255)    NULL,
    date            DATE            NOT NULL,
    created_at      DATETIME(6)     NOT NULL,

    CONSTRAINT pk_waitlist_entries PRIMARY KEY (id)
);

-- 13. Read model de médicos (projeção local para evitar chamadas ao profile-service)
CREATE TABLE IF NOT EXISTS doctor_read_model (
    doctor_id       BIGINT          NOT NULL,
    user_id         BIGINT          NULL,
    full_name       VARCHAR(255)    NULL,
    specialization  VARCHAR(255)    NULL,
    profile_picture VARCHAR(500)    NULL,

    CONSTRAINT pk_doctor_read_model PRIMARY KEY (doctor_id)
);

-- 14. Read model de pacientes
CREATE TABLE IF NOT EXISTS patient_read_model (
    patient_id      BIGINT          NOT NULL,
    user_id         BIGINT          NULL,
    full_name       VARCHAR(255)    NULL,
    phone_number    VARCHAR(50)     NULL,
    email           VARCHAR(255)    NULL,
    profile_picture VARCHAR(500)    NULL,

    CONSTRAINT pk_patient_read_model PRIMARY KEY (patient_id)
);

