-- ============================================================
-- V2__seed_insurance_providers.sql
-- Seed inicial de convênios para o billing-service
-- Substitui o DataInitializer.java
-- ============================================================

INSERT INTO tb_insurance_providers (id, name, coverage_percentage, active)
VALUES
    (1, 'Unimed',                  0.80, true),
    (2, 'Amil',                    0.50, true),
    (3, 'Particular (Sem Convênio)', 0.00, true);

