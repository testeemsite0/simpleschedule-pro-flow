
# Documentação do Banco de Dados - Sistema de Agendamentos

## Estrutura Geral

O sistema utiliza **PostgreSQL** através do **Supabase** com as seguintes características:
- Row Level Security (RLS) habilitado
- Triggers automáticos para auditoria
- Funções personalizadas para lógica de negócio
- Índices otimizados para performance

## Esquemas de Dados

### 1. Autenticação e Perfis

#### Tabela: profiles
**Propósito:** Armazenar informações do perfil do usuário profissional

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  profession TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  avatar TEXT,
  company_name TEXT,
  display_name TEXT,
  company_type TEXT DEFAULT 'individual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Relacionamentos:**
- `id` → `auth.users(id)` (1:1)

**Índices:**
- PRIMARY KEY: `id`
- UNIQUE: `slug`
- INDEX: `email`

---

#### Tabela: company_settings
**Propósito:** Configurações específicas da empresa/profissional

```sql
CREATE TABLE public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  display_name TEXT NOT NULL,
  company_type TEXT NOT NULL DEFAULT 'individual',
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  address TEXT,
  phone TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_id)
);
```

**Relacionamentos:**
- `professional_id` → `auth.users(id)` (1:1)

**Constraints:**
- UNIQUE: `professional_id` (um profissional = uma configuração)

---

### 2. Gestão de Equipe

#### Tabela: team_members
**Propósito:** Membros da equipe que podem realizar atendimentos

```sql
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  position TEXT,
  avatar TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Relacionamentos:**
- `professional_id` → `profiles(id)` (N:1)

**Índices:**
- INDEX: `professional_id`
- INDEX: `active`

---

### 3. Serviços e Planos

#### Tabela: services
**Propósito:** Serviços oferecidos pelo profissional

```sql
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Relacionamentos:**
- `professional_id` → `profiles(id)` (N:1)

**Constraints:**
- `price` >= 0
- `duration_minutes` > 0

---

#### Tabela: insurance_plans
**Propósito:** Planos de convênio médico aceitos

```sql
CREATE TABLE public.insurance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL,
  name TEXT NOT NULL,
  limit_per_plan INTEGER,
  current_appointments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Relacionamentos:**
- `professional_id` → `profiles(id)` (N:1)

**Constraints:**
- `limit_per_plan` >= 0 (quando não NULL)
- `current_appointments` >= 0

---

#### Tabela: team_member_insurance_plans
**Propósito:** Relacionamento N:N entre membros da equipe e planos de convênio

```sql
CREATE TABLE public.team_member_insurance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL,
  insurance_plan_id UUID NOT NULL,
  limit_per_member INTEGER,
  current_appointments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(team_member_id, insurance_plan_id)
);
```

**Relacionamentos:**
- `team_member_id` → `team_members(id)` (N:1)
- `insurance_plan_id` → `insurance_plans(id)` (N:1)

---

#### Tabela: team_member_services
**Propósito:** Relacionamento N:N entre membros da equipe e serviços

```sql
CREATE TABLE public.team_member_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL,
  service_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(team_member_id, service_id)
);
```

**Relacionamentos:**
- `team_member_id` → `team_members(id)` (N:1)
- `service_id` → `services(id)` (N:1)

---

### 4. Horários e Disponibilidade

#### Tabela: time_slots
**Propósito:** Configuração de horários de trabalho

```sql
CREATE TABLE public.time_slots (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  professional_id UUID NOT NULL,
  team_member_id UUID,
  day_of_week INTEGER NOT NULL, -- 0=Domingo, 1=Segunda, ..., 6=Sábado
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  appointment_duration_minutes INTEGER DEFAULT 60,
  lunch_break_start TIME,
  lunch_break_end TIME,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Relacionamentos:**
- `professional_id` → `profiles(id)` (N:1)
- `team_member_id` → `team_members(id)` (N:1)

**Constraints:**
- `day_of_week` BETWEEN 0 AND 6
- `start_time` < `end_time`
- `appointment_duration_minutes` > 0
- Se `lunch_break_start` não NULL, então `lunch_break_end` não NULL
- `lunch_break_start` < `lunch_break_end` (quando ambos não NULL)

**Índices:**
- INDEX: `professional_id`
- INDEX: `team_member_id`
- INDEX: `day_of_week`
- INDEX: `available`

---

### 5. Agendamentos

#### Tabela: appointments
**Propósito:** Agendamentos realizados

```sql
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  professional_id UUID NOT NULL,
  team_member_id UUID,
  service_id UUID,
  insurance_plan_id UUID,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'canceled'
  source CHARACTER VARYING DEFAULT 'client', -- 'client', 'manual'
  price NUMERIC,
  free_tier_used BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Relacionamentos:**
- `professional_id` → `profiles(id)` (N:1)
- `team_member_id` → `team_members(id)` (N:1)
- `service_id` → `services(id)` (N:1)
- `insurance_plan_id` → `insurance_plans(id)` (N:1)

**Constraints:**
- `status` IN ('scheduled', 'completed', 'canceled')
- `source` IN ('client', 'manual')
- `start_time` < `end_time`
- `price` >= 0 (quando não NULL)

**Índices:**
- INDEX: `professional_id`
- INDEX: `team_member_id`
- INDEX: `date`
- INDEX: `status`
- INDEX: `source`
- UNIQUE: `professional_id, team_member_id, date, start_time` (previne conflitos)

---

### 6. Clientes

#### Tabela: clients
**Propósito:** Histórico e estatísticas de clientes

```sql
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  last_appointment TIMESTAMP WITH TIME ZONE,
  total_appointments INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Relacionamentos:**
- `professional_id` → `profiles(id)` (N:1)

**Constraints:**
- `total_appointments` >= 0
- `total_revenue` >= 0

**Índices:**
- INDEX: `professional_id`
- INDEX: `email`

---

### 7. Configurações do Sistema

#### Tabela: system_preferences
**Propósito:** Preferências individuais do profissional

```sql
CREATE TABLE public.system_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL,
  default_appointment_duration INTEGER DEFAULT 60,
  appointment_buffer_minutes INTEGER DEFAULT 0,
  working_hours_start TIME DEFAULT '08:00:00',
  working_hours_end TIME DEFAULT '18:00:00',
  working_days INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5], -- Segunda a Sexta
  notifications_enabled BOOLEAN DEFAULT true,
  reminder_hours_before INTEGER DEFAULT 24,
  calendar_view TEXT DEFAULT 'week',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(professional_id)
);
```

**Relacionamentos:**
- `professional_id` → `profiles(id)` (1:1)

---

#### Tabela: system_config
**Propósito:** Configurações globais do sistema

```sql
CREATE TABLE public.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  premium_price NUMERIC NOT NULL DEFAULT 39.90,
  stripe_price_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

### 8. Assinaturas e Pagamentos

#### Tabela: subscribers
**Propósito:** Controle de assinaturas dos usuários

```sql
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  email TEXT NOT NULL,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Relacionamentos:**
- `user_id` → `auth.users(id)` (1:1)

---

#### Tabela: subscription_history
**Propósito:** Histórico de assinaturas e pagamentos

```sql
CREATE TABLE public.subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  subscription_tier TEXT,
  status TEXT,
  stripe_subscription_id TEXT,
  amount NUMERIC,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  cancellation_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Relacionamentos:**
- `user_id` → `auth.users(id)` (N:1)

---

## Funções de Banco de Dados

### 1. Atualização Automática de Timestamps
```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Uso:** Trigger em todas as tabelas com `updated_at`

---

### 2. Criação Automática de Perfil
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, profession, slug)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'profession', 'Não especificado'),
    COALESCE(NEW.raw_user_meta_data->>'slug', LOWER(REPLACE(NEW.email, '@', '-at-')))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Uso:** Trigger na tabela `auth.users` para INSERT

