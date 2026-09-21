/** Rutas locales para instalaciones bajo /ambiente-de-pruebas-jr. */
export function appUrl(pathname: string) {
  const basePath = process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || '';
  return pathname.startsWith('/') && !pathname.startsWith(`${basePath}/`)
    ? `${basePath}${pathname}`
    : pathname;
}
