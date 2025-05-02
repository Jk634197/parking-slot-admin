import {
  signInCredentialsSchema,
  signInResponseSchema,
  type SignInCredentials,
  type SignInResponse,
  type User,
  type VerifyOtpResponse,
} from '@/schemas/user';

import { apiService } from './api-service';
import { authClient } from './auth/client';

class AuthService {
  private readonly AUTH_TOKEN_KEY = 'auth-token';
  private readonly USER_KEY = 'user';

  validatePhone(phone: string): boolean {
    return signInCredentialsSchema.shape.phone.safeParse(phone).success;
  }

  async signIn(credentials: SignInCredentials): Promise<SignInResponse> {
    if (!this.validatePhone(credentials.phone)) {
      throw new Error('Invalid phone number format. Please use E.164 format (e.g., +1234567890)');
    }

    const { error } = await authClient.signInWithPhone({ phone: credentials.phone });

    if (error && typeof error === 'string') {
      throw new Error(error);
    }

    // Get the user data after successful sign in
    const { data: user, error: userError } = await authClient.getUser();

    if (userError && typeof userError === 'string') {
      throw new Error(userError);
    }

    if (!user) {
      throw new Error('Failed to get user data');
    }

    // Create a new user with the phone number
    const newUser: User = {
      id: 1, // This should come from the backend
      firstName: 'User',
      lastName: '',
      phone: credentials.phone,
      email: '',
      createdOn: new Date(),
      createdBy: 0,
      isActive: true,
      isArchived: false,
      userId: 1, // This should match the id for now
    };

    // Store the user data
    this.setAuthData(localStorage.getItem('custom-auth-token') || '', newUser);

    return {
      token: localStorage.getItem('custom-auth-token') || '',
      user: newUser,
    };
  }

  async verifyOtp(phone: string, otp: string): Promise<VerifyOtpResponse> {
    const _response = await apiService.post<VerifyOtpResponse>('/Auth/login', {
      phone,
      otp,
    });
    this.setAuthData(_response?.token || '', _response);
    return _response;
  }

  async signOut(): Promise<void> {
    const { error } = await authClient.signOut();
    if (error && typeof error === 'string') {
      throw new Error(error);
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('custom-auth-token');
  }

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      const parsedUser = JSON.parse(userStr) as unknown;
      const result = signInResponseSchema.shape.user.safeParse(parsedUser);
      return result.success ? result.data : null;
    } catch {
      return null;
    }
  }

  private setAuthData(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('custom-auth-token', token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }
}

export const authService = new AuthService();
