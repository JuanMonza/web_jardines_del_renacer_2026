export const FOLLOWUP_FIELDS = {
  referido: "¿Es referido?",
  referidoPor: "Nombre de quien refiere",
  pretelefonica: "Pretelefónica",
  entrevistadores: "Entrevistadores",
  entrevista: "Entrevista presencial o virtual",
  pruebas: "Pruebas realizadas",
  resultados: "Resultados de pruebas",
  perfil: "Evaluación del perfil",
  referencias: "Referencias",
  observaciones: "Observaciones",
  decision: "Motivo de decisión",
  traslado: "Observaciones de traslado",
} as const;
export type FollowupKey = keyof typeof FOLLOWUP_FIELDS;
export const DEFAULT_SELECTION_STEPS: FollowupKey[] = ["pretelefonica", "entrevista", "pruebas", "referencias"];
export function selectionSteps(value: unknown): FollowupKey[] {
  return Array.isArray(value) ? [...new Set(value.filter((key): key is FollowupKey => typeof key === "string" && key in FOLLOWUP_FIELDS))] : [...DEFAULT_SELECTION_STEPS];
}
