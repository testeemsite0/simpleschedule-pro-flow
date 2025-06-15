
-- Corrigir todas as políticas RLS que estão faltando

-- Políticas para a tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para a tabela subscription_plans (já existe uma política pública)
-- Adicionar política para admins gerenciarem
CREATE POLICY "Admins can manage subscription plans" 
ON public.subscription_plans 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Políticas para a tabela webhook_logs
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view webhook logs" 
ON public.webhook_logs 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Políticas para a tabela admin_audit_logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" 
ON public.admin_audit_logs 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Políticas para a tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Políticas para a tabela appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments" 
ON public.appointments 
FOR SELECT 
USING (auth.uid() = professional_id);

CREATE POLICY "Users can manage own appointments" 
ON public.appointments 
FOR ALL 
USING (auth.uid() = professional_id) 
WITH CHECK (auth.uid() = professional_id);

-- Políticas para a tabela services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own services" 
ON public.services 
FOR SELECT 
USING (auth.uid() = professional_id);

CREATE POLICY "Users can manage own services" 
ON public.services 
FOR ALL 
USING (auth.uid() = professional_id) 
WITH CHECK (auth.uid() = professional_id);

-- Políticas para a tabela time_slots
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own time slots" 
ON public.time_slots 
FOR SELECT 
USING (auth.uid() = professional_id);

CREATE POLICY "Users can manage own time slots" 
ON public.time_slots 
FOR ALL 
USING (auth.uid() = professional_id) 
WITH CHECK (auth.uid() = professional_id);

-- Políticas para a tabela team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own team members" 
ON public.team_members 
FOR SELECT 
USING (auth.uid() = professional_id);

CREATE POLICY "Users can manage own team members" 
ON public.team_members 
FOR ALL 
USING (auth.uid() = professional_id) 
WITH CHECK (auth.uid() = professional_id);

-- Políticas para a tabela insurance_plans
ALTER TABLE public.insurance_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insurance plans" 
ON public.insurance_plans 
FOR SELECT 
USING (auth.uid() = professional_id);

CREATE POLICY "Users can manage own insurance plans" 
ON public.insurance_plans 
FOR ALL 
USING (auth.uid() = professional_id) 
WITH CHECK (auth.uid() = professional_id);

-- Políticas para a tabela clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients" 
ON public.clients 
FOR SELECT 
USING (auth.uid() = professional_id);

CREATE POLICY "Users can manage own clients" 
ON public.clients 
FOR ALL 
USING (auth.uid() = professional_id) 
WITH CHECK (auth.uid() = professional_id);

-- Políticas para as tabelas de configuração do sistema
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage system settings" 
ON public.system_settings 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Permitir leitura pública das configurações do sistema
CREATE POLICY "Anyone can read system config" 
ON public.system_config 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage system config" 
ON public.system_config 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin'));
