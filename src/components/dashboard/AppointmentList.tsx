
import React, { useState, useEffect } from 'react';
import { Appointment } from '@/types';
import { useAppointments } from '@/context/AppointmentContext';
import { useToast } from '@/hooks/use-toast';
import AppointmentsByProfessional from './appointments/AppointmentsByProfessional';
import AppointmentEmptyState from './appointments/AppointmentEmptyState';

interface AppointmentListProps {
  appointments: Appointment[];
  onAppointmentCanceled?: (id: string) => void;
  onRefreshNeeded?: () => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ 
  appointments: initialAppointments, 
  onAppointmentCanceled,
  onRefreshNeeded 
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const { cancelAppointment } = useAppointments();
  const { toast } = useToast();
  
  // Handle cancellation of appointments
  const handleCancel = async (id: string) => {
    if (window.confirm('Deseja realmente cancelar este agendamento?')) {
      const success = await cancelAppointment(id);
      if (success) {
        // Update the local state to reflect the cancellation
        const updatedAppointments = appointments.filter(app => app.id !== id);
        setAppointments(updatedAppointments);
        
        // Notify the parent component about the cancellation
        if (onAppointmentCanceled) {
          onAppointmentCanceled(id);
        }
        
        toast({
          title: "Agendamento cancelado",
          description: "O agendamento foi cancelado com sucesso."
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível cancelar o agendamento.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Update appointments when props change
  useEffect(() => {
    setAppointments(initialAppointments);
  }, [initialAppointments]);
  
  if (appointments.length === 0) {
    return <AppointmentEmptyState />;
  }
  
  return (
    <AppointmentsByProfessional
      appointments={appointments}
      onAppointmentCanceled={handleCancel}
      onRefreshNeeded={onRefreshNeeded}
    />
  );
};

export default AppointmentList;
