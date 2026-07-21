-- ============================================================
-- JARDINES DEL RENACER
-- DATABASE 2.0
-- FOREIGN KEYS
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- POSTULACIONES
-- ============================================================

ALTER TABLE postulaciones
ADD CONSTRAINT fk_postulacion_candidato FOREIGN KEY (candidato_id) REFERENCES candidatos (id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE postulaciones
ADD CONSTRAINT fk_postulacion_vacante FOREIGN KEY (vacante_id) REFERENCES vacantes (id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- ============================================================
-- ENTREVISTAS
-- ============================================================

ALTER TABLE entrevistas
ADD CONSTRAINT fk_entrevista_postulacion FOREIGN KEY (postulacion_id) REFERENCES postulaciones (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE entrevistas
ADD CONSTRAINT fk_entrevista_candidato FOREIGN KEY (candidato_id) REFERENCES candidatos (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE entrevistas
ADD CONSTRAINT fk_entrevista_vacante FOREIGN KEY (vacante_id) REFERENCES vacantes (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE entrevistas
ADD CONSTRAINT fk_entrevista_admin FOREIGN KEY (entrevistador) REFERENCES admin_users (id) ON UPDATE CASCADE ON DELETE SET NULL;

-- ============================================================
-- NOTIFICACIONES
-- ============================================================

ALTER TABLE notificaciones
ADD CONSTRAINT fk_notificacion_candidato FOREIGN KEY (candidato_id) REFERENCES candidatos (id) ON UPDATE CASCADE ON DELETE CASCADE;

-- ============================================================
-- PASSWORD RESET
-- ============================================================

ALTER TABLE password_reset_tokens
ADD CONSTRAINT fk_reset_candidato FOREIGN KEY (candidato_id) REFERENCES candidatos (id) ON UPDATE CASCADE ON DELETE CASCADE;

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================

ALTER TABLE activity_logs
ADD CONSTRAINT fk_logs_admin FOREIGN KEY (usuario_id) REFERENCES admin_users (id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE activity_logs
ADD CONSTRAINT fk_logs_candidato FOREIGN KEY (usuario_id) REFERENCES candidatos (id) ON UPDATE CASCADE ON DELETE SET NULL;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- HISTORIAL POSTULACIONES
-- ============================================================

ALTER TABLE historial_postulacion
ADD CONSTRAINT fk_historial_postulacion FOREIGN KEY (postulacion_id) REFERENCES postulaciones (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE historial_postulacion
ADD CONSTRAINT fk_historial_estado FOREIGN KEY (estado_id) REFERENCES estados_postulacion (id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE historial_postulacion
ADD CONSTRAINT fk_historial_admin FOREIGN KEY (cambiado_por) REFERENCES admin_users (id) ON UPDATE CASCADE ON DELETE SET NULL;

-- ============================================================
-- ARCHIVOS CANDIDATO
-- ============================================================

ALTER TABLE archivos_candidato
ADD CONSTRAINT fk_archivos_candidato FOREIGN KEY (candidato_id) REFERENCES candidatos (id) ON UPDATE CASCADE ON DELETE CASCADE;