
-- 1. Criar tabela de funcionalidades do sistema
CREATE TABLE public.system_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Criar tabela de relação N:N entre planos de assinatura e funcionalidades
CREATE TABLE public.subscription_plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES public.system_features(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_plan_feature UNIQUE (subscription_plan_id, feature_id)
);

-- 3. Políticas de RLS para system_features
ALTER TABLE public.system_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin pode tudo em system_features"
  ON public.system_features
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Políticas de RLS para subscription_plan_features
ALTER TABLE public.subscription_plan_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin pode tudo em subscription_plan_features"
  ON public.subscription_plan_features
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Popular com algumas features de exemplo (adicione/edite depois se desejar)
INSERT INTO public.system_features (key, label, description) VALUES
  ('booking', 'Agendamento Online', 'Permite agendar compromissos pela internet.'),
  ('team_management', 'Gestão de Equipe', 'Permite adicionar/remover membros da equipe.'),
  ('insurance_support', 'Suporte a Convênios', 'Gerenciar planos de convênios médicos.'),
  ('advanced_reports', 'Relatórios Avançados', 'Acesso a relatórios detalhados.'),
  ('client_management', 'Gestão de Clientes', 'Registro e histórico de clientes.');

-- 6. Opcional: Remover o campo "features" da tabela original para evitar ambiguidade
-- (Se você já migrou todos os planos para usar a nova estrutura)
-- ALTER TABLE public.subscription_plans DROP COLUMN features;
