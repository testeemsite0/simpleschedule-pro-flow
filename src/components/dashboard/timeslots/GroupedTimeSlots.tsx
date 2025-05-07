
import React from 'react';
import { TimeSlot, TeamMember } from '@/types';
import TimeSlotCard from './TimeSlotCard';
import { TableCell, TableRow } from '@/components/ui/table';

interface GroupedTimeSlotsProps {
  dayOfWeek: number;
  timeSlots: TimeSlot[];
  teamMembers: TeamMember[];
  onEdit: (timeSlot: TimeSlot) => void;
  onDelete: (timeSlot: TimeSlot) => void;
  isSelectionMode: boolean;
  selectedTimeSlots: Set<string>;
  onToggleSelection: (id: string) => void;
  dayOfWeekNames: string[];
}

const GroupedTimeSlots: React.FC<GroupedTimeSlotsProps> = ({
  dayOfWeek,
  timeSlots,
  teamMembers,
  onEdit,
  onDelete,
  isSelectionMode,
  selectedTimeSlots,
  onToggleSelection,
  dayOfWeekNames
}) => {
  const sortedTimeSlots = [...timeSlots].sort((a, b) => 
    a.start_time.localeCompare(b.start_time)
  );

  const getMemberName = (timeSlot: TimeSlot) => {
    if (!timeSlot.team_member_id) return undefined;
    return teamMembers.find(m => m.id === timeSlot.team_member_id);
  };

  return (
    <>
      {sortedTimeSlots.map((slot) => (
        <TimeSlotCard
          key={slot.id}
          timeSlot={slot}
          teamMember={getMemberName(slot)}
          onEdit={onEdit}
          onDelete={onDelete}
          isSelectionMode={isSelectionMode}
          isSelected={selectedTimeSlots.has(slot.id)}
          onToggleSelection={onToggleSelection}
          dayOfWeekNames={dayOfWeekNames}
        />
      ))}
    </>
  );
};

export default GroupedTimeSlots;
