import {NextRequest,NextResponse} from "next/server";
import pool,{query} from "@/lib/db";
import {ADMIN_SESSION_COOKIE,requireAdminPermission} from "@/lib/iam/admin-session";
import type {RowDataPacket} from "mysql2/promise";
export async function GET(request:NextRequest){
  const session=await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value,"vacancies.applications.update");
  if(!session)return NextResponse.json({message:"No autorizado para editar."},{status:403});
  const rows=await query("SELECT m.id,c.nombre,c.documento,c.correo,c.telefono,c.ciudad,c.departamento,m.vacante,m.estado,m.observaciones,m.evaluacion,m.motivo_descarte,m.licencia_runt,m.raw_data FROM historical_candidate_movements m JOIN historical_candidates c ON c.identity_key=m.identity_key WHERE m.id=?",[request.nextUrl.searchParams.get("id")]);
  return rows[0]?NextResponse.json(rows[0]):NextResponse.json({message:"Registro no encontrado."},{status:404});
}
export async function PUT(request:NextRequest){
  const session=await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value,"vacancies.applications.update");
  if(!session)return NextResponse.json({message:"No autorizado."},{status:403});
  const body=await request.json().catch(()=>null);
  const lengths:Record<string,number>={nombre:255,documento:30,correo:255,telefono:60,ciudad:120,departamento:120,vacante:255,estado:80,observaciones:10000,evaluacion:10000,motivo_descarte:10000,licencia_runt:10000,raw_data:1000000};
  if(!body||!Number.isSafeInteger(body.id)||!body.nombre?.trim())return NextResponse.json({message:"Nombre y registro son obligatorios."},{status:422});
  for(const [key,length] of Object.entries(lengths))if(typeof body[key]!=="string"||body[key].length>length)return NextResponse.json({message:`Revisa el campo ${key}.`},{status:422});
  if(body.correo&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.correo))return NextResponse.json({message:"Correo inválido."},{status:422});
  const connection=await pool.getConnection();
  try {
    const raw=JSON.parse(body.raw_data||"{}");
    raw["_Edición interna"]=`${session.name} (ID ${session.userId}) · ${new Date().toISOString()}`;
    await connection.beginTransaction();
    const [rows]=await connection.query<RowDataPacket[]>("SELECT m.*,c.nombre,c.documento,c.correo,c.telefono,c.ciudad,c.departamento FROM historical_candidate_movements m JOIN historical_candidates c ON c.identity_key=m.identity_key WHERE m.id=? FOR UPDATE",[body.id]);
    const previous=rows[0];if(!previous){await connection.rollback();return NextResponse.json({message:"Registro no encontrado."},{status:404});}
    await connection.execute("UPDATE historical_candidates SET nombre=?,documento=?,correo=?,telefono=?,ciudad=?,departamento=? WHERE identity_key=?",[body.nombre,body.documento,body.correo,body.telefono,body.ciudad,body.departamento,previous.identity_key]);
    await connection.execute("UPDATE historical_candidate_movements SET vacante=?,estado=?,observaciones=?,evaluacion=?,motivo_descarte=?,licencia_runt=?,raw_data=? WHERE id=?",[body.vacante,body.estado,body.observaciones,body.evaluacion,body.motivo_descarte,body.licencia_runt,JSON.stringify(raw),body.id]);
    for(const key of Object.keys(lengths).filter(key=>key!=="raw_data"&&String(previous[key]??"")!==body[key]))await connection.execute("INSERT INTO activity_logs(usuario_tipo,accion,modulo,tabla_afectada,registro_id,descripcion) VALUES ('Admin','HISTORICO_EDITADO','Vacantes','candidatos',?,?)",[body.id,`Administrador ${session.name} (ID ${session.userId}) editó ${key}. Antes: ${previous[key]||"Vacío"}. Después: ${body[key]||"Vacío"}.`]);
    // Las notas extendidas se auditan por campo para conservar cada cambio.
    const oldRaw=typeof previous.raw_data==="string"?JSON.parse(previous.raw_data||"{}"):previous.raw_data||{};
    for(const [key,value] of Object.entries(raw).filter(([key,value])=>key!=="_Edición interna"&&oldRaw[key]!==value)){
      if(String(value).length>10000)throw new Error("Nota demasiado extensa");
      await connection.execute("INSERT INTO activity_logs(usuario_tipo,accion,modulo,tabla_afectada,registro_id,descripcion) VALUES ('Admin','HISTORICO_EDITADO','Vacantes','candidatos',?,?)",[body.id,`Administrador ${session.name} (ID ${session.userId}) editó ${key}. Antes: ${oldRaw[key]||"Vacío"}. Después: ${value}.`]);
    }
    await connection.commit();return NextResponse.json({success:true});
  }catch{await connection.rollback();return NextResponse.json({message:"No fue posible guardar los cambios."},{status:500});}finally{connection.release();}
}
