
# Dicionário de Dados do Sistema

## Índice
1. [Interfaces Principais](#interfaces-principais)
2. [Tipos de Autenticação](#tipos-de-autenticação)
3. [Tipos de Agendamento](#tipos-de-agendamento)
4. [Tipos de Equipe](#tipos-de-equipe)
5. [Tipos de Serviços](#tipos-de-serviços)
6. [Tipos de Convênios](#tipos-de-convênios)
7. [Tipos de Secretárias](#tipos-de-secretárias)
8. [Tipos de Sistema](#tipos-de-sistema)
9. [Enums e Constantes](#enums-e-constantes)
10. [Tipos de Formulários](#tipos-de-formulários)
11. [Tipos de Contexto](#tipos-de-contexto)

## Interfaces Principais

### User
Interface base para usuários do sistema.

```typescript
interface User {
  id: string;              // UUID único do usuário
  email: string;           // Email único para autenticação
  name: string;            // Nome completo do usuário
  slug?: string;           // Slug único para URLs amigáveis (opcional)
}
```

**Campos:**
- `id`: Identificador único UUID, chave primária
- `email`: Endereço de email único, usado para autenticação
- `name`: Nome completo do usuário para exibição
- `slug`: Identificador amigável para URLs públicas (opcional)

**Relacionamentos:**
- Base para todas as outras interfaces de usuário
- Usado como referência em `Professional`

---

### Professional
Interface para profissionais que oferecem serviços.

```typescript
interface Professional {
  id: string;              // UUID único do profissional
  name: string;            // Nome completo
  email: string;           // Email de contato
  profession: string;      // Profissão (ex: "Médico", "Dentista")
  bio?: string;            // Biografia/descrição (opcional)
  slug: string;            // Slug único para agendamento público
  address?: string;        // Endereço do consultório (opcional)
  avatar?: string;         // URL da foto de perfil (opcional)
}
```

**Campos:**
- `id`: UUID único, referência para `auth.users`
- `name`: Nome completo para exibição
- `email`: Email de contato profissional
- `profession`: Área de atuação profissional
- `bio`: Descrição ou biografia (opcional)
- `slug`: Identificador único para URL de agendamento
- `address`: Endereço físico do consultório (opcional)
- `avatar`: URL da imagem de perfil (opcional)

**Relacionamentos:**
- Um para muitos com `Appointment`
- Um para muitos com `Service`
- Um para muitos com `TeamMember`
- Um para muitos com `TimeSlot`

## Tipos de Autenticação

### AuthContextType
Contexto principal de autenticação da aplicação.

```typescript
interface AuthContextType {
  user: Professional | null;                           // Usuário autenticado
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, profession: string) => Promise<boolean>;
  logout: () => void;                                  // Função para logout
  isAuthenticated: boolean;                            // Status de autenticação
  isLoading: boolean;                                  // Status de carregamento
}
```

**Métodos:**
- `login`: Autentica usuário com email/senha
- `register`: Registra novo usuário profissional
- `logout`: Encerra sessão atual

**Estados:**
- `isAuthenticated`: Indica se há usuário logado
- `isLoading`: Indica carregamento de dados de auth

---

### AuthState
Estado interno do sistema de autenticação.

```typescript
interface AuthState {
  user: Professional | null;    // Usuário atual
  isLoading: boolean;           // Carregando dados
}
```

---

### RegisterFormValues
Valores do formulário de registro.

```typescript
type RegisterFormValues = {
  name: string;                 // Nome completo
  email: string;                // Email único
  profession: string;           // Profissão
  password: string;             // Senha
  confirmPassword: string;      // Confirmação de senha
};
```

**Validações:**
- `name`: Obrigatório, mínimo 2 caracteres
- `email`: Formato de email válido
- `profession`: Obrigatório
- `password`: Mínimo 6 caracteres
- `confirmPassword`: Deve coincidir com password

## Tipos de Agendamento

### Appointment
Interface principal para agendamentos.

```typescript
interface Appointment {
  id: string;                   // UUID único do agendamento
  professional_id: string;     // UUID do profissional
  client_name: string;         // Nome do cliente
  client_email: string;        // Email do cliente
  client_phone?: string;       // Telefone do cliente (opcional)
  date: string;                // Data no formato YYYY-MM-DD
  start_time: string;          // Horário início HH:MM
  end_time: string;            // Horário fim HH:MM
  notes?: string;              // Observações (opcional)
  status: 'scheduled' | 'completed' | 'canceled' | 'no_show';
  created_at?: string;         // Data de criação
  updated_at?: string;         // Data de atualização
  source?: 'client' | 'manual'; // Origem do agendamento
  service_id?: string;         // UUID do serviço (opcional)
  price?: number;              // Valor cobrado (opcional)
  team_member_id?: string;     // UUID do membro da equipe (opcional)
  insurance_plan_id?: string;  // UUID do convênio (opcional)
  free_tier_used: boolean;     // Se usou tier gratuito
}
```

**Status Possíveis:**
- `scheduled`: Agendado
- `completed`: Realizado
- `canceled`: Cancelado
- `no_show`: Cliente não compareceu

**Origem:**
- `client`: Agendado pelo cliente via web
- `manual`: Agendado manualmente pelo profissional

**Relacionamentos:**
- Pertence a um `Professional`
- Pode ter um `Service`
- Pode ter um `TeamMember`
- Pode ter um `InsurancePlan`

## Tipos de Equipe

### TeamMember
Interface para membros da equipe.

```typescript
interface TeamMember {
  id: string;                  // UUID único
  professional_id: string;    // UUID do profissional responsável
  name: string;                // Nome do membro
  email?: string;              // Email (opcional)
  position?: string;           // Cargo/posição (opcional)
  avatar?: string;             // URL da foto (opcional)
  active: boolean;             // Se está ativo
  created_at: string;          // Data de criação
  updated_at: string;          // Data de atualização
  services?: Service[];        // Serviços que pode realizar
  insurancePlans?: TeamMemberInsurancePlan[]; // Convênios associados
  availableInsurancePlans?: InsurancePlan[];  // Convênios disponíveis
}
```

**Relacionamentos:**
- Pertence a um `Professional`
- Muitos para muitos com `Service` via `TeamMemberService`
- Muitos para muitos com `InsurancePlan` via `TeamMemberInsurancePlan`
- Um para muitos com `TimeSlot`
- Um para muitos com `Appointment`

---

### TeamMemberService
Relacionamento entre membro da equipe e serviços.

```typescript
interface TeamMemberService {
  id: string;                  // UUID único
  team_member_id: string;      // UUID do membro
  service_id: string;          // UUID do serviço
  created_at: string;          // Data de associação
}
```

---

### TeamMemberInsurancePlan
Relacionamento entre membro da equipe e convênios.

```typescript
interface TeamMemberInsurancePlan {
  id: string;                  // UUID único
  team_member_id: string;      // UUID do membro
  insurance_plan_id: string;   // UUID do convênio
  limit_per_member: number | null;     // Limite por membro
  current_appointments: number;        // Agendamentos atuais
  created_at: string;          // Data de criação
  insurancePlan?: InsurancePlan;       // Dados do convênio
  availableForBooking?: boolean;       // Disponível para agendamento
}
```

## Tipos de Serviços

### Service
Interface para serviços oferecidos.

```typescript
interface Service {
  id: string;                  // UUID único
  professional_id: string;    // UUID do profissional
  name: string;                // Nome do serviço
  description?: string;        // Descrição (opcional)
  price: number;               // Preço do serviço
  duration_minutes: number;    // Duração em minutos
  active: boolean;             // Se está ativo
  created_at?: string;         // Data de criação
  updated_at?: string;         // Data de atualização
}
```

**Validações:**
- `price`: Deve ser >= 0
- `duration_minutes`: Deve ser > 0
- `name`: Obrigatório

**Relacionamentos:**
- Pertence a um `Professional`
- Muitos para muitos com `TeamMember`
- Um para muitos com `Appointment`

## Tipos de Convênios

### InsurancePlan
Interface para planos de convênio.

```typescript
interface InsurancePlan {
  id: string;                  // UUID único
  name: string;                // Nome do convênio
  professional_id: string;    // UUID do profissional
  created_at: string;          // Data de criação
  updated_at: string;          // Data de atualização
  limit_per_plan: number | null;       // Limite global do plano
  current_appointments: number | null; // Agendamentos atuais
  availableForBooking?: boolean;       // Disponível para agendamento
  
  // Propriedades para uso no front-end
  memberPlanId?: string;               // ID da associação com membro
  memberLimit?: number | null;         // Limite específico do membro
  memberCurrentAppointments?: number;  // Agendamentos do membro
}
```

**Relacionamentos:**
- Pertence a um `Professional`
- Muitos para muitos com `TeamMember` via `TeamMemberInsurancePlan`
- Um para muitos com `Appointment`

## Tipos de Secretárias

### UserRole
Interface para roles de usuários.

```typescript
interface UserRole {
  id: string;                  // UUID único
  user_id: string;             // UUID do usuário
  role: 'professional' | 'secretary' | 'admin'; // Tipo de role
  created_at: string;          // Data de criação
}
```

**Roles Disponíveis:**
- `professional`: Proprietário da conta
- `secretary`: Assistente com acesso limitado
- `admin`: Administrador do sistema

---

### SecretaryAssignment
Interface para associação de secretárias.

```typescript
interface SecretaryAssignment {
  id: string;                  // UUID único
  secretary_id: string;        // UUID da secretária
  professional_id: string;    // UUID do profissional
  is_active: boolean;          // Se está ativa
  created_at: string;          // Data de criação
  updated_at: string;          // Data de atualização
}
```

## Tipos de Sistema

### SubscriptionPlan
Interface para planos de assinatura.

```typescript
interface SubscriptionPlan {
  id: string;                  // UUID único
  name: string;                // Nome do plano
  description: string;         // Descrição
  price: number;               // Preço mensal
  features: string[];          // Lista de funcionalidades
}
```

---

### Subscriber
Interface para assinantes.

```typescript
interface Subscriber {
  id: string;                  // UUID único
  user_id: string;             // UUID do usuário
  email: string;               // Email do assinante
  stripe_customer_id?: string; // ID do cliente no Stripe
  subscribed: boolean;         // Se tem assinatura ativa
  subscription_tier?: string;  // Tipo de assinatura
  subscription_end?: string;   // Data de fim da assinatura
  updated_at: string;          // Data de atualização
  created_at: string;          // Data de criação
}
```

---

### SystemConfig
Interface para configurações do sistema.

```typescript
interface SystemConfig {
  id: string;                  // UUID único
  premium_price: number;       // Preço da versão premium
  stripe_price_id: string;     // ID do preço no Stripe
  created_at: string;          // Data de criação
  updated_at: string;          // Data de atualização
}
```

## Tipos de Horários

### TimeSlot
Interface para horários de trabalho.

```typescript
interface TimeSlot {
  id: string;                  // UUID único
  professional_id: string;    // UUID do profissional
  day_of_week: number;         // Dia da semana (0=Dom, 6=Sab)
  start_time: string;          // Horário início HH:MM
  end_time: string;            // Horário fim HH:MM
  available: boolean;          // Se está disponível
  created_at?: string;         // Data de criação
  updated_at?: string;         // Data de atualização
  appointment_duration_minutes?: number; // Duração padrão
  lunch_break_start?: string;  // Início do almoço
  lunch_break_end?: string;    // Fim do almoço
  team_member_id?: string;     // UUID do membro (opcional)
}
```

**Validações:**
- `day_of_week`: 0-6 (Domingo a Sábado)
- `start_time` < `end_time`
- Se `lunch_break_start` definido, `lunch_break_end` obrigatório
- `appointment_duration_minutes` > 0

## Enums e Constantes

### Status de Agendamento
```typescript
type AppointmentStatus = 'scheduled' | 'completed' | 'canceled' | 'no_show';
```

### Origem do Agendamento
```typescript
type AppointmentSource = 'client' | 'manual';
```

### Tipos de Usuário
```typescript
type UserRoleType = 'professional' | 'secretary' | 'admin';
```

### Dias da Semana
```typescript
const DAYS_OF_WEEK = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado'
} as const;
```

### Status de Pagamento
```typescript
type PaymentStatus = 'pending' | 'paid' | 'partial' | 'refunded';
```

### Métodos de Pagamento
```typescript
type PaymentMethod = 'cash' | 'debit' | 'credit' | 'pix' | 'insurance';
```

## Tipos de Formulários

### BookingFormData
Interface para dados do formulário de agendamento.

```typescript
interface BookingFormData {
  teamMemberId?: string;       // ID do membro da equipe
  insurancePlanId?: string;    // ID do convênio
  serviceId?: string;          // ID do serviço
  date?: string;               // Data selecionada
  timeSlot?: string;           // Horário selecionado
  clientName: string;          // Nome do cliente
  clientEmail: string;         // Email do cliente
  clientPhone?: string;        // Telefone do cliente
  notes?: string;              // Observações
}
```

### AppointmentFormData
Interface para criação de agendamentos.

```typescript
interface AppointmentFormData {
  client_name: string;         // Nome do cliente
  client_email: string;        // Email do cliente
  client_phone?: string;       // Telefone do cliente
  date: string;                // Data do agendamento
  start_time: string;          // Horário de início
  end_time: string;            // Horário de fim
  service_id?: string;         // ID do serviço
  team_member_id?: string;     // ID do membro da equipe
  insurance_plan_id?: string;  // ID do convênio
  notes?: string;              // Observações
  price?: number;              // Valor do serviço
}
```

## Tipos de Contexto

### AppointmentContextType
Contexto para gerenciamento de agendamentos.

```typescript
interface AppointmentContextType {
  appointments: Appointment[];             // Lista de agendamentos
  loading: boolean;                        // Status de carregamento
  error: string | null;                    // Erro atual
  fetchAppointments: () => Promise<void>;  // Buscar agendamentos
  createAppointment: (data: AppointmentFormData) => Promise<void>;
  updateAppointment: (id: string, data: Partial<AppointmentFormData>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  filterByDate: (date: string) => Appointment[];
  filterByStatus: (status: AppointmentStatus) => Appointment[];
}
```

### BookingContextType
Contexto para o fluxo de agendamento público.

```typescript
interface BookingContextType {
  currentStep: BookingStep;                // Passo atual
  formData: BookingFormData;               // Dados do formulário
  availableSlots: string[];                // Horários disponíveis
  loading: boolean;                        // Carregamento
  error: string | null;                    // Erro atual
  setCurrentStep: (step: BookingStep) => void;
  updateFormData: (data: Partial<BookingFormData>) => void;
  submitBooking: () => Promise<void>;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  resetForm: () => void;
}
```

### BookingStep
Passos do processo de agendamento.

```typescript
type BookingStep = 
  | 'team-member'     // Seleção do profissional
  | 'insurance'       // Seleção do convênio
  | 'service'         // Seleção do serviço
  | 'date'            // Seleção da data
  | 'time'            // Seleção do horário
  | 'client-info'     // Informações do cliente
  | 'confirmation';   // Confirmação final
```

## Tipos de Pagamento

### AppointmentPayment
Interface para pagamentos de agendamentos.

```typescript
interface AppointmentPayment {
  id: string;                  // UUID único
  appointment_id: string;      // UUID do agendamento
  amount: number;              // Valor pago
  payment_method: PaymentMethod; // Método de pagamento
  payment_status: PaymentStatus; // Status do pagamento
  notes?: string;              // Observações
  paid_at?: string;            // Data do pagamento
  recorded_by?: string;        // Quem registrou
  created_at: string;          // Data de criação
  updated_at: string;          // Data de atualização
}
```

### AppointmentStatusHistory
Interface para histórico de status.

```typescript
interface AppointmentStatusHistory {
  id: string;                  // UUID único
  appointment_id: string;      // UUID do agendamento
  old_status?: string;         // Status anterior
  new_status: string;          // Novo status
  changed_by?: string;         // Quem alterou
  notes?: string;              // Observações
  created_at: string;          // Data da alteração
}
```

---

**Observações:**
- Todos os UUIDs são gerados automaticamente pelo PostgreSQL
- Campos com `?` são opcionais
- Datas são armazenadas em formato ISO 8601
- Horários são armazenados em formato HH:MM
- Preços são armazenados como NUMERIC para precisão

**Última atualização**: Janeiro 2025
