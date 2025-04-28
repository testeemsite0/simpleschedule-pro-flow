
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
  professional_id: string; // Changed from professionalId to match database
  day_of_week: number; // Changed from dayOfWeek to match database
  start_time: string; // Changed from startTime to match database
  end_time: string; // Changed from endTime to match database
  available: boolean;
}

export interface Appointment {
  id: string;
  professional_id: string; // Changed from professionalId to match database
  client_name: string; // Changed from clientName to match database
  client_email: string; // Changed from clientEmail to match database
  client_phone?: string; // Changed from clientPhone to match database
  date: string;
  start_time: string; // Changed from startTime to match database
  end_time: string; // Changed from endTime to match database
  notes?: string;
  status: "scheduled" | "completed" | "canceled";
}
