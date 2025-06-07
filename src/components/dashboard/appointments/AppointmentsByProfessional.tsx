
import React, { useState, useEffect } from 'react';
import { Appointment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, User } from 'lucide-react';
import AppointmentCard from './AppointmentCard';
import { supabase } from '@/integrations/supabase/client';

interface AppointmentsByProfessionalProps {
  appointments: Appointment[];
  onAppointmentCanceled?: (id: string) => void;
  onRefreshNeeded?: () => void;
}

interface ProfessionalGroup {
  professionalId: string;
  professionalName: string;
  appointments: Appointment[];
}

const AppointmentsByProfessional: React.FC<AppointmentsByProfessionalProps> = ({
  appointments,
  onAppointmentCanceled,
  onRefreshNeeded
}) => {
  const [professionalGroups, setProfessionalGroups] = useState<ProfessionalGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [teamMembers, setTeamMembers] = useState<Record<string, string>>({});
  const [insurancePlans, setInsurancePlans] = useState<Record<string, string>>({});

  useEffect(() => {
    groupAppointmentsByProfessional();
  }, [appointments]);

  useEffect(() => {
    fetchAdditionalData();
  }, [appointments]);

  const fetchAdditionalData = async () => {
    if (appointments.length === 0) return;

    try {
      // Fetch team members
      const teamMemberIds = [...new Set(appointments.map(a => a.team_member_id).filter(Boolean))];
      if (teamMemberIds.length > 0) {
        const { data: teamMembersData } = await supabase
          .from('team_members')
          .select('id, name')
          .in('id', teamMemberIds);

        if (teamMembersData) {
          const teamMembersMap = teamMembersData.reduce((acc, tm) => {
            acc[tm.id] = tm.name;
            return acc;
          }, {} as Record<string, string>);
          setTeamMembers(teamMembersMap);
        }
      }

      // Fetch insurance plans
      const insuranceIds = [...new Set(appointments.map(a => a.insurance_plan_id).filter(Boolean))];
      if (insuranceIds.length > 0) {
        const { data: insuranceData } = await supabase
          .from('insurance_plans')
          .select('id, name')
          .in('id', insuranceIds);

        if (insuranceData) {
          const insuranceMap = insuranceData.reduce((acc, ip) => {
            acc[ip.id] = ip.name;
            return acc;
          }, {} as Record<string, string>);
          setInsurancePlans(insuranceMap);
        }
      }
    } catch (error) {
      console.error('Error fetching additional data:', error);
    }
  };

  const groupAppointmentsByProfessional = async () => {
    if (appointments.length === 0) {
      setProfessionalGroups([]);
      return;
    }

    try {
      // Get unique professional IDs
      const professionalIds = [...new Set(appointments.map(a => a.professional_id))];

      // Fetch professional names
      const { data: professionals } = await supabase
        .from('profiles')
        .select('id, name, display_name')
        .in('id', professionalIds);

      const professionalNames = professionals?.reduce((acc, p) => {
        acc[p.id] = p.display_name || p.name;
        return acc;
      }, {} as Record<string, string>) || {};

      // Group appointments by professional
      const grouped = professionalIds.map(professionalId => {
        const professionalAppointments = appointments.filter(
          a => a.professional_id === professionalId
        );

        return {
          professionalId,
          professionalName: professionalNames[professionalId] || 'Profissional não encontrado',
          appointments: professionalAppointments
        };
      });

      // Sort by professional name
      grouped.sort((a, b) => a.professionalName.localeCompare(b.professionalName));

      setProfessionalGroups(grouped);

      // Expand all groups by default if there are few appointments
      if (appointments.length <= 10) {
        setExpandedGroups(new Set(professionalIds));
      }
    } catch (error) {
      console.error('Error grouping appointments:', error);
    }
  };

  const toggleGroup = (professionalId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(professionalId)) {
      newExpanded.delete(professionalId);
    } else {
      newExpanded.add(professionalId);
    }
    setExpandedGroups(newExpanded);
  };

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {professionalGroups.map(group => (
        <Card key={group.professionalId}>
          <Collapsible
            open={expandedGroups.has(group.professionalId)}
            onOpenChange={() => toggleGroup(group.professionalId)}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span>{group.professionalName}</span>
                    <span className="text-sm text-muted-foreground">
                      ({group.appointments.length} agendamento{group.appointments.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                  {expandedGroups.has(group.professionalId) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {group.appointments.map(appointment => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      teamMemberName={appointment.team_member_id ? teamMembers[appointment.team_member_id] : undefined}
                      insurancePlanName={appointment.insurance_plan_id ? insurancePlans[appointment.insurance_plan_id] : undefined}
                      onCancel={onAppointmentCanceled}
                      onStatusChange={onRefreshNeeded}
                    />
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
    </div>
  );
};

export default AppointmentsByProfessional;
