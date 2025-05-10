
import React from 'react';
import { ProfessionalStep } from '../steps/ProfessionalStep';
import { TeamMember } from '@/types';

interface TeamMemberStepContentProps {
  teamMembers: TeamMember[];
  selectedTeamMember: string;
  onTeamMemberChange: (teamMemberId: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export const TeamMemberStepContent: React.FC<TeamMemberStepContentProps> = ({
  teamMembers,
  selectedTeamMember,
  onTeamMemberChange,
  isLoading,
  onRefresh
}) => {
  return (
    <ProfessionalStep
      teamMembers={teamMembers}
      selectedTeamMember={selectedTeamMember}
      onTeamMemberChange={onTeamMemberChange}
      isLoading={isLoading}
      onRefresh={onRefresh}
    />
  );
};
