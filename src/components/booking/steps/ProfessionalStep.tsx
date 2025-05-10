
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { TeamMember } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfessionalStepProps {
  teamMembers: TeamMember[];
  selectedTeamMember: string;
  onTeamMemberChange: (teamMemberId: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const ProfessionalStep: React.FC<ProfessionalStepProps> = ({
  teamMembers,
  selectedTeamMember,
  onTeamMemberChange,
  isLoading = false,
  onRefresh
}) => {
  // Enhanced debug information
  useEffect(() => {
    console.log("ProfessionalStep mounted with data:", { 
      teamMembersCount: teamMembers?.length || 0,
      teamMembersData: teamMembers,
      selectedTeamMember,
      isLoading
    });
    
    if (!teamMembers || teamMembers.length === 0) {
      console.warn("ProfessionalStep: No team members available");
    }
    
    return () => {
      console.log("ProfessionalStep unmounted");
    };
  }, [teamMembers, selectedTeamMember, isLoading]);
  
  const handleRefresh = () => {
    console.log("ProfessionalStep: Refresh button clicked");
    if (onRefresh) {
      onRefresh();
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">
          Escolha um profissional
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground">Carregando profissionais...</p>
      </div>
    );
  }
  
  // Improved error handling for missing or empty team members
  if (!teamMembers || !Array.isArray(teamMembers) || teamMembers.length === 0) {
    console.warn("ProfessionalStep: No team members available:", teamMembers);
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Escolha um profissional
          </h2>
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          )}
        </div>
        
        <Alert className="bg-amber-50 border-amber-300">
          <Info className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-800">
            Não há profissionais disponíveis para agendamento. Por favor, tente atualizar a página ou entre em contato diretamente para verificar a disponibilidade.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Escolha um profissional
        </h2>
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamMembers.map((member) => (
            <Button
              key={member.id} 
              variant="outline"
              className={`flex justify-between items-center p-4 h-auto ${selectedTeamMember === member.id ? "border-primary bg-primary/5" : ""}`}
              onClick={() => {
                console.log(`ProfessionalStep: Selected team member ${member.id} - ${member.name}`);
                onTeamMemberChange(member.id);
              }}
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
