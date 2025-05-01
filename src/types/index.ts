
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
