export type Theme = 'light' | 'dark'

/**
 * Obtiene el tema inicial basado en localStorage o preferencia del sistema.
 */
export function getInitialTheme(): Theme {
  if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
    return localStorage.getItem('theme') as Theme
  }
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }
  return 'light'
}

/**
 * Aplica un tema al documento y lo guarda en localStorage.
 */
export function setTheme(theme: Theme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme)
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('theme', theme)
  }
}

/**
 * Alterna entre light y dark.
 */
export function toggleTheme(): Theme {
  const current =
    typeof document !== 'undefined'
      ? (document.documentElement.getAttribute('data-theme') as Theme) || 'light'
      : 'light'

  const next = current === 'light' ? 'dark' : 'light'
  setTheme(next)
  return next
}
