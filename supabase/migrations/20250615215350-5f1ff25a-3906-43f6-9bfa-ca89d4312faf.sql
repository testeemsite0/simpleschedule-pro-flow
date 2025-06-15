
-- 1. Corrigir políticas RLS conflitantes e garantir que todas as tabelas admin tenham acesso correto

-- Primeiro, vamos garantir que as políticas existentes estão corretas para subscription_plans
DROP POLICY IF EXISTS "Anyone can read subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Admins can manage subscription plans" ON public.subscription_plans;

-- Política para leitura pública dos planos (necessário para página de preços)
CREATE POLICY "Anyone can read subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (true);

-- Política para admins gerenciarem planos
CREATE POLICY "Admins can manage subscription plans" 
ON public.subscription_plans 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Garantir que system_features tem políticas corretas
DROP POLICY IF EXISTS "Admin pode tudo em system_features" ON public.system_features;
DROP POLICY IF EXISTS "Anyone can read system features" ON public.system_features;

-- Leitura pública das features (para exibir na página de preços)
CREATE POLICY "Anyone can read system features" 
ON public.system_features 
FOR SELECT 
USING (true);

-- Admins podem gerenciar features
CREATE POLICY "Admins can manage system features" 
ON public.system_features 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Garantir que subscription_plan_features tem políticas corretas
DROP POLICY IF EXISTS "Admin pode tudo em subscription_plan_features" ON public.subscription_plan_features;
DROP POLICY IF EXISTS "Anyone can read plan features" ON public.subscription_plan_features;

-- Leitura pública das relações plano-features
CREATE POLICY "Anyone can read plan features" 
ON public.subscription_plan_features 
FOR SELECT 
USING (true);

-- Admins podem gerenciar relações
CREATE POLICY "Admins can manage plan features" 
ON public.subscription_plan_features 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Corrigir políticas para profiles (usada nos JOINs de auditoria)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Usuários podem ver e atualizar seu próprio perfil
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Admins podem ver todos os perfis (necessário para logs de auditoria)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Admins podem gerenciar todos os perfis
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Garantir que user_roles tem políticas corretas
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Usuários podem ver seus próprios papéis
CREATE POLICY "Users can view own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins podem gerenciar todos os papéis
CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Garantir que admin_audit_logs tem políticas corretas
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;

CREATE POLICY "Admins can view audit logs" 
ON public.admin_audit_logs 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Garantir que webhook_logs tem políticas corretas
DROP POLICY IF EXISTS "Admins can view webhook logs" ON public.webhook_logs;

CREATE POLICY "Admins can view webhook logs" 
ON public.webhook_logs 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin'));
