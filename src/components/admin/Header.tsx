import { useState, useRef, useEffect } from 'react';
import { UserCircleIcon, MoonIcon, SunIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  onLogout?: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="sticky top-0 z-999 flex items-center border-b border-border bg-surface px-4 py-4 shadow-sm dark:border-gray-700 dark:bg-surface md:px-6">
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-text dark:text-white">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 hover:bg-surface-secondary dark:hover:bg-surface-secondary"
        >
          {theme === 'light' ? (
            <MoonIcon className="h-5 w-5 text-text-secondary" />
          ) : (
            <SunIcon className="h-5 w-5 text-text-secondary" />
          )}
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2"
          >
            <UserCircleIcon className="h-8 w-8 text-text-secondary" />
            <span className="hidden text-sm font-medium text-text-secondary md:block">Admin</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-surface py-2 shadow-default dark:border-gray-700 dark:bg-surface">
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-surface-secondary dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}