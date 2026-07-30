/* Importación inicial y repetible del directorio oficial de sedes a MySQL. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');
const mysql = require('mysql2/promise');

function environment() {
  const values = {};
  for (const line of fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) values[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
  return values;
}

function readSedes() {
  const file = fs.readFileSync(path.join(process.cwd(), 'src/data/sedes.ts'), 'utf8');
  const compiled = ts.transpileModule(file, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(compiled, { module, exports: module.exports, require });
  return module.exports.SEDES;
}

function readCityImageResolver() {
  const getDepartamentoSlug = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\./g, '').trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const file = fs.readFileSync(path.join(process.cwd(), 'src/config/ciudades.ts'), 'utf8');
  const compiled = ts.transpileModule(file, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(compiled, { module, exports: module.exports, require: (request) => request === '@/data/sedes' ? { getDepartamentoSlug } : require(request) });
  return module.exports.getCiudadImagePath;
}

(async () => {
  const env = environment();
  const connection = await mysql.createConnection({ host: env.DB_HOST, port: Number(env.DB_PORT || 3306), user: env.DB_USER, password: env.DB_PASSWORD, database: env.DB_DATABASE });
  await connection.query(fs.readFileSync(path.join(process.cwd(), 'src/database/sedes/01_schema.sql'), 'utf8'));
  await connection.query('ALTER TABLE sedes MODIFY COLUMN telefono VARCHAR(150) DEFAULT NULL');
  const [columns] = await connection.query('SHOW COLUMNS FROM sedes');
  if (!columns.some((column) => column.Field === 'estado_operativo')) await connection.query("ALTER TABLE sedes ADD COLUMN estado_operativo VARCHAR(30) NOT NULL DEFAULT 'Activa' AFTER lng");
  const sedes = readSedes();
  const getCityImagePath = readCityImageResolver();
  for (const sede of sedes) {
    await connection.execute(`INSERT INTO sedes (id, nombre, departamento, ciudad, direccion, direccion_visible, administradora, telefono, foto_url, lat, lng, estado_operativo, activa)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
      ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), departamento=VALUES(departamento), ciudad=VALUES(ciudad), direccion=VALUES(direccion), direccion_visible=VALUES(direccion_visible), administradora=VALUES(administradora), telefono=VALUES(telefono), foto_url=COALESCE(NULLIF(foto_url, ''), VALUES(foto_url)), lat=VALUES(lat), lng=VALUES(lng), activa=TRUE`,
      [sede.id, sede.nombre, sede.departamento, sede.ciudad, sede.direccion || null, sede.direccionVisible || null, sede.administradora || null, sede.telefono || null, sede.fotoUrl || getCityImagePath(sede.departamento, sede.ciudad) || null, sede.lat || 0, sede.lng || 0, sede.estadoOperativo || 'Activa']);
  }
  await connection.end();
  console.log(`Sedes importadas en MySQL: ${sedes.length}.`);
})().catch((error) => { console.error('No fue posible importar las sedes:', error.message); process.exit(1); });
