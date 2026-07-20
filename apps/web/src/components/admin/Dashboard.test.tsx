import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatsCard from './StatsCard';
import RecentLeadsTable from './RecentLeadsTable';

describe('StatsCard', () => {
  it('renders title and value', () => {
    render(<StatsCard title="Visitantes" value="12,543" />);
    expect(screen.getByText('Visitantes')).toBeInTheDocument();
    expect(screen.getByText('12,543')).toBeInTheDocument();
  });

  it('renders change indicator when provided', () => {
    render(<StatsCard title="Leads" value="234" change={12.5} />);
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
  });

  it('renders negative change in red', () => {
    render(<StatsCard title="Proyectos" value="45" change={-2.1} />);
    expect(screen.getByText('-2.1%')).toBeInTheDocument();
  });
});

describe('RecentLeadsTable', () => {
  const mockLeads = [
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
  ];

  it('renders table headers', () => {
    render(<RecentLeadsTable leads={mockLeads} />);
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Teléfono')).toBeInTheDocument();
    expect(screen.getByText('Servicio')).toBeInTheDocument();
    expect(screen.getByText('Fecha')).toBeInTheDocument();
  });

  it('renders lead data', () => {
    render(<RecentLeadsTable leads={mockLeads} />);
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('juan@ejemplo.com')).toBeInTheDocument();
    expect(screen.getByText('Desarrollo Web')).toBeInTheDocument();
  });

  it('shows empty state when no leads', () => {
    render(<RecentLeadsTable leads={[]} />);
    expect(screen.getByText('No hay leads disponibles')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    render(<RecentLeadsTable leads={[]} loading={true} />);
    expect(screen.queryByText('Leads Recientes')).not.toBeInTheDocument();
  });
});