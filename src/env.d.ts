/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly PUBLIC_API_BASE_URL?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

interface Window {
  modalHelpers: {
    openModal: (modalId: string) => void;
    closeModal: (modal: HTMLElement | string) => void;
    closeAllModals: () => void;
    updateModalMessage: (modalId: string, newMessage: string) => void;
  };
  confirmModalHelpers: {
    open: (id: string, onConfirm: () => void) => void;
    close: (id: string | HTMLElement) => void;
  };
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}