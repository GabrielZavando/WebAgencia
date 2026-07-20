interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  createdAt: string;
}

interface RecentLeadsTableProps {
  leads: Lead[];
  loading?: boolean;
}

export default function RecentLeadsTable({ leads, loading = false }: RecentLeadsTableProps) {
  if (loading) {
    return (
      <div className="rounded-sm border border-gray-200 bg-surface p-6 shadow-default dark:border-gray-700 dark:bg-surface">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-gray-200 bg-surface shadow-default dark:border-gray-700 dark:bg-surface">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-text dark:text-white">Leads Recientes</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-surface-secondary dark:border-gray-700 dark:bg-gray-800">
              <th className="px-4 py-4 font-medium text-text dark:text-white">Nombre</th>
              <th className="px-4 py-4 font-medium text-text dark:text-white">Email</th>
              <th className="px-4 py-4 font-medium text-text dark:text-white">Teléfono</th>
              <th className="px-4 py-4 font-medium text-text dark:text-white">Servicio</th>
              <th className="px-4 py-4 font-medium text-text dark:text-white">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                  No hay leads disponibles
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-gray-200 transition-colors hover:bg-surface-secondary dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-3 font-medium text-text dark:text-white">{lead.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{lead.email}</td>
                  <td className="px-4 py-3 text-text-secondary">{lead.phone}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {lead.service}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {new Date(lead.createdAt).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}