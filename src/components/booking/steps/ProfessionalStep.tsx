
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { TeamMember } from '@/types';

interface ProfessionalStepProps {
  teamMembers: TeamMember[];
  selectedTeamMember: string;
  onTeamMemberChange: (teamMemberId: string) => void;
}

export const ProfessionalStep: React.FC<ProfessionalStepProps> = ({
  teamMembers,
  selectedTeamMember,
  onTeamMemberChange
}) => {
  if (teamMembers.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md">
        <p className="text-muted-foreground">Nenhum profissional disponível.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        Escolha um profissional
      </h2>
      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamMembers.map((member) => (
            <Button
              key={member.id} 
              variant="outline"
              className={`flex justify-between items-center p-4 h-auto ${selectedTeamMember === member.id ? "border-primary bg-primary/5" : ""}`}
              onClick={() => onTeamMemberChange(member.id)}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{member.name}</span>
                {member.position && <span className="text-xs text-muted-foreground">{member.position}</span>}
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
