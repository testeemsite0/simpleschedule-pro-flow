export interface User {
  id: string;
  email: string;
  name: string;
  slug?: string;
}

export interface Professional {
  id: string;
  name: string;
  email: string;
  profession: string;
  bio?: string;
  slug: string;
  address?: string;
  avatar?: string; // Adding avatar property
}

export interface TimeSlot {
  id: string;
  professional_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  available: boolean;
  created_at?: string;
  updated_at?: string;
  appointment_duration_minutes?: number;
  lunch_break_start?: string;
  lunch_break_end?: string;
  team_member_id?: string;
}

export interface Service {
  id: string;
  professional_id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Appointment {
  id: string;
  professional_id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'canceled';
  created_at?: string;
  updated_at?: string;
  source?: 'client' | 'manual';
  service_id?: string;
  price?: number;
  team_member_id?: string;
  insurance_plan_id?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
}

export interface SystemConfig {
  id: string;
  premium_price: number;
  stripe_price_id: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionHistory {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  subscription_tier: string;
  amount: number;
  period_start: string;
  period_end: string;
  cancellation_date?: string;
  status: 'active' | 'canceled' | 'expired';
  created_at: string;
}

export interface Subscriber {
  id: string;
  user_id: string;
  email: string;
  stripe_customer_id?: string;
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  updated_at: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  professional_id: string;
  name: string;
  email?: string;
  position?: string;
  avatar?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  services?: Service[]; // Relação opcional com serviços
  insurancePlans?: TeamMemberInsurancePlan[]; // Relação opcional com convênios
  availableInsurancePlans?: InsurancePlan[]; // Convênios disponíveis para este membro
}

export interface TeamMemberService {
  id: string;
  team_member_id: string;
  service_id: string;
  created_at: string;
}

export interface InsurancePlan {
  id: string;
  name: string;
  professional_id: string;
  created_at: string;
  updated_at: string;
  limit_per_plan: number | null;
  current_appointments: number | null;
  availableForBooking?: boolean; // Propriedade para indicar disponibilidade
  // Propriedades adicionais para uso no front-end
  memberPlanId?: string;
  memberLimit?: number | null;
  memberCurrentAppointments?: number;
}

export interface TeamMemberInsurancePlan {
  id: string;
  team_member_id: string;
  insurance_plan_id: string;
  limit_per_member: number | null;
  current_appointments: number;
  created_at: string;
  insurancePlan?: InsurancePlan; // Relação opcional com o plano de saúde
  availableForBooking?: boolean; // Nova propriedade para indicar disponibilidade
}
