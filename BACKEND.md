
# Documentação do Backend - Sistema de Agendamentos

## Arquitetura Geral

O sistema utiliza **Supabase** como backend principal, fornecendo:
- Banco de dados PostgreSQL
- Autenticação JWT
- Row Level Security (RLS)
- Real-time subscriptions
- Edge Functions
- Storage de arquivos

## Estrutura de Dados

### Tabelas Principais

#### 1. profiles
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
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

#### 2. company_settings
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

#### 3. team_members
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

#### 4. services
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

#### 5. time_slots
```sql
CREATE TABLE public.time_slots (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  professional_id UUID NOT NULL,
  team_member_id UUID,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
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

#### 6. appointments
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

#### 7. insurance_plans
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

#### 8. clients
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

## Contexts e Hooks

### 1. AuthContext
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
```

### 2. AppointmentContext
```typescript
interface AppointmentContextType {
  appointments: Appointment[];
  setAppointments: (appointments: Appointment[]) => void;
  getAppointmentsByProfessional: (professionalId: string) => Promise<Appointment[]>;
  addAppointment: (appointment: Appointment) => void;
  cancelAppointment: (appointmentId: string) => Promise<boolean>;
  countMonthlyAppointments: (professionalId: string) => Promise<number>;
  isWithinFreeLimit: (professionalId: string) => Promise<boolean>;
}
```

### 3. UnifiedBookingContext
```typescript
interface UnifiedBookingContextType {
  currentStep: BookingStep;
  bookingData: BookingData;
  teamMembers: TeamMember[];
  services: Service[];
  insurancePlans: InsurancePlan[];
  availableDates: Date[];
  availableSlots: AvailableSlot[];
  isLoading: boolean;
  error: string | null;
  maintenanceMode: boolean;
  // ... métodos de controle
}
```

## Services e APIs

### 1. Appointment Service
```typescript
// src/hooks/booking/api/services/appointmentService.ts
export const fetchAppointments = (professionalId: string, signal?: AbortSignal) => Promise<Appointment[]>
export const createAppointment = (appointmentData: any) => Promise<{data: any, error: any}>
```

### 2. Team Member Service
```typescript
// src/hooks/booking/api/services/teamMemberService.ts
export const fetchTeamMembers = (professionalId: string, signal?: AbortSignal) => Promise<TeamMember[]>
```

### 3. Time Slot Service
```typescript
// src/hooks/booking/api/services/timeSlotService.ts
export const fetchTimeSlots = (professionalId: string, signal?: AbortSignal) => Promise<TimeSlot[]>
```

### 4. Company Settings Service
```typescript
// src/hooks/useCompanySettings.tsx
export const useCompanySettings = () => {
  return {
    settings: CompanySettings | null;
    loading: boolean;
    error: string | null;
    updateSettings: (updates: Partial<CompanySettings>) => Promise<boolean>;
    refetch: () => Promise<void>;
  }
}
```

## Funções de Banco de Dados

### 1. Atualização de Contadores
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
$$ LANGUAGE plpgsql;
```

### 2. Atualização de Estatísticas de Cliente
```sql
CREATE OR REPLACE FUNCTION public.update_client_statistics()
RETURNS trigger AS $$
-- Função que atualiza estatísticas do cliente automaticamente
```

### 3. Verificação de Limites
```sql
CREATE OR REPLACE FUNCTION public.can_team_member_accept_insurance(member_id uuid, plan_id uuid)
RETURNS boolean AS $$
-- Função que verifica se um membro da equipe pode aceitar um plano de seguro
```

## Edge Functions

### 1. check-subscription
```typescript
// supabase/functions/check-subscription/index.ts
// Verifica status da assinatura do usuário
// Retorna informações sobre limites e plano atual
```

### 2. create-checkout
```typescript
// supabase/functions/create-checkout/index.ts
// Cria sessão de checkout do Stripe
```

### 3. customer-portal
```typescript
// supabase/functions/customer-portal/index.ts
// Acesso ao portal do cliente Stripe
```

## Row Level Security (RLS)

### Políticas Principais

#### 1. Company Settings
```sql
-- Usuários podem ver apenas suas configurações
CREATE POLICY "Users can view their own company settings" 
  ON public.company_settings FOR SELECT 
  USING (auth.uid() = professional_id);

-- Usuários podem criar suas configurações
CREATE POLICY "Users can create their own company settings" 
  ON public.company_settings FOR INSERT 
  WITH CHECK (auth.uid() = professional_id);

-- Usuários podem atualizar suas configurações
CREATE POLICY "Users can update their own company settings" 
  ON public.company_settings FOR UPDATE 
  USING (auth.uid() = professional_id);
