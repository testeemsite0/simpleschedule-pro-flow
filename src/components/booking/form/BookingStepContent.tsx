
import React from 'react';
import { ProfessionalStep } from '../steps/ProfessionalStep';
import { ServiceStep } from '../steps/ServiceStep';
import { InsuranceStep } from '../steps/InsuranceStep';
import { TimeStep } from '../steps/TimeStep';
import { ClientInfoStep } from '@/components/booking/steps/ClientInfoStep';
import { ConfirmationStep } from '../steps/ConfirmationStep';
import { BookingStep } from '@/hooks/booking/useBookingSteps';
import { BookingData } from '@/hooks/booking/useBookingSteps';
import { TeamMember, Service, InsurancePlan } from '@/types';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface BookingStepContentProps {
  currentStep: BookingStep;
  bookingData: BookingData;
  teamMembers: TeamMember[];
  services: Service[];
  insurancePlans: InsurancePlan[];
  availableDates: Date[];
  availableSlots: {
    date: Date;
    startTime: string;
    endTime: string;
    teamMemberId?: string;
  }[];
  isLoading: boolean;
  handleTeamMemberChange: (teamMemberId: string) => void;
  handleServiceChange: (serviceId: string) => void;
  handleInsuranceChange: (insuranceId: string) => void;
  handleDateChange: (date: Date) => void;
  handleTimeChange: (startTime: string, endTime: string) => void;
  handleClientInfoSubmit: (name: string, email: string, phone: string, notes?: string) => void;
  handleCompleteBooking: () => void;
  goToPreviousStep: () => void;
  getAvailableServicesForTeamMember: (teamMemberId: string) => Service[];
  checkInsuranceLimitReached: (insuranceId: string, teamMemberId?: string) => boolean;
  handleRefresh: () => void;
}

export const BookingStepContent: React.FC<BookingStepContentProps> = ({
  currentStep,
  bookingData,
  teamMembers,
  services,
  insurancePlans,
  availableDates,
  availableSlots,
  isLoading,
  handleTeamMemberChange,
  handleServiceChange,
  handleInsuranceChange,
  handleDateChange,
  handleTimeChange,
  handleClientInfoSubmit,
  handleCompleteBooking,
  goToPreviousStep,
  getAvailableServicesForTeamMember,
  checkInsuranceLimitReached,
  handleRefresh
}) => {
  switch (currentStep) {
    case 'team-member':
      return (
        <ProfessionalStep
          teamMembers={teamMembers}
          selectedTeamMember={bookingData.teamMemberId || ''}
          onTeamMemberChange={handleTeamMemberChange}
          isLoading={isLoading}
          onRefresh={handleRefresh}
        />
      );
    case 'service':
      return (
        <ServiceStep
          services={getAvailableServicesForTeamMember(bookingData.teamMemberId || '')}
          selectedService={bookingData.serviceId || ''}
          onServiceChange={handleServiceChange}
          onBack={goToPreviousStep}
        />
      );
    case 'insurance':
      return (
        <InsuranceStep
          insurancePlans={insurancePlans}
          selectedInsurance={bookingData.insuranceId || ''}
          onInsuranceChange={handleInsuranceChange}
          onBack={goToPreviousStep}
        />
      );
    case 'time':
      return (
        <TimeStep
          availableSlots={availableSlots}
          selectedDate={bookingData.date}
          selectedStartTime={bookingData.startTime}
          selectedEndTime={bookingData.endTime}
          onTimeSlotSelect={(date, startTime, endTime) => {
            handleDateChange(date);
            handleTimeChange(startTime, endTime);
          }}
          isLoading={isLoading}
          onBack={goToPreviousStep}
        />
      );
    case 'client-info':
      return (
        <ClientInfoStep
          onClientInfoSubmit={handleClientInfoSubmit}
          isLoading={isLoading}
          onBack={goToPreviousStep}
        />
      );
    case 'confirmation':
      return (
        <ConfirmationStep
          bookingData={bookingData}
          onConfirm={handleCompleteBooking}
          onEdit={goToPreviousStep}
          isLoading={isLoading}
        />
      );
    default:
      return null;
  }
};
