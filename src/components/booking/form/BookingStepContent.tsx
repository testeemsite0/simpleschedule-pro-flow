
import React, { useMemo } from 'react';
import { TeamMemberStepContent } from '../steps/TeamMemberStepContent';
import { ServiceStepContent } from '../steps/ServiceStepContent';
import { InsuranceStepContent } from '../steps/InsuranceStepContent';
import { DateStepContent } from '../steps/DateStepContent';
import { TimeStepContent } from '../steps/TimeStepContent';
import { ClientInfoStepContent } from '../steps/ClientInfoStepContent';
import { ConfirmationStepContent } from '../steps/ConfirmationStepContent';
import { BookingStep } from '@/hooks/booking/useBookingSteps';
import { BookingData } from '@/hooks/booking/useBookingSteps';
import { TeamMember, Service, InsurancePlan } from '@/types';

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
  // Memoize available services for the selected team member
  const availableServices = useMemo(() => {
    if (!bookingData.teamMemberId) return [];
    return getAvailableServicesForTeamMember(bookingData.teamMemberId);
  }, [bookingData.teamMemberId, getAvailableServicesForTeamMember]);

  // Handle time selection in one function
  const handleTimeSlotSelect = (date: Date, startTime: string, endTime: string) => {
    handleDateChange(date);
    handleTimeChange(startTime, endTime);
  };

  console.log(`BookingStepContent: Rendering step ${currentStep}`, {
    teamMembersCount: teamMembers.length,
    availableDatesCount: availableDates.length,
    availableSlotsCount: availableSlots.length,
    hasSelectedDate: !!bookingData.date,
    insuranceId: bookingData.insuranceId
  });

  // Render the appropriate step content based on current step
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
    case 'insurance':
      return (
        <InsuranceStepContent
          insurancePlans={insurancePlans}
          selectedInsurance={bookingData.insuranceId || ''}
          onInsuranceChange={handleInsuranceChange}
          teamMemberId={bookingData.teamMemberId}
          checkInsuranceLimitReached={checkInsuranceLimitReached}
        />
      );
    case 'service':
      return (
        <ServiceStepContent
          services={availableServices}
          selectedService={bookingData.serviceId || ''}
          onServiceChange={handleServiceChange}
          getAvailableServicesForTeamMember={getAvailableServicesForTeamMember}
          teamMemberId={bookingData.teamMemberId || ''}
          insuranceId={bookingData.insuranceId}
        />
      );
    case 'date':
      return (
        <DateStepContent
          availableDates={availableDates}
          selectedDate={bookingData.date}
          onDateSelect={handleDateChange}
          isLoading={isLoading}
        />
      );
    case 'time':
      return (
        <TimeStepContent
          availableSlots={availableSlots}
          selectedDate={bookingData.date}
          selectedStartTime={bookingData.startTime}
          selectedEndTime={bookingData.endTime}
          onTimeSlotSelect={handleTimeSlotSelect}
          isLoading={isLoading}
        />
      );
    case 'client-info':
      return (
        <ClientInfoStepContent
          onClientInfoSubmit={handleClientInfoSubmit}
          isLoading={isLoading}
          defaultValues={{
            name: bookingData.clientName,
            email: bookingData.clientEmail,
            phone: bookingData.clientPhone,
            notes: bookingData.notes
          }}
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
