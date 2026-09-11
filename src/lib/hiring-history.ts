import { createHash } from "crypto";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";

type InterviewRow = RowDataPacket & {
  id: number;
  fecha: Date | string;
  modalidad: string;
  duracion: number;
  lugar: string | null;
  enlace: string | null;
  estado: string;
  resultado: string;
  observaciones: string;
  entrevistador_nombre: string;
};

function parseFields(value: unknown): Record<string, string> {
  if (!value) return {};
  if (typeof value !== "string") return value as Record<string, string>;
  try {
    return JSON.parse(value) as Record<string, string>;
  } catch {
    return {};
  }
}

export async function recordHiring(connection:PoolConnection,id:string,admin:string,notes:string) {
  const [rows]=await connection.query<RowDataPacket[]>(`SELECT c.*,v.titulo,p.created_at AS applied_at,f.fields_json
    FROM postulaciones p JOIN candidatos c ON c.id=p.candidato_id JOIN vacantes v ON v.id=p.vacante_id
    LEFT JOIN application_followups f ON f.application_id=p.id WHERE p.id=?`,[id]);
  const row=rows[0]; if(!row)throw new Error("Postulación no encontrada");
  const hash=(value:string)=>createHash("sha256").update(value).digest("hex");
  const identity=hash(row.documento ? `document:${row.documento}` : `candidate:${row.id}`);
  const name=[row.nombres,row.apellidos].filter(Boolean).join(" ");
  const fields=parseFields(row.fields_json);
  const [interviews]=await connection.query<InterviewRow[]>(`SELECT e.id,e.fecha,e.modalidad,e.duracion,e.lugar,e.enlace,e.estado,e.resultado,e.observaciones,
    COALESCE(NULLIF(TRIM(CONCAT(COALESCE(a.nombres,''),' ',COALESCE(a.apellidos,''))),''),'Equipo de Talento Humano') AS entrevistador_nombre
    FROM entrevistas e LEFT JOIN admin_users a ON a.id=e.entrevistador
    WHERE e.postulacion_id=? AND e.deleted_at IS NULL ORDER BY e.fecha,e.id`,[id]);
  const interviewers=[...new Set(interviews.map(interview=>interview.entrevistador_nombre).filter(Boolean))];
  const interviewSummary=interviews.map((interview,index)=>{
    const date=new Date(interview.fecha);
    const formattedDate=Number.isNaN(date.getTime())?String(interview.fecha):new Intl.DateTimeFormat("es-CO",{dateStyle:"short",timeStyle:"short",timeZone:"America/Bogota"}).format(date);
    const location=interview.modalidad==="Presencial"?interview.lugar:interview.enlace;
    return `Entrevista ${index+1}: ${formattedDate} | ${interview.modalidad} | ${interview.estado} | ${interview.resultado} | Entrevistó: ${interview.entrevistador_nombre}${location?` | ${location}`:""} | Observación: ${interview.observaciones}`;
  }).join("\n");
  await connection.execute("INSERT INTO historical_candidates(identity_key,nombre,documento,correo,telefono,ciudad,departamento,first_seen,last_seen) VALUES (?,?,?,?,?,?,?,CURRENT_DATE(),CURRENT_DATE()) ON DUPLICATE KEY UPDATE last_seen=CURRENT_DATE()",
    [identity,name,row.documento||"",row.email||"",row.telefono||"",row.ciudad||"",row.departamento||""]);
  const detail=[`Contratación registrada por ${admin}. Observación: ${notes||"Sin observación adicional"}`,interviewSummary].filter(Boolean).join("\n\n");
  const evaluation=[fields.pruebas&&`Pruebas: ${fields.pruebas}`,fields.resultados&&`Resultados: ${fields.resultados}`,interviewSummary&&`Entrevistas:\n${interviewSummary}`].filter(Boolean).join("\n\n");
  const raw=JSON.stringify({"Nombres":row.nombres,"Apellidos":row.apellidos,"Cédula":row.documento,"Correo":row.email,"Teléfono":row.telefono,"Dirección":row.direccion,"Ciudad":row.ciudad,"Departamento":row.departamento,"Cargo":row.titulo,"Fecha de postulación":row.applied_at,"Entrevistas":interviews.map(interview=>({id:interview.id,fecha:interview.fecha,modalidad:interview.modalidad,duracion:interview.duracion,lugar:interview.lugar,enlace:interview.enlace,estado:interview.estado,resultado:interview.resultado,observaciones:interview.observaciones,entrevistador:interview.entrevistador_nombre})),...fields});
  await connection.execute("INSERT INTO historical_candidate_movements(source_key,identity_key,fecha,vacante,estado,origen,entrevistadores,observaciones,evaluacion,raw_data,hoja_origen,fila_origen) VALUES (?,?,CURRENT_DATE(),?,'Contratado','Proceso de selección',?,?,?,?,'Contratación desde vacantes',?) ON DUPLICATE KEY UPDATE observaciones=VALUES(observaciones),evaluacion=VALUES(evaluacion),raw_data=VALUES(raw_data)",
    [hash(`hiring:${id}`),identity,row.titulo,interviewers.join(", ")||fields.entrevistadores||admin,detail,evaluation,raw,Number(id)]);
}
