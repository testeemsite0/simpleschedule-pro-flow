
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Hook para buscar múltiplos tipos de dados relacionados em uma única chamada
export const useOptimizedQueries = (professionalId: string | undefined) => {
  const [data, setData] = useState<{
    teamMembers: any[];
    services: any[];
    insurancePlans: any[];
    timeSlots: any[];
    appointments: any[];
    isLoading: boolean;
    error: string | null;
  }>({
    teamMembers: [],
    services: [],
    insurancePlans: [],
    timeSlots: [],
    appointments: [],
    isLoading: true,
    error: null
  });

  const { toast } = useToast();

  const fetchAllData = useCallback(async () => {
    if (!professionalId) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      // Fazer todas as consultas em paralelo para melhor performance
      const [
        teamMembersResponse,
        servicesResponse,
        insurancePlansResponse,
        timeSlotsResponse,
        appointmentsResponse
      ] = await Promise.all([
        // Busca membros da equipe
        supabase
          .from('team_members')
          .select('*')
          .eq('professional_id', professionalId)
          .eq('active', true),

        // Busca serviços
        supabase
          .from('services')
          .select('*')
          .eq('professional_id', professionalId)
          .eq('active', true),

        // Busca planos de seguro
        supabase
          .from('insurance_plans')
          .select('*')
          .eq('professional_id', professionalId),

        // Busca slots de tempo
        supabase
          .from('time_slots')
          .select('*')
          .eq('professional_id', professionalId),

        // Busca agendamentos
        supabase
          .from('appointments')
          .select('*')
          .eq('professional_id', professionalId)
          .order('date', { ascending: true })
      ]);

      // Verifica erros em cada resposta
      const errors = [
        teamMembersResponse.error,
        servicesResponse.error,
        insurancePlansResponse.error,
        timeSlotsResponse.error,
        appointmentsResponse.error
      ].filter(Boolean);

      if (errors.length > 0) {
        console.error("Errors fetching data:", errors);
        throw new Error("Falha ao buscar dados necessários");
      }

      // Atualiza o estado com todos os dados
      setData({
        teamMembers: teamMembersResponse.data || [],
        services: servicesResponse.data || [],
        insurancePlans: insurancePlansResponse.data || [],
        timeSlots: timeSlotsResponse.data || [],
        appointments: appointmentsResponse.data || [],
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error("Error in useOptimizedQueries:", error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Erro desconhecido"
      }));

      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível buscar as informações necessárias",
        variant: "destructive"
      });
    }
  }, [professionalId, toast]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const refetch = useCallback(() => {
    setData(prev => ({ ...prev, isLoading: true }));
    fetchAllData();
  }, [fetchAllData]);

  return {
    ...data,
    refetch
  };
};
