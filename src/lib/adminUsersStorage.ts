export type AdminUserRole = 'admin' | 'admin_aliados' | 'admin_vacantes';

export interface ManagedAdminUser {
  id: string;
  cedula: string;
  nombre: string;
  rol: AdminUserRole;
  password: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

const ADMIN_USERS_STORAGE_KEY = 'jdr.admin.users.v1';

export const ADMIN_USERS_UPDATED_EVENT = 'jdr:admin-users-updated';

export const ADMIN_ROLE_LABELS: Record<AdminUserRole, string> = {
  admin: 'Admin general',
  admin_aliados: 'Admin aliados',
  admin_vacantes: 'Admin vacantes',
};

const DEFAULT_ADMIN_USERS: ManagedAdminUser[] = [
  {
    id: 'admin-default',
    cedula: '1234567890',
    nombre: 'Administrador General',
    rol: 'admin',
    password: 'admin123',
    activo: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'admin-aliados-default',
    cedula: '2222222222',
    nombre: 'Administrador Aliados Comerciales',
    rol: 'admin_aliados',
    password: 'aliados123',
    activo: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'admin-vacantes-default',
    cedula: '3333333333',
    nombre: 'Administrador de Vacantes',
    rol: 'admin_vacantes',
    password: 'vacantes123',
    activo: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

function getDefaultUsers() {
  return DEFAULT_ADMIN_USERS.map((user) => ({ ...user }));
}

function normalizeUser(record: Partial<ManagedAdminUser>): ManagedAdminUser | null {
  if (!record.id || !record.cedula || !record.nombre || !record.rol || !record.password) {
    return null;
  }

  if (!['admin', 'admin_aliados', 'admin_vacantes'].includes(record.rol)) {
    return null;
  }

  const now = new Date().toISOString();
  return {
    id: record.id,
    cedula: record.cedula.replace(/\D/g, ''),
    nombre: record.nombre,
    rol: record.rol,
    password: record.password,
    activo: Boolean(record.activo),
    createdAt: record.createdAt ?? now,
    updatedAt: record.updatedAt ?? now,
  };
}

export function loadAdminUsers(): ManagedAdminUser[] {
  if (typeof window === 'undefined') return getDefaultUsers();

  try {
    const raw = window.localStorage.getItem(ADMIN_USERS_STORAGE_KEY);
    if (!raw) return getDefaultUsers();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return getDefaultUsers();

    const normalized = parsed
      .map((record) => normalizeUser(record as Partial<ManagedAdminUser>))
      .filter(Boolean) as ManagedAdminUser[];

    return normalized.length > 0 ? normalized : getDefaultUsers();
  } catch {
    return getDefaultUsers();
  }
}

export function saveAdminUsers(users: ManagedAdminUser[]) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(users));
  window.dispatchEvent(new CustomEvent(ADMIN_USERS_UPDATED_EVENT));
}

export function findAdminUserByCredentials(
  cedula: string,
  password: string,
  roles?: AdminUserRole[],
) {
  const cleanCedula = cedula.replace(/\D/g, '');
  return loadAdminUsers().find((user) => {
    const roleAllowed = roles ? roles.includes(user.rol) : true;
    return user.activo && roleAllowed && user.cedula === cleanCedula && user.password === password;
  }) ?? null;
}
