export type ApiErrorType = 'NETWORK_ERROR' | 'TIMEOUT_ERROR' | 'HTTP_ERROR' | 'PARSE_ERROR';

export class ApiError extends Error {
  type: ApiErrorType;
  status?: number;

  constructor(type: ApiErrorType, message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
  }
}

type FetchMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiRequestOptions {
  method?: FetchMethod;
  body?: any;
  headers?: HeadersInit;
  timeout?: number;
  retry?: { attempts: number; delayMs: number };
  injectTurnstile?: boolean;
  signal?: AbortSignal;
}

const getApiUrl = () => {
  return import.meta.env.PUBLIC_API_URL || import.meta.env.PUBLIC_API_BASE_URL || '';
};

function getTurnstileToken(): string | null {
  if (typeof window !== 'undefined' && (window as any).turnstile) {
    const token = (window as any).turnstile.getResponse();
    return token || null;
  }
  return null;
}

export async function apiFetch<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const url = `${getApiUrl()}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const { timeout = 15000, retry, injectTurnstile, signal: externalSignal, ...rest } = options;

  const execute = async (): Promise<T> => {
    const headers = new Headers(rest.headers || {});
    let body = rest.body;

    if (body && !(body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
      if (injectTurnstile) {
        const token = getTurnstileToken();
        if (token) {
          body = { ...body, turnstileToken: token };
        }
      }
      body = JSON.stringify(body);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort('timeout'), timeout);
    if (externalSignal) {
      externalSignal.addEventListener('abort', () => controller.abort(externalSignal.reason), { once: true });
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: rest.method || 'GET',
        headers,
        body,
        signal: controller.signal,
      });
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        if (err?.reason === 'timeout') {
          throw new ApiError('TIMEOUT_ERROR', 'La solicitud excedió el tiempo de espera');
        }
        throw new ApiError('NETWORK_ERROR', 'La solicitud fue cancelada');
      }
      if (err?.name === 'TypeError' || err?.message?.includes('Failed to fetch')) {
        throw new ApiError('NETWORK_ERROR', 'Error de conexión con el servidor');
      }
      throw new ApiError('NETWORK_ERROR', err?.message || 'Error de red');
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      let errorMsg = 'Error en la petición API';
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch {
        errorMsg = response.statusText || errorMsg;
      }
      throw new ApiError('HTTP_ERROR', errorMsg, response.status);
    }

    if (response.status === 204) {
      return {} as T;
    }

    try {
      return await response.json();
    } catch {
      throw new ApiError('PARSE_ERROR', 'Error al procesar la respuesta del servidor');
    }
  };

  if (retry && retry.attempts > 1) {
    let lastError: any;
    for (let i = 0; i < retry.attempts; i++) {
      try {
        return await execute();
      } catch (err: any) {
        lastError = err;
        if (err instanceof ApiError && (err.type === 'NETWORK_ERROR' || err.type === 'TIMEOUT_ERROR')) {
          if (i < retry.attempts - 1) {
            await new Promise(r => setTimeout(r, retry.delayMs * (i + 1)));
            continue;
          }
        }
        throw err;
      }
    }
    throw lastError;
  }

  return execute();
}

export const apiClient = {
  get: <T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, data?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiFetch<T>(endpoint, { ...options, method: 'POST', body: data }),
  put: <T>(endpoint: string, data?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiFetch<T>(endpoint, { ...options, method: 'PUT', body: data }),
  patch: <T>(endpoint: string, data?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiFetch<T>(endpoint, { ...options, method: 'PATCH', body: data }),
  delete: <T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