---

### 3. Atualização de Contadores de Convênio
```sql
CREATE OR REPLACE FUNCTION public.update_insurance_plan_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.insurance_plan_id IS NOT NULL AND NEW.status = 'scheduled' THEN
    UPDATE public.insurance_plans 
    SET current_appointments = current_appointments + 1
    WHERE id = NEW.insurance_plan_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'scheduled' AND NEW.status = 'canceled' AND NEW.insurance_plan_id IS NOT NULL THEN
    UPDATE public.insurance_plans 
    SET current_appointments = GREATEST(current_appointments - 1, 0)
    WHERE id = NEW.insurance_plan_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 4. Atualização de Estatísticas de Cliente
```sql
CREATE OR REPLACE FUNCTION public.update_client_statistics()
RETURNS trigger AS $$
DECLARE
  client_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.clients 
    WHERE professional_id = NEW.professional_id AND email = NEW.client_email
  ) INTO client_exists;
  
  IF client_exists THEN
    -- Atualiza cliente existente
    UPDATE public.clients
    SET 
      last_appointment = GREATEST(last_appointment, NEW.date::timestamp with time zone),
      total_appointments = CASE 
        WHEN NEW.status = 'scheduled' AND (TG_OP = 'INSERT' OR OLD.status != 'scheduled') THEN total_appointments + 1
        WHEN OLD.status = 'scheduled' AND NEW.status != 'scheduled' THEN GREATEST(total_appointments - 1, 0)
        ELSE total_appointments
      END,
      total_revenue = CASE
        WHEN NEW.status = 'completed' AND NEW.price IS NOT NULL THEN total_revenue + NEW.price
        WHEN OLD.status = 'completed' AND NEW.status != 'completed' AND OLD.price IS NOT NULL THEN GREATEST(total_revenue - OLD.price, 0)
        ELSE total_revenue
      END,
      updated_at = now()
    WHERE professional_id = NEW.professional_id AND email = NEW.client_email;
  ELSE
    -- Cria novo cliente
    INSERT INTO public.clients (
      professional_id, name, email, phone, last_appointment,
      total_appointments, total_revenue
    ) VALUES (
      NEW.professional_id, NEW.client_name, NEW.client_email, NEW.client_phone,
      NEW.date::timestamp with time zone,
      CASE WHEN NEW.status = 'scheduled' THEN 1 ELSE 0 END,
      CASE WHEN NEW.status = 'completed' AND NEW.price IS NOT NULL THEN NEW.price ELSE 0 END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 5. Verificação de Capacidade do Convênio
```sql
CREATE OR REPLACE FUNCTION public.can_team_member_accept_insurance(member_id uuid, plan_id uuid)
RETURNS boolean AS $$
DECLARE
  can_accept BOOLEAN;
BEGIN
  SELECT 
    CASE 
      WHEN tmip.limit_per_member IS NULL THEN TRUE
      WHEN tmip.current_appointments < tmip.limit_per_member THEN TRUE
      ELSE FALSE
    END INTO can_accept
  FROM 
    public.team_member_insurance_plans tmip
  WHERE 
    tmip.team_member_id = member_id AND 
    tmip.insurance_plan_id = plan_id;
    
  RETURN COALESCE(can_accept, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Triggers

### 1. Atualização Automática de updated_at
```sql
-- Para cada tabela com updated_at
CREATE TRIGGER update_[table_name]_updated_at
  BEFORE UPDATE ON public.[table_name]
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

### 2. Criação de Perfil para Novo Usuário
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 3. Atualização de Contadores
```sql
CREATE TRIGGER update_insurance_plan_count_trigger
  AFTER INSERT OR UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_insurance_plan_count();

CREATE TRIGGER update_client_statistics_trigger
  AFTER INSERT OR UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_client_statistics();
```

---

## Row Level Security (RLS)

### Políticas Padrão

Todas as tabelas principais implementam as seguintes políticas:

```sql
-- Exemplo para appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own appointments" 
  ON public.appointments FOR SELECT 
  USING (auth.uid() = professional_id);

CREATE POLICY "Users can create their own appointments" 
  ON public.appointments FOR INSERT 
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Users can update their own appointments" 
  ON public.appointments FOR UPDATE 
  USING (auth.uid() = professional_id);

CREATE POLICY "Users can delete their own appointments" 
  ON public.appointments FOR DELETE 
  USING (auth.uid() = professional_id);
```

### Exceções de RLS

- Tabelas de configuração global (`system_config`)
- Algumas consultas públicas para agendamento externo

---

## Índices de Performance

### Índices Críticos
```sql
-- Appointments
CREATE INDEX idx_appointments_professional_date ON public.appointments(professional_id, date);
CREATE INDEX idx_appointments_team_member_date ON public.appointments(team_member_id, date);
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- Time Slots
CREATE INDEX idx_time_slots_professional_day ON public.time_slots(professional_id, day_of_week);
CREATE INDEX idx_time_slots_team_member_day ON public.time_slots(team_member_id, day_of_week);

-- Clients
CREATE INDEX idx_clients_professional_email ON public.clients(professional_id, email);
```

---

## Queries Mais Utilizadas

### 1. Buscar Agendamentos do Profissional
```sql
SELECT 
  a.*,
  tm.name as team_member_name,
  s.name as service_name,
  ip.name as insurance_plan_name
FROM appointments a
LEFT JOIN team_members tm ON a.team_member_id = tm.id
LEFT JOIN services s ON a.service_id = s.id
LEFT JOIN insurance_plans ip ON a.insurance_plan_id = ip.id
WHERE a.professional_id = $1
  AND a.date >= CURRENT_DATE
ORDER BY a.date, a.start_time;
```

### 2. Verificar Disponibilidade
```sql
SELECT ts.*
FROM time_slots ts
WHERE ts.professional_id = $1
  AND (ts.team_member_id = $2 OR ts.team_member_id IS NULL)
  AND ts.day_of_week = $3
  AND ts.available = true
  AND NOT EXISTS (
    SELECT 1 FROM appointments a
    WHERE a.professional_id = $1
      AND a.team_member_id = COALESCE($2, ts.team_member_id)
      AND a.date = $4
      AND a.status = 'scheduled'
      AND (
        (a.start_time < ts.end_time AND a.end_time > ts.start_time)
      )
  );
```

### 3. Relatório de Receita
```sql
SELECT 
  DATE_TRUNC('month', date) as month,
  COUNT(*) as total_appointments,
  SUM(price) as total_revenue,
  COUNT(DISTINCT client_email) as unique_clients
FROM appointments
WHERE professional_id = $1
  AND status = 'completed'
  AND date >= $2
  AND date <= $3
GROUP BY DATE_TRUNC('month', date)
ORDER BY month;
```

---

## Backup e Manutenção

### Backup Automático
- Supabase realiza backup automático diário
- Retenção de 7 dias para plano gratuito
- Point-in-time recovery disponível

### Manutenção Preventiva
```sql
-- Limpeza de dados antigos (executar mensalmente)
DELETE FROM subscription_history 
WHERE created_at < NOW() - INTERVAL '2 years';

-- Atualização de estatísticas
ANALYZE public.appointments;
ANALYZE public.clients;
```

### Monitoramento
```sql
-- Verificar tamanho das tabelas
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Verificar queries lentas
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

Este documento serve como referência completa para a estrutura e operação do banco de dados do sistema de agendamentos.
