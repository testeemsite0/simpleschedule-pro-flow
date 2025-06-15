
-- Create subscription_plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  stripe_price_id TEXT UNIQUE,
  interval_type TEXT DEFAULT 'month' CHECK (interval_type IN ('month', 'year')),
  features JSONB DEFAULT '[]'::jsonb,
  max_appointments INTEGER,
  max_team_members INTEGER,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create stripe_config table for admin settings
CREATE TABLE public.stripe_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_endpoint_secret TEXT,
  webhook_events TEXT[] DEFAULT ARRAY['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted', 'invoice.payment_succeeded', 'invoice.payment_failed'],
  test_mode BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create admin_audit_logs table
CREATE TABLE public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT, -- 'user', 'plan', 'config', etc.
  target_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create webhook_logs table
CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  stripe_event_id TEXT UNIQUE,
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "admin_full_access_plans" ON public.subscription_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "admin_full_access_stripe_config" ON public.stripe_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "admin_full_access_audit_logs" ON public.admin_audit_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "admin_full_access_webhook_logs" ON public.webhook_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow public read access to active subscription plans
CREATE POLICY "public_read_active_plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

-- Insert default plans
INSERT INTO public.subscription_plans (name, description, price, stripe_price_id, features, max_appointments, max_team_members, display_order) VALUES
('Gratuito', 'Plano básico para começar', 0.00, NULL, '["5 agendamentos por mês", "1 membro da equipe", "Suporte por email"]', 5, 1, 1),
('Premium', 'Plano completo para profissionais', 39.90, 'price_premium_monthly', '["Agendamentos ilimitados", "Até 5 membros da equipe", "Relatórios avançados", "Suporte prioritário"]', -1, 5, 2),
('Enterprise', 'Solução para clínicas e grandes equipes', 99.90, 'price_enterprise_monthly', '["Agendamentos ilimitados", "Membros ilimitados", "API personalizada", "Suporte dedicado", "Integração personalizada"]', -1, -1, 3);
