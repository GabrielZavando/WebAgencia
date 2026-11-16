import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SidebarShell from './SidebarShell';

describe('SidebarShell', () => {
  const mockMatchMedia = vi.fn();

  beforeEach(() => {
    document.body.innerHTML = '';
    mockMatchMedia.mockImplementation((query) => ({
      matches: query === '(min-width: 1024px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    vi.stubGlobal('matchMedia', mockMatchMedia);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('mobile environment (< 1024px)', () => {
    it('3.1 starts with sidebar closed and backdrop not in the DOM', () => {
      render(<SidebarShell />);
      expect(document.getElementById('admin-sidebar-backdrop')).toBeNull();
    });

    it('3.2 clicking toggle opens sidebar and shows backdrop', () => {
      render(<SidebarShell />);
      const toggle = screen.getByRole('button', { name: 'Abrir menú de navegación' });
      expect(toggle).not.toBeNull();
      React.act(() => {
        toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });
      expect(document.getElementById('admin-sidebar-backdrop')).not.toBeNull();
    });

    it('3.3 clicking backdrop closes sidebar and hides backdrop', () => {
      render(<SidebarShell />);
      const toggle = screen.getByRole('button', { name: 'Abrir menú de navegación' });
      React.act(() => {
        toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });
      const backdrop = document.getElementById('admin-sidebar-backdrop');
      expect(backdrop).not.toBeNull();
      React.act(() => {
        backdrop!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });
      expect(document.getElementById('admin-sidebar-backdrop')).toBeNull();
    });
  });

  describe('desktop environment (>= 1024px)', () => {
    beforeEach(() => {
      mockMatchMedia.mockImplementation((query) => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
    });

    it('3.4 sidebar is visible by default and no backdrop', () => {
      render(<SidebarShell />);
      expect(document.getElementById('admin-sidebar-backdrop')).toBeNull();
    });
  });
});
