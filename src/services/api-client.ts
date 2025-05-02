import { authService } from './auth';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

interface ErrorResponse {
  message: string;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: 'An error occurred' }))) as ErrorResponse;
    throw new ApiError(response.status, error.message);
  }
  return response.json() as Promise<T>;
}

function getAuthHeaders(requiresAuth: boolean): Headers {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  if (requiresAuth) {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

export const apiClient = {
  async get<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options;
    const headers = getAuthHeaders(requiresAuth);

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...fetchOptions,
      method: 'GET',
      headers,
    });

    return handleResponse<T>(response);
  },

  async post<T>(url: string, data: unknown, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options;
    const headers = getAuthHeaders(requiresAuth);

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...fetchOptions,
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    return handleResponse<T>(response);
  },

  async put<T>(url: string, data: unknown, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options;
    const headers = getAuthHeaders(requiresAuth);

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...fetchOptions,
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    return handleResponse<T>(response);
  },

  async delete<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options;
    const headers = getAuthHeaders(requiresAuth);

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...fetchOptions,
      method: 'DELETE',
      headers,
    });

    return handleResponse<T>(response);
  },
};
