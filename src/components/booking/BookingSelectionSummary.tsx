
import React from 'react';
import { TeamMember, Service, InsurancePlan } from '@/types';
import { format } from 'date-fns';

interface BookingSelectionSummaryProps {
  selectedTeamMember?: string;
  selectedInsurance?: string;
  selectedService?: string;
  selectedDate?: Date | null;
  teamMembers: TeamMember[];
  services: Service[];
  insurancePlans: InsurancePlan[];
}

export const BookingSelectionSummary: React.FC<BookingSelectionSummaryProps> = ({
  selectedTeamMember,
  selectedInsurance,
  selectedService,
  selectedDate,
  teamMembers,
  services,
  insurancePlans
}) => {
  if (!selectedTeamMember) return null;

  return (
    <div className="mt-6 p-4 bg-accent/30 rounded-md">
      <h3 className="font-medium mb-2">Seleção atual:</h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Profissional:</span>
          <span className="font-medium">
            {teamMembers.find(m => m.id === selectedTeamMember)?.name || ''}
            {teamMembers.find(m => m.id === selectedTeamMember)?.position ? 
              ` - ${teamMembers.find(m => m.id === selectedTeamMember)?.position}` : ''}
          </span>
        </div>
        
        {selectedInsurance && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Convênio:</span>
            <span className="font-medium">
              {selectedInsurance === "none" ? "Particular" : 
               insurancePlans.find(p => p.id === selectedInsurance)?.name || ''}
            </span>
          </div>
        )}
        
        {selectedService && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Serviço:</span>
            <span className="font-medium">
              {services.find(s => s.id === selectedService)?.name || ''}
            </span>
          </div>
        )}
        
        {selectedDate && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Data:</span>
            <span className="font-medium">{format(selectedDate, 'dd/MM/yyyy')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
