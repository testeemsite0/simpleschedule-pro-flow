
/**
 * API layer for fetching different types of data
 * 
 * This file is now just a facade that re-exports functionality from the new modular files
 */

export { fetchTeamMembers } from './services/teamMemberService';
export * from './dataLoader';
export * from './services/appointmentService';
