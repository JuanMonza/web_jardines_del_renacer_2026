-- Conserva los datos visibles al momento exacto de cada postulación.
ALTER TABLE postulaciones
  ADD COLUMN IF NOT EXISTS application_snapshot JSON NULL AFTER cv_url;

UPDATE postulaciones p
LEFT JOIN candidatos c ON c.id = p.candidato_id
LEFT JOIN vacantes v ON v.id = p.vacante_id
SET p.application_snapshot = JSON_OBJECT(
  'candidateDocument', COALESCE(c.documento, ''),
  'candidateName', TRIM(CONCAT(COALESCE(c.nombres, ''), ' ', COALESCE(c.apellidos, ''))),
  'candidateEmail', COALESCE(c.email, ''),
  'candidatePhone', COALESCE(c.telefono, ''),
  'candidateCity', COALESCE(c.ciudad, ''),
  'candidateDepartment', COALESCE(c.departamento, ''),
  'professionalTitle', COALESCE(c.profesion, ''),
  'education', COALESCE(c.educacion, ''),
  'vacancyTitle', COALESCE(v.titulo, ''),
  'source', COALESCE(p.fuente, ''),
  'capturedAt', DATE_FORMAT(COALESCE(p.created_at, NOW()), '%Y-%m-%dT%H:%i:%s')
)
WHERE p.application_snapshot IS NULL;
