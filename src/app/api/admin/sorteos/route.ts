import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";
import { ADMIN_SESSION_COOKIE, requireAdminPermission, verifyAdminPassword } from "@/lib/iam/admin-session";
import { repairMojibake } from "@/lib/text-encoding";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SorteoRow = { id:number; titulo:string; descripcion:string|null; fecha_sorteo:string; premio:string|null; ganadores_esperados:number; imagen:string|null; terminos_url:string|null; live_visualizaciones:number|null; live_plataformas:string|null; estado:string; created_at:string; updated_at:string; deleted_at:string|null };
type WinnerRow = { id:number; sorteo_id:number; participante_id:number; posicion:number; validado:number; nombre:string; numero_contrato:string; seleccionado_at:string };
type ActivityRow = { sorteo_id:number; accion:string; detalle:string|null; created_at:string; administrador:string|null };

function text(value:unknown,length:number){return typeof value==="string"?value.trim().slice(0,length):"";}
function image(value:unknown){return typeof value==="string"&&/^data:image\/(png|jpe?g|webp);base64,/i.test(value)&&value.length<=2_800_000?value:null;}
function safeUrl(value:unknown){const raw=text(value,255);if(!raw)return null;try{const parsed=new URL(raw);return ["http:","https:"].includes(parsed.protocol)?parsed.toString():null;}catch{return null;}}
async function logActivity(sorteoId:number,userId:number,action:string,detail:string){await execute("INSERT INTO sorteo_activity_logs (sorteo_id,admin_user_id,accion,detalle) VALUES (?,?,?,?)",[sorteoId,userId,action,detail]);}

async function data(includeDeleted=false){
  const sorteos=await query<SorteoRow>(`SELECT id,titulo,descripcion,fecha_sorteo,premio,ganadores_esperados,imagen,terminos_url,live_visualizaciones,live_plataformas,estado,created_at,updated_at,deleted_at FROM sorteos ${includeDeleted?"":"WHERE deleted_at IS NULL"} ORDER BY fecha_sorteo DESC`);
  const participants=await query<{sorteo_id:number;total:number;habilitados:number}>("SELECT sorteo_id,COUNT(*) total,SUM(habilitado=TRUE) habilitados FROM sorteo_participantes GROUP BY sorteo_id");
  const winners=await query<WinnerRow>("SELECT g.id,g.sorteo_id,g.participante_id,g.posicion,g.validado,p.nombre,p.numero_contrato,g.seleccionado_at FROM sorteo_ganadores g INNER JOIN sorteo_participantes p ON p.id=g.participante_id ORDER BY g.posicion");
  const activities=await query<ActivityRow>(`SELECT l.sorteo_id,l.accion,l.detalle,l.created_at,NULLIF(TRIM(CONCAT(COALESCE(a.nombres,''),' ',COALESCE(a.apellidos,''))), '') administrador FROM sorteo_activity_logs l LEFT JOIN admin_users a ON a.id=l.admin_user_id ORDER BY l.created_at DESC`);
  return sorteos.map(sorteo=>({
    ...sorteo,
    titulo:repairMojibake(sorteo.titulo),descripcion:repairMojibake(sorteo.descripcion),premio:repairMojibake(sorteo.premio),live_plataformas:repairMojibake(sorteo.live_plataformas),
    participantes:participants.find(row=>row.sorteo_id===sorteo.id)??{total:0,habilitados:0},
    ganadores:winners.filter(winner=>winner.sorteo_id===sorteo.id).map(winner=>({...winner,nombre:repairMojibake(winner.nombre),numero_contrato:repairMojibake(winner.numero_contrato),validado:Boolean(winner.validado)})),
    trazabilidad:activities.filter(activity=>activity.sorteo_id===sorteo.id).slice(0,50).map(activity=>({...activity,detalle:repairMojibake(activity.detalle),administrador:repairMojibake(activity.administrador)})),
  }));
}

export async function GET(request:NextRequest){
  if(!(await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value,"giveaways.view")))return NextResponse.json({message:"No autorizado."},{status:403});
  try{return NextResponse.json({data:await data(request.nextUrl.searchParams.get("includeDeleted")==="1")});}
  catch(error){console.error("GET sorteos:",error);return NextResponse.json({message:"No fue posible cargar los sorteos. Verifica que la migración MySQL esté aplicada."},{status:500});}
}

