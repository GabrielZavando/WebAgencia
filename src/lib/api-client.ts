type FetchMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends RequestInit {
  method?: FetchMethod;
  body?: any;
}

const getApiUrl = () => {
  return import.meta.env.PUBLIC_API_URL || import.meta.env.PUBLIC_API_BASE_URL || '';
};

export async function apiFetch<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${getApiUrl()}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers || {});
  
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
    body: options.body instanceof FormData 
      ? options.body 
      : options.body ? JSON.stringify(options.body) : undefined
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMsg = 'Error en la petición API';
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorMsg;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    const error = new Error(errorMsg) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const apiClient = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) => 
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => 
    apiFetch<T>(endpoint, { ...options, method: 'POST', body: data }),
  put: <T>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => 
    apiFetch<T>(endpoint, { ...options, method: 'PUT', body: data }),
  patch: <T>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => 
    apiFetch<T>(endpoint, { ...options, method: 'PATCH', body: data }),
  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) => 
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' })
};
