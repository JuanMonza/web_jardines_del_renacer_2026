import { NextRequest,NextResponse } from "next/server";
import * as XLSX from "xlsx-js-style";
import { query } from "@/lib/db";
import { ADMIN_SESSION_COOKIE,requireAdminPermission } from "@/lib/iam/admin-session";
import { ensureSelectionSchema } from "@/lib/selection-followup";
import { ensureHistoricalCandidateSchema } from "@/lib/historical-candidate-records";
import { ensureApplicationSnapshotSchema,ensureCandidateLicenseColumn } from "@/lib/candidateStorageDB";

type ReportRow=Record<string,unknown>;
type Tone="blue"|"yellow"|"purple"|"green"|"red"|"gray";
const TONES:Record<Tone,{strong:string;soft:string}>={
  blue:{strong:"0EA5E9",soft:"E0F2FE"},yellow:{strong:"D97706",soft:"FEF3C7"},purple:{strong:"7C3AED",soft:"EDE9FE"},
  green:{strong:"059669",soft:"D1FAE5"},red:{strong:"DC2626",soft:"FEE2E2"},gray:{strong:"64748B",soft:"F1F5F9"},
};

function toneFor(value:unknown):Tone{
  const text=String(value??"").toLocaleLowerCase("es-CO");
  if(/contrat|seleccionado|aprobado|completado/.test(text))return "green";
  if(/no seleccionado|no continúa|no continua|rechazado|cancelado|cerrado/.test(text))return "red";
  if(/entrevista|traslad|reagendada|finalista/.test(text))return "purple";
  if(/revisión|revision|prueba|pendiente|pausad/.test(text))return "yellow";
  if(/postulad|recibid|programada/.test(text))return "blue";
  return "gray";
}
function printable(value:unknown){
  if(value==null)return "";
  if(value instanceof Date)return value;
  if(typeof value==="object")return JSON.stringify(value);
  return value;
}
function parseObject(value:unknown):Record<string,unknown>{
  if(!value)return {};
  if(typeof value==="object"&&!Array.isArray(value))return value as Record<string,unknown>;
  if(typeof value!=="string")return {};
  try{const parsed=JSON.parse(value);return parsed&&typeof parsed==="object"&&!Array.isArray(parsed)?parsed:{};}catch{return {};}
}
function expand(rows:ReportRow[]){
  return rows.map(row=>{
    const details=parseObject(row.Ficha),{Ficha,...base}=row;
    void Ficha;
    return {...base,...Object.fromEntries(Object.entries(details).map(([key,value])=>[`Ficha: ${key}`,printable(value)]))};
  });
}
function addSheet(workbook:XLSX.WorkBook,name:string,sourceRows:ReportRow[],statusKey="Estado"){
  const rows=sourceRows.length?sourceRows:[{Resultado:"Sin registros en el período seleccionado"}];
  const sheet=XLSX.utils.json_to_sheet(rows,{cellDates:true});
  const range=XLSX.utils.decode_range(sheet["!ref"]||"A1");
  for(let column=0;column<=range.e.c;column++){
    const cell=sheet[XLSX.utils.encode_cell({r:0,c:column})];
    if(cell)cell.s={font:{bold:true,color:{rgb:"FFFFFF"}},fill:{fgColor:{rgb:"244F8A"}},alignment:{vertical:"center",wrapText:true},border:{bottom:{style:"thin",color:{rgb:"173C70"}}}};
  }
  const headers=Array.from({length:range.e.c+1},(_,column)=>String(sheet[XLSX.utils.encode_cell({r:0,c:column})]?.v??""));
  const statusColumn=headers.indexOf(statusKey),lightColumn=headers.indexOf("Semáforo");
  for(let row=1;row<=range.e.r;row++){
    const status=statusColumn>=0?sheet[XLSX.utils.encode_cell({r:row,c:statusColumn})]?.v:"";
    const colors=TONES[toneFor(status)];
    for(let column=0;column<=range.e.c;column++){
      const cell=sheet[XLSX.utils.encode_cell({r:row,c:column})];
      if(!cell)continue;
      cell.s={alignment:{vertical:"top",wrapText:true},fill:{fgColor:{rgb:row%2===0?"F8FAFC":"FFFFFF"}},border:{bottom:{style:"hair",color:{rgb:"DCE6F2"}}}};
      if(column===statusColumn)cell.s={...cell.s,font:{bold:true,color:{rgb:colors.strong}},fill:{fgColor:{rgb:colors.soft}}};
      if(column===lightColumn){cell.v="●";cell.t="s";cell.s={...cell.s,font:{bold:true,color:{rgb:colors.strong},sz:18},fill:{fgColor:{rgb:colors.soft}},alignment:{horizontal:"center",vertical:"center"}};}
    }
  }
  sheet["!cols"]=headers.map(header=>({wch:/Observaciones|Detalle|Ficha:|Evaluación|Pruebas/.test(header)?44:/Nombre|Vacante|Entrevistador|Responsable/.test(header)?28:/Correo|Enlace/.test(header)?32:/Fecha/.test(header)?21:18}));
  sheet["!rows"]=[{hpt:30},...Array.from({length:Math.max(0,range.e.r)},()=>({hpt:34}))];
  sheet["!autofilter"]={ref:XLSX.utils.encode_range({s:{r:0,c:0},e:{r:range.e.r,c:range.e.c}})};
  sheet["!freeze"]={xSplit:0,ySplit:1,topLeftCell:"A2",activePane:"bottomLeft",state:"frozen"};
  XLSX.utils.book_append_sheet(workbook,sheet,name);
}

