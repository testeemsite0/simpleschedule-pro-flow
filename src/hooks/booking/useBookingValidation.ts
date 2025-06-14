
import { useConflictValidation } from './useConflictValidation';
import { toast } from 'sonner';

export const useBookingValidation = () => {
  const { checkTimeConflict, validateBusinessHours, isChecking } = useConflictValidation();

  const validateBookingData = async (
    professionalId: string,
    teamMemberId: string | undefined,
    date: Date,
    startTime: string,
    endTime: string,
    clientName: string,
    clientEmail: string
  ) => {
    // Basic validation
    if (!professionalId || !date || !startTime || !endTime || !clientName || !clientEmail) {
      toast.error('Todos os campos obrigatórios devem ser preenchidos');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      toast.error('Email inválido');
      return false;
    }

    // Date validation (not in the past)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      toast.error('Não é possível agendar para datas passadas');
      return false;
    }

    // Time validation
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    if (start >= end) {
      toast.error('Horário de término deve ser posterior ao de início');
      return false;
    }

    // Validate business hours
    const isWithinBusinessHours = await validateBusinessHours(
      professionalId,
      teamMemberId,
      date.toISOString().split('T')[0],
      startTime,
      endTime
    );

    if (!isWithinBusinessHours) {
      return false;
    }

    // Check for conflicts
    const conflictCheck = await checkTimeConflict(
      professionalId,
      teamMemberId,
      date.toISOString().split('T')[0],
      startTime,
      endTime
    );

    if (conflictCheck.hasConflict) {
      toast.error(
        `Conflito de horário! Já existe um agendamento com ${conflictCheck.conflictDetails?.clientName} das ${conflictCheck.conflictDetails?.startTime} às ${conflictCheck.conflictDetails?.endTime}`
      );
      return false;
    }

    return true;
  };

  return {
    validateBookingData,
    isValidating: isChecking
  };
};
