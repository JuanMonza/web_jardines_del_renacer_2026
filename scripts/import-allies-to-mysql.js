/* Importación idempotente del catálogo comercial aprobado a MySQL. */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function loadEnvironment() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return process.env;
  const values = { ...process.env };
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) values[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
  return values;
}

function slugForCategory(value) {
  const normalized = String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (normalized.includes('mascota')) return 'mascotas';
  if (normalized.includes('turismo') || normalized.includes('hotel')) return 'turismo';
  if (normalized.includes('automotor')) return 'automotores';
  if (normalized.includes('educacion')) return 'educacion';
  if (normalized.includes('tecnolog')) return 'tecnologia';
  if (normalized.includes('hogar')) return 'hogar';
  if (normalized.includes('gastro')) return 'gastrobares';
  if (normalized.includes('deporte')) return 'deportes';
  if (normalized.includes('alimento')) return 'alimento';
  if (normalized.includes('parqueadero')) return 'parqueaderos';
  if (normalized.includes('farmaceut')) return 'farmaceutico';
  if (normalized.includes('tatuaje')) return 'tatuajes-perforaciones';
  if (normalized.includes('fondo') || normalized.includes('credito')) return 'finanzas';
  return 'salud';
}

function sourceLoginId(row) {
  const identity = [row.DEPARTAMENTO, row.MUNICIPIOS, row.ALIADO, row.CATEGORIA, row.DESCUENTOS].join('|');
  return `IMP${crypto.createHash('sha1').update(identity).digest('hex').slice(0, 14).toUpperCase()}`;
}

async function main() {
  const env = loadEnvironment();
  const cataloguePath = path.join(process.cwd(), 'public', 'data', 'base-aliados-actualizados-tics.json');
  const catalogue = JSON.parse(fs.readFileSync(cataloguePath, 'utf8'));
  const connection = await mysql.createConnection({
    host: env.DB_HOST, port: Number(env.DB_PORT || 3306), user: env.DB_USER,
    password: env.DB_PASSWORD, database: env.DB_DATABASE || env.DB_NAME,
  });

  const sql = `INSERT INTO aliados
    (login_id, name, category_slug, subcategory, discount_label, departamento, municipio, address, logo, whatsapp_number, whatsapp_template, featured, description, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', '', 'Hola, quiero más información de "{{nombre}}".', FALSE, '', TRUE)
    ON DUPLICATE KEY UPDATE name=VALUES(name), category_slug=VALUES(category_slug), subcategory=VALUES(subcategory), discount_label=VALUES(discount_label), departamento=VALUES(departamento), municipio=VALUES(municipio), address=VALUES(address), active=TRUE`;
  await connection.beginTransaction();
  try {
    for (const row of catalogue) {
      const category = String(row.CATEGORIA || '').trim();
      const city = String(row.MUNICIPIOS || '').trim();
      await connection.execute(sql, [sourceLoginId(row), String(row.ALIADO || '').trim(), slugForCategory(category), category, String(row.DESCUENTOS || '').trim() || 'Beneficio sujeto a condiciones', String(row.DEPARTAMENTO || '').trim(), city, city || 'Dirección por confirmar']);
    }
    await connection.execute("UPDATE aliados SET active = FALSE WHERE login_id IN ('RM1001','PC1002','RS1003','RA1004','VM1005')");
    await connection.commit();
    const [rows] = await connection.query("SELECT COUNT(*) AS total FROM aliados WHERE active = TRUE");
    console.log(JSON.stringify({ imported: catalogue.length, activeAllies: rows[0].total }));
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { await connection.end(); }
}

main().catch((error) => { console.error(error.code || 'IMPORT_FAILED'); process.exit(1); });