export async function GET(request:NextRequest){
  const session=await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value,"vacancies.applications.view");
  if(!session)return NextResponse.json({message:"No autorizado."},{status:403});
  const from=request.nextUrl.searchParams.get("from")||"",to=request.nextUrl.searchParams.get("to")||"";
  if((from&&!/^\d{4}-\d{2}-\d{2}$/.test(from))||(to&&!/^\d{4}-\d{2}-\d{2}$/.test(to))||(from&&to&&from>to))return NextResponse.json({message:"Rango de fechas inválido."},{status:422});
  try{
    await Promise.all([ensureSelectionSchema(),ensureHistoricalCandidateSchema(),ensureApplicationSnapshotSchema(),ensureCandidateLicenseColumn()]);
    const args=[from||"1000-01-01",to||"9999-12-31"];
    const applications=await query<ReportRow>(`SELECT p.id AS Postulación,
      COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(p.application_snapshot,'$.candidateDocument')),''),c.documento,'') AS Cédula,
      COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(p.application_snapshot,'$.candidateName')),''),NULLIF(TRIM(CONCAT(COALESCE(c.nombres,''),' ',COALESCE(c.apellidos,''))),''),'Postulante sin nombre') AS Nombre,
      COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(p.application_snapshot,'$.candidateEmail')),''),c.email,'') AS Correo,
      COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(p.application_snapshot,'$.candidatePhone')),''),c.telefono,'') AS Teléfono,
      COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(p.application_snapshot,'$.candidateCity')),''),c.ciudad,'') AS Ciudad,
      COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(p.application_snapshot,'$.candidateDepartment')),''),c.departamento,'') AS Departamento,
      c.educacion AS 'Nivel académico',c.profesion AS 'Título o profesión',IF(c.tiene_licencia_conduccion=1,'Sí','No') AS 'Licencia de conducción',
      COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(p.application_snapshot,'$.vacancyTitle')),''),v.titulo,'Vacante no disponible') AS Vacante,
      p.estado AS Estado,'●' AS Semáforo,p.fuente AS Fuente,p.created_at AS 'Fecha de postulación',p.updated_at AS 'Última actualización',p.observaciones_rh AS Observaciones,p.cv_url AS 'Hoja de vida',f.fields_json AS Ficha
      FROM postulaciones p LEFT JOIN candidatos c ON c.id=p.candidato_id LEFT JOIN vacantes v ON v.id=p.vacante_id
      LEFT JOIN application_followups f ON f.application_id=p.id WHERE p.deleted_at IS NULL AND DATE(p.created_at) BETWEEN ? AND ? ORDER BY p.created_at`,args);
    const interviews=await query<ReportRow>(`SELECT e.id AS Entrevista,e.postulacion_id AS Postulación,c.documento AS Cédula,
      TRIM(CONCAT(COALESCE(c.nombres,''),' ',COALESCE(c.apellidos,''))) AS Nombre,v.titulo AS Vacante,e.fecha AS Fecha,e.modalidad AS Modalidad,e.duracion AS 'Duración (minutos)',e.lugar AS Lugar,e.enlace AS Enlace,e.estado AS Estado,'●' AS Semáforo,e.resultado AS Resultado,e.observaciones AS Observaciones,
      COALESCE(NULLIF(TRIM(CONCAT(COALESCE(a.nombres,''),' ',COALESCE(a.apellidos,''))),''),'Equipo de Talento Humano') AS Entrevistador
      FROM entrevistas e LEFT JOIN candidatos c ON c.id=e.candidato_id LEFT JOIN vacantes v ON v.id=e.vacante_id LEFT JOIN admin_users a ON a.id=e.entrevistador
      WHERE e.deleted_at IS NULL AND DATE(e.fecha) BETWEEN ? AND ? ORDER BY e.fecha,e.id`,args);
    const history=await query<ReportRow>(`SELECT c.documento AS Cédula,c.nombre AS Nombre,c.correo AS Correo,c.telefono AS Teléfono,c.ciudad AS Ciudad,c.departamento AS Departamento,m.vacante AS Cargo,m.estado AS Estado,'●' AS Semáforo,m.fecha AS Fecha,m.origen AS Origen,m.entrevistadores AS Entrevistadores,m.observaciones AS Observaciones,m.evaluacion AS 'Pruebas y entrevistas',m.motivo_descarte AS 'Motivo de descarte',m.licencia_runt AS 'Licencia / RUNT',m.hoja_origen AS 'Origen del registro',m.fila_origen AS 'Fila de origen',m.raw_data AS Ficha
      FROM historical_candidate_movements m JOIN historical_candidates c ON c.identity_key=m.identity_key WHERE m.fecha BETWEEN ? AND ? ORDER BY m.fecha,m.id`,args);
    const audit=await query<ReportRow>(`SELECT l.created_at AS Fecha,l.accion AS Acción,COALESCE(p.estado,'Movimiento administrativo') AS Estado,'●' AS Semáforo,l.usuario_tipo AS Responsable,l.usuario_id AS 'ID responsable',l.registro_id AS Registro,l.tabla_afectada AS Entidad,l.descripcion AS Detalle
      FROM activity_logs l LEFT JOIN postulaciones p ON l.tabla_afectada='postulaciones' AND p.id=l.registro_id
      WHERE l.modulo='Vacantes' AND DATE(l.created_at) BETWEEN ? AND ? ORDER BY l.created_at,l.id`,args);
    const trace:ReportRow[]=[
      ...applications.map(row=>({Fecha:row["Fecha de postulación"],Tipo:"Postulación",Postulación:row.Postulación,Cédula:row.Cédula,Nombre:row.Nombre,Vacante:row.Vacante,Estado:row.Estado,Semáforo:"●",Responsable:row.Fuente,Detalle:row.Observaciones||"Postulación recibida."})),
      ...interviews.map(row=>({Fecha:row.Fecha,Tipo:"Entrevista",Postulación:row.Postulación,Cédula:row.Cédula,Nombre:row.Nombre,Vacante:row.Vacante,Estado:row.Estado,Semáforo:"●",Responsable:row.Entrevistador,Detalle:`${row.Modalidad} · Resultado: ${row.Resultado}. ${row.Observaciones||""}`})),
      ...history.map(row=>({Fecha:row.Fecha,Tipo:"Historial laboral",Postulación:"",Cédula:row.Cédula,Nombre:row.Nombre,Vacante:row.Cargo,Estado:row.Estado,Semáforo:"●",Responsable:row.Entrevistadores,Detalle:row.Observaciones,"Pruebas y entrevistas":row["Pruebas y entrevistas"]})),
      ...audit.map(row=>({Fecha:row.Fecha,Tipo:"Auditoría",Postulación:row.Entidad==="postulaciones"?row.Registro:"",Cédula:"",Nombre:"",Vacante:"",Estado:row.Estado,Semáforo:"●",Responsable:row.Responsable,Detalle:row.Detalle,Acción:row.Acción})),
    ].sort((a,b)=>new Date(String(a.Fecha)).getTime()-new Date(String(b.Fecha)).getTime());
    const workbook=XLSX.utils.book_new();
    addSheet(workbook,"Resumen",[{Período:`${from||"Inicio"} a ${to||"Actual"}`,Postulaciones:applications.length,Entrevistas:interviews.length,"Entrevistas realizadas":interviews.filter(row=>row.Estado==="Realizada").length,"Entrevistas aprobadas":interviews.filter(row=>row.Resultado==="Aprobado").length,Contrataciones:history.filter(row=>row.Estado==="Contratado").length,"Movimientos auditados":audit.length}],"Resultado");
    addSheet(workbook,"Trazabilidad completa",trace);
    addSheet(workbook,"Postulaciones",expand(applications));
    addSheet(workbook,"Entrevistas",interviews);
    addSheet(workbook,"Historial laboral",expand(history));
    addSheet(workbook,"Auditoría",audit);
    const buffer=XLSX.write(workbook,{bookType:"xlsx",type:"buffer",cellStyles:true});
    return new NextResponse(buffer,{headers:{"Content-Type":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","Content-Disposition":`attachment; filename="reporte-seleccion-${from||"inicio"}-${to||"actual"}.xlsx"`,"Cache-Control":"no-store"}});
  }catch(error){console.error("No fue posible generar el reporte de selección:",error);return NextResponse.json({message:"No fue posible generar el reporte."},{status:500});}
}
