const fs = require("fs");
const path = require("path");

function loadEnvironment(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

function prepareTrainingEnvironment() {
  const root = path.resolve(__dirname, "..");
  loadEnvironment(path.join(root, ".env.local"));
  loadEnvironment(path.join(root, ".env.training.local"));
  process.env.APP_ENV = "training";
  process.env.NEXT_PUBLIC_APP_ENV = "training";
  process.env.TRAINING_DB_HOST ||= process.env.DB_HOST || "";
  process.env.TRAINING_DB_PORT ||= process.env.DB_PORT || "3306";
  process.env.TRAINING_DB_USER ||= process.env.DB_USER || "";
  process.env.TRAINING_DB_PASSWORD ||= process.env.DB_PASSWORD || "";
  process.env.TRAINING_DB_SSL ||= process.env.DB_SSL || "";
  process.env.TRAINING_DB_DATABASE ||= process.env.DB_DATABASE
    ? `${process.env.DB_DATABASE}_capacitacion_local`
    : "jardines_capacitacion_local";
  process.env.TRAINING_EMAIL_RECIPIENT ||= "prueba.smtp@jardinesdelrenacer.co";
  if (process.env.TRAINING_DB_DATABASE === process.env.DB_DATABASE) {
    throw new Error("TRAINING_DB_DATABASE debe ser diferente de DB_DATABASE.");
  }
  return root;
}

module.exports = { loadEnvironment, prepareTrainingEnvironment };
