
import { format, parseISO, addDays, startOfDay, isAfter, isBefore, setHours, setMinutes } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

// Timezone configuration for Brazil (UTC-3)
export const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

// Get current date/time in Brazil timezone
export const getCurrentBrazilTime = (): Date => {
  return utcToZonedTime(new Date(), BRAZIL_TIMEZONE);
};

// Convert a local date to UTC for database storage
export const localDateToUTC = (localDate: Date): Date => {
  return zonedTimeToUtc(localDate, BRAZIL_TIMEZONE);
};

// Convert UTC date from database to local Brazil time
export const utcToLocalDate = (utcDate: Date): Date => {
  return utcToZonedTime(utcDate, BRAZIL_TIMEZONE);
};

// Format date for display in Brazil timezone
export const formatBrazilDate = (date: Date, formatString: string = 'dd/MM/yyyy'): string => {
  const localDate = utcToZonedTime(date, BRAZIL_TIMEZONE);
  return format(localDate, formatString);
};

// Format time for display in Brazil timezone
export const formatBrazilTime = (date: Date, formatString: string = 'HH:mm'): string => {
  const localDate = utcToZonedTime(date, BRAZIL_TIMEZONE);
  return format(localDate, formatString);
};

// Check if a date/time slot is in the past (Brazil timezone)
export const isSlotInPast = (slotDate: Date, slotTime: string): boolean => {
  const now = getCurrentBrazilTime();
  const [hours, minutes] = slotTime.split(':').map(Number);
  
  // Create slot datetime in Brazil timezone
  const slotDateTime = setMinutes(setHours(slotDate, hours), minutes);
  
  return isBefore(slotDateTime, now);
};

// Get today's date in Brazil timezone
export const getBrazilToday = (): Date => {
  return startOfDay(getCurrentBrazilTime());
};

// Check if a date is today in Brazil timezone
export const isBrazilToday = (date: Date): boolean => {
  const today = getBrazilToday();
  const compareDate = startOfDay(utcToZonedTime(date, BRAZIL_TIMEZONE));
  return format(today, 'yyyy-MM-dd') === format(compareDate, 'yyyy-MM-dd');
};

// Get date string for appointment storage (YYYY-MM-DD format in Brazil timezone)
export const getAppointmentDateString = (date: Date): string => {
  const localDate = utcToZonedTime(date, BRAZIL_TIMEZONE);
  return format(localDate, 'yyyy-MM-dd');
};

// Parse appointment date string to Date object in Brazil timezone
export const parseAppointmentDate = (dateString: string): Date => {
  // Parse as Brazil date and return as UTC for consistency
  const localDate = parseISO(`${dateString}T12:00:00`);
  return zonedTimeToUtc(localDate, BRAZIL_TIMEZONE);
};
