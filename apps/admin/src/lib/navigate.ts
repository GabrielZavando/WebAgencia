/**
 * Utilidad de navegación del cliente.
 * Envuelve window.location.assign para permitir mocks en tests.
 */
export const navigate = (url: string): void => {
  window.location.assign(url);
};
