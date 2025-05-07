
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TeamMember, Service, InsurancePlan } from '@/types';

interface BookingSelectionSummaryProps {
  selectedTeamMember: string;
  selectedService: string;
  selectedInsurance: string;
  selectedDate: Date | null;
  teamMembers: TeamMember[];
  services: Service[];
  insurancePlans: InsurancePlan[];
}

export const BookingSelectionSummary: React.FC<BookingSelectionSummaryProps> = ({
  selectedTeamMember,
  selectedService,
  selectedInsurance,
  selectedDate,
  teamMembers,
  services,
  insurancePlans
}) => {
  // Find the selected team member, service and insurance objects
  const teamMember = teamMembers.find(m => m.id === selectedTeamMember);
  const service = services.find(s => s.id === selectedService);
  const insurance = insurancePlans.find(p => p.id === selectedInsurance);
  
  if (!teamMember) return null;
  
  return (
    <div className="mt-6 p-4 bg-accent/30 rounded-md">
      <h3 className="font-medium mb-2">Seleção atual:</h3>
      <div className="space-y-1 text-sm">
        {teamMember && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Profissional:</span>
            <span className="font-medium">
              {teamMember.name}
              {teamMember.position ? ` - ${teamMember.position}` : ''}
            </span>
          </div>
        )}
        
        {service && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Serviço:</span>
            <span className="font-medium">
              {service.name}
            </span>
          </div>
        )}
        
        {selectedInsurance && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Convênio:</span>
            <span className="font-medium">
              {selectedInsurance === "none" 
                ? "Particular" 
                : insurance?.name || ""}
            </span>
          </div>
        )}
        
        {selectedDate && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Data:</span>
            <span className="font-medium">
              {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
