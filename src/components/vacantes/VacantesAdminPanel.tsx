'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  User,
  Users,
  Mail,
  Phone,
  Calendar,
  Search,
  AlertCircle,
  Loader2,
  Briefcase,
  FileText as FileTextIcon,
  UserCheck,
  UserX,
  Clock,
  FileDown,
  ArrowUp,
  ArrowDown,
  Eye,
  X as XIcon,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import SectionTitle from '@/components/ui/SectionTitle';
import { formatDate } from '@/lib/utils';
import {
  APPLICATION_STATUS_OPTIONS,
  type JobApplication,
} from '@/config/candidates';
import {
  VACANCY_DEPARTMENTS,
  createEmptyVacancy,
  type JobVacancy,
} from '@/config/vacancies';
import {
  readCandidateApplications,
  writeCandidateApplications,
} from '@/lib/candidateStorage';
import { APPLICATION_PROGRESS_STEPS, getApplicationProgress } from '@/lib/applicationProgress';
import {
  // Eliminados: readJobVacancies y writeJobVacancies
  removeJobVacancy,
  upsertJobVacancy,
} from '@/lib/vacanciesStorage';

type CandidateUser = Partial<JobApplication>;

function StatsCard({
  icon: Icon,
  title,
  value,
  color = 'text-primary',
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  value: number | string;
  color?: string;
  onClick?: () => void;
}) {
  const cardContent = (
    <>
      <Icon className={`w-8 h-8 ${color} mb-2`} />
      <p className="text-3xl font-bold text-text">{value}</p>
      <p className="text-xs text-textLight mt-1">{title}</p>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="glass rounded-2xl border border-primary/10 p-4 flex flex-col items-center justify-center text-center h-full w-full transition-all hover:border-primary/30 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {cardContent}
      </button>
    );
  }

  return (
    <div className="glass rounded-2xl border border-primary/10 p-4 flex flex-col items-center justify-center text-center h-full">
      {cardContent}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl border border-primary/15 p-3 text-sm">
        <p className="font-bold text-text">{label}</p>
        <p className="text-primary">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function VacanciesMetrics({
  applications,
  vacancies,
  onMetricClick,
}: {
  applications: JobApplication[];
  vacancies: JobVacancy[];
  onMetricClick: (metric: 'vacancies' | 'users' | 'applications') => void;
}) {
  const metrics = useMemo(() => {
    const totalApplications = applications.length;
    const uniqueCandidates = new Set(
      applications.map((app) => app.candidateDocument).filter(Boolean),
    ).size;
    const selected = applications.filter((app) => app.status === 'Seleccionado').length;
    const rejected = applications.filter((app) => app.status === 'No continua').length;
    const inProcess = applications.filter((app) =>
      ['Recibida', 'En revision', 'Entrevista', 'Prueba tecnica'].includes(app.status),
    ).length;

    return {
      totalVacancies: vacancies.length,
      totalApplications,
      uniqueCandidates,
      selected,
      rejected,
      inProcess,
    };
  }, [applications, vacancies]);

  const applicationsByMonth = useMemo(() => {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthlyData: { name: string; Postulaciones: number }[] = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = monthNames[d.getMonth()];
      monthlyData.push({ name: monthName, Postulaciones: 0 });
    }

    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

    applications.forEach(app => {
      const appDate = new Date(app.appliedAt);
      if (appDate >= sixMonthsAgo) {
        const monthName = monthNames[appDate.getMonth()];
        const monthEntry = monthlyData.find(m => m.name === monthName);
        if (monthEntry) {
          monthEntry.Postulaciones++;
        }
      }
    });

    return monthlyData;
  }, [applications]);

  const statusDistribution = useMemo(() => {
    const statusCounts: { [key: string]: number } = {};
    APPLICATION_STATUS_OPTIONS.forEach(status => {
      statusCounts[status] = 0;
    });

    applications.forEach(app => {
      if (statusCounts[app.status] !== undefined) {
        statusCounts[app.status]++;
      }
    });

    return Object.entries(statusCounts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  }, [applications]);

  const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#ef4444'];

  return (
    <div className="mb-6">
      <h3 className="text-xl font-display text-text mb-4">Métricas Generales</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatsCard
          icon={Briefcase}
          title="Vacantes Activas"
          value={metrics.totalVacancies}
          onClick={() => onMetricClick('vacancies')}
        />
        <StatsCard
          icon={Users}
          title="Candidatos Únicos"
          value={metrics.uniqueCandidates}
          onClick={() => onMetricClick('users')}
        />
        <StatsCard
          icon={FileTextIcon}
          title="Postulaciones"
          value={metrics.totalApplications}
          onClick={() => onMetricClick('applications')}
        />
        <StatsCard
          icon={Clock}
          title="En Proceso"
          value={metrics.inProcess}
          color="text-blue-500"
          onClick={() => onMetricClick('applications')}
        />
        <StatsCard
          icon={UserCheck}
          title="Seleccionados"
          value={metrics.selected}
          color="text-green-500"
          onClick={() => onMetricClick('applications')}
        />
        <StatsCard
          icon={UserX}
          title="No Continúan"
          value={metrics.rejected}
          color="text-red-500"
          onClick={() => onMetricClick('applications')}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass rounded-2xl border border-primary/10 p-4">
          <h4 className="text-lg font-display text-text mb-4 text-center">Postulaciones por Mes</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={applicationsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
              <Bar dataKey="Postulaciones" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-2xl border border-primary/10 p-4">
          <h4 className="text-lg font-display text-text mb-4 text-center">Distribución de Estados</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconSize={10}
                wrapperStyle={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  paddingTop: '20px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function CandidateApplicationsModal({ user, onClose }: { user: CandidateUser; onClose: () => void }) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.candidateDocument) {
      const fetchApplications = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/applications/by-candidate/${user.candidateDocument}`);
          const result = await response.json();
          if (result.success) {
            setApplications(result.data);
          }
        } finally {
          setLoading(false);
        }
      };
      void fetchApplications();
    }
  }, [user.candidateDocument]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass rounded-2xl border border-primary/20 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-primary/10 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-display text-text">Postulaciones de {user.candidateName}</h3>
            <p className="text-sm text-textLight">C.C. {user.candidateDocument}</p>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm" className="h-9 w-9 p-0">
            <XIcon className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : applications.length > 0 ? (
            <ul className="space-y-4">
              {applications.map(app => (
                <li key={app.id} className="p-4 rounded-lg border border-primary/10 bg-white/10 transition-all hover:border-primary/20 hover:bg-white/20">
                  <p className="font-semibold text-text">{app.vacancyTitle}</p>
                  <p className="text-sm text-textLight">Postuló el: {formatDate(app.appliedAt)}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${app.status === 'Seleccionado' ? 'bg-green-100 text-green-800' : app.status === 'No continua' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                      Estado: {app.status}
                    </span>
                    <a href={`/dashboard/vacantes/${app.id}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                      <Eye size={14} /> Ver Detalles
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-textLight">No se encontraron postulaciones para este usuario.</p>
          )}
        </div>
        <div className="p-4 border-t border-primary/10 text-right">
          <Button onClick={onClose} variant="secondary">Cerrar</Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente que muestra la lista de todos los usuarios únicos (candidatos)
 * que se han registrado en el sistema al postularse a una vacante.
 */
function RegisteredUsersList() {
  type SortDirection = 'asc' | 'desc';
  type SortConfig = {
    key: keyof CandidateUser;
    direction: SortDirection;
  };

  const [users, setUsers] = useState<CandidateUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'appliedAt', direction: 'desc' });
  const [selectedUser, setSelectedUser] = useState<CandidateUser | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/users');
        const result = await response.json();

        if (response.ok && result.success) {
          setUsers(result.data);
        } else {
          setError(result.message || 'No se pudo cargar la lista de usuarios.');
        }
      } catch (err) {
        setError('Error de red. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const requestSort = (key: keyof CandidateUser) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof CandidateUser) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUp className="inline-block ml-1 h-4 w-4 text-transparent" />;
    }
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="inline-block ml-1 h-4 w-4" />;
    }
    return <ArrowDown className="inline-block ml-1 h-4 w-4" />;
  };

  const handleExportCSV = () => {
    const headers = ['Nombre', 'Documento', 'Email', 'Teléfono', 'Última Postulación'];

    const escapeCsvField = (field: string | undefined | null): string => {
      if (field === null || field === undefined) {
        return '""';
      }
      const stringField = String(field);
      if (/[",\n\r]/.test(stringField)) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return `"${stringField}"`;
    };

    const rows = processedUsers.map((user) =>
      [
        escapeCsvField(user.candidateName),
        escapeCsvField(user.candidateDocument),
        escapeCsvField(user.candidateEmail),
        escapeCsvField(user.candidatePhone),
        escapeCsvField(user.appliedAt ? formatDate(user.appliedAt) : 'N/A'),
      ].join(','),
    );

    const csvString = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `usuarios-registrados-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processedUsers = useMemo(() => {
    let processableUsers = [...users];
    const query = searchTerm.toLowerCase();
    if (query) {
      processableUsers = processableUsers.filter(
        (user) =>
          user.candidateName?.toLowerCase().includes(query) ||
          user.candidateEmail?.toLowerCase().includes(query) ||
          user.candidateDocument?.includes(query),
      );
    }

    if (sortConfig !== null) {
      processableUsers.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return processableUsers;
  }, [users, searchTerm, sortConfig]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="animate-spin h-8 w-8 text-primary" /> Cargando usuarios...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-600">
        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-display text-text">Usuarios Registrados</h3>
          <p className="text-sm text-textLight mt-1">
            Lista de todos los candidatos que han aplicado a una vacante en el sistema.
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="secondary" disabled={processedUsers.length === 0}>
          <FileDown className="mr-2 h-4 w-4" />
          Exportar a CSV
        </Button>
      </div>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre, email o documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-lg glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
        />
      </div>

      <div className="mt-4 overflow-y-auto max-h-[60vh] custom-scrollbar pr-2">
        <table className="w-full text-left">
          <thead className="border-b bg-white/30 sticky top-0 backdrop-blur-sm">
            <tr>
              <th className="p-4 font-semibold text-gray-600 cursor-pointer hover:bg-primary/5" onClick={() => requestSort('candidateName')}>
                <div className="flex items-center">Nombre {getSortIcon('candidateName')}</div>
              </th>
              <th className="p-4 font-semibold text-gray-600">
                Contacto
              </th>
              <th className="p-4 font-semibold text-gray-600 cursor-pointer hover:bg-primary/5" onClick={() => requestSort('appliedAt')}>
                <div className="flex items-center">Última Postulación {getSortIcon('appliedAt')}</div>
              </th>
              <th className="p-4 font-semibold text-gray-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {processedUsers.map((user) => (
              <tr key={user.candidateDocument} className="border-b border-primary/10 hover:bg-primary/5">
                <td className="p-4"><div className="flex items-center gap-3"><User size={16} className="text-gray-400" /><div><p className="font-semibold text-text">{user.candidateName}</p><p className="text-xs text-textLight">C.C. {user.candidateDocument}</p></div></div></td>
                <td className="p-4"><div className="flex flex-col gap-1"><div className="flex items-center gap-2 text-sm"><Mail size={14} className="text-gray-400" /><a href={`mailto:${user.candidateEmail}`} className="text-blue-600 hover:underline">{user.candidateEmail}</a></div><div className="flex items-center gap-2 text-sm"><Phone size={14} className="text-gray-400" />{user.candidatePhone || 'No registrado'}</div></div></td>
                <td className="p-4"><div className="flex items-center gap-2 text-sm"><Calendar size={14} className="text-gray-400" />{user.appliedAt ? formatDate(user.appliedAt) : 'N/A'}</div></td>
                <td className="p-4">
                  <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedUser && (
        <CandidateApplicationsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseLines(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function createDraftFromVacancy(vacancy: JobVacancy) {
  return {
    ...vacancy,
    requirementsText: vacancy.requirements.join('\n'),
    benefitsText: vacancy.benefits.join('\n'),
  };
}

type VacancyDraft = JobVacancy & {
  requirementsText: string;
  benefitsText: string;
};

type VacanciesSession = {
  cedula: string;
  role: string;
  name: string;
};

function createInitialDraft(): VacancyDraft {
  const base = createEmptyVacancy();
  return {
    ...base,
    requirementsText: '',
    benefitsText: '',
  };
}

const APPLICATION_PROGRESS_SHORT_LABELS: Record<
  (typeof APPLICATION_PROGRESS_STEPS)[number],
  string
> = {
  Recibida: 'Recibida',
  'En revision': 'Revision',
  Entrevista: 'Entrevista',
  'Prueba tecnica': 'Prueba',
  Seleccionado: 'Seleccionado',
};

function ApplicationProgressTrack({ status }: { status: JobApplication['status'] }) {
  const progress = getApplicationProgress(status);
  const barClass = progress.isRejected ? 'bg-red-500' : 'bg-primary';
  const trailClass = progress.isRejected ? 'bg-red-100' : 'bg-primary/15';

  return (
    <div className="mt-3 rounded-xl border border-primary/10 bg-white/70 p-3">
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-[11px] uppercase tracking-[0.12em] text-textLight">Ruta del proceso</p>
        <span
          className={`text-[11px] font-semibold px-2 py-1 rounded-full ${progress.isRejected
            ? 'text-red-700 bg-red-100 border border-red-200'
            : progress.isFinished
              ? 'text-green-700 bg-green-100 border border-green-200'
              : 'text-primary bg-primary/10 border border-primary/20'
            }`}
        >
          {status}
        </span>
      </div>

      <div className={`relative h-1 rounded-full ${trailClass}`}>
        <span
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${barClass}`}
          style={{ width: `${progress.percent}%` }}
        />
      </div>

      <div className="mt-2 grid grid-cols-5 gap-2">
        {APPLICATION_PROGRESS_STEPS.map((step, index) => {
          const reached = !progress.isRejected && index <= progress.activeIndex;
          const isCurrent = !progress.isRejected && index === progress.activeIndex;

          return (
            <div key={step} className="flex flex-col items-center gap-1">
              <span
                className={`h-3 w-3 rounded-full border transition-colors ${reached
                  ? 'bg-primary border-primary'
                  : 'bg-white border-primary/25'
                  } ${isCurrent ? 'ring-2 ring-primary/30' : ''}`}
              />
              <span className="text-[10px] text-textLight text-center leading-tight">
                {APPLICATION_PROGRESS_SHORT_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>

      {progress.isRejected && (
        <p className="text-xs text-red-700 mt-2">
          Proceso finalizado en estado "No continua".
        </p>
      )}
    </div>
  );
}

export default function VacantesAdminPanel() {
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [session, setSession] = useState<VacanciesSession | null>(null);
  const [draft, setDraft] = useState<VacancyDraft>(createInitialDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'vacancies' | 'users'>(
    initialTab === 'users' ? 'users' : 'vacancies',
  );
  const [expandedVacancyId, setExpandedVacancyId] = useState<string | null>(null);
  const vacanciesListRef = useRef<HTMLDivElement>(null);
  const loadVacancies = async () => {
    try {
      const response = await fetch('/api/vacantes', {
        cache: 'no-store',
      });

      const data = await response.json();

      setVacancies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando vacantes:', error);
      setVacancies([]);
    }
  };

  useEffect(() => {
    async function initialize() {
      const rawSession = localStorage.getItem('vacanciesAdminUser');

      if (rawSession) {
        try {
          setSession(JSON.parse(rawSession) as VacanciesSession);
        } catch {
          setSession(null);
        }
      }

      await loadVacancies();

      setApplications(readCandidateApplications());
    }

    initialize();

    const syncFromStorage = async () => {
      await loadVacancies();
      setApplications(readCandidateApplications());
    };

    window.addEventListener('storage', syncFromStorage);
    window.addEventListener('candidate-storage-updated', syncFromStorage);

    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('candidate-storage-updated', syncFromStorage);
    };
  }, []);

  const ownedVacancies = useMemo(() => {
    if (!session?.cedula) {
      return vacancies;
    }

    return vacancies.filter((vacancy) => {
      return !vacancy.createdByCedula || vacancy.createdByCedula === session.cedula;
    });
  }, [session?.cedula, vacancies]);

  const ownedApplications = useMemo(() => {
    const visibleVacancyIds = new Set(ownedVacancies.map((vacancy) => vacancy.id));
    return applications.filter((application) => visibleVacancyIds.has(application.vacancyId));
  }, [applications, ownedVacancies]);

  const filteredVacancies = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return ownedVacancies;
    }
    return ownedVacancies.filter((vacancy) => {
      return (
        vacancy.title.toLowerCase().includes(query) ||
        vacancy.area.toLowerCase().includes(query) ||
        vacancy.city.toLowerCase().includes(query) ||
        vacancy.department.toLowerCase().includes(query)
      );
    });
  }, [ownedVacancies, search]);

  const resetDraft = () => {
    setDraft(createInitialDraft());
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!draft.title.trim()) {
      toast.error('Debes ingresar el cargo de la vacante.');
      return;
    }

    if (!draft.area.trim()) {
      toast.error('Debes ingresar el área.');
      return;
    }

    if (!draft.city.trim()) {
      toast.error('Debes ingresar la ciudad.');
      return;
    }

    if (!draft.summary.trim()) {
      toast.error('Debes ingresar un resumen de la vacante.');
      return;
    }

    const now = new Date().toISOString();

    const current = editingId
      ? vacancies.find((vacancy) => vacancy.id === editingId)
      : null;

    const record: JobVacancy = {
      ...draft,
      id: editingId || '',
      title: draft.title.trim(),
      area: draft.area.trim(),
      city: draft.city.trim(),
      contractType: draft.contractType.trim() || 'Tiempo completo',
      schedule: draft.schedule.trim(),
      salary: draft.salary.trim() || 'A convenir',
      experience: draft.experience.trim(),
      summary: draft.summary.trim(),
      requirements: parseLines(draft.requirementsText),
      benefits: parseLines(draft.benefitsText),
      postedAt: draft.postedAt || now.slice(0, 10),
      createdAt: current?.createdAt || now,
      updatedAt: now,
      createdByCedula: current?.createdByCedula || session?.cedula || '',
      createdByName: current?.createdByName || session?.name || '',
    };

    try {
      if (editingId) {
        await fetch(`/api/vacantes/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(record),
        });
        toast.success('Vacante actualizada correctamente.');
      } else {
        await fetch('/api/vacantes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(record),
        });
        toast.success('Vacante creada correctamente.');
      }
      await loadVacancies();
      resetDraft();
    } catch (error) {
      console.error(error);
      toast.error('No fue posible guardar la vacante.');
    }
  };

  const handleMetricClick = (metric: 'vacancies' | 'users' | 'applications') => {
    if (metric === 'users') {
      setActiveTab('users');
    } else {
      setActiveTab('vacancies');
      // The timeout ensures the view has re-rendered before scrolling
      setTimeout(() => {
        vacanciesListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleEdit = (vacancy: JobVacancy) => {
    setDraft(createDraftFromVacancy(vacancy));
    setEditingId(vacancy.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast(`Editando vacante: ${vacancy.title}`, { icon: '✍️' });
  };

  const handleDelete = async (vacancy: JobVacancy) => {
    const confirmed = window.confirm(
      `¿Deseas eliminar la vacante "${vacancy.title}"?`
    );

    if (!confirmed) {
      return;
    }
    try {
      await fetch(`/api/vacantes/${vacancy.id}`, {
        method: 'DELETE',
      });
      await loadVacancies();
      if (editingId === vacancy.id) {
        resetDraft();
      }
      toast.success('Vacante desactivada correctamente.');
    } catch (error) {
      console.error(error);
      toast.error('No fue posible eliminar la vacante.');
    }
  };

  const handleUpdateApplicationStatus = (
    applicationId: string,
    status: JobApplication['status'],
  ) => {
    const target = applications.find((application) => application.id === applicationId);
    const next = applications.map((application) =>
      application.id === applicationId ? { ...application, status } : application,
    );
    setApplications(next);
    writeCandidateApplications(next);
    const toastId = toast.loading('Actualizando estado y enviando notificación...');

    if (!target || !target.candidateEmail) {
      toast.error('Estado actualizado. No se pudo enviar correo porque la postulación no tiene email.', { id: toastId });
      return;
    }

    void (async () => {
      try {
        const response = await fetch('/api/vacantes/notificar-estado', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            candidateName: target.candidateName,
            candidateEmail: target.candidateEmail,
            candidateDocument: target.candidateDocument,
            vacancyTitle: target.vacancyTitle,
            trackingCode: target.trackingCode,
            status,
          }),
        });

        const result = (await response.json()) as { ok: boolean; message?: string };
        if (!response.ok || !result.ok) {
          toast.error(`No se pudo notificar por correo: ${result.message || 'Error de envío'}`, { id: toastId });
          return;
        }

        toast.success('Estado actualizado y notificado por correo.', { id: toastId });
      } catch {
        toast.error('Falló la notificación por correo.', { id: toastId });
      }
    })();
  };

  return (
    <div className="min-h-screen pt-2 pb-10">
      {/* Es recomendable mover el componente Toaster a un layout principal para que las notificaciones persistan durante la navegación */}
      <Toaster position="bottom-right" toastOptions={{ duration: 5000 }} />
      <SectionTitle
        title="Panel de Vacantes"
        subtitle={session?.name ? `Administra las vacantes creadas por ${session.name}.` : 'Administra vacantes de Trabaja con Nosotros en un panel exclusivo.'}
        align="left"
        className="mb-8"
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1.08fr_0.92fr] gap-8">
        <section className="glass rounded-3xl border border-primary/15 p-6 md:p-8">
          <h3 className="text-2xl font-display text-text mb-6">
            {editingId ? 'Editar vacante' : 'Crear nueva vacante'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Cargo"
              value={draft.title}
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Ej: Auxiliar de servicio al cliente"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <Input
                label="Area"
                value={draft.area}
                onChange={(event) => setDraft((prev) => ({ ...prev, area: event.target.value }))}
                placeholder="Ej: Comercial"
                required
              />

              <div>
                <label className="block text-sm font-medium text-text mb-2">Departamento</label>
                <select
                  value={draft.department}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, department: event.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                >
                  {VACANCY_DEPARTMENTS.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Ciudad"
                value={draft.city}
                onChange={(event) => setDraft((prev) => ({ ...prev, city: event.target.value }))}
                placeholder="Ej: Pereira"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Modalidad</label>
                <select
                  value={draft.modality}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      modality: event.target.value as JobVacancy['modality'],
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Hibrido">Hibrido</option>
                  <option value="Remoto">Remoto</option>
                </select>
              </div>

              <Input
                label="Tipo de contrato"
                value={draft.contractType}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, contractType: event.target.value }))
                }
                placeholder="Tiempo completo"
              />

              <Input
                label="Fecha de publicacion"
                type="date"
                value={draft.postedAt}
                onChange={(event) => setDraft((prev) => ({ ...prev, postedAt: event.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Horario"
                value={draft.schedule}
                onChange={(event) => setDraft((prev) => ({ ...prev, schedule: event.target.value }))}
                placeholder="Lunes a viernes"
              />
              <Input
                label="Salario"
                value={draft.salary}
                onChange={(event) => setDraft((prev) => ({ ...prev, salary: event.target.value }))}
                placeholder="A convenir"
              />
              <Input
                label="Experiencia"
                value={draft.experience}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, experience: event.target.value }))
                }
                placeholder="1+ ano"
              />
            </div>

            <Textarea
              label="Resumen de la vacante"
              value={draft.summary}
              onChange={(event) => setDraft((prev) => ({ ...prev, summary: event.target.value }))}
              placeholder="Describe la vacante en pocas lineas."
              rows={3}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea
                label="Requisitos (uno por linea)"
                value={draft.requirementsText}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, requirementsText: event.target.value }))
                }
                placeholder={'Ej:\nComunicacion asertiva\nManejo de Excel'}
                rows={5}
              />

              <Textarea
                label="Beneficios (uno por linea)"
                value={draft.benefitsText}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, benefitsText: event.target.value }))
                }
                placeholder={'Ej:\nEstabilidad laboral\nCapacitacion continua'}
                rows={5}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-text">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, featured: event.target.checked }))
                }
                className="accent-primary"
              />
              Marcar como vacante destacada
            </label>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" variant="primary">
                {editingId ? 'Guardar cambios' : 'Crear vacante'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetDraft}>
                Limpiar formulario
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>
                  Cancelar edicion
                </Button>
              )}
            </div>
          </form>

        </section>

        <section className="glass rounded-3xl border border-primary/15 p-6 md:p-7">
          <div className="flex border-b border-primary/10 mb-4">
            <button
              onClick={() => setActiveTab('vacancies')}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'vacancies'
                ? 'text-primary border-b-2 border-primary'
                : 'text-textLight hover:text-text'
                }`}
            >
              Vacantes y Postulaciones
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'users'
                ? 'text-primary border-b-2 border-primary'
                : 'text-textLight hover:text-text'
                }`}
            >
              Usuarios Registrados
            </button>
          </div>

          {activeTab === 'vacancies' && (
            <>
              <VacanciesMetrics
                applications={ownedApplications}
                vacancies={ownedVacancies}
                onMetricClick={handleMetricClick}
              />

              <div ref={vacanciesListRef} className="mt-6 pt-5 border-t border-primary/10">
                <h3 className="text-xl font-display text-text mb-4">Gestión de Vacantes</h3>
                <Input
                  label="Buscar en listado de vacantes"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cargo, area, ciudad o departamento..."
                />
              </div>

              <div className="mt-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-1 custom-scrollbar">
                {filteredVacancies.map((vacancy) => {
                  const applicationsForVacancy = ownedApplications.filter(
                    (app) => app.vacancyId === vacancy.id,
                  );
                  const isExpanded = expandedVacancyId === vacancy.id;

                  return (
                    <article
                      key={vacancy.id}
                      className="rounded-2xl border border-primary/15 bg-white/45 p-4 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-text line-clamp-1">{vacancy.title}</p>
                          <p className="text-xs text-primary uppercase tracking-[0.16em] mt-1">
                            {vacancy.area}
                          </p>
                          <p className="text-xs text-textLight mt-1">
                            {vacancy.city}, {vacancy.department}
                          </p>
                          <p className="text-xs text-textLight mt-1">
                            {vacancy.modality} | {vacancy.contractType}
                          </p>
                        </div>
                        {vacancy.featured && (
                          <span className="text-[10px] font-semibold px-2 py-1 rounded-full border border-green-500/25 bg-green-500/10 text-green-700">
                            Destacada
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(vacancy)}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-primary/25 text-primary hover:bg-primary/10 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(vacancy)}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Eliminar
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedVacancyId(isExpanded ? null : vacancy.id)
                          }
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-sky-500/25 text-sky-600 hover:bg-sky-500/10 transition-colors flex items-center gap-1"
                        >
                          <Users size={14} />
                          Postulaciones ({applicationsForVacancy.length})
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-primary/10">
                          {applicationsForVacancy.length === 0 ? (
                            <p className="text-sm text-center text-textLight py-4">
                              No hay postulaciones para esta vacante.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {applicationsForVacancy.map((application) => (
                                <article
                                  key={application.id}
                                  className="rounded-xl border border-primary/10 bg-white/20 p-3"
                                >
                                  <p className="font-semibold text-text text-sm">
                                    {application.candidateName || 'Postulante'}
                                  </p>
                                  <p className="text-xs text-textLight">
                                    {application.candidateEmail}
                                  </p>
                                  <p className="text-xs text-textLight mt-1">
                                    C.C: {application.candidateDocument || 'No registrado'}
                                  </p>

                                  <div className="mt-2 flex flex-wrap gap-2">
                                    <a
                                      href={`/dashboard/vacantes/${application.id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs font-semibold px-2 py-1 rounded-lg border border-blue-500/25 text-blue-600 hover:bg-blue-500/10 transition-colors"
                                    >
                                      Ver Detalles
                                    </a>
                                  </div>

                                  <div className="mt-2">
                                    <label className="block text-xs text-textLight mb-1">
                                      Estado
                                    </label>
                                    <select
                                      value={application.status}
                                      onChange={(event) =>
                                        handleUpdateApplicationStatus(
                                          application.id,
                                          event.target.value as JobApplication['status'],
                                        )
                                      }
                                      className="w-full px-3 py-2 rounded-lg border border-primary/20 bg-white text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    >
                                      {APPLICATION_STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status}>
                                          {status}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <ApplicationProgressTrack status={application.status} />
                                  <p className="text-xs text-textLight mt-2 text-right">
                                    {new Date(application.appliedAt).toLocaleString('es-CO')}
                                  </p>
                                </article>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          )}
          {activeTab === 'users' && <RegisteredUsersList />}
        </section>
      </div>
    </div>
  );
}