export async function POST(request:NextRequest){
  try{
    const body=(await request.json()) as Record<string,unknown>;
    const action=text(body.action,40);
    const permission=action==="draw"?"giveaways.draw":action==="delete"?"giveaways.delete":action==="save"?(body.id?"giveaways.update":"giveaways.create"):action==="participants"?"giveaways.create":["winner","remove_winner","validate","status","restore"].includes(action)?"giveaways.update":"";
    const session=permission?await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value,permission):null;
    if(!session)return NextResponse.json({message:"No autorizado."},{status:403});

    if(action==="save"){
      const title=text(body.titulo,180),date=text(body.fechaSorteo,25),requestedState=text(body.estado,20);
      const state=["BORRADOR","PROGRAMADO","PAUSADO","CERRADO","PUBLICADO","CANCELADO"].includes(requestedState)?requestedState:"BORRADOR";
      if(!title||!date)return NextResponse.json({message:"Completa nombre y fecha del sorteo."},{status:422});
      const submittedImage=image(body.imagen);
      if(body.imagen!=null&&!submittedImage)return NextResponse.json({message:"La imagen debe ser JPG, PNG o WEBP y pesar máximo 2 MB."},{status:422});
      const id=Number(body.id),expectedWinners=Math.min(100,Math.max(1,Math.floor(Number(body.ganadoresEsperados)||1)));
      if(id>0){
        const current=await query<{estado:string}>("SELECT estado FROM sorteos WHERE id=? AND deleted_at IS NULL LIMIT 1",[id]);
        if(current[0]?.estado==="PUBLICADO"&&!(await verifyAdminPassword(session,body.adminPassword)))return NextResponse.json({message:"Confirma tu contraseña administrativa para modificar un sorteo publicado."},{status:401});
      }
      if(state==="PUBLICADO"){
        const counts=await query<{total:number;validados:number}>("SELECT COUNT(*) total,SUM(validado=TRUE) validados FROM sorteo_ganadores WHERE sorteo_id=?",[id]);
        if(!(id>0)||Number(counts[0]?.total||0)<expectedWinners||Number(counts[0]?.validados||0)<expectedWinners)return NextResponse.json({message:`Debes completar y validar ${expectedWinners} ganador(es) antes de conservar la publicación.`},{status:422});
      }
      const liveViews=body.liveVisualizaciones===""||body.liveVisualizaciones==null?null:Math.max(0,Math.floor(Number(body.liveVisualizaciones)||0));
      const termsUrl=safeUrl(body.terminosUrl);
      if(text(body.terminosUrl,255)&&!termsUrl)return NextResponse.json({message:"El enlace de términos debe comenzar por http:// o https://."},{status:422});
      const values=[title,text(body.descripcion,4000)||null,date,text(body.premio,180)||null,expectedWinners,submittedImage,state,termsUrl,liveViews,text(body.livePlataformas,255)||null,session.userId];
      if(id>0){
        await execute("UPDATE sorteos SET titulo=?,descripcion=?,fecha_sorteo=?,premio=?,ganadores_esperados=?,imagen=?,estado=?,terminos_url=?,live_visualizaciones=?,live_plataformas=?,updated_by=? WHERE id=? AND deleted_at IS NULL",[...values,id]);
        await logActivity(id,session.userId,"SORTEO_ACTUALIZADO","Información general, configuración e imagen actualizadas");
      }else{
        const result=await execute("INSERT INTO sorteos (titulo,descripcion,fecha_sorteo,premio,ganadores_esperados,imagen,estado,terminos_url,live_visualizaciones,live_plataformas,created_by,updated_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",[...values,session.userId]);
        await logActivity(result.insertId,session.userId,"SORTEO_CREADO","Sorteo creado desde el panel de Mercadeo");
      }
    }else if(action==="participants"){
      const sorteoId=Number(body.sorteoId),rows=Array.isArray(body.participantes)?body.participantes:[];
      if(!(sorteoId>0)||!rows.length)return NextResponse.json({message:"Carga al menos un participante válido."},{status:422});
      for(const raw of rows.slice(0,10000)){
        const row=raw as Record<string,unknown>,contrato=text(row.contrato,80),nombre=text(row.nombre,180);
        if(!contrato||!nombre)continue;
        await execute("INSERT INTO sorteo_participantes (sorteo_id,numero_contrato,nombre,documento,telefono,email,habilitado) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre),documento=VALUES(documento),telefono=VALUES(telefono),email=VALUES(email),habilitado=VALUES(habilitado)",[sorteoId,contrato,nombre,text(row.documento,40)||null,text(row.telefono,50)||null,text(row.email,160)||null,row.habilitado!==false]);
      }
      await logActivity(sorteoId,session.userId,"PARTICIPANTES_CARGADOS",`${rows.length} registros recibidos`);
    }else if(action==="winner"){
      const sorteoId=Number(body.sorteoId),winnerId=Number(body.winnerId),nombre=text(body.nombre,180),numeroContrato=text(body.numeroContrato,80);
      if(!(sorteoId>0)||!nombre||!numeroContrato)return NextResponse.json({message:"Completa el nombre y número de contrato del ganador."},{status:422});
      const raffle=await query<{estado:string;ganadores_esperados:number}>("SELECT estado,ganadores_esperados FROM sorteos WHERE id=? AND deleted_at IS NULL LIMIT 1",[sorteoId]);
      if(!raffle[0])return NextResponse.json({message:"Sorteo no encontrado."},{status:404});
      if(raffle[0].estado==="PUBLICADO"&&!(await verifyAdminPassword(session,body.adminPassword)))return NextResponse.json({message:"Confirma tu contraseña administrativa para modificar un ganador publicado."},{status:401});
      if(!(winnerId>0)){
        const current=await query<{total:number}>("SELECT COUNT(*) total FROM sorteo_ganadores WHERE sorteo_id=?",[sorteoId]);
        if(Number(current[0]?.total||0)>=Number(raffle[0].ganadores_esperados))return NextResponse.json({message:`Este sorteo ya tiene los ${raffle[0].ganadores_esperados} ganador(es) configurados.`},{status:422});
      }
      await execute("INSERT INTO sorteo_participantes (sorteo_id,numero_contrato,nombre,documento,telefono,email,habilitado) VALUES (?,?,?,?,?,?,TRUE) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre),habilitado=TRUE",[sorteoId,numeroContrato,nombre,null,null,null]);
      const participant=await query<{id:number}>("SELECT id FROM sorteo_participantes WHERE sorteo_id=? AND numero_contrato=? LIMIT 1",[sorteoId,numeroContrato]);
      if(!participant[0])throw Error("No se pudo registrar el ganador.");
      const duplicate=await query<{id:number}>("SELECT id FROM sorteo_ganadores WHERE sorteo_id=? AND participante_id=? AND id<>? LIMIT 1",[sorteoId,participant[0].id,winnerId>0?winnerId:0]);
      if(duplicate[0])return NextResponse.json({message:"Esta persona ya está registrada como ganadora del incentivo."},{status:409});
      if(winnerId>0)await execute("UPDATE sorteo_ganadores SET participante_id=?,validado=FALSE,validado_por=NULL,validado_at=NULL,seleccionado_por=?,seleccionado_at=NOW() WHERE id=? AND sorteo_id=?",[participant[0].id,session.userId,winnerId,sorteoId]);
      else{
        const positions=await query<{next_position:number}>("SELECT COALESCE(MAX(posicion),0)+1 next_position FROM sorteo_ganadores WHERE sorteo_id=?",[sorteoId]);
        await execute("INSERT INTO sorteo_ganadores (sorteo_id,participante_id,posicion,seleccionado_por) VALUES (?,?,?,?)",[sorteoId,participant[0].id,positions[0]?.next_position??1,session.userId]);
      }
      await execute("UPDATE sorteos SET estado='CERRADO',updated_by=? WHERE id=?",[session.userId,sorteoId]);
      await logActivity(sorteoId,session.userId,winnerId>0?"GANADOR_ACTUALIZADO":"GANADOR_REGISTRADO_MANUALMENTE",`${winnerId>0?"Ganador actualizado":"Ganador registrado"}: ${nombre} · Contrato ${numeroContrato}`);
    }else if(action==="remove_winner"){
      const sorteoId=Number(body.sorteoId),winnerId=Number(body.winnerId);
      if(!(sorteoId>0)||!(winnerId>0))return NextResponse.json({message:"Sorteo inválido."},{status:422});
      const raffle=await query<{estado:string}>("SELECT estado FROM sorteos WHERE id=? AND deleted_at IS NULL LIMIT 1",[sorteoId]);
      if(raffle[0]?.estado==="PUBLICADO"&&!(await verifyAdminPassword(session,body.adminPassword)))return NextResponse.json({message:"Confirma tu contraseña administrativa para retirar un ganador publicado."},{status:401});
      await execute("DELETE FROM sorteo_ganadores WHERE id=? AND sorteo_id=?",[winnerId,sorteoId]);
      await execute("UPDATE sorteos SET estado='CERRADO',updated_by=? WHERE id=? AND deleted_at IS NULL",[session.userId,sorteoId]);
      await logActivity(sorteoId,session.userId,"GANADOR_RETIRADO","Ganador retirado; los demás registros se conservaron");
    }else if(action==="draw"){
      const sorteoId=Number(body.sorteoId),active=await query<{id:number}>("SELECT id FROM sorteo_participantes WHERE sorteo_id=? AND habilitado=TRUE ORDER BY RAND() LIMIT 1",[sorteoId]);
      if(!active[0])return NextResponse.json({message:"No hay participantes habilitados para realizar el sorteo."},{status:422});
      await execute("DELETE FROM sorteo_ganadores WHERE sorteo_id=?",[sorteoId]);
      await execute("INSERT INTO sorteo_ganadores (sorteo_id,participante_id,posicion,seleccionado_por) VALUES (?,?,1,?)",[sorteoId,active[0].id,session.userId]);
      await execute("UPDATE sorteos SET estado='CERRADO',updated_by=? WHERE id=?",[session.userId,sorteoId]);
      await logActivity(sorteoId,session.userId,"GANADOR_SELECCIONADO","Selección aleatoria ejecutada sobre participantes habilitados");
    }else if(action==="validate"){
      const sorteoId=Number(body.sorteoId),expected=await query<{ganadores_esperados:number;total:number}>(`SELECT s.ganadores_esperados,COUNT(g.id) total FROM sorteos s LEFT JOIN sorteo_ganadores g ON g.sorteo_id=s.id WHERE s.id=? AND s.deleted_at IS NULL GROUP BY s.id,s.ganadores_esperados`,[sorteoId]);
      if(!expected[0]||Number(expected[0].total)<Number(expected[0].ganadores_esperados))return NextResponse.json({message:`Debes registrar ${expected[0]?.ganadores_esperados||1} ganador(es) antes de publicar.`},{status:422});
      await execute("UPDATE sorteo_ganadores SET validado=TRUE,validado_por=?,validado_at=NOW() WHERE sorteo_id=?",[session.userId,sorteoId]);
      await execute("UPDATE sorteos SET estado='PUBLICADO',updated_by=? WHERE id=?",[session.userId,sorteoId]);
      await logActivity(sorteoId,session.userId,"GANADORES_VALIDADOS_Y_PUBLICADOS",`${expected[0].total} ganador(es) validados y publicados`);
    }else if(action==="status"){
      const id=Number(body.id),nextState=text(body.estado,20);
      if(!(id>0)||!["BORRADOR","PROGRAMADO","PAUSADO","CERRADO","CANCELADO"].includes(nextState))return NextResponse.json({message:"Estado inválido."},{status:422});
      const current=await query<{estado:string}>("SELECT estado FROM sorteos WHERE id=? AND deleted_at IS NULL LIMIT 1",[id]);
      if(current[0]?.estado==="PUBLICADO"&&!(await verifyAdminPassword(session,body.adminPassword)))return NextResponse.json({message:"Confirma tu contraseña administrativa para modificar un sorteo publicado."},{status:401});
      await execute("UPDATE sorteos SET estado=?,updated_by=? WHERE id=? AND deleted_at IS NULL",[nextState,session.userId,id]);
      await logActivity(id,session.userId,"ESTADO_ACTUALIZADO",`Estado actualizado a ${nextState}`);
    }else if(action==="delete"){
      const id=Number(body.id);
      if(!(id>0))return NextResponse.json({message:"Sorteo inválido."},{status:422});
      if(!(await verifyAdminPassword(session,body.adminPassword)))return NextResponse.json({message:"La contraseña administrativa no es válida."},{status:401});
      await logActivity(id,session.userId,"SORTEO_ELIMINADO","Sorteo enviado a la papelera desde el panel de Mercadeo");
      await execute("UPDATE sorteos SET estado='CANCELADO',deleted_at=NOW(),updated_by=? WHERE id=?",[session.userId,id]);
    }else if(action==="restore"){
      const id=Number(body.id);
      if(!(id>0))return NextResponse.json({message:"Sorteo inválido."},{status:422});
      await execute("UPDATE sorteos SET estado='BORRADOR',deleted_at=NULL,updated_by=? WHERE id=? AND deleted_at IS NOT NULL",[session.userId,id]);
      await logActivity(id,session.userId,"SORTEO_RESTAURADO","Sorteo recuperado desde la papelera");
    }else return NextResponse.json({message:"Operación inválida."},{status:400});
    return NextResponse.json({data:await data(true)});
  }catch(error){console.error("POST sorteos:",error);return NextResponse.json({message:"No fue posible guardar el sorteo. Revisa los datos y la migración MySQL."},{status:500});}
}
