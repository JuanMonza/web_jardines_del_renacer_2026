const DEFAULT_SITE_URL = "https://jardinesdelrenacer.com";

export function institutionalEmailSiteUrl() {
  const configured = (process.env.EMAIL_PUBLIC_SITE_URL || process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
  if (!configured || /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/|$)/i.test(configured)) return DEFAULT_SITE_URL;
  return configured;
}

/** Marco común para todo correo SMTP institucional. */
export function institutionalEmailLayout(content: string, section = "Jardines del Renacer") {
  const baseUrl = institutionalEmailSiteUrl();
  const logo = `${baseUrl}/logos_jr_favico.png`;
  const socialLinks = [
    { name: "Facebook", href: "https://facebook.com/jardinesdelrenacer", icon: "https://img.icons8.com/color/96/facebook-new.png" },
    { name: "Instagram", href: "https://instagram.com/jardinesdelrenacer", icon: "https://img.icons8.com/fluency/96/instagram-new.png" },
    { name: "TikTok", href: "https://tiktok.com/@jardinesdelrenacer", icon: "https://img.icons8.com/color/96/tiktok--v1.png" },
    { name: "LinkedIn", href: "https://www.linkedin.com/company/jardines-del-renacer/posts/?feedView=all", icon: "https://img.icons8.com/color/96/linkedin.png" },
    { name: "WhatsApp", href: "https://wa.me/573113906052", icon: "https://img.icons8.com/color/96/whatsapp--v1.png" },
  ];
  const socialCells = socialLinks.map(({ name, href, icon }) => `<td style="padding:0 6px"><a href="${href}" title="${name}" style="display:inline-block;text-decoration:none"><img src="${icon}" width="30" height="30" alt="${name}" style="display:block;width:30px;height:30px;border:0"></a></td>`).join("");
  return `<div style="margin:0;padding:28px 14px;background-color:#eaf2fb;background-image:linear-gradient(145deg,#dce9f8 0%,#f7fbff 48%,#d5e5f7 100%);font-family:Arial,sans-serif;color:#24344d">
    <div style="max-width:620px;margin:auto;overflow:hidden;border:1px solid rgba(255,255,255,.85);border-radius:24px;background-color:#ffffff;background:rgba(255,255,255,.9);box-shadow:0 20px 50px rgba(23,63,115,.18)">
      <div style="padding:22px 26px;background-color:#173f73;background-image:linear-gradient(135deg,#173f73,#3f73ad);color:#fff">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="padding-right:14px"><div style="padding:7px;border:1px solid rgba(255,255,255,.45);border-radius:16px;background:rgba(255,255,255,.14)"><img src="${logo}" width="52" height="58" alt="Jardines del Renacer" style="display:block;width:52px;height:58px;object-fit:contain;border:0"></div></td><td><strong style="font-size:19px">Jardines del Renacer</strong><div style="margin-top:5px;font-size:12px;color:#dbeafe">${section}</div></td></tr></table>
      </div>
      <div style="padding:28px 24px;background-color:#ffffff;background:rgba(255,255,255,.78)">${content}</div>
      <div style="padding:22px 20px;border-top:1px solid rgba(203,220,241,.9);background-color:#f5f9fe;background:rgba(245,249,254,.88);text-align:center">
        <p style="margin:0 0 10px;font-size:12px;color:#64748b">© ${new Date().getFullYear()} Jardines del Renacer. Todos los derechos reservados.</p>
        <p style="margin:0;font-size:12px;line-height:1.8"><a href="${baseUrl}" style="color:#2454a0;text-decoration:none">jardinesdelrenacer.com</a><span style="color:#cbd5e1"> · </span><a href="${baseUrl}/legal/terminos" style="color:#2454a0;text-decoration:none">Términos y condiciones</a><span style="color:#cbd5e1"> · </span><a href="${baseUrl}/legal/privacidad" style="color:#2454a0;text-decoration:none">Política de privacidad</a><span style="color:#cbd5e1"> · </span><a href="${baseUrl}/legal/cookies" style="color:#2454a0;text-decoration:none">Política de cookies</a></p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px auto 0"><tr>${socialCells}</tr></table>
        <p style="margin:12px 0 0;font-size:11px;color:#94a3b8">Síguenos en nuestras redes sociales.</p>
        <p style="margin:10px 0 0;font-size:11px;color:#94a3b8">Este es un mensaje automático; por favor no respondas a este correo.</p>
      </div>
    </div>
  </div>`;
}
