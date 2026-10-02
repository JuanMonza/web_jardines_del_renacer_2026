"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, ExternalLink, MessageCircle, Share2, X } from "lucide-react";
import type { JobVacancy } from "@/config/vacancies";
import ScreenDialog from "@/components/ui/ScreenDialog";

function vacancyDetails(vacancy: JobVacancy) {
  return [
    `Vacante: ${vacancy.title}`,
    `Ubicación: ${vacancy.city}, ${vacancy.department}`,
    `Modalidad: ${vacancy.modality}`,
    `Contrato: ${vacancy.contractType}`,
    vacancy.schedule.trim() ? `Días de trabajo: ${vacancy.schedule.trim()}` : "",
    vacancy.salary.trim() ? `Salario: ${vacancy.salary.trim()}` : "",
    vacancy.requiresDriversLicense ? "Licencia de conducción: requerida" : "",
  ].filter(Boolean);
}

function caption(vacancy: JobVacancy) {
  return `¡Estamos buscando talento!\n\n${vacancyDetails(vacancy).join("\n")}\n\nJardines del Renacer`;
}

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else current = candidate;
  }
  if (current) lines.push(current);
  return lines;
}

function loadCanvasImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

function drawImageCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawnWidth = image.naturalWidth * scale;
  const drawnHeight = image.naturalHeight * scale;
  context.drawImage(image, x - (drawnWidth - width) / 2, y - (drawnHeight - height) / 2, drawnWidth, drawnHeight);
}

function fittedLines(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  initialSize: number,
  minimumSize: number,
) {
  for (let size = initialSize; size >= minimumSize; size -= 2) {
    context.font = `800 ${size}px Arial`;
    const lines = wrapText(context, text, maxWidth);
    if (lines.length <= maxLines) return { lines, size };
  }
  context.font = `800 ${minimumSize}px Arial`;
  const lines = wrapText(context, text, maxWidth).slice(0, maxLines);
  const last = lines[maxLines - 1] || "";
  while (context.measureText(`${lines[maxLines - 1]}…`).width > maxWidth && lines[maxLines - 1].length > 1) {
    lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1);
  }
  lines[maxLines - 1] = `${lines[maxLines - 1] || last}…`;
  return { lines, size: minimumSize };
}

async function createVacancyImage(vacancy: JobVacancy) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const context = canvas.getContext("2d");
  if (!context) return "";

  const base = process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || "";
  const [logo, teamPhoto] = await Promise.all([
    loadCanvasImage(`${base}/logo-oficial.webp`),
    loadCanvasImage(`${base}/images/images-baners/Trabaja_con_nosotros.webp`),
  ]);

  const background = context.createLinearGradient(0, 0, 1080, 1920);
  background.addColorStop(0, "#0d3569");
  background.addColorStop(0.58, "#245c9b");
  background.addColorStop(1, "#79a8d8");
  context.fillStyle = background;
  context.fillRect(0, 0, 1080, 1920);
  context.fillStyle = "rgba(255,255,255,.07)";
  context.beginPath(); context.arc(945, 210, 330, 0, Math.PI * 2); context.fill();
  context.beginPath(); context.arc(30, 1800, 330, 0, Math.PI * 2); context.fill();

  context.textAlign = "center";
  context.drawImage(logo, 460, 58, 160, 169);

  context.save();
  context.beginPath();
  context.roundRect(70, 275, 940, 650, 56);
  context.clip();
  drawImageCover(context, teamPhoto, 70, 275, 940, 650);
  const photoShade = context.createLinearGradient(0, 275, 0, 925);
  photoShade.addColorStop(0, "rgba(13,53,105,.02)");
  photoShade.addColorStop(1, "rgba(13,53,105,.72)");
  context.fillStyle = photoShade;
  context.fillRect(70, 275, 940, 650);
  context.restore();

  context.save();
  context.shadowColor = "rgba(3,28,65,.28)";
  context.shadowBlur = 42;
  context.shadowOffsetY = 18;
  context.beginPath();
  context.roundRect(70, 700, 940, 860, 54);
  context.fillStyle = "rgba(245,250,255,.88)";
  context.fill();
  context.restore();
  context.beginPath();
  context.roundRect(70, 700, 940, 860, 54);
  context.strokeStyle = "rgba(255,255,255,.72)";
  context.lineWidth = 4;
  context.stroke();

  context.textAlign = "center";
  context.fillStyle = "#174579";
  context.font = "800 47px Arial";
  context.fillText("¡ESTAMOS BUSCANDO TALENTO!", 540, 810);

  context.textAlign = "left";
  context.fillStyle = "#285c99";
  context.font = "800 25px Arial";
  context.fillText("VACANTE:", 140, 905);
  context.fillStyle = "#143c70";
  const vacancyTitle = fittedLines(context, vacancy.title, 800, 2, 58, 42);
  context.font = `800 ${vacancyTitle.size}px Arial`;
  let y = 985;
  for (const line of vacancyTitle.lines) {
    context.fillText(line, 140, y);
    y += vacancyTitle.size + 16;
  }
  y += 20;
  context.fillStyle = "#506b8d";
  context.font = "600 27px Arial";
  const details = vacancyDetails(vacancy).slice(1);
  for (const detail of details) {
    for (const line of wrapText(context, detail, 800)) {
      context.fillText(line, 140, y);
      y += 39;
    }
    y += 9;
  }

  context.beginPath();
  context.roundRect(120, 1370, 840, 125, 32);
  context.fillStyle = "rgba(23,69,121,.92)";
  context.fill();
  context.fillStyle = "#ffffff";
  context.textAlign = "center";
  context.font = "800 23px Arial";
  context.fillText("POSTÚLATE EN", 540, 1415);
  context.font = "700 27px Arial";
  context.fillText("jardinesdelrenacer.com/servicios/trabaja-con-nosotros", 540, 1463);

  context.font = "800 42px Arial";
  context.fillText("¡ÚNETE A NUESTRO EQUIPO!", 540, 1695);
  context.font = "500 27px Arial";
  context.fillStyle = "#e5f2ff";
  context.fillText("Comparte esta oportunidad con quien la necesite", 540, 1760);
  context.beginPath();
  context.roundRect(390, 1810, 300, 8, 4);
  context.fillStyle = "rgba(255,255,255,.65)";
  context.fill();
  return canvas.toDataURL("image/png");
}

