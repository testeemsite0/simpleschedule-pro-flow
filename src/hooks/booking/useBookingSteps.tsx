
import { useState, useCallback } from 'react';

export type BookingStep = 'team-member' | 'service' | 'insurance' | 'date' | 'time' | 'client-info' | 'confirmation';

export interface BookingData {
  teamMemberId?: string;
  serviceId?: string;
  insuranceId?: string;
  date?: Date;
  startTime?: string;
  endTime?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  notes?: string;
  appointmentId?: string;
  // Additional fields for display purposes
  professionalName?: string;
  professionalEmail?: string;
  professionalRole?: string;
  professionalSlug?: string;
}

interface UseBookingStepsProps {
  initialStep?: BookingStep;
}

export const useBookingSteps = ({ initialStep = 'team-member' }: UseBookingStepsProps = {}) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>(initialStep);
  const [bookingData, setBookingData] = useState<BookingData>({});
  const [error, setError] = useState<string | null>(null);

  console.log("useBookingSteps: Current data:", JSON.stringify(bookingData, null, 2));

  const goToNextStep = useCallback(() => {
    const steps: BookingStep[] = ['team-member', 'service', 'insurance', 'date', 'time', 'client-info', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      console.log(`useBookingSteps: Moving from ${currentStep} to ${nextStep}`);
      setCurrentStep(nextStep);
    }
  }, [currentStep]);

  const goToPreviousStep = useCallback(() => {
    const steps: BookingStep[] = ['team-member', 'service', 'insurance', 'date', 'time', 'client-info', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex > 0) {
      const previousStep = steps[currentIndex - 1];
      console.log(`useBookingSteps: Moving from ${currentStep} to ${previousStep}`);
      setCurrentStep(previousStep);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: BookingStep) => {
    console.log(`useBookingSteps: Jumping to step ${step}`);
    setCurrentStep(step);
  }, []);

  const updateBookingData = useCallback((updates: Partial<BookingData>) => {
    console.log("useBookingSteps: Updating booking data with:", JSON.stringify(updates, null, 2));
    setBookingData(prev => {
      const newData = { ...prev, ...updates };
      console.log("useBookingSteps: New booking data:", JSON.stringify(newData, null, 2));
      return newData;
    });
  }, []);

  const setTeamMember = useCallback((teamMemberId: string) => {
    console.log(`useBookingSteps: Setting team member: ${teamMemberId}`);
    updateBookingData({ teamMemberId });
  }, [updateBookingData]);

  const setService = useCallback((serviceId: string) => {
    console.log(`useBookingSteps: Setting service: ${serviceId}`);
    updateBookingData({ serviceId });
  }, [updateBookingData]);

  const setInsurance = useCallback((insuranceId: string) => {
    console.log(`useBookingSteps: Setting insurance: ${insuranceId}`);
    updateBookingData({ insuranceId });
  }, [updateBookingData]);

  const setDate = useCallback((date: Date) => {
    console.log(`useBookingSteps: Setting date: ${date.toISOString()}`);
    updateBookingData({ date });
  }, [updateBookingData]);

  const setTime = useCallback((startTime: string, endTime: string) => {
    console.log(`useBookingSteps: Setting time: ${startTime} - ${endTime}`);
    updateBookingData({ startTime, endTime });
  }, [updateBookingData]);

  const setClientInfo = useCallback((name: string, email: string, phone?: string, notes?: string) => {
    console.log(`useBookingSteps: Setting client info - Name: ${name}, Email: ${email}, Phone: ${phone}`);
    const clientData = {
      clientName: name,
      clientEmail: email,
      clientPhone: phone || '',
      notes: notes || ''
    };
    console.log("useBookingSteps: Client data to be saved:", JSON.stringify(clientData, null, 2));
    updateBookingData(clientData);
  }, [updateBookingData]);

  const updateErrorState = useCallback((errorMessage: string | null) => {
    console.log(`useBookingSteps: Setting error: ${errorMessage}`);
    setError(errorMessage);
  }, []);

  const resetBooking = useCallback(() => {
    console.log("useBookingSteps: Resetting booking data");
    setBookingData({});
    setCurrentStep('team-member');
    setError(null);
  }, []);

  return {
    currentStep,
    bookingData,
    error,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    setTeamMember,
    setService,
    setInsurance,
    setDate,
    setTime,
    setClientInfo,
    updateErrorState,
    resetBooking,
    updateBookingData
  };
};
