const fs = require("fs");
const path = require("path");

function loadEnvironment(filePath, override = false, allowedKeys = null) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!match || (allowedKeys && !allowedKeys.has(match[1])) || (!override && process.env[match[1]] !== undefined)) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

function prepareTrainingEnvironment({ schemaSource = false, vps = false } = {}) {
  const root = path.resolve(__dirname, "..");
  loadEnvironment(path.join(root, ".env.local"));
  const productionAdminSecret = process.env.AUTH_JWT_SECRET;
  const productionCandidateSecret = process.env.CANDIDATE_JWT_SECRET;
  loadEnvironment(path.join(root, ".env.training.local"), true);
  if (schemaSource && process.env.TRAINING_SCHEMA_SOURCE_ENV_FILE) {
    const sourceFile = path.resolve(process.env.TRAINING_SCHEMA_SOURCE_ENV_FILE);
    if (!fs.existsSync(sourceFile)) throw new Error("No existe TRAINING_SCHEMA_SOURCE_ENV_FILE.");
    loadEnvironment(sourceFile, true, new Set(["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_DATABASE", "DB_SSL"]));
  }
  process.env.APP_ENV = "training";
  process.env.NEXT_PUBLIC_APP_ENV = "training";
  const required = ["TRAINING_DB_HOST", "TRAINING_DB_PORT", "TRAINING_DB_USER", "TRAINING_DB_PASSWORD", "TRAINING_DB_DATABASE", "TRAINING_EMAIL_RECIPIENT"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Faltan variables obligatorias de capacitación: ${missing.join(", ")}.`);
  if (process.env.TRAINING_DB_DATABASE === process.env.DB_DATABASE ||
      process.env.TRAINING_DB_USER === process.env.DB_USER) {
    throw new Error("Capacitación requiere una base y un usuario MySQL distintos de producción.");
  }
  if (process.env.TRAINING_BASE_PATH === "/ambiente-de-pruebas-jr" &&
      process.env.TRAINING_DB_HOST === "127.0.0.1" &&
      Number(process.env.TRAINING_DB_PORT) === 3307) {
    throw new Error("El puerto 3307 pertenece a la base de producción; capacitación requiere otro servidor MySQL.");
  }
  if (vps) {
    const trainingPort = Number(process.env.TRAINING_PORT);
    if (!Number.isInteger(trainingPort) || trainingPort < 1024 || trainingPort > 65535 || trainingPort === 3000 || trainingPort === 3001) {
      throw new Error("Define TRAINING_PORT con un puerto interno libre; 3000 y 3001 ya están reservados en este VPS.");
    }
    if (process.env.TRAINING_BASE_PATH !== "/ambiente-de-pruebas-jr") {
      throw new Error("TRAINING_BASE_PATH debe ser /ambiente-de-pruebas-jr en el VPS.");
    }
    const adminSecret = process.env.TRAINING_AUTH_JWT_SECRET;
    const candidateSecret = process.env.TRAINING_CANDIDATE_JWT_SECRET;
    if (!adminSecret || adminSecret.length < 32 || !candidateSecret || candidateSecret.length < 32 ||
        adminSecret === productionAdminSecret || candidateSecret === productionCandidateSecret) {
      throw new Error("Define secretos JWT exclusivos de pruebas (mínimo 32 caracteres, diferentes de producción).");
    }
    process.env.AUTH_JWT_SECRET = adminSecret;
    process.env.CANDIDATE_JWT_SECRET = candidateSecret;
    process.env.NEXT_PUBLIC_SITE_URL = 'https://jardinesdelrenacer.com/ambiente-de-pruebas-jr';
    process.env.SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (!schemaSource) {
    for (const key of Object.keys(process.env)) {
      if (key.startsWith("DB_")) delete process.env[key];
    }
  }
  return root;
}

module.exports = { loadEnvironment, prepareTrainingEnvironment };
