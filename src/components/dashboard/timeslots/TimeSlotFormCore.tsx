
import React from 'react';
import { TimeSlot } from '@/types';
import TeamMemberSelector from './TeamMemberSelector';
import DaySelector from './DaySelector';
import TimeRangeSelector from './TimeRangeSelector';
import BreakSelector from './BreakSelector';
import BatchModeToggle from './FormSections/BatchModeToggle';
import AvailabilityToggle from './FormSections/AvailabilityToggle';
import FormActions from './FormSections/FormActions';
import { useTimeSlotForm } from '@/hooks/useTimeSlotForm';

interface TimeSlotFormCoreProps {
  onSuccess?: () => void;
  initialData?: TimeSlot;
  onCancel?: () => void;
}

const TimeSlotFormCore: React.FC<TimeSlotFormCoreProps> = ({ 
  onSuccess, 
  initialData,
  onCancel
}) => {
  const {
    isEditing,
    dayOfWeek,
    setDayOfWeek,
    selectedDays,
    handleDayToggle,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    available,
    setAvailable,
    appointmentDuration,
    setAppointmentDuration,
    hasLunchBreak,
    setHasLunchBreak,
    lunchBreakStart,
    setLunchBreakStart,
    lunchBreakEnd,
    setLunchBreakEnd,
    isLoading,
    teamMembers,
    selectedTeamMember,
    setSelectedTeamMember,
    selectedTeamMembers,
    handleTeamMemberToggle,
    batchMode,
    setBatchMode,
    handleSubmit
  } = useTimeSlotForm({ initialData, onSuccess });
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEditing && (
        <BatchModeToggle 
          batchMode={batchMode}
          setBatchMode={setBatchMode}
        />
      )}

      <TeamMemberSelector
        teamMembers={teamMembers}
        selectedTeamMember={selectedTeamMember}
        setSelectedTeamMember={setSelectedTeamMember}
        selectedTeamMembers={selectedTeamMembers}
        handleTeamMemberToggle={handleTeamMemberToggle}
        batchMode={batchMode}
      />

      <DaySelector
        dayOfWeek={dayOfWeek}
        setDayOfWeek={setDayOfWeek}
        selectedDays={selectedDays}
        handleDayToggle={handleDayToggle}
        batchMode={batchMode}
      />
      
      <TimeRangeSelector
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        appointmentDuration={appointmentDuration}
        setAppointmentDuration={setAppointmentDuration}
      />
      
      <BreakSelector
        hasLunchBreak={hasLunchBreak}
        setHasLunchBreak={setHasLunchBreak}
        lunchBreakStart={lunchBreakStart}
        setLunchBreakStart={setLunchBreakStart}
        lunchBreakEnd={lunchBreakEnd}
        setLunchBreakEnd={setLunchBreakEnd}
      />
      
      <AvailabilityToggle
        available={available}
        setAvailable={setAvailable}
      />
      
      <FormActions 
        onCancel={onCancel}
        isLoading={isLoading}
        isEditing={isEditing}
        batchMode={batchMode}
      />
    </form>
  );
};

export default TimeSlotFormCore;
