
import React from 'react';
import { TeamMemberStepContent } from '../steps/TeamMemberStepContent';
import { ServiceStepContent } from '../steps/ServiceStepContent';
import { InsuranceStepContent } from '../steps/InsuranceStepContent';
import { TimeStepContent } from '../steps/TimeStepContent';
import { ClientInfoStepContent } from '../steps/ClientInfoStepContent';
import { ConfirmationStepContent } from '../steps/ConfirmationStepContent';
import { BookingStep } from '@/hooks/booking/useBookingSteps';
import { BookingData } from '@/hooks/booking/useBookingSteps';
import { TeamMember, Service, InsurancePlan } from '@/types';
import { RefreshCw } from 'lucide-react';

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
        <TeamMemberStepContent
          teamMembers={teamMembers}
          selectedTeamMember={bookingData.teamMemberId || ''}
          onTeamMemberChange={handleTeamMemberChange}
          isLoading={isLoading}
          onRefresh={handleRefresh}
        />
      );
    case 'service':
      return (
        <ServiceStepContent
          services={services}
          selectedService={bookingData.serviceId || ''}
          onServiceChange={handleServiceChange}
          onBack={goToPreviousStep}
          getAvailableServicesForTeamMember={getAvailableServicesForTeamMember}
          teamMemberId={bookingData.teamMemberId || ''}
        />
      );
    case 'insurance':
      return (
        <InsuranceStepContent
          insurancePlans={insurancePlans}
          selectedInsurance={bookingData.insuranceId || ''}
          onInsuranceChange={handleInsuranceChange}
          onBack={goToPreviousStep}
          teamMemberId={bookingData.teamMemberId}
          checkInsuranceLimitReached={checkInsuranceLimitReached}
        />
      );
    case 'time':
      return (
        <TimeStepContent
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
        <ClientInfoStepContent
          onClientInfoSubmit={handleClientInfoSubmit}
          isLoading={isLoading}
          onBack={goToPreviousStep}
        />
      );
    case 'confirmation':
      return (
        <ConfirmationStepContent
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
