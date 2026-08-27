'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { CheckCircle2, Edit3, Eye, EyeOff, KeyRound, Loader2, Mail, Plus, Search, ShieldCheck, Trash2, UserCog, UsersRound, X } from 'lucide-react';

type AdminUser = { id: number; cedula: string; nombres: string; apellidos: string; email: string; activo: number; ultimo_login: string | null; bloqueado_hasta: string | null; roles: string | null };
type Role = { id: number; nombre: string; descripcion: string | null; color: string | null };
type AdminForm = { cedula: string; nombres: string; apellidos: string; email: string; password: string; roleId: string; activo: boolean };
const emptyForm: AdminForm = { cedula: '', nombres: '', apellidos: '', email: '', password: '', roleId: '', activo: true };

function formatDate(value: string | null) {
  if (!value) return 'Sin ingreso registrado';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Sin ingreso registrado' : date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DashboardUsuariosPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AdminForm>(emptyForm);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/iam/admin/users', { cache: 'no-store' });
      const payload = await response.json() as { data?: AdminUser[]; roles?: Role[]; message?: string };
      if (!response.ok) throw new Error(payload.message || 'No fue posible cargar los administradores.');
      setUsers(payload.data || []);
      setRoles(payload.roles || []);
    } catch (error) {
      setFeedback({ ok: false, message: error instanceof Error ? error.message : 'No fue posible cargar los administradores.' });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadUsers(); }, [loadUsers]);
  const notify = (ok: boolean, message: string) => { setFeedback({ ok, message }); window.setTimeout(() => setFeedback(null), 4200); };
  const filteredUsers = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return users;
    return users.filter((user) => [user.nombres, user.apellidos, user.cedula, user.email, user.roles || ''].join(' ').toLocaleLowerCase().includes(term));
  }, [search, users]);
  const activeUsers = useMemo(() => users.filter((user) => Boolean(user.activo)).length, [users]);
  const recentUsers = useMemo(() => users.filter((user) => user.ultimo_login).length, [users]);

  const openCreate = () => { setEditingUser(null); setForm({ ...emptyForm, roleId: roles[0] ? String(roles[0].id) : '' }); setShowPassword(false); setShowForm(true); };
  const openEdit = (user: AdminUser) => {
    const primaryRole = roles.find((role) => user.roles?.split('|').map((name) => name.trim()).includes(role.nombre));
    setEditingUser(user);
    setForm({ cedula: user.cedula, nombres: user.nombres, apellidos: user.apellidos, email: user.email, password: '', roleId: primaryRole ? String(primaryRole.id) : '', activo: Boolean(user.activo) });
    setShowPassword(false); setShowForm(true);
  };
  const saveUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true);
    try {
      const response = await fetch(editingUser ? `/api/iam/admin/users/${editingUser.id}` : '/api/iam/admin/users', { method: editingUser ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...form, roleId: Number(form.roleId) }) });
      const payload = await response.json() as { message?: string };
      if (!response.ok) throw new Error(payload.message || 'No fue posible guardar el administrador.');
      setShowForm(false); notify(true, payload.message || 'Administrador guardado correctamente.'); await loadUsers();
    } catch (error) { notify(false, error instanceof Error ? error.message : 'No fue posible guardar el administrador.'); } finally { setSaving(false); }
  };
  const deleteUser = async () => {
    if (!confirmDelete) return; setSaving(true);
    try {
      const response = await fetch(`/api/iam/admin/users/${confirmDelete.id}`, { method: 'DELETE' });
      const payload = await response.json() as { message?: string };
      if (!response.ok) throw new Error(payload.message || 'No fue posible desactivar el administrador.');
      setConfirmDelete(null); notify(true, payload.message || 'Administrador desactivado correctamente.'); await loadUsers();
    } catch (error) { notify(false, error instanceof Error ? error.message : 'No fue posible desactivar el administrador.'); } finally { setSaving(false); }
  };

  return <div className="p-5 md:p-8">
    <header className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/55 px-6 py-7 shadow-[0_22px_56px_-38px_rgba(13,54,109,0.8)] backdrop-blur-xl md:px-8">
      <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#b8d4f4]/55 blur-3xl" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Identidad y acceso</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-text md:text-4xl">Usuarios administrativos</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-textLight md:text-base">Gestiona las cuentas reales de los administradores, sus roles y el acceso seguro a cada operación.</p></div><button onClick={openCreate} disabled={loading || !roles.length} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_-14px_rgba(29,78,157,0.9)] transition hover:-translate-y-0.5 hover:bg-[#254e92] disabled:cursor-not-allowed disabled:opacity-50"><Plus className="h-4 w-4" /> Nuevo administrador</button></div>
    </header>
    <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={UsersRound} label="Administradores" value={String(users.length)} tone="blue" /><Metric icon={CheckCircle2} label="Cuentas activas" value={String(activeUsers)} tone="green" /><Metric icon={ShieldCheck} label="Roles configurados" value={String(roles.length)} tone="violet" /><Metric icon={KeyRound} label="Con actividad" value={String(recentUsers)} tone="amber" /></section>
    <section className="mt-5 rounded-[26px] border border-white/80 bg-white/50 p-4 shadow-[0_20px_54px_-38px_rgba(13,54,109,0.72)] backdrop-blur-xl md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Directorio IAM</p><h2 className="mt-1 text-xl font-bold text-text">Equipo con acceso a la plataforma</h2></div><label className="flex min-w-0 items-center gap-2 rounded-xl border border-[#d7e4f6] bg-white/75 px-3 py-2.5 text-[#557190] md:w-[22rem]"><Search className="h-4 w-4 shrink-0" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, rol o cédula" className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-[#91a5be]" /></label></div>
      {loading ? <div className="flex min-h-64 items-center justify-center gap-3 text-sm font-medium text-textLight"><Loader2 className="h-5 w-5 animate-spin text-primary" /> Cargando administradores...</div> : filteredUsers.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center text-center"><UserCog className="h-9 w-9 text-primary/60" /><p className="mt-3 font-bold text-text">No encontramos administradores</p><p className="mt-1 text-sm text-textLight">Cambia la búsqueda o crea una nueva cuenta.</p></div> : <div className="mt-5 grid gap-3 xl:grid-cols-2">{filteredUsers.map((user) => <UserCard key={user.id} user={user} onEdit={() => openEdit(user)} onDelete={() => setConfirmDelete(user)} />)}</div>}
    </section>
    {showForm && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#102e55]/45 p-4 backdrop-blur-md"><form onSubmit={saveUser} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/80 bg-[#f8fbff]/95 p-6 shadow-[0_28px_80px_-28px_rgba(8,37,88,0.85)] md:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Administración segura</p><h2 className="mt-1 text-2xl font-bold text-text">{editingUser ? 'Editar administrador' : 'Crear administrador'}</h2><p className="mt-1 text-sm text-textLight">Las credenciales se guardan cifradas en IAM; nunca en el navegador.</p></div><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-[#d6e2f2] bg-white/80 p-2 text-textLight hover:text-primary"><X className="h-5 w-5" /></button></div><div className="mt-6 grid gap-4 md:grid-cols-2"><Field label="Nombres"><input required value={form.nombres} onChange={(event) => setForm((current) => ({ ...current, nombres: event.target.value }))} className="field" /></Field><Field label="Apellidos"><input required value={form.apellidos} onChange={(event) => setForm((current) => ({ ...current, apellidos: event.target.value }))} className="field" /></Field><Field label="Cédula"><input required disabled={Boolean(editingUser)} inputMode="numeric" value={form.cedula} onChange={(event) => setForm((current) => ({ ...current, cedula: event.target.value.replace(/\D/g, '') }))} className="field disabled:cursor-not-allowed disabled:bg-slate-100" /></Field><Field label="Correo corporativo"><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7891af]" /><input required type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="field pl-10" /></div></Field><Field label="Rol principal"><select required value={form.roleId} onChange={(event) => setForm((current) => ({ ...current, roleId: event.target.value }))} className="field">{roles.map((role) => <option key={role.id} value={role.id}>{role.nombre}</option>)}</select></Field><Field label={editingUser ? 'Nueva contraseña (opcional)' : 'Contraseña temporal'}><div className="relative"><input required={!editingUser} type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} className="field pr-11" /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#6683a6] hover:bg-primary/10 hover:text-primary">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div><p className="mt-1 text-xs text-textLight">Mínimo 12 caracteres.</p></Field></div>{editingUser && <label className="mt-5 flex items-center gap-3 rounded-xl border border-[#dce8f6] bg-white/75 px-4 py-3 text-sm font-semibold text-text"><input type="checkbox" checked={form.activo} onChange={(event) => setForm((current) => ({ ...current, activo: event.target.checked }))} className="h-4 w-4 accent-[#315fa8]" /> Mantener cuenta activa</label>}<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-[#cfddef] bg-white px-4 py-3 text-sm font-bold text-[#42658d]">Cancelar</button><button disabled={saving} type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{editingUser ? 'Guardar cambios' : 'Crear administrador'}</button></div></form></div>}
    {confirmDelete && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#102e55]/45 p-4 backdrop-blur-md"><div className="w-full max-w-md rounded-[28px] border border-white/80 bg-[#f8fbff]/95 p-6 shadow-2xl"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600"><Trash2 className="h-5 w-5" /></div><h2 className="mt-4 text-xl font-bold text-text">Desactivar administrador</h2><p className="mt-2 text-sm leading-6 text-textLight">{confirmDelete.nombres} dejará de acceder a la plataforma. El historial y la trazabilidad se conservarán.</p><div className="mt-6 flex justify-end gap-2"><button onClick={() => setConfirmDelete(null)} className="rounded-xl border border-[#cfddef] bg-white px-4 py-2.5 text-sm font-bold text-[#42658d]">Cancelar</button><button disabled={saving} onClick={() => void deleteUser()} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">Desactivar</button></div></div></div>}
    {feedback && <div className={`fixed bottom-6 left-1/2 z-[90] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold text-white shadow-2xl ${feedback.ok ? 'bg-[#12795c]' : 'bg-[#ba3551]'}`}>{feedback.ok ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <X className="h-5 w-5 shrink-0" />}{feedback.message}</div>}
    <style jsx>{`.field { width: 100%; border-radius: .75rem; border: 1px solid #d6e2f2; background: rgba(255,255,255,.82); padding: .75rem 1rem; color: #1d3553; outline: none; transition: box-shadow .2s, border-color .2s; } .field:focus { border-color: #3f6fb4; box-shadow: 0 0 0 3px rgba(63,111,180,.14); }`}</style>
  </div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block text-sm font-semibold text-[#294a70]"><span className="mb-2 block">{label}</span>{children}</label>; }
function Metric({ icon: Icon, label, value, tone }: { icon: typeof UsersRound; label: string; value: string; tone: 'blue' | 'green' | 'violet' | 'amber' }) { const tones = { blue: 'bg-[#e4efff] text-[#315fa8]', green: 'bg-[#e5f8ef] text-[#12815b]', violet: 'bg-[#eee9ff] text-[#7154b8]', amber: 'bg-[#fff2d9] text-[#bd7114]' }; return <div className="rounded-2xl border border-white/80 bg-white/60 p-4 shadow-[0_14px_30px_-26px_rgba(13,54,109,.9)] backdrop-blur-xl"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div><p className="mt-4 text-xs font-bold uppercase tracking-[.14em] text-textLight">{label}</p><p className="mt-1 text-3xl font-bold text-text">{value}</p></div>; }
function getPanelHref(roles: string | null) {
  if (roles?.includes('Administrador de Talleres')) return '/dashboard-talleres';
  if (roles?.includes('Administrador de Sorteos')) return '/dashboard-sorteos';
  const assigned = roles?.split('|').map((role) => role.trim()) || [];
  if (assigned.includes('Administrador de Aliados')) return '/dashboard-aliados';
  if (assigned.includes('Administrador de Sedes')) return '/dashboard-sedes';
  if (assigned.includes('Administrador de Vacantes')) return '/dashboard-vacantes';
  if (assigned.includes('Coordinador de Cotizaciones') || assigned.includes('Gestor de Cotizaciones')) return '/dashboard/cotizaciones';
  return '/dashboard';
}
function UserCard({ user, onEdit, onDelete }: { user: AdminUser; onEdit: () => void; onDelete: () => void }) { const active = Boolean(user.activo); return <article className="group rounded-2xl border border-[#dce7f4] bg-white/70 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#a9c6ea] hover:shadow-[0_18px_38px_-28px_rgba(13,54,109,.9)]"><div className="flex gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eaf2ff] font-bold text-[#315fa8]">{`${user.nombres.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase()}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-bold text-text">{user.nombres} {user.apellidos}</h3><p className="mt-0.5 truncate text-sm text-textLight">{user.email}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{active ? 'Activo' : 'Inactivo'}</span></div><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-lg bg-[#edf3fc] px-2.5 py-1 text-xs font-semibold text-[#42658d]">{user.roles || 'Sin rol'}</span><span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">CC {user.cedula}</span></div><div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#e4ebf5] pt-3"><p className="text-xs text-textLight">Último ingreso: {formatDate(user.ultimo_login)}</p><div className="flex items-center gap-1"><Link href={getPanelHref(user.roles)} className="rounded-lg bg-[#edf3fc] px-2.5 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-white">Ver panel</Link><button onClick={onEdit} className="rounded-lg p-2 text-[#42658d] hover:bg-[#eaf2ff] hover:text-primary" title="Editar administrador"><Edit3 className="h-4 w-4" /></button><button onClick={onDelete} className="rounded-lg p-2 text-[#a3475b] hover:bg-red-50 hover:text-red-600" title="Desactivar administrador"><Trash2 className="h-4 w-4" /></button></div></div></div></div></article>; }
