/**
 * Corrige texto UTF-8 histórico que fue almacenado o leído como Latin-1
 * (por ejemplo, "pÃ©rdida" pasa a "pérdida"). Los textos válidos se devuelven
 * sin cambios y el contenido binario/base64 nunca debe pasar por esta función.
 */
export function repairMojibake(value: string | null | undefined) {
  if (!value || !/[ÃÂ]/.test(value)) return value ?? "";
  try {
    const repaired = Buffer.from(value, "latin1").toString("utf8");
    return repaired.includes("�") ? value : repaired;
  } catch {
    return value;
  }
}
