
-- Permitir leitura pública dos planos ativos para a página de preços
DROP POLICY IF EXISTS "public_read_active_plans" ON public.subscription_plans;

CREATE POLICY "Public can read active plans" 
ON public.subscription_plans 
FOR SELECT 
USING (is_active = true);

-- Política separada para usuários autenticados lerem todos os planos ativos
CREATE POLICY "Authenticated users can read active plans" 
ON public.subscription_plans 
FOR SELECT 
TO authenticated
USING (is_active = true);
