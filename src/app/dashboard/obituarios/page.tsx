'use client';

import { useState } from 'react';
import SectionTitle from '@/components/ui/SectionTitle';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { Obituary } from '@/types/obituary';

export default function DashboardObituariosPage() {
  const [obituarios, setObituarios] = useState<Obituary[]>([
    {
      id: '1',
      nombre: 'María González Pérez',
      fechaNacimiento: '1950-03-15',
      fechaFallecimiento: '2026-02-04',
      foto: '/images/obituarios/placeholder.jpg',
      descripcion: 'Amada madre, abuela y amiga',
      sala: 'Sala A - Principal',
      ubicacionSala: 'Sede Principal, Primer Piso',
      inicioVelacion: '2026-02-04T14:00',
      cierreVelacion: '2026-02-05T10:00',
      cedula: '1234567890',
      sede: 'principal',
      createdAt: new Date('2026-02-04T09:30:00'),
    },
    {
      id: '2',
      nombre: 'José Ramírez López',
      fechaNacimiento: '1945-07-22',
      fechaFallecimiento: '2026-02-03',
      foto: '/images/obituarios/placeholder.jpg',
      descripcion: 'Querido esposo y padre',
      sala: 'Sala B - VIP',
      ubicacionSala: 'Sede Norte, Segundo Piso',
      inicioVelacion: '2026-02-03T16:00',
      cierreVelacion: '2026-02-04T11:00',
      cedula: '9876543210',
      sede: 'norte',
      createdAt: new Date('2026-02-03T10:15:00'),
    },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    fechaNacimiento: '',
    fechaFallecimiento: '',
    cedula: '',
    descripcion: '',
    sala: '',
    ubicacionSala: '',
    inicioVelacion: '',
    cierreVelacion: '',
    sede: 'principal',
    direccionServicio: '',
    direccionCementerio: '',
    nombreCementerio: '',
    horaDestinoFinal: '',
    ubicacionMapa: '',
    servicios: [] as string[],
    tieneCeremonia: false,
    nombreIglesia: '',
    direccionIglesia: '',
    horaCeremonia: '',
    lugarCeremonia: '',
  });
  const [searchCedula, setSearchCedula] = useState('');

  const sedes = ['principal', 'norte', 'sur', 'oriente', 'occidente'];
  const salas = ['Sala A - Principal', 'Sala B - VIP', 'Sala C - Familiar', 'Sala D - Capilla', 'Sala Magna 1', 'Sala Magna 2', 'Sala Magna 3', 'Sala Magna 4'];
  const serviciosDisponibles = ['Cafetería', 'Florería', 'Crematorio', 'Estacionamiento', 'Wifi', 'Accesibilidad', 'Nichos', 'Capilla Ecuménica'];

  const toggleServicio = (servicio: string) => {
    setFormData(prev => ({
      ...prev,
      servicios: prev.servicios.includes(servicio)
        ? prev.servicios.filter(s => s !== servicio)
        : [...prev.servicios, servicio]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      setObituarios(obituarios.map(obit => 
        obit.id === editingId 
          ? { ...formData, id: editingId, foto: '/images/obituarios/placeholder.jpg' }
          : obit
      ));
      setEditingId(null);
    } else {
      const newObituario: Obituary = {
        ...formData,
        id: Date.now().toString(),
        foto: '/images/obituarios/placeholder.jpg',
        createdAt: new Date(),
      };
      setObituarios([newObituario, ...obituarios]);
    }
    
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (obituario: Obituary) => {
    setFormData({
      nombre: obituario.nombre,
      fechaNacimiento: obituario.fechaNacimiento,
      fechaFallecimiento: obituario.fechaFallecimiento,
      cedula: obituario.cedula,
      descripcion: obituario.descripcion || '',
      sala: obituario.sala,
      ubicacionSala: obituario.ubicacionSala,
      inicioVelacion: obituario.inicioVelacion,
      cierreVelacion: obituario.cierreVelacion,
      sede: obituario.sede,
      direccionServicio: obituario.direccionServicio || '',
      direccionCementerio: obituario.direccionCementerio || '',
      nombreCementerio: obituario.nombreCementerio || '',
      horaDestinoFinal: obituario.horaDestinoFinal || '',
      ubicacionMapa: obituario.ubicacionMapa || '',
      servicios: obituario.servicios || [],
      tieneCeremonia: obituario.tieneCeremonia || false,
      nombreIglesia: obituario.nombreIglesia || '',
      direccionIglesia: obituario.direccionIglesia || '',
      horaCeremonia: obituario.horaCeremonia || '',
      lugarCeremonia: obituario.lugarCeremonia || '',
    });
    setEditingId(obituario.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este obituario?')) {
      setObituarios(obituarios.filter(obit => obit.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      fechaNacimiento: '',
      fechaFallecimiento: '',
      cedula: '',
      descripcion: '',
      sala: '',
      ubicacionSala: '',
      inicioVelacion: '',
      cierreVelacion: '',
      sede: 'principal',
      direccionServicio: '',
      direccionCementerio: '',
      nombreCementerio: '',
      horaDestinoFinal: '',
      ubicacionMapa: '',
      servicios: [],
      tieneCeremonia: false,
      nombreIglesia: '',
      direccionIglesia: '',
      horaCeremonia: '',
      lugarCeremonia: '',
    });
  };

  const filteredObituarios = searchCedula
    ? obituarios.filter(obit => obit.cedula.includes(searchCedula))
    : obituarios;

  // Estadísticas calculadas
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const obituariosThisMonth = obituarios.filter(obit => {
    const fecha = new Date(obit.fechaFallecimiento);
    return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
  }).length;

  const obituariosThisYear = obituarios.filter(obit => {
    const fecha = new Date(obit.fechaFallecimiento);
    return fecha.getFullYear() === currentYear;
  }).length;

  // Simulación de visitas (en producción vendría de analytics)
  const visitasPagina = 4567;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle
          title="Gestión de Obituarios"
          subtitle="Administra los obituarios diarios de todas las sedes"
          align="left"
          className="mb-0"
        />
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancelar' : '+ Nuevo Obituario'}
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-5 border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textLight mb-1">Total Obituarios</p>
              <p className="text-3xl font-bold text-text">{obituarios.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl"></span>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-5 border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textLight mb-1">Este Mes</p>
              <p className="text-3xl font-bold text-text">{obituariosThisMonth}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <span className="text-2xl"></span>
            </div>
          </div>
          <p className="text-xs text-textLight mt-2">
            {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="glass rounded-xl p-5 border border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textLight mb-1">Este Año</p>
              <p className="text-3xl font-bold text-text">{obituariosThisYear}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <span className="text-2xl"></span>
            </div>
          </div>
          <p className="text-xs text-textLight mt-2">{currentYear}</p>
        </div>

        <div className="glass rounded-xl p-5 border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textLight mb-1">Visitas al Sitio</p>
              <p className="text-3xl font-bold text-text">{visitasPagina.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
              <span className="text-2xl"></span>
            </div>
          </div>
          <p className="text-xs text-textLight mt-2">Total acumulado</p>
        </div>
      </div>

      {/* Search by Cédula */}
      <div className="glass p-4 rounded-xl border border-border">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar por número de cédula..."
              value={searchCedula}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchCedula(e.target.value)}
              className="w-full"
            />
          </div>
          <Button variant="outline" onClick={() => setSearchCedula('')}>
            Limpiar
          </Button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass p-6 rounded-xl border border-border">
          <h2 className="text-xl font-semibold text-text mb-4">
            {editingId ? 'Editar Obituario' : 'Nuevo Obituario'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Nombre Completo *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: María González Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Cédula *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.cedula}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, cedula: e.target.value })}
                  placeholder="Sin puntos ni espacios"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Fecha de Nacimiento *
                </label>
                <Input
                  type="date"
                  required
                  value={formData.fechaNacimiento}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Fecha de Fallecimiento *
                </label>
                <Input
                  type="date"
                  required
                  value={formData.fechaFallecimiento}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, fechaFallecimiento: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Sede *
                </label>
                <select
                  required
                  value={formData.sede}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, sede: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg glass border border-border text-text"
                >
                  {sedes.map(sede => (
                    <option key={sede} value={sede}>
                      {sede.charAt(0).toUpperCase() + sede.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Sala *
                </label>
                <select
                  required
                  value={formData.sala}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, sala: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg glass border border-border text-text"
                >
                  <option value="">Seleccionar sala</option>
                  {salas.map(sala => (
                    <option key={sala} value={sala}>{sala}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Ubicación Sala *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.ubicacionSala}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, ubicacionSala: e.target.value })}
                  placeholder="Ej: Primer Piso, Ala Norte"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Inicio Velación *
                </label>
                <Input
                  type="datetime-local"
                  required
                  value={formData.inicioVelacion}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, inicioVelacion: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Cierre Velación *
                </label>
                <Input
                  type="datetime-local"
                  required
                  value={formData.cierreVelacion}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, cierreVelacion: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Descripción / Mensaje
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Mensaje conmemorativo (opcional)"
                rows={3}
                className="w-full px-4 py-2 rounded-lg glass border border-border text-text resize-none"
              />
            </div>

            {/* Información de dirección y tiempo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Dirección del Servicio
                </label>
                <Input
                  type="text"
                  value={formData.direccionServicio}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, direccionServicio: e.target.value })}
                  placeholder="Dirección completa del servicio ceremonial"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Nombre del Cementerio
                </label>
                <Input
                  type="text"
                  value={formData.nombreCementerio}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nombreCementerio: e.target.value })}
                  placeholder="Nombre del cementerio destino"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Dirección del Cementerio
                </label>
                <Input
                  type="text"
                  value={formData.direccionCementerio}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, direccionCementerio: e.target.value })}
                  placeholder="Dirección del cementerio (opcional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  ⏰ Hora Destino Final
                </label>
                <Input
                  type="time"
                  value={formData.horaDestinoFinal}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, horaDestinoFinal: e.target.value })}
                  placeholder="Hora de llegada al cementerio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Ubicación para Mapa
                </label>
                <Input
                  type="text"
                  value={formData.ubicacionMapa}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, ubicacionMapa: e.target.value })}
                  placeholder="Ciudad o dirección para Google Maps"
                />
              </div>
            </div>

            {/* Sección de Ceremonia Religiosa */}
            <div className="pt-4 border-t border-border">
              <div className="mb-4">
                <label className="flex items-center gap-3 p-4 rounded-xl glass border border-border cursor-pointer hover:border-primary/50 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.tieneCeremonia}
                    onChange={(e) => setFormData({ ...formData, tieneCeremonia: e.target.checked })}
                    className="w-5 h-5 text-primary rounded"
                  />
                  <span className="text-sm font-medium text-text">
                    ¿Tiene ceremonia religiosa o misa?
                  </span>
                </label>
              </div>

              {formData.tieneCeremonia && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl glass border border-primary/20">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Nombre de la Iglesia
                    </label>
                    <Input
                      type="text"
                      value={formData.nombreIglesia}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nombreIglesia: e.target.value })}
                      placeholder="Ej: Parroquia San José"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Dirección de la Iglesia
                    </label>
                    <Input
                      type="text"
                      value={formData.direccionIglesia}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, direccionIglesia: e.target.value })}
                      placeholder="Dirección completa de la iglesia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Hora de la Ceremonia
                    </label>
                    <Input
                      type="time"
                      value={formData.horaCeremonia}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, horaCeremonia: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Lugar de la Misa
                    </label>
                    <Input
                      type="text"
                      value={formData.lugarCeremonia}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, lugarCeremonia: e.target.value })}
                      placeholder="Ej: Capilla Principal, Salón de Eventos"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Servicios disponibles */}
            <div className="pt-4 border-t border-border">
              <label className="block text-sm font-medium text-text mb-3">
                Servicios de la Agencia
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {serviciosDisponibles.map((servicio) => (
                  <label
                    key={servicio}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.servicios.includes(servicio)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.servicios.includes(servicio)}
                      onChange={() => toggleServicio(servicio)}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm text-text">{servicio}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary">
                {editingId ? 'Actualizar' : 'Crear'} Obituario
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                  setEditingId(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden border border-border">
        <div className="p-4 border-b border-border bg-primary/5">
          <h2 className="font-semibold text-text">
            Obituarios Registrados ({filteredObituarios.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text">Cédula</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text">Sede</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text">Sala</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text">Velación</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text">Creado</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-text">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredObituarios.map((obituario) => (
                <tr key={obituario.id} className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-text">{obituario.nombre}</td>
                  <td className="px-4 py-3 text-sm text-textLight">{obituario.cedula}</td>
                  <td className="px-4 py-3 text-sm text-textLight capitalize">{obituario.sede}</td>
                  <td className="px-4 py-3 text-sm text-textLight">{obituario.sala}</td>
                  <td className="px-4 py-3 text-sm text-textLight">
                    {new Date(obituario.inicioVelacion).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm text-textLight">
                    {obituario.createdAt ? (
                      <div>
                        <div>{new Date(obituario.createdAt).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}</div>
                        <div className="text-xs text-textLight/70">{new Date(obituario.createdAt).toLocaleTimeString('es-CO', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</div>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(obituario)}
                        className="px-3 py-1 text-xs rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(obituario.id)}
                        className="px-3 py-1 text-xs rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredObituarios.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-textLight">
                    No se encontraron obituarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
