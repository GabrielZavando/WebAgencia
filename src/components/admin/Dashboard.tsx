import { useState, useEffect } from 'react';
import { BuildingOfficeIcon, UsersIcon, ClipboardDocumentListIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import DashboardLayout from './DashboardLayout';
import StatsCard from './StatsCard';
import RecentLeadsTable from './RecentLeadsTable';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../lib/api-client';

interface DashboardStats {
  visitors: number;
  leads: number;
  projects: number;
  revenue: number;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  createdAt: string;
}

export default function Dashboard() {
  const { user, loading: authLoading, error: authError } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (authLoading) return;
      
      if (authError || !user) {
        setLoading(false);
        return;
      }

      try {
        // Obtener estadísticas y leads en paralelo
        const [statsResponse, leadsResponse] = await Promise.allSettled([
          apiFetch<{ visitors: number; leads: number; projects: number; revenue: number }>('/api/v1/stats/summary'),
          apiFetch<Array<{ id: string; name: string; email: string; phone: string; service: string; createdAt: string }>>('/api/v1/leads/recent'),
        ]);

        // Procesar estadísticas
        if (statsResponse.status === 'fulfilled') {
          setStats(statsResponse.value);
        } else {
          // Datos de ejemplo si la API no está disponible
          setStats({
            visitors: 12543,
            leads: 234,
            projects: 45,
            revenue: 89500,
          });
        }

        // Procesar leads
        if (leadsResponse.status === 'fulfilled') {
          setLeads(leadsResponse.value);
        } else {
          // Datos de ejemplo si la API no está disponible
          setLeads([
            {
              id: '1',
              name: 'Juan Pérez',
              email: 'juan@ejemplo.com',
              phone: '+52 55 1234 5678',
              service: 'Desarrollo Web',
              createdAt: '2024-01-15',
            },
            {
              id: '2',
              name: 'María García',
              email: 'maria@ejemplo.com',
              phone: '+52 55 8765 4321',
              service: 'Marketing Digital',
              createdAt: '2024-01-14',
            },
            {
              id: '3',
              name: 'Carlos López',
              email: 'carlos@ejemplo.com',
              phone: '+52 55 1122 3344',
              service: 'SEO',
              createdAt: '2024-01-13',
            },
          ]);
        }

        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos');
        setLoading(false);
      }
    }

    fetchData();
  }, [authLoading, authError, user]);

  const handleLogout = async () => {
    try {
      // Llamar al endpoint de logout
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      // Ignorar errores de red
    } finally {
      // Redirigir a login
      window.location.href = '/login';
    }
  };

  if (loading || authLoading) {
    return (
      <DashboardLayout onLogout={handleLogout}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-sm border border-gray-200 bg-surface dark:border-gray-700 dark:bg-surface"></div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (error || authError) {
    return (
      <DashboardLayout onLogout={handleLogout}>
        <div className="flex h-64 items-center justify-center">
          <p className="text-error">{error || authError}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout onLogout={handleLogout}>
      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Visitantes"
          value={stats?.visitors.toLocaleString() || '0'}
          change={12.5}
          changeLabel="vs mes anterior"
          icon={<UsersIcon className="h-6 w-6" />}
        />
        <StatsCard
          title="Leads"
          value={stats?.leads.toLocaleString() || '0'}
          change={8.2}
          changeLabel="vs mes anterior"
          icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
        />
        <StatsCard
          title="Proyectos"
          value={stats?.projects.toLocaleString() || '0'}
          change={-2.1}
          changeLabel="vs mes anterior"
          icon={<BuildingOfficeIcon className="h-6 w-6" />}
        />
        <StatsCard
          title="Ingresos"
          value={`$${stats?.revenue.toLocaleString() || '0'}`}
          change={15.3}
          changeLabel="vs mes anterior"
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
        />
      </div>

      {/* Recent Leads Table */}
      <RecentLeadsTable leads={leads} loading={loading} />
    </DashboardLayout>
  );
}