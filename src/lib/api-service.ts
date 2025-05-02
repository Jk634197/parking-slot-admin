export interface ApiResponse<T = unknown> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiService {
  private readonly baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = (await response.json()) as ApiResponse<T>;

    if (!data.success) {
      throw new ApiError(data?.statusCode || 500, data?.message || 'Unknown error', data.data);
    }

    return data.data;
  }

  async get<T>(url: string, params?: Record<string, string>): Promise<T> {
    const searchParams = params ? new URLSearchParams(params).toString() : '';
    const endpoint = searchParams ? `${url}?${searchParams}` : url;
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'DELETE' });
  }
}

// Create a singleton instance
export const apiService = new ApiService(process.env.NEXT_PUBLIC_API_URL || '');
