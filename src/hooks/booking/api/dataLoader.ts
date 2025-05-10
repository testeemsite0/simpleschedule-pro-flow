
/**
 * Optimized data loading system for booking data
 */
import { fetchTeamMembers } from './services/teamMemberService';
import { fetchServices } from './services/serviceService';
import { fetchInsurancePlans } from './services/insuranceService';
import { fetchTimeSlots } from './services/timeSlotService';
import { fetchAppointments } from './services/appointmentService';
import { unifiedDataFetch } from './dataFetcherCore';

// Function to pre-warm cache for essential data with improved performance
export const prewarmBookingDataCache = async (professionalId: string) => {
  if (!professionalId) return;
  
  const controller = new AbortController();
  const signal = controller.signal;
  
  try {
    console.log("Pre-warming booking data cache");
    
    // Fetch critical data first in parallel with immediate execution
    await Promise.all([
      fetchTeamMembers(professionalId, signal),
      fetchServices(professionalId, signal)
    ]);
    
    // Then fetch non-critical data in parallel but with lower priority
    Promise.all([
      fetchTimeSlots(professionalId, signal),
      fetchInsurancePlans(professionalId, signal),
      fetchAppointments(professionalId, signal)
    ]).catch(e => console.warn("Non-critical data pre-warming had errors:", e));
    
    console.log("Cache pre-warming complete for critical data");
  } catch (error) {
    console.error("Error pre-warming cache:", error);
  }
};

// Export everything from the service files for convenience
export {
  fetchTeamMembers,
  fetchServices,
  fetchInsurancePlans,
  fetchTimeSlots,
  fetchAppointments,
  unifiedDataFetch
};
