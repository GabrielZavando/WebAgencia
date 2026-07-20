import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

export default function DashboardLayout({ children, onLogout }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-secondary dark:bg-body">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Header onLogout={onLogout} />

        <main className="flex-1 p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}