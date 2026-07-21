-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_candidato_documento ON candidatos (documento);

CREATE INDEX idx_candidato_email ON candidatos (email);

CREATE INDEX idx_candidato_ciudad ON candidatos (ciudad);

CREATE INDEX idx_candidato_departamento ON candidatos (departamento);

CREATE INDEX idx_candidato_activo ON candidatos (activo);

CREATE INDEX idx_vacante_estado ON vacantes (estado);

CREATE INDEX idx_vacante_destacada ON vacantes (destacada);

CREATE INDEX idx_vacante_ciudad ON vacantes (ciudad);

CREATE INDEX idx_vacante_departamento ON vacantes (departamento);

CREATE INDEX idx_postulacion_candidato ON postulaciones (candidato_id);

CREATE INDEX idx_postulacion_vacante ON postulaciones (vacante_id);

CREATE INDEX idx_postulacion_estado ON postulaciones (estado);

CREATE INDEX idx_postulacion_fecha ON postulaciones (created_at);

CREATE INDEX idx_entrevista_fecha ON entrevistas (fecha);

CREATE INDEX idx_entrevista_estado ON entrevistas (estado);

CREATE INDEX idx_notificacion_leida ON notificaciones (leida);

CREATE INDEX idx_notificacion_fecha ON notificaciones (created_at);

CREATE INDEX idx_reset_token ON password_reset_tokens (token);

CREATE INDEX idx_logs_usuario ON activity_logs (usuario_id);

CREATE INDEX idx_logs_fecha ON activity_logs (created_at);

CREATE INDEX idx_archivos_candidato ON archivos_candidato (candidato_id);

CREATE INDEX idx_archivos_tipo ON archivos_candidato (tipo);

CREATE INDEX idx_archivos_principal ON archivos_candidato (principal);

CREATE INDEX idx_archivos_activo ON archivos_candidato (activo);