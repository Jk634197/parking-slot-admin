interface LoginResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    userId: number;
    local: string;
    timeZone: string;
    token: string;
    refreshToken: string;
  };
}

interface AuthState {
  userId: number;
  local: string;
  timeZone: string;
  token: string;
  refreshToken: string;
}

const AUTH_STORAGE_KEY = 'auth_state';

export const authService = {
  async login(otp: string): Promise<LoginResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ otp }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = (await response.json()) as LoginResponse;
    this.setAuthState(data.data);
    return data;
  },

  setAuthState(state: AuthState): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  },

  getAuthState(): AuthState | null {
    const state = localStorage.getItem(AUTH_STORAGE_KEY);
    return state ? (JSON.parse(state) as AuthState) : null;
  },

  getToken(): string | null {
    const state = this.getAuthState();
    return state?.token || null;
  },

  clearAuthState(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },
};
