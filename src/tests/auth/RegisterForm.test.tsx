
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import RegisterForm from '@/components/auth/RegisterForm';

// Mock dependencies
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    register: vi.fn().mockImplementation((name, email, password, profession) => {
      if (email === 'existing@example.com') {
        return Promise.reject(new Error('User already registered'));
      }
      return Promise.resolve(true);
    })
  })
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <RegisterForm />
      </BrowserRouter>
    );

  it('should render the registration form', () => {
    renderComponent();
    
    expect(screen.getByText('Criar conta')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome completo')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByText('Selecione sua profissão')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    renderComponent();
    
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
    
    await waitFor(() => {
      expect(screen.getByText('Nome deve ter pelo menos 2 caracteres')).toBeInTheDocument();
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
      expect(screen.getByText('Selecione sua profissão')).toBeInTheDocument();
      expect(screen.getByText('Senha deve ter pelo menos 6 caracteres')).toBeInTheDocument();
    });
  });

  it('should validate password confirmation', async () => {
    renderComponent();
    
    await userEvent.type(screen.getByLabelText('Nome completo'), 'John Doe');
    await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
    await userEvent.click(screen.getByText('Selecione sua profissão'));
    await userEvent.click(screen.getByText('Psicólogo(a)'));
    await userEvent.type(screen.getByLabelText('Senha'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirmar senha'), 'password456');
    
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
    
    await waitFor(() => {
      expect(screen.getByText('As senhas não conferem')).toBeInTheDocument();
    });
  });

  it('should submit the form with valid data', async () => {
    const { useAuth } = await import('@/context/AuthContext');
    const mockRegister = vi.fn().mockResolvedValue(true);
    vi.mocked(useAuth).mockReturnValue({
      ...vi.mocked(useAuth)(),
      register: mockRegister
    });

    renderComponent();
    
    await userEvent.type(screen.getByLabelText('Nome completo'), 'John Doe');
    await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
    await userEvent.click(screen.getByText('Selecione sua profissão'));
    await userEvent.click(screen.getByText('Psicólogo(a)'));
    await userEvent.type(screen.getByLabelText('Senha'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirmar senha'), 'password123');
    
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'John Doe', 
        'john@example.com', 
        'password123', 
        'psicologo'
      );
    });
  });
});
