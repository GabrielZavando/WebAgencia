import { vi, describe, it, expect, beforeEach } from 'vitest'
import { getInitialTheme, setTheme, toggleTheme } from './theme'

describe('Theme Utils (Landing)', () => {
  beforeEach(() => {
    // Limpieza de DOM y localStorage
    document.documentElement.removeAttribute('data-theme')
    localStorage.clear()
    vi.clearAllMocks()
    
    // Mock de matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('debe retornar "light" si no hay preferencia guardada ni del sistema', () => {
    expect(getInitialTheme()).toBe('light')
  })

  it('debe obtener el tema desde localStorage si existe', () => {
    localStorage.setItem('theme', 'dark')
    expect(getInitialTheme()).toBe('dark')
  })

  it('debe preferir el tema del sistema si no hay localStorage', () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
    } as any)
    
    expect(getInitialTheme()).toBe('dark')
  })

  it('debe aplicar el tema al documento', () => {
    setTheme('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('debe alternar el tema correctamente', () => {
    setTheme('light')
    const next = toggleTheme()
    expect(next).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('debe alternar de dark a light', () => {
    setTheme('dark')
    const next = toggleTheme()
    expect(next).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })
})
