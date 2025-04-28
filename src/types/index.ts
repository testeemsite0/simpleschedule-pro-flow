
export interface Professional {
  id: string;
  name: string;
  email: string;
  profession: string;
  slug: string;
  bio?: string;
  avatar?: string;
}

export interface TimeSlot {
  id: string;
  professionalId: string;
  dayOfWeek: number; // 0-6 for Sunday-Saturday
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
  available: boolean;
}

export interface Appointment {
  id: string;
  professionalId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  date: string; // ISO date string
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
  notes?: string;
  status: "scheduled" | "completed" | "canceled";
}
