const TRAINING_VALUES = new Set(["training", "capacitacion", "sandbox"]);

export function isTrainingEnvironment() {
  const value = String(
    process.env.APP_ENV || process.env.NEXT_PUBLIC_APP_ENV || "",
  ).trim().toLowerCase();
  return TRAINING_VALUES.has(value);
}

export function trainingCookiePath() {
  return isTrainingEnvironment() ? (process.env.TRAINING_BASE_PATH || '/') : '/';
}

export function prepareOutboundEmail(originalRecipient: string, subject: string) {
  if (!isTrainingEnvironment()) {
    return { to: originalRecipient, subject, redirected: false };
  }
  const trainingRecipient = String(process.env.TRAINING_EMAIL_RECIPIENT || "").trim();
  if (!/^\S+@\S+\.\S+$/.test(trainingRecipient)) {
    throw new Error("El ambiente de capacitación requiere TRAINING_EMAIL_RECIPIENT.");
  }
  return {
    to: trainingRecipient,
    subject: `[CAPACITACIÓN] ${subject}`,
    redirected: true,
  };
}

export function trainingEmailNotice(originalRecipient: string) {
  if (!isTrainingEnvironment()) return "";
  const safeRecipient = originalRecipient.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character] || character);
  return `<div style="margin:0 0 18px;padding:12px 14px;border:1px solid #f0c36a;border-radius:10px;background:#fff7df;color:#774b00;font-size:13px"><strong>Simulación de capacitación.</strong><br>Destinatario simulado: ${safeRecipient}. Este mensaje no fue enviado a la persona real.</div>`;
}
