
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ServiceList } from '@/components/dashboard/services/ServiceList';
import { Service } from '@/types';

// Mock functions
const mockOnEdit = jest.fn();
const mockOnDelete = jest.fn();
const mockOnToggleActive = jest.fn();
const mockOpenAddServiceDialog = jest.fn();

// Mock data
const mockServices: Service[] = [
  {
    id: '1',
    name: 'Service 1',
    description: 'Description 1',
    price: 100,
    duration_minutes: 60,
    active: true,
    professional_id: 'pro-1',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Service 2',
    description: 'Description 2',
    price: 150,
    duration_minutes: 30,
    active: false,
    professional_id: 'pro-1',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }
];

describe('ServiceList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state', () => {
    render(
      <ServiceList
        services={[]}
        loading={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
        openAddServiceDialog={mockOpenAddServiceDialog}
      />
    );
    
    expect(screen.getByText(/Carregando serviços/i)).toBeInTheDocument();
  });

  test('renders empty state', () => {
    render(
      <ServiceList
        services={[]}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
        openAddServiceDialog={mockOpenAddServiceDialog}
      />
    );
    
    expect(screen.getByText(/Você não tem serviços cadastrados/i)).toBeInTheDocument();
    expect(screen.getByText(/Adicionar Serviço/i)).toBeInTheDocument();
  });

  test('renders service list when services are provided', () => {
    render(
      <ServiceList
        services={mockServices}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
        openAddServiceDialog={mockOpenAddServiceDialog}
      />
    );
    
    expect(screen.getByText('Service 1')).toBeInTheDocument();
    expect(screen.getByText('Service 2')).toBeInTheDocument();
    expect(screen.getByText('R$ 100,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 150,00')).toBeInTheDocument();
    expect(screen.getByText('60min')).toBeInTheDocument();
    expect(screen.getByText('30min')).toBeInTheDocument();
  });

  test('calls onEdit when edit button is clicked', () => {
    render(
      <ServiceList
        services={mockServices}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
        openAddServiceDialog={mockOpenAddServiceDialog}
      />
    );
    
    // Find all edit buttons and click the first one
    const editButtons = screen.getAllByTitle(/Editar/i);
    fireEvent.click(editButtons[0]);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockServices[0]);
  });

  test('calls onDelete when delete button is clicked', () => {
    render(
      <ServiceList
        services={mockServices}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
        openAddServiceDialog={mockOpenAddServiceDialog}
      />
    );
    
    // Find all delete buttons and click the first one
    const deleteButtons = screen.getAllByTitle(/Excluir/i);
    fireEvent.click(deleteButtons[0]);
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockServices[0].id);
  });

  test('calls onToggleActive when toggle is clicked', () => {
    render(
      <ServiceList
        services={mockServices}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
        openAddServiceDialog={mockOpenAddServiceDialog}
      />
    );
    
    // Find all switch elements and click the first one
    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]);
    
    expect(mockOnToggleActive).toHaveBeenCalledWith(mockServices[0]);
  });

  test('calls openAddServiceDialog when add button is clicked in empty state', () => {
    render(
      <ServiceList
        services={[]}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
        openAddServiceDialog={mockOpenAddServiceDialog}
      />
    );
    
    // Find the add service button and click it
    const addButton = screen.getByText(/Adicionar Serviço/i);
    fireEvent.click(addButton);
    
    expect(mockOpenAddServiceDialog).toHaveBeenCalled();
  });
});
