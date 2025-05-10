
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn().mockReturnValue({ data: { session: null } }),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn().mockReturnValue({ 
        data: { subscription: { unsubscribe: vi.fn() } }
      })
    }
  }
}));

// Mock services
vi.mock('@/services/profileService', () => ({
  fetchUserProfile: vi.fn(),
  createUserProfile: vi.fn()
}));

// Test component that uses auth context
const TestComponent = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide initial auth state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('should update auth state when session changes', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const { fetchUserProfile } = await import('@/services/profileService');
    
    // Mock auth state change
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      // Simulate auth state change
      setTimeout(() => {
        callback('SIGNED_IN', { 
          user: { id: '123', email: 'test@example.com' } 
        });
      }, 0);
      
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    // Mock profile fetch
    vi.mocked(fetchUserProfile).mockResolvedValue({
      id: '123', 
      name: 'Test User', 
      email: 'test@example.com',
      profession: 'Developer',
      slug: 'test-user'
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially not authenticated
    expect(screen.getByTestId('authenticated').textContent).toBe('false');

    // Wait for auth state to change
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });
    
    // Check profile is loaded
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).not.toBe('null');
      expect(screen.getByTestId('user').textContent).toContain('Test User');
    });
  });
});
