-- ============================================================
-- JARDINES DEL RENACER | DATABASE 2.0 | CORE
-- Archivo: 13_development_candidate_seed.sql
-- Propósito: cuenta de postulante SOLO para pruebas internas.
-- Requiere ejecutar antes la migración 20260721_postulantes_candidatos.sql.
-- Nunca ejecutar en producción.
-- ============================================================

INSERT INTO candidatos (documento, nombres, apellidos, email, telefono, password_hash, activo)
VALUES ('9000000004', 'Postulante', 'Pruebas', 'postulante.pruebas@jardines.local', '3000000004', '$2b$12$2IT7DgCpp0T3OCpS9vQTYeAQBqZjsLucsAiomjvQme0PMrMtiB5MS', TRUE)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), apellido = VALUES(apellido), email = VALUES(email), password_hash = VALUES(password_hash), activo = TRUE, deleted_at = NULL;
