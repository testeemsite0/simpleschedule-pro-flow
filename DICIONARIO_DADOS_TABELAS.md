
# Dicionário de Dados - Tabelas do Banco

## Índice
1. [Tabelas de Usuários e Perfis](#tabelas-de-usuários-e-perfis)
2. [Tabelas de Agendamentos](#tabelas-de-agendamentos)
3. [Tabelas de Equipe](#tabelas-de-equipe)
4. [Tabelas de Serviços](#tabelas-de-serviços)
5. [Tabelas de Convênios](#tabelas-de-convênios)
6. [Tabelas de Horários](#tabelas-de-horários)
7. [Tabelas de Sistema](#tabelas-de-sistema)
8. [Tabelas de Assinaturas](#tabelas-de-assinaturas)
9. [Tabelas de Auditoria](#tabelas-de-auditoria)
10. [Relacionamentos](#relacionamentos)
11. [Índices](#índices)
12. [Triggers](#triggers)
13. [Funções](#funções)

## Tabelas de Usuários e Perfis

### profiles
**Propósito**: Armazenar informações dos perfis profissionais do sistema.

| Campo | Tipo | Nulável | Padrão | Descrição |
|-------|------|---------|--------|-----------|
| id | uuid | Não | - | UUID único, referência para auth.users |
| name | text | Não | - | Nome completo do profissional |
| email | text | Não | - | Email único para contato |
| profession | text | Não | - | Profissão (ex: "Médico", "Dentista") |
| slug | text | Não | - | Identificador único para URLs públicas |
| bio | text | Sim | - | Biografia ou descrição do profissional |
| avatar | text | Sim | - | URL da foto de perfil |
| company_name | text | Sim | - | Nome da empresa/clínica |
| display_name | text | Sim | - | Nome para exibição |
| company_type | text | Sim | 'individual' | Tipo de empresa |
| password_changed | boolean | Sim | false | Se alterou senha padrão |
| created_at | timestamptz | Sim | now() | Data de criação |
| updated_at | timestamptz | Sim | now() | Data de atualização |

**Constraints:**
- PRIMARY KEY: `id`
- UNIQUE: `slug`
- FOREIGN KEY: `id` → `auth.users(id)` ON DELETE CASCADE

**Índices:**
- `idx_profiles_slug` (UNIQUE): `slug`
- `idx_profiles_email`: `email`

**Triggers:**
- `update_profiles_updated_at`: Atualiza `updated_at` automaticamente

---

### user_roles
**Propósito**: Controlar permissões e roles dos usuários no sistema.

| Campo | Tipo | Nulável | Padrão | Descrição |
|-------|------|---------|--------|-----------|
| id | uuid | Não | gen_random_uuid() | UUID único |
| user_id | uuid | Não | - | Referência para o usuário |
| role | user_role | Não | 'professional' | Tipo de permissão |
| created_at | timestamptz | Não | now() | Data de criação |

**Enum user_role:**
- `professional`: Proprietário da conta
- `secretary`: Secretária com acesso limitado
- `admin`: Administrador do sistema

**Constraints:**
- PRIMARY KEY: `id`
- UNIQUE: `user_id, role`
- FOREIGN KEY: `user_id` → `auth.users(id)` ON DELETE CASCADE

**RLS Policies:**
- Usuários podem ver apenas seus próprios roles
- Usuários podem inserir apenas seus próprios roles

---

### secretary_assignments
**Propósito**: Associar secretárias aos profissionais que podem gerenciar.

| Campo | Tipo | Nulável | Padrão | Descrição |
|-------|------|---------|--------|-----------|
| id | uuid | Não | gen_random_uuid() | UUID único |
| secretary_id | uuid | Não | - | UUID da secretária |
| professional_id | uuid | Não | - | UUID do profissional |
| is_active | boolean | Não | true | Se a associação está ativa |
| created_at | timestamptz | Não | now() | Data de criação |
| updated_at | timestamptz | Não | now() | Data de atualização |

**Constraints:**
- PRIMARY KEY: `id`
- UNIQUE: `secretary_id, professional_id`
- FOREIGN KEY: `secretary_id` → `auth.users(id)`
- FOREIGN KEY: `professional_id` → `auth.users(id)`

**Triggers:**
- `update_secretary_assignments_updated_at`: Atualiza `updated_at`

## Tabelas de Agendamentos

### appointments
**Propósito**: Armazenar todos os agendamentos do sistema.

| Campo | Tipo | Nulável | Padrão | Descrição |
|-------|------|---------|--------|-----------|
| id | uuid | Não | extensions.uuid_generate_v4() | UUID único |
| professional_id | uuid | Não | - | UUID do profissional responsável |
| team_member_id | uuid | Sim | - | UUID do membro da equipe |
| service_id | uuid | Sim | - | UUID do serviço |
| insurance_plan_id | uuid | Sim | - | UUID do convênio |
| client_name | text | Não | - | Nome completo do cliente |
| client_email | text | Não | - | Email do cliente |
| client_phone | text | Sim | - | Telefone do cliente |
| date | date | Não | - | Data do agendamento |
| start_time | time | Não | - | Horário de início |
| end_time | time | Não | - | Horário de término |
| notes | text | Sim | - | Observações do agendamento |
| status | text | Não | 'scheduled' | Status atual |
| source | varchar | Sim | 'client' | Origem do agendamento |
| price | numeric | Sim | - | Valor cobrado |
| free_tier_used | boolean | Não | true | Se usou tier gratuito |
| created_at | timestamptz | Sim | now() | Data de criação |
| updated_at | timestamptz | Sim | now() | Data de atualização |

**Status Válidos:**
- `scheduled`: Agendado
- `completed`: Realizado
- `canceled`: Cancelado
- `no_show`: Cliente não compareceu

**Source Válidos:**
- `client`: Agendado pelo cliente
- `manual`: Agendado manualmente

**Constraints:**
- PRIMARY KEY: `id`
- CHECK: `start_time < end_time`
- CHECK: `price >= 0` (quando não nulo)
- FOREIGN KEY: `professional_id` → `profiles(id)`
- FOREIGN KEY: `team_member_id` → `team_members(id)`
- FOREIGN KEY: `service_id` → `services(id)`
- FOREIGN KEY: `insurance_plan_id` → `insurance_plans(id)`

**Índices:**
- `idx_appointments_professional_date`: `professional_id, date`
- `idx_appointments_team_member_date`: `team_member_id, date`
- `idx_appointments_status`: `status`
- `idx_appointments_source`: `source`
- `idx_appointments_date`: `date`

**Triggers:**
- `update_appointments_updated_at`: Atualiza `updated_at`
- `update_insurance_plan_count_trigger`: Atualiza contadores de convênio
- `update_insurance_member_count_trigger`: Atualiza contadores por membro
- `update_client_statistics_trigger`: Atualiza estatísticas de clientes
- `log_appointment_status_change_trigger`: Registra mudanças de status

---

### appointment_payments
**Propósito**: Controlar pagamentos dos agendamentos.

| Campo | Tipo | Nulável | Padrão | Descrição |
|-------|------|---------|--------|-----------|
| id | uuid | Não | gen_random_uuid() | UUID único |
| appointment_id | uuid | Não | - | UUID do agendamento |
| amount | numeric | Não | - | Valor pago |
| payment_method | payment_method | Não | - | Método de pagamento |
| payment_status | payment_status | Não | 'pending' | Status do pagamento |
| notes | text | Sim | - | Observações do pagamento |
| paid_at | timestamptz | Sim | - | Data/hora do pagamento |
| recorded_by | uuid | Sim | - | Quem registrou o pagamento |
| created_at | timestamptz | Não | now() | Data de criação |
| updated_at | timestamptz | Não | now() | Data de atualização |

**Enum payment_method:**
- `cash`: Dinheiro
- `debit`: Cartão de débito
- `credit`: Cartão de crédito
- `pix`: PIX
- `insurance`: Convênio

**Enum payment_status:**
- `pending`: Pendente
- `paid`: Pago
- `partial`: Pagamento parcial
- `refunded`: Estornado

**Constraints:**
- PRIMARY KEY: `id`
- CHECK: `amount > 0`
- FOREIGN KEY: `appointment_id` → `appointments(id)` ON DELETE CASCADE
- FOREIGN KEY: `recorded_by` → `auth.users(id)`

---

### appointment_status_history
**Propósito**: Histórico de mudanças de status dos agendamentos.

| Campo | Tipo | Nulável | Padrão | Descrição |
|-------|------|---------|--------|-----------|
| id | uuid | Não | gen_random_uuid() | UUID único |
| appointment_id | uuid | Não | - | UUID do agendamento |
| old_status | text | Sim | - | Status anterior |
| new_status | text | Não | - | Novo status |
| changed_by | uuid | Sim | - | Quem fez a alteração |
| notes | text | Sim | - | Observações da mudança |
| created_at | timestamptz | Não | now() | Data da alteração |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `appointment_id` → `appointments(id)` ON DELETE CASCADE
- FOREIGN KEY: `changed_by` → `auth.users(id)`

## Tabelas de Equipe

### team_members
**Propósito**: Membros da equipe que podem realizar atendimentos.

| Campo | Tipo | Nulável | Padrão | Descrição |
|-------|------|---------|--------|-----------|
| id | uuid | Não | gen_random_uuid() | UUID único |
| professional_id | uuid | Não | - | UUID do profissional responsável |
| name | text | Não | - | Nome completo do membro |
| email | text | Sim | - | Email do membro |
| position | text | Sim | - | Cargo ou posição |
| avatar | text | Sim | - | URL da foto |
| active | boolean | Não | true | Se está ativo |
| created_at | timestamptz | Não | now() | Data de criação |
| updated_at | timestamptz | Não | now() | Data de atualização |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `professional_id` → `profiles(id)` ON DELETE CASCADE

**Índices:**
- `idx_team_members_professional`: `professional_id`
- `idx_team_members_active`: `active`

**Triggers:**
- `update_team_members_updated_at`: Atualiza `updated_at`

---

### team_member_services
**Propósito**: Relacionamento N:N entre membros da equipe e serviços.

| Campo | Tipo | Nulável | Padrão | Descrição |
|-------|------|---------|--------|-----------|
| id | uuid | Não | gen_random_uuid() | UUID único |
| team_member_id | uuid | Não | - | UUID do membro |
| service_id | uuid | Não | - | UUID do serviço |
| created_at | timestamptz | Não | now() | Data de associação |

**Constraints:**
- PRIMARY KEY: `id`
- UNIQUE: `team_member_id, service_id`
- FOREIGN KEY: `team_member_id` → `team_members(id)` ON DELETE CASCADE
- FOREIGN KEY: `service_id` → `services(id)` ON DELETE CASCADE

---

### team_member_insurance_plans
**Propósito**: Relacionamento N:N entre membros e convênios com limites.

| Campo | Tipo | Nulável | Padrão | Descrição |
|-------|------|---------|--------|-----------|
| id | uuid | Não | gen_random_uuid() | UUID único |
| team_member_id | uuid | Não | - | UUID do membro |
| insurance_plan_id | uuid | Não | - | UUID do convênio |
| limit_per_member | integer | Sim | - | Limite específico do membro |
| current_appointments | integer | Sim | 0 | Agendamentos atuais |
| created_at | timestamptz | Não | now() | Data de associação |

**Constraints:**
- PRIMARY KEY: `id`
- UNIQUE: `team_member_id, insurance_plan_id`
- CHECK: `limit_per_member >= 0` (quando não nulo)
- CHECK: `current_appointments >= 0`
- FOREIGN KEY: `team_member_id` → `team_members(id)` ON DELETE CASCADE
- FOREIGN KEY: `insurance_plan_id` → `insurance_plans(id)` ON DELETE CASCADE

## Tabelas de Serviços

### services
**Propósito**: Serviços oferecidos pelos profissionais.

| Campo | Tipo | Nulável | Padrão | Descrição |
|-------|------|---------|--------|-----------|
| id | uuid | Não | gen_random_uuid() | UUID único |
| professional_id | uuid | Não | - | UUID do profissional |
| name | text | Não | - | Nome do serviço |
| description | text | Sim | - | Descrição detalhada |
| price | numeric | Não | - | Preço do serviço |
| duration_minutes | integer | Não | 60 | Duração em minutos |
| active | boolean | Não | true | Se está ativo |
| created_at | timestamptz | Não | now() | Data de criação |
| updated_at | timestamptz | Não | now() | Data de atualização |

**Constraints:**
- PRIMARY KEY: `id`
- CHECK: `price >= 0`
- CHECK: `duration_minutes > 0`
- FOREIGN KEY: `professional_id` → `profiles(id)` ON DELETE CASCADE

**Índices:**
- `idx_services_professional`: `professional_id`
- `idx_services_active`: `active`

**Triggers:**
- `update_services_updated_at`: Atualiza `updated_at`

## Tabelas de Convênios

### insurance_plans
**Propósito**: Planos de convênio aceitos pelos profissionais.

| Campo | Tipo | Nulável | Padrão | Descrição |
|-------|------|---------|--------|-----------|
| id | uuid | Não | gen_random_uuid() | UUID único |
| professional_id | uuid | Não | - | UUID do profissional |
| name | text | Não | - | Nome do convênio |
| limit_per_plan | integer | Sim | - | Limite global do plano |
| current_appointments | integer | Sim | 0 | Agendamentos atuais |
| created_at | timestamptz | Não | now() | Data de criação |
| updated_at | timestamptz | Não | now() | Data de atualização |

**Constraints:**
- PRIMARY KEY: `id`
- CHECK: `limit_per_plan >= 0` (quando não nulo)
- CHECK: `current_appointments >= 0`
- FOREIGN KEY: `professional_id` → `profiles(id)` ON DELETE CASCADE

**Índices:**
- `idx_insurance_plans_professional`: `professional_id`

**Triggers:**
- `update_insurance_plans_updated_at`: Atualiza `updated_at`

## Tabelas de Horários

### time_slots
**Propósito**: Definir horários de trabalho e disponibilidade.

| Campo | Tipo | Nulável | Padrão | Descrição |
|-------|------|---------|--------|-----------|
| id | uuid | Não | extensions.uuid_generate_v4() | UUID único |
| professional_id | uuid | Não | - | UUID do profissional |
| team_member_id | uuid | Sim | - | UUID do membro da equipe |
| day_of_week | integer | Não | - | Dia da semana (0=Dom, 6=Sab) |
| start_time | time | Não | - | Horário de início |
| end_time | time | Não | - | Horário de término |
| appointment_duration_minutes | integer | Sim | 60 | Duração padrão |
| lunch_break_start | time | Sim | - | Início do intervalo |
| lunch_break_end | time | Sim | - | Fim do intervalo |
| available | boolean | Sim | true | Se está disponível |
| created_at | timestamptz | Sim | now() | Data de criação |
| updated_at | timestamptz | Sim | now() | Data de atualização |

**Constraints:**
- PRIMARY KEY: `id`
- CHECK: `day_of_week >= 0 AND day_of_week <= 6`
- CHECK: `start_time < end_time`
- CHECK: `appointment_duration_minutes > 0`
- CHECK: Se `lunch_break_start` não nulo, `lunch_break_end` não nulo
- CHECK: `lunch_break_start < lunch_break_end` (quando ambos não nulos)
- FOREIGN KEY: `professional_id` → `profiles(id)` ON DELETE CASCADE
- FOREIGN KEY: `team_member_id` → `team_members(id)` ON DELETE CASCADE

**Índices:**
- `idx_time_slots_professional_day`: `professional_id, day_of_week`
- `idx_time_slots_team_member_day`: `team_member_id, day_of_week`
- `idx_time_slots_available`: `available`

**Triggers:**
- `update_time_slots_updated_at`: Atualiza `updated_at`

## Tabelas de Sistema

### system_config
**Propósito**: Configurações globais do sistema.

| Campo | Tipo | Nulável | Padrão | Descrição |
|-------|------|---------|--------|-----------|
| id | uuid | Não | gen_random_uuid() | UUID único |
| premium_price | numeric | Não | 39.90 | Preço da versão premium |
| stripe_price_id | text | Não | - | ID do preço no Stripe |
| created_at | timestamptz | Não | now() | Data de criação |
| updated_at | timestamptz | Não | now() | Data de atualização |

**Constraints:**
- PRIMARY KEY: `id`
- CHECK: `premium_price > 0`

**RLS Policies:**
- Leitura pública permitida
- Escrita restrita a administradores

---

### system_preferences
**Propósito**: Preferências individuais dos profissionais.

| Campo | Tipo | Nulável | Padrão | Descrição |
|-------|------|---------|--------|-----------|
| id | uuid | Não | gen_random_uuid() | UUID único |
| professional_id | uuid | Não | - | UUID do profissional |
| default_appointment_duration | integer | Sim | 60 | Duração padrão (min) |
| appointment_buffer_minutes | integer | Sim | 0 | Buffer entre agendamentos |
| working_hours_start | time | Sim | '08:00:00' | Início do expediente |
| working_hours_end | time | Sim | '18:00:00' | Fim do expediente |
| working_days | integer[] | Sim | [1,2,3,4,5] | Dias de trabalho |
| notifications_enabled | boolean | Sim | true | Notificações ativas |
| reminder_hours_before | integer | Sim | 24 | Horas antes do lembrete |
| calendar_view | text | Sim | 'week' | Visualização padrão |
| created_at | timestamptz | Não | now() | Data de criação |
| updated_at | timestamptz | Não | now() | Data de atualização |

**Constraints:**
- PRIMARY KEY: `id`
- UNIQUE: `professional_id`
- CHECK: `default_appointment_duration > 0`
- CHECK: `appointment_buffer_minutes >= 0`
- CHECK: `working_hours_start < working_hours_end`
- CHECK: `reminder_hours_before >= 0`
- FOREIGN KEY: `professional_id` → `profiles(id)` ON DELETE CASCADE

---

### company_settings
**Propósito**: Configurações específicas da empresa/clínica.

| Campo | Tipo | Nulável | Padrão | Descrição |
|-------|------|---------|--------|-----------|
| id | uuid | Não | gen_random_uuid() | UUID único |
| professional_id | uuid | Não | - | UUID do profissional |
| company_name | text | Sim | - | Nome da empresa |
| display_name | text | Não | - | Nome para exibição |
| company_type | text | Não | 'individual' | Tipo de empresa |
| timezone | text | Não | 'America/Sao_Paulo' | Fuso horário |
| address | text | Sim | - | Endereço completo |
| phone | text | Sim | - | Telefone de contato |
| website | text | Sim | - | Site da empresa |
| logo_url | text | Sim | - | URL do logotipo |
| created_at | timestamptz | Não | now() | Data de criação |
| updated_at | timestamptz | Não | now() | Data de atualização |

**Constraints:**
- PRIMARY KEY: `id`
- UNIQUE: `professional_id`
- FOREIGN KEY: `professional_id` → `auth.users(id)` ON DELETE CASCADE

## Tabelas de Assinaturas

### subscribers
**Propósito**: Controlar assinaturas dos usuários.

| Campo | Tipo | Nulável | Padrão | Descrição |
|-------|------|---------|--------|-----------|
| id | uuid | Não | gen_random_uuid() | UUID único |
| user_id | uuid | Sim | - | UUID do usuário |
| email | text | Não | - | Email do assinante |
| stripe_customer_id | text | Sim | - | ID do cliente no Stripe |
| subscribed | boolean | Não | false | Se tem assinatura ativa |
| subscription_tier | text | Sim | - | Tipo de assinatura |
| subscription_end | timestamptz | Sim | - | Data de término |
| created_at | timestamptz | Não | now() | Data de criação |
| updated_at | timestamptz | Não | now() | Data de atualização |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id` → `auth.users(id)`

---

### subscription_history
**Propósito**: Histórico de assinaturas e pagamentos.

| Campo | Tipo | Nulável | Padrão | Descrição |
|-------|------|---------|--------|-----------|
| id | uuid | Não | gen_random_uuid() | UUID único |
| user_id | uuid | Sim | - | UUID do usuário |
| stripe_subscription_id | text | Sim | - | ID da assinatura no Stripe |
| subscription_tier | text | Sim | - | Tipo de assinatura |
| amount | numeric | Sim | - | Valor pago |
| period_start | timestamptz | Sim | - | Início do período |
| period_end | timestamptz | Sim | - | Fim do período |
| cancellation_date | timestamptz | Sim | - | Data de cancelamento |
| status | text | Sim | - | Status da assinatura |
| created_at | timestamptz | Não | now() | Data de criação |

**Constraints:**
- PRIMARY KEY: `id`
- CHECK: `amount >= 0` (quando não nulo)
- CHECK: `period_start < period_end` (quando ambos não nulos)
- FOREIGN KEY: `user_id` → `auth.users(id)`

## Tabelas de Auditoria

### clients
**Propósito**: Estatísticas e histórico de clientes.

| Campo | Tipo | Nulável | Padrão | Descrição |
|-------|------|---------|--------|-----------|
| id | uuid | Não | gen_random_uuid() | UUID único |
| professional_id | uuid | Não | - | UUID do profissional |
| name | text | Não | - | Nome do cliente |
| email | text | Sim | - | Email do cliente |
| phone | text | Sim | - | Telefone do cliente |
| notes | text | Sim | - | Observações sobre o cliente |
| last_appointment | timestamptz | Sim | - | Data do último agendamento |
| total_appointments | integer | Sim | 0 | Total de agendamentos |
| total_revenue | numeric | Sim | 0 | Receita total gerada |
| created_at | timestamptz | Não | now() | Data de criação |
| updated_at | timestamptz | Não | now() | Data de atualização |

**Constraints:**
- PRIMARY KEY: `id`
- CHECK: `total_appointments >= 0`
- CHECK: `total_revenue >= 0`
- FOREIGN KEY: `professional_id` → `profiles(id)` ON DELETE CASCADE

**Índices:**
- `idx_clients_professional_email`: `professional_id, email`

---

### notification_templates
**Propósito**: Templates para notificações automáticas.

| Campo | Tipo | Nulável | Padrão | Descrição |
|-------|------|---------|--------|-----------|
| id | uuid | Não | gen_random_uuid() | UUID único |
| professional_id | uuid | Não | - | UUID do profissional |
| type | text | Não | - | Tipo de notificação |
| subject | text | Não | - | Assunto do email |
| body | text | Não | - | Corpo da mensagem |
| is_active | boolean | Sim | true | Se está ativo |
| created_at | timestamptz | Não | now() | Data de criação |
| updated_at | timestamptz | Não | now() | Data de atualização |

**Tipos de Notificação:**
- `appointment_confirmation`: Confirmação de agendamento
- `appointment_reminder`: Lembrete de agendamento
- `appointment_cancellation`: Cancelamento de agendamento
- `appointment_rescheduled`: Reagendamento

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `professional_id` → `profiles(id)` ON DELETE CASCADE

## Relacionamentos

### Diagrama de Relacionamentos Principais

```
auth.users (Supabase)
    ↓ 1:1
profiles
    ↓ 1:N
├── appointments
├── services
├── team_members
├── insurance_plans
├── time_slots
└── clients

team_members
    ↓ N:M
├── team_member_services → services
└── team_member_insurance_plans → insurance_plans

appointments
    ↑ N:1
├── team_members
├── services
└── insurance_plans
```

### Relacionamentos Detalhados

#### 1:1 (Um para Um)
- `profiles.id` ↔ `auth.users.id`
- `system_preferences.professional_id` ↔ `profiles.id`
- `company_settings.professional_id` ↔ `profiles.id`

#### 1:N (Um para Muitos)
- `profiles.id` → `appointments.professional_id`
- `profiles.id` → `services.professional_id`
- `profiles.id` → `team_members.professional_id`
- `profiles.id` → `insurance_plans.professional_id`
- `profiles.id` → `time_slots.professional_id`
- `team_members.id` → `appointments.team_member_id`
- `services.id` → `appointments.service_id`
- `insurance_plans.id` → `appointments.insurance_plan_id`

#### N:M (Muitos para Muitos)
- `team_members` ↔ `services` via `team_member_services`
- `team_members` ↔ `insurance_plans` via `team_member_insurance_plans`

## Índices

### Índices de Performance

#### Agendamentos
```sql
CREATE INDEX idx_appointments_professional_date ON appointments(professional_id, date);
CREATE INDEX idx_appointments_team_member_date ON appointments(team_member_id, date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date_range ON appointments(date) WHERE status = 'scheduled';
```

#### Time Slots
```sql
CREATE INDEX idx_time_slots_professional_day ON time_slots(professional_id, day_of_week);
CREATE INDEX idx_time_slots_available ON time_slots(available) WHERE available = true;
```

#### Clientes
```sql
CREATE INDEX idx_clients_professional_email ON clients(professional_id, email);
CREATE INDEX idx_clients_last_appointment ON clients(last_appointment);
```

### Índices Únicos
```sql
CREATE UNIQUE INDEX idx_profiles_slug ON profiles(slug);
CREATE UNIQUE INDEX idx_user_roles_unique ON user_roles(user_id, role);
CREATE UNIQUE INDEX idx_team_member_services_unique ON team_member_services(team_member_id, service_id);
```

## Triggers

### Triggers de Atualização Automática
```sql
-- Atualização de updated_at
CREATE TRIGGER update_{table}_updated_at
  BEFORE UPDATE ON {table}
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
```

**Aplicado em:**
- `profiles`
- `appointments`
- `services`
- `team_members`
- `insurance_plans`
- `time_slots`
- `clients`

### Triggers de Auditoria
```sql
-- Log de mudanças de status
CREATE TRIGGER log_appointment_status_change_trigger
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION log_appointment_status_change();
```

### Triggers de Contadores
```sql
-- Atualização de contadores de convênio
CREATE TRIGGER update_insurance_plan_count_trigger
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_insurance_plan_count();

-- Atualização de contadores por membro
CREATE TRIGGER update_insurance_member_count_trigger
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_insurance_member_count();
```

### Triggers de Estatísticas
```sql
-- Atualização de estatísticas de clientes
CREATE TRIGGER update_client_statistics_trigger
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_client_statistics();
```

## Funções

### Funções de Segurança

#### get_current_user_role()
```sql
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role::text FROM public.user_roles 
  WHERE user_id = auth.uid() LIMIT 1;
$$;
```

#### has_role(_role text)
```sql
CREATE OR REPLACE FUNCTION public.has_role(_role text)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role::text = _role
  );
$$;
```

#### is_secretary_for_professional(secretary_user_id uuid, target_professional_id uuid)
```sql
CREATE OR REPLACE FUNCTION public.is_secretary_for_professional(
  secretary_user_id uuid, 
  target_professional_id uuid
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.secretary_assignments 
    WHERE secretary_id = secretary_user_id 
    AND professional_id = target_professional_id 
    AND is_active = true
  );
END;
$$;
```

### Funções de Negócio

#### can_team_member_accept_insurance(member_id uuid, plan_id uuid)
```sql
CREATE OR REPLACE FUNCTION public.can_team_member_accept_insurance(
  member_id uuid, 
  plan_id uuid
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  can_accept BOOLEAN;
BEGIN
  SELECT 
    CASE 
      WHEN tmip.limit_per_member IS NULL THEN TRUE
      WHEN tmip.current_appointments < tmip.limit_per_member THEN TRUE
      ELSE FALSE
    END INTO can_accept
  FROM public.team_member_insurance_plans tmip
  WHERE tmip.team_member_id = member_id 
    AND tmip.insurance_plan_id = plan_id;
    
  RETURN COALESCE(can_accept, FALSE);
END;
$$;
```

### Funções de Auditoria

#### handle_updated_at()
```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
```

#### handle_new_user()
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;
```

## Políticas RLS (Row Level Security)

### Padrão de Segurança
Todas as tabelas principais implementam RLS com as seguintes políticas básicas:

```sql
-- Visualização: usuários veem apenas seus dados
CREATE POLICY "Users can view own data" 
  ON {table} FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = professional_id);

-- Inserção: usuários inserem apenas seus dados
CREATE POLICY "Users can insert own data" 
  ON {table} FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.uid() = professional_id);

-- Atualização: usuários atualizam apenas seus dados
CREATE POLICY "Users can update own data" 
  ON {table} FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() = professional_id);
```

### Políticas Especiais para Secretárias
```sql
-- Secretárias podem ver agendamentos dos profissionais que gerenciam
CREATE POLICY "Secretaries can view managed appointments"
  ON appointments FOR SELECT
  USING (
    professional_id = auth.uid() OR
    is_secretary_for_professional(auth.uid(), professional_id)
  );
```

---

**Observações de Manutenção:**
- Executar `ANALYZE` mensalmente nas tabelas principais
- Monitorar crescimento das tabelas de auditoria
- Verificar performance dos índices regularmente
- Revisar políticas RLS em atualizações

**Última atualização**: Janeiro 2025
**Versão do Schema**: 1.0.0
