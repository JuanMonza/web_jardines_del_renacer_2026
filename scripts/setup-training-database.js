const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const { randomBytes } = require("crypto");
const { prepareTrainingEnvironment } = require("./training-env");

// Este comando usa producción solo como fuente de esquema/catálogos, nunca como
// destino de escritura. La conexión fuente se fuerza a transacciones READ ONLY.
const root = prepareTrainingEnvironment({ schemaSource: true });

const source = {
  host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_DATABASE,
  ssl: process.env.DB_SSL ? JSON.parse(process.env.DB_SSL) : undefined,
};
const target = {
  host: process.env.TRAINING_DB_HOST, port: Number(process.env.TRAINING_DB_PORT || 3306), user: process.env.TRAINING_DB_USER,
  password: process.env.TRAINING_DB_PASSWORD, database: process.env.TRAINING_DB_DATABASE,
  ssl: process.env.TRAINING_DB_SSL ? JSON.parse(process.env.TRAINING_DB_SSL) : undefined,
};

async function copyRows(sourceConnection, targetConnection, table) {
  const [rows] = await sourceConnection.query(`SELECT * FROM \`${table}\``);
  if (!rows.length) return;
  const columns = Object.keys(rows[0]);
  const identifiers = columns.map((column) => `\`${column}\``).join(",");
  const placeholders = columns.map(() => "?").join(",");
  for (const row of rows) {
    await targetConnection.query(`INSERT IGNORE INTO \`${table}\` (${identifiers}) VALUES (${placeholders})`, columns.map((column) => row[column]));
  }
}

