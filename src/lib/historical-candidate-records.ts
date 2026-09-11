import { createHash } from "crypto";
import * as XLSX from "xlsx";
import { execute, query } from "@/lib/db";

export type HistoricalCandidateRow = {
  identityKey: string;
  name: string;
  documentNumber: string;
  email: string;
  phone: string;
  city: string;
  department: string;
  sourceSheet: string;
  sourceRow: number;
  processDate: string | null;
  vacancyTitle: string;
  status: string;
  source: string;
  interviewers: string;
  observations: string;
  evaluation: string;
  discardReason: string;
  licenseCheck: string;
  rawReference: string;
  rawData: string;
};

const text = (value: unknown) => String(value ?? "").replace(/\s+/g, " ").trim();
const normalized = (value: unknown) => text(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const digits = (value: unknown) => text(value).replace(/\D/g, "");
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const limited = (value: string, size: number) => value.slice(0, size);

function findColumn(headers: string[], matches: string[]) {
  return headers.findIndex((header) => matches.some((match) => header.includes(match)));
}

function cell(row: unknown[], index: number) {
  return index >= 0 ? text(row[index]) : "";
}

function asDate(value: unknown) {
  const validDate = (year: number, month: number, day: number) => {
    if (![year, month, day].every(Number.isInteger) || year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) return null;
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };
  if (value instanceof Date) return validDate(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate());
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    return parsed ? validDate(parsed.y, parsed.m, parsed.d) : null;
  }
  const valueText = text(value);
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:$|T|\s)/.exec(valueText);
  if (iso) return validDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  const local = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(valueText);
  return local ? validDate(Number(local[3]), Number(local[2]), Number(local[1])) : null;
}

function inferStatus(rawStatus: string, applies: string, discard: string, sheet: string) {
  const combined = normalized(`${rawStatus} ${applies} ${discard} ${sheet}`);
  if (combined.includes("contratad")) return "Contratado";
  if (combined.includes("no continua") || combined.includes("no seleccion") || combined.includes("descartar") || combined.includes("llamadas no")) return "No continúa";
  if (combined.includes("entrevist")) return "Entrevista";
  if (combined.includes("prueba")) return "Prueba técnica";
  if (combined.includes("si")) return "En revisión";
  return rawStatus || "Histórico";
}

export function parseHistoricalCandidateWorkbook(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const rows: HistoricalCandidateRow[] = [];
  const sheets = workbook.SheetNames.map((sheetName) => {
    const data = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], { header: 1, defval: null, blankrows: false });
    const headerRow = data.findIndex((row) => {
      const all = row.map(normalized).join(" ");
      return all.includes("nombre") && (all.includes("cedula") || all.includes("identific") || all.includes("documento") || all.includes("telef"));
    });
    return { sheetName, data, headerRow };
  });
  const skippedSheets = sheets.filter(({ headerRow }) => headerRow < 0).map(({ sheetName }) => sheetName);

  for (const { sheetName, data, headerRow } of sheets) {
    if (headerRow < 0) continue;
    const headers = data[headerRow].map(normalized);
    const index = {
      date: findColumn(headers, ["fecha"]), name: findColumn(headers, ["nombre"]), document: findColumn(headers, ["cedula", "identific", "documento"]),
      phone: findColumn(headers, ["telef"]), email: findColumn(headers, ["correo"]), city: findColumn(headers, ["ciudad"]),
      department: findColumn(headers, ["regional"]), vacancy: findColumn(headers, ["vacante", "cargo"]), source: findColumn(headers, ["origen"]),
      interviewers: findColumn(headers, ["entrevistador"]), applies: findColumn(headers, ["aplica para"]), discard: findColumn(headers, ["por que no aplica", "por qué no aplica", "descartar"]),
      evaluation: findColumn(headers, ["pruebas", "perfil que tiene"]), status: findColumn(headers, ["estado"]), observations: findColumn(headers, ["observacion"]), license: findColumn(headers, ["simit", "runt"]),
    };
    for (let rowIndex = headerRow + 1; rowIndex < data.length; rowIndex += 1) {
      const row = data[rowIndex];
      const name = cell(row, index.name);
      if (!name) continue;
      const documentNumber = digits(cell(row, index.document));
      const email = cell(row, index.email).toLowerCase();
      const phone = digits(cell(row, index.phone));
      const identityKey = documentNumber ? `document:${documentNumber}` : email ? `email:${email}` : phone ? `phone:${phone}` : `name:${normalized(name)}|${normalized(cell(row, index.city))}`;
      const rawStatus = cell(row, index.status);
      const applies = cell(row, index.applies);
      const discardReason = cell(row, index.discard);
      rows.push({
        identityKey, name, documentNumber, email, phone, city: cell(row, index.city), department: cell(row, index.department),
        sourceSheet: sheetName, sourceRow: rowIndex + 1, processDate: asDate(row[index.date]), vacancyTitle: cell(row, index.vacancy),
        status: inferStatus(rawStatus, applies, discardReason, sheetName), source: cell(row, index.source), interviewers: cell(row, index.interviewers),
        observations: cell(row, index.observations), evaluation: cell(row, index.evaluation), discardReason, licenseCheck: cell(row, index.license),
        rawReference: `${sheetName}!${rowIndex + 1}`,
        rawData: JSON.stringify(Object.fromEntries(headers.map((header, column) => [`${header || "Sin encabezado"} [${column + 1}]`, String(row[column] ?? "")]).filter(([, value]) => value))),
      });
    }
  }
  return { rows, skippedSheets };
}

