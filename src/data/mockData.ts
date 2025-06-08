
import { Professional, TimeSlot, Appointment } from "../types";

export const professionals: Professional[] = [
  {
    id: "1",
    name: "Dr. Ana Silva",
    email: "ana.silva@example.com",
    profession: "Psicóloga",
    slug: "ana-silva",
    bio: "Psicóloga clínica com 10 anos de experiência em terapia cognitivo-comportamental.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "2",
    name: "Dr. Carlos Mendes",
    email: "carlos.mendes@example.com",
    profession: "Fisioterapeuta",
    slug: "carlos-mendes",
    bio: "Fisioterapeuta especialista em reabilitação esportiva e tratamento de lesões.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "3",
    name: "Dra. Juliana Costa",
    email: "juliana.costa@example.com",
    profession: "Advogada",
    slug: "juliana-costa",
    bio: "Advogada especializada em direito civil e familiar com mais de 15 anos de experiência.",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
];

export const timeSlots: TimeSlot[] = [
  // Ana Silva's slots
  { id: "1", professional_id: "1", day_of_week: 1, start_time: "09:00", end_time: "10:00", available: true },
  { id: "2", professional_id: "1", day_of_week: 1, start_time: "10:00", end_time: "11:00", available: true },
  { id: "3", professional_id: "1", day_of_week: 1, start_time: "11:00", end_time: "12:00", available: true },
  { id: "4", professional_id: "1", day_of_week: 2, start_time: "14:00", end_time: "15:00", available: true },
  { id: "5", professional_id: "1", day_of_week: 2, start_time: "15:00", end_time: "16:00", available: true },
  { id: "6", professional_id: "1", day_of_week: 3, start_time: "09:00", end_time: "10:00", available: true },
  { id: "7", professional_id: "1", day_of_week: 3, start_time: "10:00", end_time: "11:00", available: true },
  
  // Carlos Mendes's slots
  { id: "8", professional_id: "2", day_of_week: 1, start_time: "08:00", end_time: "09:00", available: true },
  { id: "9", professional_id: "2", day_of_week: 1, start_time: "09:00", end_time: "10:00", available: true },
  { id: "10", professional_id: "2", day_of_week: 2, start_time: "13:00", end_time: "14:00", available: true },
  { id: "11", professional_id: "2", day_of_week: 2, start_time: "14:00", end_time: "15:00", available: true },
  { id: "12", professional_id: "2", day_of_week: 4, start_time: "08:00", end_time: "09:00", available: true },
  { id: "13", professional_id: "2", day_of_week: 4, start_time: "09:00", end_time: "10:00", available: true },
  
  // Juliana Costa's slots
  { id: "14", professional_id: "3", day_of_week: 1, start_time: "14:00", end_time: "15:00", available: true },
  { id: "15", professional_id: "3", day_of_week: 1, start_time: "15:00", end_time: "16:00", available: true },
  { id: "16", professional_id: "3", day_of_week: 2, start_time: "10:00", end_time: "11:00", available: true },
  { id: "17", professional_id: "3", day_of_week: 2, start_time: "11:00", end_time: "12:00", available: true },
  { id: "18", professional_id: "3", day_of_week: 5, start_time: "14:00", end_time: "15:00", available: true },
  { id: "19", professional_id: "3", day_of_week: 5, start_time: "15:00", end_time: "16:00", available: true },
];

export const appointments: Appointment[] = [
  {
    id: "1",
    professional_id: "1",
    client_name: "Pedro Almeida",
    client_email: "pedro@example.com",
    client_phone: "+55 11 98765-4321",
    date: "2025-05-05",
    start_time: "09:00",
    end_time: "10:00",
    notes: "Primeira consulta",
    status: "scheduled",
    free_tier_used: false,
  },
  {
    id: "2",
    professional_id: "1",
    client_name: "Maria Souza",
    client_email: "maria@example.com",
    client_phone: "+55 11 91234-5678",
    date: "2025-05-06",
    start_time: "14:00",
    end_time: "15:00",
    notes: "Sessão de acompanhamento",
    status: "scheduled",
    free_tier_used: false,
  },
  {
    id: "3",
    professional_id: "2",
    client_name: "João Santos",
    client_email: "joao@example.com",
    client_phone: "+55 11 98765-1234",
    date: "2025-05-05",
    start_time: "08:00",
    end_time: "09:00",
    notes: "Avaliação física",
    status: "scheduled",
    free_tier_used: false,
  },
];

export const currentUser: Professional | null = professionals[0];
