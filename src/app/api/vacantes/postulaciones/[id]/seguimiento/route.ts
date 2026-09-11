import { NextRequest, NextResponse } from "next/server";
import pool, { query } from "@/lib/db";
import { ensureSelectionSchema } from "@/lib/selection-followup";
import { FOLLOWUP_FIELDS, selectionSteps } from "@/config/selection-followup";
import { ADMIN_SESSION_COOKIE, requireAdminPermission, hasPermission } from "@/lib/iam/admin-session";
import type { RowDataPacket } from "mysql2";

function parse(value: unknown): Record<string,string> {
  return typeof value === "string" ? JSON.parse(value) : (value as Record<string,string>) || {};
}
export async function GET(request: NextRequest, {params}: {params:{id:string}}) {
  const session=await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value,"vacancies.applications.view");
  if(!session)return NextResponse.json({message:"No autorizado."},{status:403});
  try {
    await ensureSelectionSchema();
    const rows=await query<RowDataPacket>(`SELECT c.nombres,c.apellidos,c.documento,c.telefono,c.email,c.direccion,c.ciudad,c.departamento,c.profesion,c.educacion,c.experiencia,c.cv_url,p.observaciones_rh,v.titulo,v.requisitos,v.selection_steps,f.fields_json,f.revision
      FROM postulaciones p JOIN candidatos c ON c.id=p.candidato_id JOIN vacantes v ON v.id=p.vacante_id LEFT JOIN application_followups f ON f.application_id=p.id WHERE p.id=? AND p.deleted_at IS NULL`,[params.id]);
    if(!rows[0])return NextResponse.json({message:"Postulación no encontrada."},{status:404});
    const row=rows[0];
    const [history,interviews]=await Promise.all([
      query("SELECT descripcion,created_at FROM activity_logs WHERE tabla_afectada='postulaciones' AND registro_id=? AND accion IN ('FICHA_SELECCION_EDITADA','ENTREVISTA_AGREGADA') ORDER BY id DESC",[params.id]),
      query(`SELECT e.id,e.fecha,e.modalidad,e.duracion,e.lugar,e.enlace,e.estado,e.resultado,e.observaciones,e.created_at,
        COALESCE(NULLIF(TRIM(CONCAT(COALESCE(a.nombres,''),' ',COALESCE(a.apellidos,''))),''),'Equipo de Talento Humano') AS entrevistador_nombre
        FROM entrevistas e LEFT JOIN admin_users a ON a.id=e.entrevistador
        WHERE e.postulacion_id=? AND e.deleted_at IS NULL ORDER BY e.fecha DESC,e.id DESC`,[params.id]),
    ]);
    return NextResponse.json({profile:row,fields:parse(row.fields_json),revision:row.revision??0,steps:selectionSteps(typeof row.selection_steps==="string"?JSON.parse(row.selection_steps):row.selection_steps),history,interviews,canEdit:hasPermission(session,"vacancies.applications.update")});
  } catch {return NextResponse.json({message:"No fue posible consultar la ficha."},{status:500});}
}
export async function POST(request:NextRequest,{params}:{params:{id:string}}) {
  const session=await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value,"vacancies.applications.update");
  if(!session)return NextResponse.json({message:"No autorizado."},{status:403});
  const body=await request.json().catch(()=>null);
  const modalities=["Presencial","Google Meet","Microsoft Teams","Zoom","Llamada Telefónica"];
  const states=["Programada","Realizada","Cancelada","Reagendada"];
  const results=["Pendiente","Aprobado","Rechazado"];
  const modality=String(body?.modality??""),state=String(body?.state??""),result=String(body?.result??""),date=String(body?.date??""),notes=String(body?.notes??"").trim(),place=String(body?.place??"").trim(),link=String(body?.link??"").trim(),duration=Number(body?.duration);
  if(!modalities.includes(modality)||!states.includes(state)||!results.includes(result)||!date||Number.isNaN(new Date(date).getTime())||!Number.isInteger(duration)||duration<15||duration>480||!notes||notes.length>5000)
    return NextResponse.json({message:"Completa fecha, modalidad, duración, estado, resultado y observación de la entrevista."},{status:422});
  if((modality==="Presencial"&&!place)||(modality!=="Presencial"&&modality!=="Llamada Telefónica"&&!link))
    return NextResponse.json({message:modality==="Presencial"?"Indica el lugar de la entrevista presencial.":"Indica el enlace de la entrevista virtual."},{status:422});
  await ensureSelectionSchema();
  const connection=await pool.getConnection();
  try{
    await connection.beginTransaction();
    const [applications]=await connection.query<RowDataPacket[]>("SELECT id,candidato_id,vacante_id FROM postulaciones WHERE id=? AND deleted_at IS NULL FOR UPDATE",[params.id]);
    const application=applications[0];
    if(!application){await connection.rollback();return NextResponse.json({message:"Postulación no encontrada."},{status:404});}
    const [inserted]=await connection.execute<import("mysql2/promise").ResultSetHeader>(`INSERT INTO entrevistas(postulacion_id,candidato_id,vacante_id,entrevistador,modalidad,fecha,duracion,lugar,enlace,estado,resultado,observaciones) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,[params.id,application.candidato_id,application.vacante_id,session.userId,modality,new Date(date),duration,place||null,link||null,state,result,notes]);
    const description=`Administrador ${session.name} (ID ${session.userId}) agregó la entrevista ${inserted.insertId}. Fecha: ${date}. Modalidad: ${modality}. Estado: ${state}. Resultado: ${result}. Observación: ${notes}`;
    await connection.execute("INSERT INTO activity_logs(usuario_tipo,accion,modulo,tabla_afectada,registro_id,descripcion) VALUES ('Admin','ENTREVISTA_AGREGADA','Vacantes','postulaciones',?,?)",[params.id,description]);
    await connection.commit();
    return NextResponse.json({success:true,id:String(inserted.insertId)},{status:201});
  }catch(error){await connection.rollback();console.error("No fue posible registrar la entrevista:",error);return NextResponse.json({message:"No fue posible registrar la entrevista."},{status:500});}
  finally{connection.release();}
}
export async function PUT(request:NextRequest,{params}:{params:{id:string}}) {
  const session=await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value,"vacancies.applications.update");
  if(!session)return NextResponse.json({message:"No autorizado."},{status:403});
  const body=await request.json().catch(()=>null);
  if(!body||!body.fields||typeof body.fields!=="object"||!Number.isInteger(body.revision))
    return NextResponse.json({message:"Datos de ficha inválidos."},{status:422});
  const fields:Record<string,string>={};
  for(const key of Object.keys(FOLLOWUP_FIELDS)){
    const value=body.fields[key]??"";
    if(typeof value!=="string"||value.length>10000)return NextResponse.json({message:"Cada campo admite hasta 10.000 caracteres."},{status:422});
    fields[key]=value;
  }
  await ensureSelectionSchema();
  const connection=await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [applications]=await connection.query<RowDataPacket[]>("SELECT id FROM postulaciones WHERE id=? AND deleted_at IS NULL FOR UPDATE",[params.id]);
    if(!applications.length){await connection.rollback();return NextResponse.json({message:"Postulación no encontrada."},{status:404});}
    const [rows]=await connection.query<RowDataPacket[]>("SELECT fields_json,revision FROM application_followups WHERE application_id=?",[params.id]);
    const current=rows[0], before=parse(current?.fields_json);
    if((current?.revision??0)!==body.revision){await connection.rollback();return NextResponse.json({message:"Otro administrador actualizó la ficha. Recarga para revisar sus cambios antes de guardar."},{status:409});}
    const changes=Object.keys(fields).filter(key=>(before[key]??"")!==fields[key]);
    if(changes.length){
      await connection.execute("INSERT INTO application_followups(application_id,fields_json,revision) VALUES (?,?,1) ON DUPLICATE KEY UPDATE fields_json=VALUES(fields_json),revision=revision+1",[params.id,JSON.stringify(fields)]);
      for(const key of changes){
        const description=`Administrador ${session.name} (ID ${session.userId}) actualizó ${FOLLOWUP_FIELDS[key as keyof typeof FOLLOWUP_FIELDS]}. Anterior: ${before[key]||"Sin registrar"}. Nuevo: ${fields[key]||"Vacío"}. Observación: ${fields[key]||"Campo borrado por el administrador"}`;
        await connection.execute("INSERT INTO activity_logs(usuario_tipo,accion,modulo,tabla_afectada,registro_id,descripcion) VALUES ('Admin','FICHA_SELECCION_EDITADA','Vacantes','postulaciones',?,?)",[params.id,description]);
      }
    }
    await connection.commit();
    return NextResponse.json({success:true});
  } catch {await connection.rollback();return NextResponse.json({message:"No fue posible guardar la ficha."},{status:500});}
  finally {connection.release();}
}
