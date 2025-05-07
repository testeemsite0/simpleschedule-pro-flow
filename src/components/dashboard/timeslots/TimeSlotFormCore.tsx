
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TimeSlot } from '@/types';

import TeamMemberSelector from './TeamMemberSelector';
import DaySelector from './DaySelector';
import TimeRangeSelector from './TimeRangeSelector';
import BreakSelector from './BreakSelector';
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
        <div className="flex items-center space-x-2 pb-4 border-b">
          <Switch
            id="batchMode"
            checked={batchMode}
            onCheckedChange={setBatchMode}
          />
          <Label htmlFor="batchMode">Adicionar múltiplos horários</Label>
        </div>
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
      
      <div className="flex items-center space-x-2">
        <Switch
          id="available"
          checked={available}
          onCheckedChange={setAvailable}
        />
        <Label htmlFor="available">Disponível para agendamento</Label>
      </div>
      
      <div className="pt-4 border-t mt-4 flex justify-end gap-2">
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="outline">
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : isEditing 
            ? 'Salvar alterações' 
            : batchMode 
              ? 'Adicionar horários em lote' 
              : 'Adicionar horário'}
        </Button>
      </div>
    </form>
  );
};

export default TimeSlotFormCore;
