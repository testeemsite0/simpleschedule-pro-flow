
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ServiceForm from '@/components/dashboard/ServiceForm';
import userEvent from '@testing-library/user-event';

// Mock the onSave and onCancel functions
const mockOnSave = jest.fn();
const mockOnCancel = jest.fn();

// Create a test service
const testService = {
  id: '1',
  name: 'Test Service',
  description: 'Test Description',
  price: 100,
  duration_minutes: 60,
  active: true,
  professional_id: 'test-pro-id',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
};

describe('ServiceForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form with empty fields when no service is provided', () => {
    render(<ServiceForm service={null} onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    expect(screen.getByLabelText(/Nome do serviço/i)).toHaveValue('');
    expect(screen.getByLabelText(/Descrição/i)).toHaveValue('');
    expect(screen.getByLabelText(/Preço/i)).toHaveValue('0');
    expect(screen.getByLabelText(/Duração/i)).toHaveValue('60');
    expect(screen.getByText(/Disponível para agendamento/i)).toBeInTheDocument();
    expect(screen.getByText(/Criar serviço/i)).toBeInTheDocument();
  });

  test('renders form with service data when service is provided', () => {
    render(<ServiceForm service={testService} onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    expect(screen.getByLabelText(/Nome do serviço/i)).toHaveValue('Test Service');
    expect(screen.getByLabelText(/Descrição/i)).toHaveValue('Test Description');
    expect(screen.getByLabelText(/Preço/i)).toHaveValue('100');
    expect(screen.getByLabelText(/Duração/i)).toHaveValue('60');
    expect(screen.getByText(/Disponível para agendamento/i)).toBeInTheDocument();
    expect(screen.getByText(/Salvar alterações/i)).toBeInTheDocument();
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(<ServiceForm service={null} onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    userEvent.click(screen.getByText(/Cancelar/i));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  test('calls onSave with form data when form is submitted', async () => {
    render(<ServiceForm service={null} onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    // Fill out the form
    userEvent.type(screen.getByLabelText(/Nome do serviço/i), 'New Service');
    userEvent.type(screen.getByLabelText(/Descrição/i), 'New Description');
    
    // Clear and set price
    fireEvent.change(screen.getByLabelText(/Preço/i), { target: { value: '150' } });
    
    // Clear and set duration
    fireEvent.change(screen.getByLabelText(/Duração/i), { target: { value: '45' } });
    
    // Submit form
    userEvent.click(screen.getByText(/Criar serviço/i));
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        name: 'New Service',
        description: 'New Description',
        price: 150,
        duration_minutes: 45,
        active: true
      });
    });
  });

  test('validates required fields', async () => {
    render(<ServiceForm service={null} onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    // Clear the name field which is required
    fireEvent.change(screen.getByLabelText(/Nome do serviço/i), { target: { value: '' } });
    
    // Submit form
    userEvent.click(screen.getByText(/Criar serviço/i));
    
    // The form should not submit
    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  test('updates form when service prop changes', () => {
    const { rerender } = render(
      <ServiceForm service={null} onSave={mockOnSave} onCancel={mockOnCancel} />
    );
    
    // Initially the form should be empty
    expect(screen.getByLabelText(/Nome do serviço/i)).toHaveValue('');
    
    // Rerender with a service
    rerender(
      <ServiceForm service={testService} onSave={mockOnSave} onCancel={mockOnCancel} />
    );
    
    // Now form should have the service data
    expect(screen.getByLabelText(/Nome do serviço/i)).toHaveValue('Test Service');
    expect(screen.getByLabelText(/Descrição/i)).toHaveValue('Test Description');
    expect(screen.getByLabelText(/Preço/i)).toHaveValue('100');
    expect(screen.getByLabelText(/Duração/i)).toHaveValue('60');
  });
});
