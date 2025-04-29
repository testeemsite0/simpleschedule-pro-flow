
-- Create table for system configuration
CREATE TABLE public.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  premium_price DECIMAL(10, 2) NOT NULL DEFAULT 39.90,
  stripe_price_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert initial configuration
INSERT INTO public.system_config (premium_price, stripe_price_id)
VALUES (39.90, 'price_initial');

-- Grant access to authenticated users (but RLS will restrict operations)
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Only allow admin users to update system config (will be enforced in application code)
CREATE POLICY "Anyone can read system config" 
  ON public.system_config 
  FOR SELECT 
  USING (true);
