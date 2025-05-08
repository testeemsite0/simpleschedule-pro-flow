
import { renderHook, act } from '@testing-library/react-hooks';
import { useServiceManagement } from '@/hooks/services/useServiceManagement';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

// Mock dependencies
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    then: jest.fn().mockImplementation((callback) => callback({ data: [], error: null })),
  },
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn().mockReturnValue({
    toast: jest.fn(),
  }),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { id: 'test-user-id' },
  }),
}));

// Mock window.confirm
global.confirm = jest.fn();

describe('useServiceManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should fetch services on mount', async () => {
    const mockServices = [
      { 
        id: '1', 
        name: 'Service 1', 
        price: 100, 
        duration_minutes: 60, 
        active: true,
        description: 'Test service',
        professional_id: 'test-user-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];
    
    supabase.from().select().eq().order().then = jest.fn().mockImplementation((callback) => 
      callback({ data: mockServices, error: null })
    );

    const { result, waitForNextUpdate } = renderHook(() => useServiceManagement());

    // Wait for the useEffect to run
    await waitForNextUpdate();

    expect(supabase.from).toHaveBeenCalledWith('services');
    expect(result.current.services).toEqual(mockServices);
    expect(result.current.loading).toBe(false);
  });

  test('should handle error when fetching services', async () => {
    const mockError = { message: 'Error fetching services' };
    supabase.from().select().eq().order().then = jest.fn().mockImplementation((callback) => 
      callback({ data: null, error: mockError })
    );

    const { result, waitForNextUpdate } = renderHook(() => useServiceManagement());

    // Wait for the useEffect to run
    await waitForNextUpdate();

    expect(supabase.from).toHaveBeenCalledWith('services');
    expect(result.current.loading).toBe(false);
    expect(useToast().toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Erro',
      variant: 'destructive',
    }));
  });

  test('should create a new service', async () => {
    const mockServiceData = { 
      name: 'New Service', 
      price: 150, 
      duration_minutes: 30, 
      active: true,
      description: 'New test service',
    };

    supabase.from().insert().then = jest.fn().mockImplementation((callback) => 
      callback({ data: null, error: null })
    );

    const { result } = renderHook(() => useServiceManagement());

    // Mock fetchServices implementation for the create operation
    result.current.fetchServices = jest.fn();

    act(() => {
      result.current.handleSaveService(mockServiceData);
    });

    expect(supabase.from).toHaveBeenCalledWith('services');
    expect(supabase.from().insert).toHaveBeenCalledWith([{
      ...mockServiceData,
      professional_id: 'test-user-id',
    }]);
    expect(useToast().toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Sucesso',
      description: 'Serviço criado com sucesso',
    }));
    expect(result.current.fetchServices).toHaveBeenCalled();
  });

  test('should update an existing service', async () => {
    const mockEditingService = { 
      id: '1', 
      name: 'Service 1', 
      price: 100, 
      duration_minutes: 60, 
      active: true,
      description: 'Test service',
      professional_id: 'test-user-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const mockUpdatedData = { 
      name: 'Updated Service', 
      price: 120, 
      duration_minutes: 45, 
      active: true,
      description: 'Updated test service',
    };

    supabase.from().update().eq().then = jest.fn().mockImplementation((callback) => 
      callback({ data: null, error: null })
    );

    const { result } = renderHook(() => useServiceManagement());
    
    // Set editing service
    act(() => {
      result.current.setEditingService(mockEditingService);
    });

    // Mock fetchServices implementation for the update operation
    result.current.fetchServices = jest.fn();

    act(() => {
      result.current.handleSaveService(mockUpdatedData);
    });

    expect(supabase.from).toHaveBeenCalledWith('services');
    expect(supabase.from().update).toHaveBeenCalledWith({
      name: mockUpdatedData.name,
      description: mockUpdatedData.description,
      price: mockUpdatedData.price,
      duration_minutes: mockUpdatedData.duration_minutes,
      active: mockUpdatedData.active,
    });
    expect(supabase.from().update().eq).toHaveBeenCalledWith('id', mockEditingService.id);
    expect(useToast().toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Sucesso',
      description: 'Serviço atualizado com sucesso',
    }));
    expect(result.current.fetchServices).toHaveBeenCalled();
  });

  test('should toggle service active status', async () => {
    const mockService = { 
      id: '1', 
      name: 'Service 1', 
      price: 100, 
      duration_minutes: 60, 
      active: true,
      description: 'Test service',
      professional_id: 'test-user-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    supabase.from().update().eq().then = jest.fn().mockImplementation((callback) => 
      callback({ data: null, error: null })
    );

    const { result } = renderHook(() => useServiceManagement());
    
    // Mock services state
    act(() => {
      result.current.services = [mockService];
    });

    act(() => {
      result.current.handleToggleActive(mockService);
    });

    expect(supabase.from).toHaveBeenCalledWith('services');
    expect(supabase.from().update).toHaveBeenCalledWith({ active: !mockService.active });
    expect(supabase.from().update().eq).toHaveBeenCalledWith('id', mockService.id);
    expect(useToast().toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Sucesso',
    }));
  });

  test('should not delete service if user cancels confirmation', async () => {
    (global.confirm as jest.Mock).mockReturnValue(false);
    
    const { result } = renderHook(() => useServiceManagement());

    act(() => {
      result.current.handleDeleteService('1');
    });

    expect(global.confirm).toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalledWith('appointments');
  });

  test('should not delete service if it has appointments', async () => {
    (global.confirm as jest.Mock).mockReturnValue(true);
    
    const mockAppointments = [{ id: 'appointment-1' }];
    supabase.from().select().eq().limit().then = jest.fn()
      .mockImplementationOnce((callback) => callback({ data: mockAppointments, error: null }));

    const { result } = renderHook(() => useServiceManagement());

    act(() => {
      result.current.handleDeleteService('1');
    });

    expect(global.confirm).toHaveBeenCalled();
    expect(supabase.from).toHaveBeenNthCalledWith(1, 'appointments');
    expect(useToast().toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Não é possível excluir',
      variant: 'destructive',
    }));
  });

  test('should not delete service if it has team member associations', async () => {
    (global.confirm as jest.Mock).mockReturnValue(true);
    
    // No appointments for this service
    supabase.from().select().eq().limit().then = jest.fn()
      .mockImplementationOnce((callback) => callback({ data: [], error: null }))
      // But there are team_member_services entries
      .mockImplementationOnce((callback) => callback({ data: [{ id: 'team-service-1' }], error: null }));

    const { result } = renderHook(() => useServiceManagement());

    act(() => {
      result.current.handleDeleteService('1');
    });

    expect(global.confirm).toHaveBeenCalled();
    expect(supabase.from).toHaveBeenNthCalledWith(1, 'appointments');
    expect(supabase.from).toHaveBeenNthCalledWith(3, 'team_member_services');
    expect(useToast().toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Não é possível excluir',
      variant: 'destructive',
    }));
  });

  test('should delete service if it has no dependencies', async () => {
    (global.confirm as jest.Mock).mockReturnValue(true);
    
    // No appointments or team member services
    supabase.from().select().eq().limit().then = jest.fn()
      .mockImplementationOnce((callback) => callback({ data: [], error: null }))
      .mockImplementationOnce((callback) => callback({ data: [], error: null }));
      
    // Delete operation
    supabase.from().delete().eq().then = jest.fn()
      .mockImplementation((callback) => callback({ error: null }));

    const mockServices = [
      { id: '1', name: 'Service to delete' },
      { id: '2', name: 'Other service' }
    ];
    
    const { result } = renderHook(() => useServiceManagement());
    
    // Mock services state
    act(() => {
      result.current.services = mockServices;
    });

    act(() => {
      result.current.handleDeleteService('1');
    });

    expect(global.confirm).toHaveBeenCalled();
    expect(supabase.from).toHaveBeenCalledWith('services');
    expect(supabase.from().delete).toHaveBeenCalled();
    expect(useToast().toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Sucesso',
      description: 'Serviço excluído com sucesso',
    }));
  });
});
