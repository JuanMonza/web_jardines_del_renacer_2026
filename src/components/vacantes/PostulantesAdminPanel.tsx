'use client';

import { useEffect, useState } from 'react';

type Application = {
    id: string;
    candidateName: string;
    candidateEmail: string;
    vacancyTitle: string;
    status: string;
    appliedAt: string;
};

export default function PostulantesAdminPanel() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');

    useEffect(() => {
        async function loadApplications() {
            try {
                const response = await fetch('/api/vacantes/postulaciones');
                const json = await response.json();
                if (json.success) {
                    setApplications(Array.isArray(json.data) ? json.data : []);
                } else {
                    setApplications([]);
                }
            } catch (error) {
                console.error('Error cargando postulaciones:', error);
                setApplications([]);
            } finally {
                setLoading(false);
            }
        }
        loadApplications();
    }, []);
    const filteredApplications = (applications ?? []).filter((application) => {
        const matchesSearch =
            application.candidateName
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
            application.candidateEmail
                ?.toLowerCase()
                .includes(search.toLowerCase());
        const matchesStatus =
            statusFilter === 'todos' ||
            application.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    return (
        <div className="space-y-6">
            <div className="glass rounded-3xl p-8 border border-primary/15">
                <h1 className="text-4xl font-bold text-text">
                    Gestión de Postulantes
                </h1>
                <p className="text-textLight mt-2">
                    Administra todos los candidatos que han aplicado a las vacantes.
                </p>
            </div>
            <div className="glass rounded-3xl border border-primary/15 p-6">
                <div className="grid md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Buscar candidato..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-border px-4 py-3"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-xl border border-border px-4 py-3"
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="Recibida">Recibida</option>
                        <option value="En revisión">En revisión</option>
                        <option value="Entrevista">Entrevista</option>
                        <option value="Contratado">Contratado</option>
                        <option value="No seleccionado">No seleccionado</option>
                    </select>
                </div>
            </div>
            <div className="glass rounded-3xl overflow-hidden border border-primary/15">
                {loading ? (
                    <div className="py-20 text-center">
                        Cargando postulantes...
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-primary/5">
                                <th className="p-4 text-left">Candidato</th>
                                <th className="p-4 text-left">Vacante</th>
                                <th className="p-4 text-left">Estado</th>
                                <th className="p-4 text-left">Fecha</th>
                                <th className="p-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-20 text-center text-textLight"
                                    >
                                        No hay postulaciones registradas.
                                    </td>
                                </tr>
                            ) : (
                                filteredApplications.map((application) => (
                                    <tr
                                        key={application.id}
                                        className="border-t hover:bg-primary/5 transition-colors"
                                    >
                                        <td className="p-4">
                                            <p className="font-semibold">
                                                {application.candidateName}
                                            </p>

                                            <p className="text-sm text-textLight">
                                                {application.candidateEmail}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            {application.vacancyTitle}
                                        </td>
                                        <td className="p-4">
                                            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm">
                                                {application.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {application.appliedAt
                                                ? new Date(application.appliedAt).toLocaleDateString()
                                                : '-'}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button className="rounded-xl bg-primary px-4 py-2 text-white hover:bg-primary-hover transition-colors">
                                                Ver
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}