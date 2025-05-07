
import React from 'react';
import { TeamMember } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface TeamMemberHeaderProps {
  teamMember: TeamMember;
  onGoBack: () => void;
}

const TeamMemberHeader: React.FC<TeamMemberHeaderProps> = ({ teamMember, onGoBack }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={onGoBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{teamMember.name}</h2>
        {teamMember.position && (
          <p className="text-muted-foreground">{teamMember.position}</p>
        )}
      </div>
    </div>
  );
};

export default TeamMemberHeader;
