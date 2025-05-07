
import React from 'react';
import { TeamMember, TimeSlot } from '@/types';
import { Button } from '@/components/ui/button';
import TimeSlotsList from '@/components/dashboard/timeslots/TimeSlotsList';
import TimeSlotDialog from '@/components/dashboard/timeslots/TimeSlotDialog';

interface TeamMemberScheduleContentProps {
  teamMember: TeamMember;
  timeSlots: TimeSlot[];
  teamMembers: TeamMember[];
  isLoading: boolean;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  selectedTimeSlot?: TimeSlot;
  handleAddSuccess: () => void;
  handleEditTimeSlot: (timeSlot: TimeSlot) => void;
  handleDeleteTimeSlot: (timeSlot: TimeSlot) => void;
  handleBatchDelete: (ids: string[]) => void;
}

const TeamMemberScheduleContent: React.FC<TeamMemberScheduleContentProps> = ({
  teamMember,
  timeSlots,
  teamMembers,
  isLoading,
  isDialogOpen,
  setIsDialogOpen,
  selectedTimeSlot,
  handleAddSuccess,
  handleEditTimeSlot,
  handleDeleteTimeSlot,
  handleBatchDelete
}) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          Configure os horários em que {teamMember.name} está disponível para atendimentos.
        </p>
        
        <TimeSlotDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          selectedTimeSlot={selectedTimeSlot ? {...selectedTimeSlot, team_member_id: teamMember.id} : undefined}
          onSuccess={handleAddSuccess}
          buttonText="Adicionar horário"
        />
      </div>
      
      {isLoading ? (
        <p>Carregando horários...</p>
      ) : (
        <TimeSlotsList 
          timeSlots={timeSlots}
          teamMembers={teamMembers}
          onEdit={handleEditTimeSlot}
          onDelete={handleDeleteTimeSlot}
          onBatchDelete={handleBatchDelete}
        />
      )}
    </>
  );
};

export default TeamMemberScheduleContent;