let schemaPromise: Promise<void> | null = null;
export async function ensureHistoricalCandidateSchema() {
  if (!schemaPromise) schemaPromise = (async () => {
    await execute(`CREATE TABLE IF NOT EXISTS historical_candidates (identity_key CHAR(64) PRIMARY KEY, nombre VARCHAR(255) NOT NULL, documento VARCHAR(30), correo VARCHAR(255), telefono VARCHAR(60), ciudad VARCHAR(120), departamento VARCHAR(120), first_seen DATE NULL, last_seen DATE NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX idx_historical_documento (documento), INDEX idx_historical_nombre (nombre), INDEX idx_historical_ciudad (ciudad)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    await execute(`CREATE TABLE IF NOT EXISTS historical_candidate_movements (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, source_key CHAR(64) NOT NULL UNIQUE, identity_key CHAR(64) NOT NULL, fecha DATE NULL, vacante VARCHAR(255), estado VARCHAR(80), origen VARCHAR(160), entrevistadores VARCHAR(255), observaciones LONGTEXT, evaluacion LONGTEXT, motivo_descarte TEXT, licencia_runt TEXT, raw_data LONGTEXT, hoja_origen VARCHAR(120) NOT NULL, fila_origen INT NOT NULL, imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_historical_identity (identity_key), INDEX idx_historical_fecha (fecha), INDEX idx_historical_estado (estado), CONSTRAINT fk_historical_movement_candidate FOREIGN KEY (identity_key) REFERENCES historical_candidates(identity_key)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    const rawColumn = await query<{ Field: string }>("SHOW COLUMNS FROM historical_candidate_movements LIKE 'raw_data'");
    if (!rawColumn.length) await execute("ALTER TABLE historical_candidate_movements ADD COLUMN raw_data LONGTEXT AFTER licencia_runt");
  })().catch((error) => { schemaPromise = null; throw error; });
  return schemaPromise;
}

export async function importHistoricalCandidateRows(rows: HistoricalCandidateRow[]) {
  await ensureHistoricalCandidateSchema();
  let importedMovements = 0;
  for (let offset = 0; offset < rows.length; offset += 200) {
    const batch = rows.slice(offset, offset + 200);
    const candidateValues = batch.map(() => "(?,?,?,?,?,?,?,?,?)").join(",");
    const candidateParams = batch.flatMap((row) => [hash(row.identityKey), limited(row.name, 255), limited(row.documentNumber, 30), limited(row.email, 255), limited(row.phone, 60), limited(row.city, 120), limited(row.department, 120), row.processDate, row.processDate]);
    await execute(`INSERT INTO historical_candidates (identity_key,nombre,documento,correo,telefono,ciudad,departamento,first_seen,last_seen) VALUES ${candidateValues} ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), documento=COALESCE(NULLIF(VALUES(documento),''),documento), correo=COALESCE(NULLIF(VALUES(correo),''),correo), telefono=COALESCE(NULLIF(VALUES(telefono),''),telefono), ciudad=COALESCE(NULLIF(VALUES(ciudad),''),ciudad), departamento=COALESCE(NULLIF(VALUES(departamento),''),departamento), first_seen=LEAST(COALESCE(first_seen,VALUES(first_seen)),COALESCE(VALUES(first_seen),first_seen)), last_seen=GREATEST(COALESCE(last_seen,VALUES(last_seen)),COALESCE(VALUES(last_seen),last_seen))`, candidateParams);
    const movementValues = batch.map(() => "(?,?,?,?,?,?,?,?,?,?,?,?,?,?)").join(",");
    const movementParams = batch.flatMap((row) => [hash(`${row.rawReference}|${row.identityKey}|${row.name}`), hash(row.identityKey), row.processDate, limited(row.vacancyTitle, 255), limited(row.status, 80), limited(row.source, 160), limited(row.interviewers, 255), row.observations, row.evaluation, row.discardReason, row.licenseCheck, row.rawData, limited(row.sourceSheet, 120), row.sourceRow]);
    const movement = await execute(`INSERT INTO historical_candidate_movements (source_key,identity_key,fecha,vacante,estado,origen,entrevistadores,observaciones,evaluacion,motivo_descarte,licencia_runt,raw_data,hoja_origen,fila_origen) VALUES ${movementValues} ON DUPLICATE KEY UPDATE raw_data=IF(COALESCE(JSON_CONTAINS_PATH(raw_data, 'one', '$."_Edición interna"'),0)=1,raw_data,VALUES(raw_data)), observaciones=IF(COALESCE(JSON_CONTAINS_PATH(raw_data, 'one', '$."_Edición interna"'),0)=1,observaciones,VALUES(observaciones)), evaluacion=IF(COALESCE(JSON_CONTAINS_PATH(raw_data, 'one', '$."_Edición interna"'),0)=1,evaluacion,VALUES(evaluacion)), motivo_descarte=IF(COALESCE(JSON_CONTAINS_PATH(raw_data, 'one', '$."_Edición interna"'),0)=1,motivo_descarte,VALUES(motivo_descarte)), licencia_runt=IF(COALESCE(JSON_CONTAINS_PATH(raw_data, 'one', '$."_Edición interna"'),0)=1,licencia_runt,VALUES(licencia_runt))`, movementParams);
    importedMovements += movement.affectedRows;
  }
  return importedMovements;
}
