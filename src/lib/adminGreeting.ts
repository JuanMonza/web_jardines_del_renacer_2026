export function getSpanishDaytimeGreeting(now = new Date()) {
  const hour = now.getHours();

  if (hour >= 5 && hour < 12) {
    return 'Buenos dias';
  }

  if (hour >= 12 && hour < 19) {
    return 'Buenas tardes';
  }

  return 'Buenas noches';
}

export function getFirstName(fullName?: string | null) {
  if (!fullName) {
    return 'Administrador';
  }

  const normalized = fullName.trim();
  if (!normalized) {
    return 'Administrador';
  }

  return normalized.split(/\s+/)[0];
}

export function buildAdminGreeting(fullName?: string | null, now = new Date()) {
  return `${getSpanishDaytimeGreeting(now)}, ${getFirstName(fullName)}`;
}
