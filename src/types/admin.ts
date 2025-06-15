
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  stripe_price_id: string | null;
  interval_type: string;
  features: string[];
  max_appointments: number | null;
  max_team_members: number | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  admin_user_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin_user?: {
    name: string;
    email: string;
  };
}

export interface WebhookLog {
  id: string;
  event_type: string;
  stripe_event_id: string | null;
  payload: any;
  processed: boolean;
  error_message: string | null;
  attempts: number;
  created_at: string;
  processed_at: string | null;
}
