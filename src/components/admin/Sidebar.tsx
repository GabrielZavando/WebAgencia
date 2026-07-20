import { useState } from 'react';
import {
  HomeIcon,
  UsersIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const menuItems = [
  { name: 'Dashboard', icon: HomeIcon, href: '/admin/dashboard' },
  { name: 'Leads', icon: UsersIcon, href: '/admin/leads' },
  { name: 'Configuración', icon: Cog6ToothIcon, href: '/admin/settings' },
];

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-primary p-2 text-white lg:hidden"
      >
        {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 transform bg-surface transition-transform duration-300 dark:bg-surface lg:static lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-gray-700">
          {!collapsed && (
            <span className="text-xl font-bold text-primary">Admin</span>
          )}
          <button
            onClick={onToggle}
            className="hidden rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 lg:block"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-4">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="mb-2 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </a>
          ))}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}