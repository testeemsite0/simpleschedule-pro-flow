
import { format, parseISO, addDays, startOfDay, setHours, setMinutes } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

// Brazilian timezone options
export const BRAZILIAN_TIMEZONES = {
  'America/Sao_Paulo': 'UTC-3 (Brasília, São Paulo, Rio de Janeiro)',
  'America/Manaus': 'UTC-4 (Manaus, Cuiabá)',
  'America/Rio_Branco': 'UTC-5 (Rio Branco, Acre)',
  'America/Fortaleza': 'UTC-3 (Fortaleza, Natal)',
  'America/Recife': 'UTC-3 (Recife, Salvador)',
  'America/Belem': 'UTC-3 (Belém)',
  'America/Campo_Grande': 'UTC-4 (Campo Grande)',
  'America/Boa_Vista': 'UTC-4 (Boa Vista)'
} as const;

export type BrazilianTimezone = keyof typeof BRAZILIAN_TIMEZONES;

// Default timezone (fallback)
export const DEFAULT_TIMEZONE: BrazilianTimezone = 'America/Sao_Paulo';

// Dynamic timezone functions that accept timezone parameter
export const getCurrentTimeInTimezone = (timezone: string = DEFAULT_TIMEZONE): Date => {
  return toZonedTime(new Date(), timezone);
};

export const localDateToUTC = (localDate: Date, timezone: string = DEFAULT_TIMEZONE): Date => {
  return fromZonedTime(localDate, timezone);
};

export const utcToLocalDate = (utcDate: Date, timezone: string = DEFAULT_TIMEZONE): Date => {
  return toZonedTime(utcDate, timezone);
};

export const formatDateInTimezone = (date: Date, timezone: string = DEFAULT_TIMEZONE, formatString: string = 'dd/MM/yyyy'): string => {
  const localDate = toZonedTime(date, timezone);
  return format(localDate, formatString);
};

export const formatTimeInTimezone = (date: Date, timezone: string = DEFAULT_TIMEZONE, formatString: string = 'HH:mm'): string => {
  const localDate = toZonedTime(date, timezone);
  return format(localDate, formatString);
};

export const formatDateTimeInTimezone = (date: Date, timezone: string = DEFAULT_TIMEZONE): string => {
  const localDate = toZonedTime(date, timezone);
  return format(localDate, 'dd/MM/yyyy HH:mm');
};

export const isSlotInPastInTimezone = (slotDate: Date, slotTime: string, timezone: string = DEFAULT_TIMEZONE): boolean => {
  const now = getCurrentTimeInTimezone(timezone);
  const [hours, minutes] = slotTime.split(':').map(Number);
  
  // Create slot datetime in specified timezone
  const slotDateTime = setMinutes(setHours(slotDate, hours), minutes);
  
  return slotDateTime < now;
};

export const getTodayInTimezone = (timezone: string = DEFAULT_TIMEZONE): Date => {
  return startOfDay(getCurrentTimeInTimezone(timezone));
};

export const isTodayInTimezone = (date: Date, timezone: string = DEFAULT_TIMEZONE): boolean => {
  const today = getTodayInTimezone(timezone);
  const compareDate = startOfDay(toZonedTime(date, timezone));
  return format(today, 'yyyy-MM-dd') === format(compareDate, 'yyyy-MM-dd');
};

export const getAppointmentDateStringInTimezone = (date: Date, timezone: string = DEFAULT_TIMEZONE): string => {
  const localDate = toZonedTime(date, timezone);
  return format(localDate, 'yyyy-MM-dd');
};

export const parseAppointmentDateInTimezone = (dateString: string, timezone: string = DEFAULT_TIMEZONE): Date => {
  const localDate = parseISO(`${dateString}T12:00:00`);
  return fromZonedTime(localDate, timezone);
};
