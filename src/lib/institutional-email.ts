const DEFAULT_SITE_URL = "https://jardinesdelrenacer.com";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
}

/** Marco común para todo correo SMTP institucional. */
export function institutionalEmailLayout(content: string, section = "Jardines del Renacer") {
  const baseUrl = siteUrl();
  const logo = `${baseUrl}/logo-oficial.webp`;
  return `<div style="margin:0;padding:24px;background:#f3f7fc;font-family:Arial,sans-serif;color:#24344d"><div style="max-width:620px;margin:auto;overflow:hidden;border:1px solid #dbe5f6;border-radius:18px;background:#fff"><div style="padding:20px 24px;background:#173f73;color:#fff"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="padding-right:12px"><img src="${logo}" width="48" height="48" alt="Jardines del Renacer" style="display:block;object-fit:contain"></td><td><strong style="font-size:18px">Jardines del Renacer</strong><div style="margin-top:4px;font-size:12px;color:#dbeafe">${section}</div></td></tr></table></div><div style="padding:26px 24px">${content}</div><div style="padding:20px 24px;border-top:1px solid #e5edf7;background:#f8fbff;text-align:center"><p style="margin:0 0 10px;font-size:12px;color:#64748b">© ${new Date().getFullYear()} Jardines del Renacer. Todos los derechos reservados.</p><p style="margin:0;font-size:12px"><a href="${baseUrl}" style="color:#2454a0;text-decoration:none">jardinesdelrenacer.com</a><span style="color:#cbd5e1"> · </span><a href="${baseUrl}/legal/terminos" style="color:#2454a0;text-decoration:none">Términos y condiciones</a><span style="color:#cbd5e1"> · </span><a href="${baseUrl}/legal/cookies" style="color:#2454a0;text-decoration:none">Política de cookies</a></p><p style="margin:12px 0 0;font-size:11px;color:#94a3b8">Este es un mensaje automático; por favor no respondas a este correo.</p></div></div></div>`;
}
