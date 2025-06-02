
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseAppointmentsRealtimeProps {
  professionalId: string;
  onAppointmentChange: () => void;
}

export const useAppointmentsRealtime = ({ 
  professionalId, 
  onAppointmentChange 
}: UseAppointmentsRealtimeProps) => {
  
  const handleRealtimeChange = useCallback((payload: any) => {
    console.log('Appointments realtime change:', payload);
    
    // Check if the change is for this professional
    if (payload.new?.professional_id === professionalId || 
        payload.old?.professional_id === professionalId) {
      console.log('Refreshing appointments due to realtime change');
      onAppointmentChange();
    }
  }, [professionalId, onAppointmentChange]);

  useEffect(() => {
    if (!professionalId) return;

    console.log('Setting up realtime subscription for appointments');
    
    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'appointments'
        },
        handleRealtimeChange
      )
      .subscribe();

    return () => {
      console.log('Cleaning up appointments realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [professionalId, handleRealtimeChange]);
};
