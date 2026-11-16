'use client';

import * as React from 'react';

interface SidebarShellProps {
  /** Oculta completamente el sidebar (usado en la página de login) */
  hideSidebar?: boolean;
  /** Oculta completamente el header (usado en la página de login) */
  hideHeader?: boolean;
}

export default function SidebarShell({
  hideSidebar = false,
  hideHeader = false,
}: SidebarShellProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Escuchar eventos de toggle desde el botón del Header (HTML vanilla, producción)
  React.useEffect(() => {
    const onToggle = () => setIsOpen((prev) => !prev);
    const onClose = () => setIsOpen(false);
    window.addEventListener('admin:toggle-sidebar', onToggle);
    window.addEventListener('admin:close-sidebar', onClose);
    return () => {
      window.removeEventListener('admin:toggle-sidebar', onToggle);
      window.removeEventListener('admin:close-sidebar', onClose);
    };
  }, []);

  // Sincronizar clases del DOM del sidebar (renderizado por Sidebar.astro).
  // En desktop, lg:translate-x-0 de Sidebar.astro siempre lo mantiene visible.
  React.useEffect(() => {
    if (hideSidebar) return;
    const sidebar = document.getElementById('admin-sidebar');
    if (!sidebar) return;

    if (isOpen) {
      sidebar.classList.remove('-translate-x-full');
      sidebar.classList.add('translate-x-0');
    } else {
      sidebar.classList.remove('translate-x-0');
      sidebar.classList.add('-translate-x-full');
    }
  }, [isOpen, hideSidebar]);

  const toggle = () => setIsOpen((prev) => !prev);
  const shouldShowBackdrop = !hideSidebar && isOpen;

  return (
    <>
      {/* Botón de alternancia (móvil: visible; desktop: oculto vía lg:hidden) */}
      <button
        className="lg:hidden"
        aria-label="Abrir menú de navegación"
        aria-controls="admin-sidebar"
        aria-expanded={String(isOpen)}
        onClick={toggle}
      >
        <span aria-hidden="true">☰</span>
      </button>

      {/* Backdrop oscuro (solo cuando el sidebar está abierto; lg:hidden lo oculta en desktop) */}
      {shouldShowBackdrop && (
        <div
          id="admin-sidebar-backdrop"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