export default function VacancyWhatsAppShare({ vacancy }: { vacancy: JobVacancy }) {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState("");
  const [copied, setCopied] = useState(false);
  const text = useMemo(() => open ? caption(vacancy) : "", [open, vacancy]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setImage("");
    void createVacancyImage(vacancy).then(result => { if (active) setImage(result); });
    return () => { active = false; };
  }, [open, vacancy]);

  async function copyText() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  function downloadImage() {
    const link = document.createElement("a");
    link.href = image;
    link.download = `vacante-${vacancy.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}.png`;
    link.click();
  }

  async function share() {
    if (navigator.share && image) {
      const blob = await (await fetch(image)).blob();
      const file = new File([blob], "vacante-jardines-del-renacer.png", { type: "image/png" });
      if (!navigator.canShare || navigator.canShare({ files: [file] })) {
        try { await navigator.share({ title: vacancy.title, text, files: [file] }); return; } catch { /* usa el flujo web */ }
      }
    }
    await copyText();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return <>
    <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100">
      <MessageCircle size={14}/> Compartir
    </button>
    {open && <ScreenDialog ariaLabel="Compartir vacante en WhatsApp" onClose={() => setOpen(false)}>
      <section onClick={(event) => event.stopPropagation()} className="grid max-h-[calc(100dvh-2rem)] w-full max-w-4xl overflow-y-auto rounded-[30px] bg-[#f7faff] shadow-2xl md:grid-cols-[310px_1fr]">
        <div className="bg-gradient-to-b from-[#173f73] to-[#4f82bb] p-5">
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-[.16em] text-blue-100">Vista previa para estado</p>
          {image ? <img src={image} alt={`Pieza para compartir la vacante ${vacancy.title}`} className="mx-auto max-h-[580px] w-full rounded-2xl object-contain shadow-xl"/> : <div className="aspect-[9/16] animate-pulse rounded-2xl bg-white/10"/>}
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">WhatsApp</p><h2 className="mt-2 text-2xl font-bold text-text">Compartir vacante</h2><p className="mt-2 text-sm leading-6 text-textLight">La imagen está lista en formato vertical. Comparte el archivo y selecciona <strong>Mi estado</strong> en WhatsApp.</p></div><button type="button" aria-label="Cerrar" onClick={() => setOpen(false)} className="rounded-xl border border-border bg-white p-2 text-textLight"><X size={20}/></button></div>
          <div className="mt-6 rounded-2xl border border-[#dbe5f3] bg-white p-4"><p className="whitespace-pre-line text-sm leading-6 text-slate-700">{text}</p></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={downloadImage} disabled={!image} className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white px-4 py-3 font-bold text-primary disabled:opacity-50"><Download size={18}/> Descargar imagen</button>
            <button type="button" onClick={() => void copyText()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white px-4 py-3 font-bold text-primary">{copied?<Check size={18}/>:<Copy size={18}/>} {copied?"Texto copiado":"Copiar texto"}</button>
            <button type="button" onClick={() => void share()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#12a957] px-4 py-3 font-bold text-white shadow-lg sm:col-span-2"><Share2 size={18}/> Compartir por WhatsApp <ExternalLink size={15}/></button>
          </div>
          <p className="mt-4 text-xs leading-5 text-textLight">WhatsApp no permite que una página publique automáticamente en tus estados. Al abrirse, selecciona “Mi estado” manualmente.</p>
        </div>
      </section>
    </ScreenDialog>}
  </>;
}
