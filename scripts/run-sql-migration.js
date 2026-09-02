const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function loadEnvironment(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    const value = match[2].replace(/^(['"])(.*)\1$/, '$2');
    process.env[match[1]] = value;
  }
}

async function run() {
  const relativeMigrationPath = process.argv[2];
  if (!relativeMigrationPath) throw new Error('Indica la ruta de la migración SQL.');
  const root = path.resolve(__dirname, '..');
  const migrationPath = path.resolve(root, relativeMigrationPath);
  const migrationDirectory = path.resolve(root, 'src/lib/migrations');
  if (!migrationPath.startsWith(`${migrationDirectory}${path.sep}`) || !fs.existsSync(migrationPath)) {
    throw new Error('La migración debe existir dentro de src/lib/migrations.');
  }

  loadEnvironment(path.join(root, '.env.local'));
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL ? JSON.parse(process.env.DB_SSL) : undefined,
    multipleStatements: true,
  });
  try {
    await connection.query(fs.readFileSync(migrationPath, 'utf8'));
    console.log(`Migración aplicada: ${relativeMigrationPath}`);
  } finally {
    await connection.end();
  }
}

run().catch((error) => {
  console.error('No fue posible aplicar la migración:', error.message);
  process.exitCode = 1;
});
