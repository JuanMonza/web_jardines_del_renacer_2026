"use client";

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { Edit3, Eye, EyeOff, Plus, ShieldCheck, Trash2, UserCog } from 'lucide-react';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Input from '@/components/ui/Input';
import SectionTitle from '@/components/ui/SectionTitle';
import {
  ADMIN_ROLE_LABELS,
  loadAdminUsers,
  saveAdminUsers,
  type AdminUserRole,
  type ManagedAdminUser,
} from '@/lib/adminUsersStorage';

type UserFormData = {
  cedula: string;
  nombre: string;
  rol: AdminUserRole;
  password: string;
  activo: boolean;
};

const EMPTY_FORM: UserFormData = {
  cedula: '',
  nombre: '',
  rol: 'admin',
  password: '',
  activo: true,
};

const ROLE_OPTIONS: AdminUserRole[] = ['admin', 'admin_aliados', 'admin_vacantes'];

function cleanCedula(value: string) {
  return value.replace(/\D/g, '');
}

export default function DashboardUsuariosPage() {
  const [users, setUsers] = useState<ManagedAdminUser[]>(() => loadAdminUsers());
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedAdminUser | null>(null);
  const [formData, setFormData] = useState<UserFormData>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const activeUsers = useMemo(() => users.filter((user) => user.activo).length, [users]);

  const roleSummary = useMemo(
    () => ROLE_OPTIONS.map((role) => ({
      role,
      count: users.filter((user) => user.rol === role).length,
    })),
    [users],
  );

  const showToast = (ok: boolean, msg: string) => {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const persistUsers = (nextUsers: ManagedAdminUser[]) => {
    setUsers(nextUsers);
    saveAdminUsers(nextUsers);
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingUser(null);
    setShowPassword(false);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (user: ManagedAdminUser) => {
    setEditingUser(user);
    setFormData({
      cedula: user.cedula,
      nombre: user.nombre,
      rol: user.rol,
      password: user.password,
      activo: user.activo,
    });
    setShowPassword(false);
    setShowForm(true);
  };

  const handleSave = (event: FormEvent) => {
    event.preventDefault();

    const cedula = cleanCedula(formData.cedula);
    const nombre = formData.nombre.trim();
    const password = formData.password.trim();

    if (cedula.length < 6 || cedula.length > 10) {
      showToast(false, 'La cedula debe tener entre 6 y 10 digitos.');
      return;
    }

    if (!nombre) {
      showToast(false, 'Ingresa el nombre del usuario.');
      return;
    }

    if (!editingUser && password.length < 4) {
      showToast(false, 'La contrasena debe tener al menos 4 caracteres.');
      return;
    }

    if (password && password.length < 4) {
      showToast(false, 'La nueva contrasena debe tener al menos 4 caracteres.');
      return;
    }

    const duplicatedCedula = users.some((user) => user.cedula === cedula && user.id !== editingUser?.id);
    if (duplicatedCedula) {
      showToast(false, 'Ya existe un usuario con esa cedula.');
      return;
    }

    const now = new Date().toISOString();
    const payload: ManagedAdminUser = {
      id: editingUser?.id ?? `admin-${Date.now()}`,
      cedula,
      nombre,
      rol: formData.rol,
      password: password || editingUser?.password || '',
      activo: formData.activo,
      createdAt: editingUser?.createdAt ?? now,
      updatedAt: now,
    };

    if (editingUser) {
      persistUsers(users.map((user) => (user.id === editingUser.id ? payload : user)));
      showToast(true, 'Usuario actualizado.');
    } else {
      persistUsers([payload, ...users]);
      showToast(true, 'Usuario creado.');
    }

    resetForm();
    setShowForm(false);
  };

  const toggleActive = (id: string) => {
    const user = users.find((item) => item.id === id);
    if (!user) return;

    const wouldDisableLastGeneralAdmin =
      user.activo &&
      user.rol === 'admin' &&
      users.filter((item) => item.rol === 'admin' && item.activo).length === 1;

    if (wouldDisableLastGeneralAdmin) {
      showToast(false, 'Debe quedar al menos un admin general activo.');
      return;
    }

    persistUsers(users.map((item) => (item.id === id ? { ...item, activo: !item.activo, updatedAt: new Date().toISOString() } : item)));
    showToast(true, 'Estado actualizado.');
  };

  const handleDeleteConfirmed = () => {
    if (!confirmDeleteId) return;

    const user = users.find((item) => item.id === confirmDeleteId);
    const wouldDeleteLastGeneralAdmin =
      user?.rol === 'admin' &&
      user.activo &&
      users.filter((item) => item.rol === 'admin' && item.activo).length === 1;

    if (wouldDeleteLastGeneralAdmin) {
      showToast(false, 'No puedes eliminar el ultimo admin general activo.');
      setConfirmDeleteId(null);
      return;
    }

    persistUsers(users.filter((item) => item.id !== confirmDeleteId));
    setConfirmDeleteId(null);
    showToast(true, 'Usuario eliminado.');
  };

  return (
    <>
      <Container className="py-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <SectionTitle
            title="Usuarios Administrativos"
            subtitle="Control maestro para crear, editar, activar y eliminar usuarios de los paneles."
            align="left"
            className="mb-0"
          />
          <Button variant="primary" onClick={openCreateForm} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm text-textLight md:grid-cols-3">
          <p>
            <span className="font-semibold text-text">Admin general:</span> entra por /login/admin y gestiona el master.
          </p>
          <p>
            <span className="font-semibold text-text">Admin aliados:</span> entra por /login/admin-aliados.
          </p>
          <p>
            <span className="font-semibold text-text">Admin vacantes:</span> entra por{' '}
            <Link href="/login/admin-vacantes" className="font-semibold text-primary hover:underline">
              /login/admin-vacantes
            </Link>{' '}
            y ve sus vacantes en /dashboard-vacantes.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-primary/20 bg-white/75 p-5 shadow-sm">
            <UserCog className="mb-3 h-6 w-6 text-primary" />
            <p className="text-sm text-textLight">Usuarios totales</p>
            <p className="text-3xl font-bold text-text">{users.length}</p>
          </div>
          <div className="rounded-2xl border border-green-500/20 bg-white/75 p-5 shadow-sm">
            <ShieldCheck className="mb-3 h-6 w-6 text-green-600" />
            <p className="text-sm text-textLight">Activos</p>
            <p className="text-3xl font-bold text-text">{activeUsers}</p>
          </div>
          {roleSummary.slice(1).map((item) => (
            <div key={item.role} className="rounded-2xl border border-border bg-white/75 p-5 shadow-sm">
              <p className="text-sm text-textLight">{ADMIN_ROLE_LABELS[item.role]}</p>
              <p className="mt-3 text-3xl font-bold text-text">{item.count}</p>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="mt-8 rounded-2xl border border-border bg-white/80 p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-text">{editingUser ? 'Editar usuario' : 'Crear usuario'}</h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Cedula"
                  value={formData.cedula}
                  onChange={(event) => setFormData((prev) => ({ ...prev, cedula: event.target.value }))}
                  required
                />
                <Input
                  label="Nombre"
                  value={formData.nombre}
                  onChange={(event) => setFormData((prev) => ({ ...prev, nombre: event.target.value }))}
                  required
                />
                <div>
                  <label className="mb-2 block text-sm font-medium text-text">Rol</label>
                  <select
                    value={formData.rol}
                    onChange={(event) => setFormData((prev) => ({ ...prev, rol: event.target.value as AdminUserRole }))}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>{ADMIN_ROLE_LABELS[role]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-text">
                    Contrasena
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                      required={!editingUser}
                      className="w-full rounded-xl border border-border bg-white/80 px-4 py-3 pr-12 text-text placeholder:text-textLight transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-textLight transition-colors hover:bg-primary/10 hover:text-primary"
                      aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                      title={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {editingUser && (
                    <p className="mt-1 text-xs text-textLight">
                      Puedes verla, copiarla o reemplazarla antes de guardar.
                    </p>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2 rounded-xl border border-border bg-slate-50 px-3 py-2 text-sm text-text">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(event) => setFormData((prev) => ({ ...prev, activo: event.target.checked }))}
                />
                Usuario activo
              </label>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Guardar
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-white/80 shadow-sm">
          <table className="min-w-[920px] w-full divide-y divide-border">
            <thead className="bg-black/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textLight">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textLight">Cedula</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textLight">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textLight">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-textLight">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 text-sm font-semibold text-text">{user.nombre}</td>
                  <td className="px-6 py-4 text-sm text-textLight">{user.cedula}</td>
                  <td className="px-6 py-4 text-sm text-textLight">{ADMIN_ROLE_LABELS[user.rol]}</td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => toggleActive(user.id)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${user.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}
                    >
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditForm(user)} className="gap-2">
                        <Edit3 className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(user.id)} className="gap-2 text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mb-1 text-lg font-bold text-text">Eliminar usuario</h3>
            <p className="mb-6 text-sm text-textLight">Esta accion no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmDeleteId(null)} className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text hover:bg-slate-50">
                Cancelar
              </button>
              <button type="button" onClick={handleDeleteConfirmed} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                Si, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed right-6 top-6 z-[70] rounded-2xl px-5 py-3.5 text-sm font-semibold text-white shadow-xl ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
