
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
  { id: "1", professionalId: "1", dayOfWeek: 1, startTime: "09:00", endTime: "10:00", available: true },
  { id: "2", professionalId: "1", dayOfWeek: 1, startTime: "10:00", endTime: "11:00", available: true },
  { id: "3", professionalId: "1", dayOfWeek: 1, startTime: "11:00", endTime: "12:00", available: true },
  { id: "4", professionalId: "1", dayOfWeek: 2, startTime: "14:00", endTime: "15:00", available: true },
  { id: "5", professionalId: "1", dayOfWeek: 2, startTime: "15:00", endTime: "16:00", available: true },
  { id: "6", professionalId: "1", dayOfWeek: 3, startTime: "09:00", endTime: "10:00", available: true },
  { id: "7", professionalId: "1", dayOfWeek: 3, startTime: "10:00", endTime: "11:00", available: true },
  
  // Carlos Mendes's slots
  { id: "8", professionalId: "2", dayOfWeek: 1, startTime: "08:00", endTime: "09:00", available: true },
  { id: "9", professionalId: "2", dayOfWeek: 1, startTime: "09:00", endTime: "10:00", available: true },
  { id: "10", professionalId: "2", dayOfWeek: 2, startTime: "13:00", endTime: "14:00", available: true },
  { id: "11", professionalId: "2", dayOfWeek: 2, startTime: "14:00", endTime: "15:00", available: true },
  { id: "12", professionalId: "2", dayOfWeek: 4, startTime: "08:00", endTime: "09:00", available: true },
  { id: "13", professionalId: "2", dayOfWeek: 4, startTime: "09:00", endTime: "10:00", available: true },
  
  // Juliana Costa's slots
  { id: "14", professionalId: "3", dayOfWeek: 1, startTime: "14:00", endTime: "15:00", available: true },
  { id: "15", professionalId: "3", dayOfWeek: 1, startTime: "15:00", endTime: "16:00", available: true },
  { id: "16", professionalId: "3", dayOfWeek: 2, startTime: "10:00", endTime: "11:00", available: true },
  { id: "17", professionalId: "3", dayOfWeek: 2, startTime: "11:00", endTime: "12:00", available: true },
  { id: "18", professionalId: "3", dayOfWeek: 5, startTime: "14:00", endTime: "15:00", available: true },
  { id: "19", professionalId: "3", dayOfWeek: 5, startTime: "15:00", endTime: "16:00", available: true },
];

export const appointments: Appointment[] = [
  {
    id: "1",
    professionalId: "1",
    clientName: "Pedro Almeida",
    clientEmail: "pedro@example.com",
    clientPhone: "+55 11 98765-4321",
    date: "2025-05-05",
    startTime: "09:00",
    endTime: "10:00",
    notes: "Primeira consulta",
    status: "scheduled",
  },
  {
    id: "2",
    professionalId: "1",
    clientName: "Maria Souza",
    clientEmail: "maria@example.com",
    clientPhone: "+55 11 91234-5678",
    date: "2025-05-06",
    startTime: "14:00",
    endTime: "15:00",
    notes: "Sessão de acompanhamento",
    status: "scheduled",
  },
  {
    id: "3",
    professionalId: "2",
    clientName: "João Santos",
    clientEmail: "joao@example.com",
    clientPhone: "+55 11 98765-1234",
    date: "2025-05-05",
    startTime: "08:00",
    endTime: "09:00",
    notes: "Avaliação física",
    status: "scheduled",
  },
];

export const currentUser: Professional | null = professionals[0];
