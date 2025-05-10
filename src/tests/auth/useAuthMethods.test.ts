
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthMethods, validateEmail } from '@/hooks/useAuthMethods';
import { renderHook, act } from '@testing-library/react-hooks';
import { AuthError, Session, User } from '@supabase/supabase-js';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn()
    }
  }
}));

describe('useAuthMethods', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('test.name@domain.co.uk')).toBe(true);
    });

    it('should invalidate incorrect email addresses', () => {
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('test')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@example')).toBe(false);
    });
  });

  describe('login', () => {
    it('should call supabase signInWithPassword with credentials', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Create mock user and session
      const mockUser: User = {
        id: '123',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        confirmed_at: null,
        last_sign_in_at: null,
        role: null,
        updated_at: null,
        phone: null,
        factors: null,
        identities: null,
        email: 'test@example.com'
      };
      
      const mockSession: Session = {
        user: mockUser,
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        expires_at: 9999999999,
        token_type: 'bearer',
        provider_token: null,
        provider_refresh_token: null
      };
      
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      const { result } = renderHook(() => useAuthMethods());
      
      await act(async () => {
        const success = await result.current.login('test@example.com', 'password');
        expect(success).toBe(true);
      });
      
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      });
    });

    it('should return false when login fails', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const mockAuthError: AuthError = {
        message: 'Invalid login credentials',
        name: 'AuthError',
        status: 400,
        __isAuthError: true
      } as AuthError;
      
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockAuthError
      });

      const { result } = renderHook(() => useAuthMethods());
      
      await act(async () => {
        const success = await result.current.login('test@example.com', 'wrong-password');
        expect(success).toBe(false);
      });
    });
  });

  describe('register', () => {
    it('should validate email before registration', async () => {
      const { result } = renderHook(() => useAuthMethods());
      
      await expect(
        act(async () => {
          await result.current.register('Test User', 'invalid-email', 'password', 'Developer');
        })
      ).rejects.toThrow('O endereço de email fornecido não é válido');
    });

    it('should call supabase signUp with user data', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Create mock user
      const mockUser: User = {
        id: '123',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        confirmed_at: null,
        last_sign_in_at: null,
        role: null,
        updated_at: null,
        phone: null,
        factors: null,
        identities: null,
        email: 'test@example.com'
      };
      
      const mockSession: Session = {
        user: mockUser,
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        expires_at: 9999999999,
        token_type: 'bearer',
        provider_token: null,
        provider_refresh_token: null
      };
      
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      const { result } = renderHook(() => useAuthMethods());
      
      await act(async () => {
        const success = await result.current.register(
          'Test User', 
          'test@example.com', 
          'password', 
          'Developer'
        );
        expect(success).toBe(true);
      });
      
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        options: {
          data: {
            name: 'Test User',
            profession: 'Developer',
            slug: 'test-user'
          }
        }
      });
    });
  });

  describe('logout', () => {
    it('should call supabase signOut', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { result } = renderHook(() => useAuthMethods());
      
      await act(async () => {
        await result.current.logout();
      });
      
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });
});