async function run() {
  if (!source.host || !source.user || !source.database || !target.host || !target.user || !target.database) {
    throw new Error("Completa la conexión principal y la conexión de capacitación.");
  }
  if (source.database === target.database && source.host === target.host) {
    throw new Error("La base de capacitación no puede ser la base principal.");
  }
  const accessFile = path.join(root, ".training-access.local.txt");
  let password = String(process.env.TRAINING_ADMIN_PASSWORD || "");
  if (password && fs.existsSync(accessFile)) fs.unlinkSync(accessFile);
  if (!password && fs.existsSync(accessFile)) {
    password = fs.readFileSync(accessFile, "utf8").match(/^TRAINING_ADMIN_PASSWORD=(.+)$/m)?.[1]?.trim() || "";
  }
  if (!password) {
    password = `Jdr-${randomBytes(12).toString("base64url")}`;
    fs.writeFileSync(accessFile, `Accesos locales de capacitación. No compartir ni subir a Git.\nTRAINING_ADMIN_PASSWORD=${password}\n`, { mode: 0o600 });
  }
  if (password.length < 12) throw new Error("TRAINING_ADMIN_PASSWORD debe tener mínimo 12 caracteres.");

  const sourceConnection = await mysql.createConnection(source);
  await sourceConnection.query("SET SESSION TRANSACTION READ ONLY");
  const targetConnection = await mysql.createConnection({ ...target, multipleStatements: true });
  try {
    await targetConnection.query("SET FOREIGN_KEY_CHECKS=0");
    const [tables] = await sourceConnection.query("SHOW FULL TABLES WHERE Table_type='BASE TABLE'");
    for (const tableRow of tables) {
      const table = Object.values(tableRow)[0];
      const [definitionRows] = await sourceConnection.query(`SHOW CREATE TABLE \`${table}\``);
      const definition = definitionRows[0]["Create Table"].replace(/^CREATE TABLE /, "CREATE TABLE IF NOT EXISTS ");
      await targetConnection.query(definition);
    }
    // Algunas instalaciones aún no aplicaron esta migración. Solo se ajusta
    // la copia de capacitación; la base de origen permanece en solo lectura.
    const [cargoColumns] = await targetConnection.query("SHOW COLUMNS FROM admin_users LIKE 'cargo'");
    if (!cargoColumns.length) {
      await targetConnection.query("ALTER TABLE admin_users ADD COLUMN cargo VARCHAR(120) NULL AFTER email");
    }
    for (const table of ["permissions", "roles", "role_permissions"]) {
      if (tables.some((row) => Object.values(row)[0] === table)) await copyRows(sourceConnection, targetConnection, table);
    }
    await targetConnection.query("SET FOREIGN_KEY_CHECKS=1");

    const passwordHash = await bcrypt.hash(password, 12);
    const accounts = [
      ["9100000001", "Capacitación", "Administración general", "capacitacion.admin@example.invalid", "Administrador General"],
      ["9100000002", "Capacitación", "Talento humano", "capacitacion.vacantes@example.invalid", "Administrador de Vacantes"],
      ["9100000003", "Capacitación", "Aliados", "capacitacion.aliados@example.invalid", "Administrador de Aliados"],
      ["9100000004", "Capacitación", "Sedes", "capacitacion.sedes@example.invalid", "Administrador de Sedes"],
      ["9100000005", "Capacitación", "Talleres", "capacitacion.talleres@example.invalid", "Administrador de Talleres"],
      ["9100000006", "Capacitación", "Mercadeo", "capacitacion.mercadeo@example.invalid", "Administrador de Sorteos"],
    ];
    for (const [document, firstName, lastName, email, roleName] of accounts) {
      await targetConnection.query(`INSERT INTO admin_users (cedula,nombres,apellidos,email,password_hash,email_verificado,activo,observaciones)
        VALUES (?,?,?,?,?,TRUE,TRUE,'Cuenta ficticia exclusiva para capacitación')
        ON DUPLICATE KEY UPDATE nombres=VALUES(nombres),apellidos=VALUES(apellidos),email=VALUES(email),password_hash=VALUES(password_hash),activo=TRUE,deleted_at=NULL`, [document, firstName, lastName, email, passwordHash]);
      await targetConnection.query(`INSERT IGNORE INTO admin_user_roles (admin_user_id,role_id,activo)
        SELECT u.id,r.id,TRUE FROM admin_users u INNER JOIN roles r ON r.nombre=? WHERE u.cedula=?`, [roleName, document]);
    }

    // El administrador general actúa como coordinador durante los ejercicios de
    // cotizaciones. El gestor es una cuenta adicional, limitada a sus prospectos.
    await targetConnection.query(`INSERT IGNORE INTO admin_user_roles (admin_user_id,role_id,activo)
      SELECT u.id,r.id,TRUE FROM admin_users u INNER JOIN roles r ON r.nombre='Coordinador de Cotizaciones'
      WHERE u.cedula='9100000001'`);
    await targetConnection.query(`INSERT INTO admin_users (cedula,nombres,apellidos,email,cargo,password_hash,email_verificado,activo,observaciones)
      VALUES ('9100000007','Andrea','Gestora de práctica','capacitacion.cotizaciones@example.invalid','Gestora de cotizaciones',?,TRUE,TRUE,'Cuenta ficticia exclusiva para capacitación')
      ON DUPLICATE KEY UPDATE nombres=VALUES(nombres),apellidos=VALUES(apellidos),email=VALUES(email),cargo=VALUES(cargo),password_hash=VALUES(password_hash),activo=TRUE,deleted_at=NULL`, [passwordHash]);
    await targetConnection.query(`INSERT IGNORE INTO admin_user_roles (admin_user_id,role_id,activo)
      SELECT u.id,r.id,TRUE FROM admin_users u INNER JOIN roles r ON r.nombre='Gestor de Cotizaciones'
      WHERE u.cedula='9100000007'`);

    const vacancyTemplate = JSON.stringify({ title: "Auxiliar de servicio - práctica", area: "Servicio", department: "Risaralda", city: "Pereira", modality: "Presencial", contractType: "Indefinido", schedule: "Lunes a viernes", salary: "A convenir", experience: "6 meses", summary: "Vacante ficticia para practicar el proceso de selección.", requirements: ["Comunicación asertiva", "Manejo básico de herramientas ofimáticas"], benefits: ["Formación interna"], featured: true });
    await targetConnection.query(`INSERT INTO vacantes (titulo,slug,descripcion,requisitos,beneficios,ciudad,departamento,modalidad,tipo_contrato,estado,destacada,fecha_publicacion,template_data)
      VALUES ('Auxiliar de servicio - práctica','capacitacion-auxiliar-servicio','Vacante ficticia para practicar el proceso de selección.',?,?,'Pereira','Risaralda','Presencial','Indefinido','Publicada',TRUE,NOW(),?)
      ON DUPLICATE KEY UPDATE estado='Publicada',deleted_at=NULL,template_data=VALUES(template_data)`, [JSON.stringify(["Comunicación asertiva", "Manejo básico de herramientas ofimáticas"]), JSON.stringify(["Formación interna"]), vacancyTemplate]);
    const candidateHash = await bcrypt.hash(`${password}-postulante`, 12);
    const candidates = [
      ["9200000001", "Laura", "Práctica", "laura.practica@example.invalid", "3000000001", "Pereira", "Risaralda"],
      ["9200000002", "Carlos", "Simulación", "carlos.simulacion@example.invalid", "3000000002", "Dosquebradas", "Risaralda"],
    ];
    for (const candidate of candidates) {
      await targetConnection.query(`INSERT INTO candidatos (documento,nombres,apellidos,email,telefono,ciudad,departamento,profesion,educacion,password_hash,email_verificado,activo)
        VALUES (?,?,?,?,?,?,?,'Auxiliar administrativo','Técnico',?,TRUE,TRUE)
        ON DUPLICATE KEY UPDATE nombres=VALUES(nombres),apellidos=VALUES(apellidos),telefono=VALUES(telefono),activo=TRUE,deleted_at=NULL`, [...candidate, candidateHash]);
      await targetConnection.query(`INSERT INTO postulaciones (candidato_id,vacante_id,estado,fuente,observaciones_rh)
        SELECT c.id,v.id,'Postulado','Manual','Registro ficticio para capacitación' FROM candidatos c INNER JOIN vacantes v ON v.slug='capacitacion-auxiliar-servicio'
        WHERE c.documento=? AND NOT EXISTS (SELECT 1 FROM postulaciones p WHERE p.candidato_id=c.id AND p.vacante_id=v.id AND p.deleted_at IS NULL)`, [candidate[0]]);
    }


    const [[coordinator]] = await targetConnection.query("SELECT id FROM admin_users WHERE cedula='9100000001' LIMIT 1");
    const [[advisor]] = await targetConnection.query("SELECT id FROM admin_users WHERE cedula='9100000007' LIMIT 1");
    const trainingQuotes = [
      ["00000000-0000-4000-8000-000000000101", "María", "Ejemplo", "3000000101", "Pereira", "maria.cotizacion@example.invalid", "plan-familiar", "Plan familiar de práctica", "familiar", 4, "WhatsApp", "09:00", "nuevo", null, null, null, null, 0],
      ["00000000-0000-4000-8000-000000000102", "Felipe", "Simulación", "3000000102", "Dosquebradas", "felipe.cotizacion@example.invalid", "plan-individual", "Plan individual de práctica", "individual", 1, "Llamada", "14:30", "contactado", "Solicitó información sobre cobertura y medios de pago.", null, "DATE_ADD(NOW(), INTERVAL 1 DAY)", "DATE_SUB(NOW(), INTERVAL 1 DAY)", 1],
      ["00000000-0000-4000-8000-000000000103", "Camila", "Capacitación", "3000000103", "Manizales", "camila.cotizacion@example.invalid", "plan-familiar", "Plan familiar de práctica", "familiar", 3, "WhatsApp", "11:15", "en_negociacion", "Cotización enviada; pendiente llamada de seguimiento.", null, "DATE_SUB(NOW(), INTERVAL 1 DAY)", "DATE_SUB(NOW(), INTERVAL 3 DAY)", 1],
      ["00000000-0000-4000-8000-000000000104", "Santiago", "Demostración", "3000000104", "Armenia", "santiago.cotizacion@example.invalid", "plan-individual", "Plan individual de práctica", "individual", 1, "Llamada", "16:00", "convertido", "Aceptó el plan durante la práctica comercial.", null, null, "DATE_SUB(NOW(), INTERVAL 5 DAY)", 1],
      ["00000000-0000-4000-8000-000000000105", "Valentina", "Ensayo", "3000000105", "Pereira", "valentina.cotizacion@example.invalid", "plan-familiar", "Plan familiar de práctica", "familiar", 2, "WhatsApp", "10:00", "descartado", "Registro de ejemplo para practicar el cierre.", "Decisión aplazada por el cliente ficticio", null, "DATE_SUB(NOW(), INTERVAL 7 DAY)", 1],
    ];
    for (const quote of trainingQuotes) {
      const [id, nombre, apellido, telefono, ciudad, email, planId, planNombre, cobertura, beneficiaries, preferredContact, contactTime, status, notes, lossReason, nextContactSql, firstContactSql, assigned] = quote;
      const [insertedQuote] = await targetConnection.query(`INSERT IGNORE INTO cotizaciones
        (id,nombre,apellido,telefono,ciudad,email,plan_id,plan_nombre,cobertura,num_beneficiarios,contacto_preferido,hora_contacto,estado,notas_asesor,motivo_perdida,proximo_contacto,asesor_id,primer_contacto_en,creado_en)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,${nextContactSql || "NULL"},?,${firstContactSql || "NULL"},DATE_SUB(NOW(), INTERVAL ? DAY))`,
        [id,nombre,apellido,telefono,ciudad,email,planId,planNombre,cobertura,beneficiaries,preferredContact,contactTime,status,notes,lossReason,assigned ? advisor.id : null,Number(id.slice(-1))]);
      if (!insertedQuote.affectedRows) continue;
      await targetConnection.query(`INSERT INTO cotizacion_historial (cotizacion_id,admin_user_id,tipo,detalle,creado_en)
        VALUES (?,NULL,'creada','Solicitud ficticia recibida desde el formulario público.',DATE_SUB(NOW(), INTERVAL ? DAY))`, [id, Number(id.slice(-1))]);
      if (status !== "nuevo") {
        await targetConnection.query(`INSERT INTO cotizacion_historial (cotizacion_id,admin_user_id,tipo,detalle,creado_en)
          VALUES (?,?,'estado',?,DATE_SUB(NOW(), INTERVAL ? DAY))`, [id, advisor.id, `Estado cambiado a ${status} durante una práctica.`, Math.max(0, Number(id.slice(-1)) - 1)]);
      }
    }
    // Versiones anteriores del preparador repetían eventos semilla al ejecutarse
    // nuevamente. Se deduplican solo los textos fijos de estos cinco ejemplos.
    await targetConnection.query(`DELETE newer FROM cotizacion_historial newer
      INNER JOIN cotizacion_historial older ON older.cotizacion_id=newer.cotizacion_id
        AND older.tipo=newer.tipo AND older.detalle=newer.detalle AND older.id<newer.id
      WHERE newer.cotizacion_id IN (?,?,?,?,?) AND
        (newer.detalle='Solicitud ficticia recibida desde el formulario público.'
         OR newer.detalle LIKE 'Estado cambiado a % durante una práctica.')`, trainingQuotes.map((quote) => quote[0]));
    await targetConnection.query(`DELETE newer FROM cotizacion_notificaciones newer
      INNER JOIN cotizacion_notificaciones older ON older.admin_user_id=newer.admin_user_id
        AND older.cotizacion_id=newer.cotizacion_id AND older.tipo=newer.tipo AND older.mensaje=newer.mensaje AND older.id<newer.id
      WHERE newer.cotizacion_id IN (?,?,?,?,?) AND newer.mensaje IN
        ('Nueva cotización ficticia pendiente de asignación.','Seguimiento ficticio vencido para Camila Capacitación.')`, trainingQuotes.map((quote) => quote[0]));
    await targetConnection.query(`INSERT INTO cotizacion_notificaciones (admin_user_id,cotizacion_id,tipo,mensaje)
      SELECT ?,?,'nueva_cotizacion','Nueva cotización ficticia pendiente de asignación.'
      WHERE NOT EXISTS (SELECT 1 FROM cotizacion_notificaciones WHERE admin_user_id=? AND cotizacion_id=? AND tipo='nueva_cotizacion')`,
      [coordinator.id, trainingQuotes[0][0], coordinator.id, trainingQuotes[0][0]]);
    await targetConnection.query(`INSERT INTO cotizacion_notificaciones (admin_user_id,cotizacion_id,tipo,mensaje)
      SELECT ?,?,'seguimiento_vencido','Seguimiento ficticio vencido para Camila Capacitación.'
      WHERE NOT EXISTS (SELECT 1 FROM cotizacion_notificaciones WHERE admin_user_id=? AND cotizacion_id=? AND tipo='seguimiento_vencido')`,
      [advisor.id, trainingQuotes[2][0], advisor.id, trainingQuotes[2][0]]);
    console.log(`Ambiente preparado en la base ${target.database}.`);
    console.log("Usuarios ficticios creados: documentos 9100000001 a 9100000007.");
    console.log("La contraseña está en .training-access.local.txt o en TRAINING_ADMIN_PASSWORD. Ese archivo está excluido de Git.");
  } finally {
    await sourceConnection.end();
    await targetConnection.end();
  }
}

run().catch((error) => { console.error("No fue posible preparar capacitación:", error.message); process.exitCode = 1; });
