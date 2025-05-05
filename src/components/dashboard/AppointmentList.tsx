
import React, { useCallback, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment, TeamMember, InsurancePlan } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppointments } from '@/context/AppointmentContext';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AppointmentListProps {
  appointments: Appointment[];
  onAppointmentCanceled?: (id: string) => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ appointments: initialAppointments, onAppointmentCanceled }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [teamMembers, setTeamMembers] = useState<Record<string, string>>({});
  const [insurancePlans, setInsurancePlans] = useState<Record<string, string>>({});
  const { cancelAppointment } = useAppointments();
  const { toast } = useToast();
  
  // Carregar dados de membros da equipe e planos de saúde uma vez
  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        // Coletar IDs únicos para buscar
        const teamMemberIds = Array.from(new Set(
          appointments
            .filter(app => app.team_member_id)
            .map(app => app.team_member_id as string)
        ));
        
        const insurancePlanIds = Array.from(new Set(
          appointments
            .filter(app => app.insurance_plan_id)
            .map(app => app.insurance_plan_id as string)
        ));
        
        // Buscar membros da equipe se houver IDs
        if (teamMemberIds.length > 0) {
          const { data: teamMembersData } = await supabase
            .from('team_members')
            .select('id, name')
            .in('id', teamMemberIds);
            
          if (teamMembersData) {
            const membersMap: Record<string, string> = {};
            teamMembersData.forEach(member => {
              membersMap[member.id] = member.name;
            });
            setTeamMembers(membersMap);
          }
        }
        
        // Buscar planos de saúde se houver IDs
        if (insurancePlanIds.length > 0) {
          const { data: plansData } = await supabase
            .from('insurance_plans')
            .select('id, name')
            .in('id', insurancePlanIds);
            
          if (plansData) {
            const plansMap: Record<string, string> = {};
            plansData.forEach(plan => {
              plansMap[plan.id] = plan.name;
            });
            setInsurancePlans(plansMap);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados adicionais:', error);
      }
    };
    
    fetchAdditionalData();
  }, [appointments]);
  
  const handleCancel = useCallback(async (id: string) => {
    if (window.confirm('Deseja realmente cancelar este agendamento?')) {
      const success = await cancelAppointment(id);
      if (success) {
        // Atualizar o estado local para refletir o cancelamento
        const updatedAppointments = appointments.filter(app => app.id !== id);
        setAppointments(updatedAppointments);
        
        // Notificar o componente pai sobre o cancelamento
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
  }, [cancelAppointment, toast, onAppointmentCanceled, appointments]);
  
  // Atualizando os appointments quando as props mudarem
  useEffect(() => {
    setAppointments(initialAppointments);
  }, [initialAppointments]);
  
  if (appointments.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Nenhum agendamento encontrado.</p>
      </Card>
    );
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'completed':
        return 'Concluído';
      case 'canceled':
        return 'Cancelado';
      default:
        return status;
    }
  };
  
  return (
    <div className="space-y-4">
      {appointments.map((appointment) => {
        const appointmentDate = new Date(appointment.date);
        const formattedDate = format(appointmentDate, "dd 'de' MMMM, yyyy", { locale: ptBR });
        
        return (
          <Card key={appointment.id} className="p-4">
            <div className="flex flex-col sm:flex-row justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <h3 className="font-medium mr-3">{appointment.client_name}</h3>
                  <Badge variant="outline" className={getStatusColor(appointment.status)}>
                    {getStatusText(appointment.status)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {formattedDate} • {appointment.start_time} - {appointment.end_time}
                </p>
                <p className="text-sm text-gray-600 mt-1">{appointment.client_email}</p>
                {appointment.client_phone && (
                  <p className="text-sm text-gray-600">{appointment.client_phone}</p>
                )}
                
                {/* Informações adicionais: membro da equipe e convênio */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {appointment.team_member_id && teamMembers[appointment.team_member_id] && (
                    <Badge variant="secondary" className="text-xs font-normal">
                      Profissional: {teamMembers[appointment.team_member_id]}
                    </Badge>
                  )}
                  
                  {appointment.insurance_plan_id && insurancePlans[appointment.insurance_plan_id] ? (
                    <Badge variant="secondary" className="text-xs font-normal">
                      Convênio: {insurancePlans[appointment.insurance_plan_id]}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs font-normal">
                      Particular
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="mt-3 sm:mt-0">
                {appointment.status === 'scheduled' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCancel(appointment.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
            
            {appointment.notes && (
              <div className="mt-3 text-sm border-t pt-2">
                <span className="font-medium">Notas: </span>
                {appointment.notes}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default AppointmentList;
