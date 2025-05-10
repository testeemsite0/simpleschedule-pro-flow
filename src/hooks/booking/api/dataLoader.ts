
/**
 * Optimized data loading system for booking data
 */
import { fetchTeamMembers } from './services/teamMemberService';
import { fetchServices } from './services/serviceService';
import { fetchInsurancePlans } from './services/insuranceService';
import { fetchTimeSlots } from './services/timeSlotService';
import { fetchAppointments } from './services/appointmentService';
import { unifiedDataFetch } from './dataFetcherCore';
import { QueryCache } from '../cache/queryCache';

// Function to pre-warm cache for essential data with improved performance
export const prewarmBookingDataCache = async (professionalId: string) => {
  if (!professionalId) {
    console.error("prewarmBookingDataCache: Missing professionalId, cannot pre-warm cache");
    return;
  }
  
  console.log("prewarmBookingDataCache: Starting pre-warm for professional:", professionalId);
  const controller = new AbortController();
  const signal = controller.signal;
  
  try {
    console.log("prewarmBookingDataCache: Pre-warming booking data cache");
    
    // Fetch critical data first in parallel with immediate execution
    const teamMembersPromise = fetchTeamMembers(professionalId, signal);
    const servicesPromise = fetchServices(professionalId, signal);
    
    const [teamMembers, services] = await Promise.all([
      teamMembersPromise,
      servicesPromise
    ]);
    
    console.log(`prewarmBookingDataCache: Pre-warmed team members: ${teamMembers.length}, services: ${Array.isArray(services) ? services.length : 'undefined'}`);
    
    // Then fetch non-critical data in parallel but with lower priority
    Promise.all([
      fetchTimeSlots(professionalId, signal),
      fetchInsurancePlans(professionalId, signal),
      fetchAppointments(professionalId, signal)
    ]).catch(e => console.warn("prewarmBookingDataCache: Non-critical data pre-warming had errors:", e));
    
    console.log("prewarmBookingDataCache: Cache pre-warming complete for critical data");
  } catch (error) {
    console.error("prewarmBookingDataCache: Error pre-warming cache:", error);
  }
};

// Clear cache for specific data types
export const clearBookingCache = (professionalId: string, dataType?: string) => {
  if (!professionalId) {
    console.warn("clearBookingCache: Missing professionalId, cannot clear cache");
    return;
  }
  
  if (dataType) {
    // Clear specific data type
    const cacheKey = `${professionalId}:${dataType}`;
    console.log(`clearBookingCache: Clearing cache for ${cacheKey}`);
    QueryCache.delete(cacheKey);
  } else {
    // Clear all booking-related cache for this professional
    console.log(`clearBookingCache: Clearing all cache for professional ${professionalId}`);
    ['teamMembers', 'services', 'insurancePlans', 'timeSlots', 'appointments'].forEach(type => {
      const cacheKey = `${professionalId}:${type}`;
      QueryCache.delete(cacheKey);
    });
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
