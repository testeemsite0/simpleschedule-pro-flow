
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeamMember } from '@/types';

interface TeamMemberSelectorProps {
  teamMembers: TeamMember[];
  selectedTeamMember: string;
  setSelectedTeamMember: (value: string) => void;
  selectedTeamMembers: Record<string, boolean>;
  handleTeamMemberToggle: (memberId: string) => void;
  batchMode: boolean;
}

const TeamMemberSelector: React.FC<TeamMemberSelectorProps> = ({
  teamMembers,
  selectedTeamMember,
  setSelectedTeamMember,
  selectedTeamMembers,
  handleTeamMemberToggle,
  batchMode
}) => {
  if (teamMembers.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Profissionais</Label>
        <p className="text-sm text-muted-foreground">Nenhum profissional cadastrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>
        Profissionais <span className="text-destructive">*</span>
      </Label>
      
      {batchMode ? (
        <div className="space-y-2">
          <div className="max-h-[150px] overflow-y-auto border rounded-md p-4">
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`member-${member.id}`}
                    checked={selectedTeamMembers[member.id] || false}
                    onCheckedChange={() => handleTeamMemberToggle(member.id)}
                  />
                  <Label 
                    htmlFor={`member-${member.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {member.name} {member.position ? `- ${member.position}` : ''}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Selecione os profissionais que irão atender nestes horários.
          </p>
        </div>
      ) : (
        <Select
          value={selectedTeamMember}
          onValueChange={setSelectedTeamMember}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um profissional" />
          </SelectTrigger>
          <SelectContent>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name} {member.position ? `- ${member.position}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default TeamMemberSelector;
