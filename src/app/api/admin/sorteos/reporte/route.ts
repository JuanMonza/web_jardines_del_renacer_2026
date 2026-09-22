import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx-js-style";
import { query } from "@/lib/db";
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from "@/lib/iam/admin-session";
import { repairMojibake } from "@/lib/text-encoding";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const headerStyle = {
  font: { bold: true, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: "234D8D" } },
  alignment: { horizontal: "center", vertical: "center" },
};
function styleSheet(sheet: XLSX.WorkSheet, widths: number[]) {
  sheet["!cols"] = widths.map((wch) => ({ wch }));
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1:A1");
  for (let column = range.s.c; column <= range.e.c; column += 1) {
    const cell = sheet[XLSX.utils.encode_cell({ r: 0, c: column })];
    if (cell) cell.s = headerStyle;
  }
  sheet["!freeze"] = { xSplit: 0, ySplit: 1 };
  sheet["!autofilter"] = { ref: XLSX.utils.encode_range(range) };
}

export async function GET(request: NextRequest) {
  const session = await requireAdminPermission(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    "giveaways.view",
  );
  if (!session) return NextResponse.json({ message: "No autorizado." }, { status: 403 });
  const from = request.nextUrl.searchParams.get("from") || "";
  const to = request.nextUrl.searchParams.get("to") || "";
  if ((from && !isoDate.test(from)) || (to && !isoDate.test(to)) || (from && to && from > to))
    return NextResponse.json({ message: "El rango de fechas no es válido." }, { status: 422 });

  try {
    const conditions = ["1=1"];
    const params: unknown[] = [];
    if (from) { conditions.push("DATE(s.fecha_sorteo)>=?"); params.push(from); }
    if (to) { conditions.push("DATE(s.fecha_sorteo)<=?"); params.push(to); }
    const where = conditions.join(" AND ");
    const raffles = await query<{
      id:number; titulo:string; fecha_sorteo:string; premio:string|null; estado:string;
      ganadores_esperados:number; participantes:number; habilitados:number; ganadores:number;
      live_visualizaciones:number|null; live_plataformas:string|null; deleted_at:string|null;
    }>(`SELECT s.id,s.titulo,s.fecha_sorteo,s.premio,s.estado,s.ganadores_esperados,
      COUNT(DISTINCT p.id) participantes,COUNT(DISTINCT CASE WHEN p.habilitado=TRUE THEN p.id END) habilitados,
      COUNT(DISTINCT g.id) ganadores,s.live_visualizaciones,s.live_plataformas,s.deleted_at
      FROM sorteos s LEFT JOIN sorteo_participantes p ON p.sorteo_id=s.id
      LEFT JOIN sorteo_ganadores g ON g.sorteo_id=s.id WHERE ${where}
      GROUP BY s.id ORDER BY s.fecha_sorteo DESC`,params);
    const ids = raffles.map((raffle) => raffle.id);
    const winners = ids.length ? await query<{
      sorteo_id:number; sorteo:string; posicion:number; nombre:string; numero_contrato:string;
      validado:number; seleccionado_at:string; validado_at:string|null;
    }>(`SELECT g.sorteo_id,s.titulo sorteo,g.posicion,p.nombre,p.numero_contrato,g.validado,g.seleccionado_at,g.validado_at
      FROM sorteo_ganadores g INNER JOIN sorteos s ON s.id=g.sorteo_id
      INNER JOIN sorteo_participantes p ON p.id=g.participante_id
      WHERE g.sorteo_id IN (${ids.map(()=>"?").join(",")}) ORDER BY s.fecha_sorteo DESC,g.posicion`,ids) : [];
    const logs = ids.length ? await query<{
      sorteo:string; accion:string; detalle:string|null; administrador:string|null; created_at:string;
    }>(`SELECT s.titulo sorteo,l.accion,l.detalle,NULLIF(TRIM(CONCAT(COALESCE(a.nombres,''),' ',COALESCE(a.apellidos,''))), '') administrador,l.created_at
      FROM sorteo_activity_logs l INNER JOIN sorteos s ON s.id=l.sorteo_id
      LEFT JOIN admin_users a ON a.id=l.admin_user_id
      WHERE l.sorteo_id IN (${ids.map(()=>"?").join(",")}) ORDER BY l.created_at DESC`,ids) : [];

    const workbook = XLSX.utils.book_new();
    const totalViews = raffles.reduce((sum, raffle) => sum + Number(raffle.live_visualizaciones || 0), 0);
    const summary = XLSX.utils.json_to_sheet([
      { Indicador: "Período", Valor: `${from || "Inicio"} a ${to || "Actualidad"}` },
      { Indicador: "Sorteos", Valor: raffles.length },
      { Indicador: "Participantes", Valor: raffles.reduce((sum,row)=>sum+Number(row.participantes),0) },
      { Indicador: "Ganadores", Valor: winners.length },
      { Indicador: "Visualizaciones de transmisiones", Valor: totalViews },
    ]);
    styleSheet(summary,[38,28]);
    XLSX.utils.book_append_sheet(workbook,summary,"Resumen");

    const rafflesSheet=XLSX.utils.json_to_sheet(raffles.map(row=>({
      ID:row.id,Sorteo:repairMojibake(row.titulo),Fecha:row.fecha_sorteo,Premio:repairMojibake(row.premio),Estado:row.deleted_at?"ELIMINADO":row.estado,
      "Ganadores esperados":row.ganadores_esperados,Participantes:Number(row.participantes),Habilitados:Number(row.habilitados),Ganadores:Number(row.ganadores),
      "Visualizaciones del live":row.live_visualizaciones??"Sin registrar","Plataformas de transmisión":repairMojibake(row.live_plataformas)||"Sin registrar",
    })));
    styleSheet(rafflesSheet,[10,38,22,28,16,20,16,14,14,25,38]);
    XLSX.utils.book_append_sheet(workbook,rafflesSheet,"Sorteos");

    const winnersSheet=XLSX.utils.json_to_sheet(winners.map(row=>({Sorteo:repairMojibake(row.sorteo),Posición:row.posicion,Ganador:repairMojibake(row.nombre),Contrato:repairMojibake(row.numero_contrato),Validado:Boolean(row.validado)?"Sí":"No","Fecha de registro":row.seleccionado_at,"Fecha de validación":row.validado_at||""})));
    styleSheet(winnersSheet,[38,10,32,20,12,22,22]);
    XLSX.utils.book_append_sheet(workbook,winnersSheet,"Ganadores");

    const logsSheet=XLSX.utils.json_to_sheet(logs.map(row=>({Sorteo:repairMojibake(row.sorteo),Acción:row.accion,Detalle:repairMojibake(row.detalle),Administrador:repairMojibake(row.administrador)||"Sistema",Fecha:row.created_at})));
    styleSheet(logsSheet,[38,32,65,30,22]);
    XLSX.utils.book_append_sheet(workbook,logsSheet,"Trazabilidad");

    const file=XLSX.write(workbook,{bookType:"xlsx",type:"buffer",cellStyles:true}) as Buffer;
    return new NextResponse(new Blob([Uint8Array.from(file)]),{headers:{"Content-Type":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","Content-Disposition":`attachment; filename="informe-mercadeo-${from||"inicio"}-${to||"actual"}.xlsx"`,"Cache-Control":"no-store"}});
  } catch (error) {
    console.error("GET reporte sorteos:",error);
    return NextResponse.json({message:"No fue posible generar el informe de Mercadeo."},{status:500});
  }
}