```

#### 2. Appointments
```sql
-- Políticas similares para appointments, team_members, services, etc.
-- Cada usuário só pode acessar seus próprios dados
```

## Sistema de Cache

### 1. Cache de Dados
```typescript
// src/hooks/booking/api/storageCache.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export const cacheGet = <T>(key: string): T | null
export const cacheSet = <T>(key: string, data: T, ttl?: number): void
export const cacheDelete = (key: string): void
export const cacheClear = (): void
```

### 2. Cache de Profissionais
```typescript
// src/hooks/booking/cache/professionalCache.ts
export const getProfessionalFromCache = (identifier: string): Professional | null
export const setProfessionalCache = (identifier: string, professional: Professional): void
export const clearProfessionalCache = (identifier?: string): void
```

## Real-time Updates

### 1. Configuração
```typescript
// src/hooks/useAppointmentsRealtime.tsx
export const useAppointmentsRealtime = ({ 
  professionalId, 
  onAppointmentChange 
}: UseAppointmentsRealtimeProps) => {
  // Configuração de canal real-time
  // Escuta mudanças na tabela appointments
}
```

### 2. Implementação
```typescript
const channel = supabase
  .channel('appointments-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'appointments'
  }, handleRealtimeChange)
  .subscribe();
```

## Utilities de Timezone

### 1. Funções Principais
```typescript
// src/utils/dynamicTimezone.ts
export const getCurrentTimeInTimezone = (timezone: string) => Date
export const localDateToUTC = (localDate: Date, timezone: string) => Date
export const utcToLocalDate = (utcDate: Date, timezone: string) => Date
export const formatDateInTimezone = (date: Date, timezone: string, format: string) => string
export const isSlotInPastInTimezone = (slotDate: Date, slotTime: string, timezone: string) => boolean
```

### 2. Fusos Horários Suportados
```typescript
export const BRAZILIAN_TIMEZONES = {
  'America/Sao_Paulo': 'UTC-3 (Brasília, São Paulo, Rio de Janeiro)',
  'America/Manaus': 'UTC-4 (Manaus, Cuiabá)',
  'America/Rio_Branco': 'UTC-5 (Rio Branco, Acre)',
  'America/Fortaleza': 'UTC-3 (Fortaleza, Natal)',
  'America/Recife': 'UTC-3 (Recife, Salvador)',
  'America/Belem': 'UTC-3 (Belém)',
  'America/Campo_Grande': 'UTC-4 (Campo Grande)',
  'America/Boa_Vista': 'UTC-4 (Boa Vista)'
} as const;
```

## Validações e Segurança

### 1. Validação de Conflitos
```typescript
// Verificação de agendamentos duplicados
const checkAppointmentConflict = async () => {
  const { data, error } = await supabase
    .from('appointments')
    .select('id')
    .eq('professional_id', professionalId)
    .eq('team_member_id', teamMemberId)
    .eq('date', formattedDate)
    .eq('start_time', startTime)
    .eq('status', 'scheduled');
    
  return data && data.length > 0;
}
```

### 2. Verificação de Limites
```typescript
// Verificação de limites do plano gratuito
const isWithinFreeLimit = async (professionalId: string): Promise<boolean> => {
  const { data, error } = await supabase.functions.invoke('check-subscription', {
    body: { userId: professionalId }
  });
  
  return data?.isWithinFreeLimit || false;
}
```

## Performance e Otimização

### 1. Lazy Loading
- Carregamento sob demanda de dados
- Paginação em listas grandes
- Cache inteligente com TTL

### 2. Otimização de Queries
- Seleção apenas de campos necessários
- Filtros eficientes por data
- Índices adequados no banco

### 3. Bundle Splitting
- Separação de código por rotas
- Carregamento assíncrono de componentes
- Otimização de imports

## Monitoramento e Logs

### 1. Logs de Sistema
```typescript
console.log('AppointmentService: Executing DB query for professional:', professionalId);
console.log('Generated slots for date with timezone:', timezone);
console.error('Error in conflict check:', error);
```

### 2. Edge Function Logs
- Logs automáticos das Edge Functions
- Monitoramento via Dashboard Supabase
- Alertas de erro configuráveis

## Backup e Recuperação

### 1. Backup Automático
- Backup diário do Supabase
- Retenção de 7 dias (plano gratuito)
- Backup sob demanda disponível

### 2. Migração de Dados
- Scripts SQL versionados
- Rollback automático em caso de erro
- Validação de integridade pós-migração

Este documento serve como referência completa para a arquitetura de backend do sistema de agendamentos.
