
# Documentação Completa do Sistema de Agendamentos

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Autenticação e Autorização](#autenticação-e-autorização)
6. [Frontend](#frontend)
7. [Backend (Supabase)](#backend-supabase)
8. [Funcionalidades Implementadas](#funcionalidades-implementadas)
9. [Funcionalidades Parcialmente Implementadas](#funcionalidades-parcialmente-implementadas)
10. [Configuração e Deploy](#configuração-e-deploy)
11. [Otimizações e Performance](#otimizações-e-performance)
12. [Segurança](#segurança)
13. [Próximos Passos](#próximos-passos)

## Visão Geral

O Sistema de Agendamentos é uma aplicação web completa para gerenciamento de consultas e agendamentos profissionais. Foi desenvolvido utilizando React/TypeScript no frontend e Supabase como backend, oferecendo uma solução robusta para profissionais que precisam gerenciar seus atendimentos, equipes e clientes.

### Objetivos Principais
- Facilitar o agendamento de consultas por clientes
- Permitir gestão completa de agendamentos pelos profissionais
- Controlar equipes e membros de trabalho
- Gerenciar convênios e planos de saúde
- Oferecer relatórios e análises de desempenho
- Implementar sistema de assinaturas premium

## Arquitetura do Sistema

### Arquitetura Geral
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Supabase      │    │   Integrações   │
│   (React/TS)    │◄──►│   PostgreSQL     │◄──►│    Externas     │
│                 │    │   Auth           │    │                 │
│   - UI/UX       │    │   Edge Functions │    │   - Stripe      │
│   - Estado      │    │   Storage        │    │   - Email       │
│   - Hooks       │    │   Real-time      │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Padrões Arquiteturais
- **Component-Based Architecture**: Componentes React reutilizáveis
- **Custom Hooks**: Lógica de negócio encapsulada em hooks
- **Context Pattern**: Gerenciamento de estado global
- **Repository Pattern**: Abstração de acesso a dados
- **Row Level Security**: Segurança a nível de linha no banco

## Tecnologias Utilizadas

### Frontend
- **React 18.3.1**: Biblioteca principal para UI
- **TypeScript**: Tipagem estática
- **Vite**: Build tool e desenvolvimento
- **React Router DOM 6.26.2**: Roteamento SPA
- **Tailwind CSS**: Framework CSS utilitário
- **Shadcn/UI**: Componentes UI padronizados
- **Radix UI**: Componentes acessíveis
- **Lucide React**: Ícones
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de esquemas
- **TanStack Query**: Cache e sincronização de dados
- **Framer Motion**: Animações
- **Date-fns**: Manipulação de datas

### Backend (Supabase)
- **PostgreSQL**: Banco de dados principal
- **Supabase Auth**: Autenticação e autorização
- **Row Level Security (RLS)**: Segurança de dados
- **Edge Functions**: Serverless functions
- **Real-time Subscriptions**: Atualizações em tempo real

### Ferramentas de Desenvolvimento
- **ESLint**: Linting de código
- **Vitest**: Testes unitários
- **Testing Library**: Testes de componentes
- **PostCSS**: Processamento CSS

### Integrações Externas
- **Stripe**: Processamento de pagamentos
- **Email Services**: Notificações por email

## Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── auth/           # Componentes de autenticação
│   ├── booking/        # Sistema de agendamento
│   ├── dashboard/      # Painel administrativo
│   ├── ui/            # Componentes base UI
│   └── layout/        # Layout e navegação
├── context/           # Context APIs
├── hooks/             # Custom hooks
├── pages/             # Páginas da aplicação
├── services/          # Serviços e APIs
├── types/             # Definições TypeScript
├── integrations/      # Integrações externas
├── utils/             # Funções utilitárias
└── tests/             # Testes automatizados

supabase/
├── functions/         # Edge Functions
├── migrations/        # Migrações do banco
└── config.toml       # Configuração do Supabase
```

## Autenticação e Autorização

### Sistema de Autenticação
- **Supabase Auth**: Sistema completo de autenticação
- **JWT Tokens**: Autenticação baseada em tokens
- **Row Level Security**: Autorização a nível de dados

### Tipos de Usuário
1. **Professional**: Proprietário da conta, acesso total
2. **Secretary**: Acesso limitado para gerenciar agendamentos
3. **Admin**: Acesso administrativo ao sistema

### Fluxo de Autenticação
```typescript
// Contexto de autenticação principal
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para autenticação
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
```

### Proteção de Rotas
- Rotas protegidas por autenticação
- Redirecionamento automático para login
- Verificação de permissões por tipo de usuário

## Frontend

### Estrutura de Componentes

#### Componentes de Layout
- **DashboardLayout**: Layout principal do painel
- **Header**: Cabeçalho com navegação
- **Sidebar**: Menu lateral
- **Footer**: Rodapé da aplicação

#### Componentes de UI Base
- **Button**: Botões padronizados
- **Input**: Campos de entrada
- **Card**: Cartões de conteúdo
- **Dialog**: Modais e diálogos
- **Toast**: Notificações
- **Loading**: Estados de carregamento

#### Componentes Especializados
- **BookingForm**: Formulário de agendamento
- **AppointmentCard**: Cartão de agendamento
- **CalendarView**: Visualização de calendário
- **TeamMemberForm**: Formulário de membros da equipe

### Gerenciamento de Estado

#### Context APIs
```typescript
// Contexto de autenticação
interface AuthContextType {
  user: Professional | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, profession: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Contexto de agendamentos
interface AppointmentContextType {
  appointments: Appointment[];
  loading: boolean;
  createAppointment: (data: CreateAppointmentData) => Promise<void>;
  updateAppointment: (id: string, data: UpdateAppointmentData) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
}
```

#### Custom Hooks
- **useAuth**: Gerenciamento de autenticação
- **useAppointments**: Operações com agendamentos
- **useUserRoles**: Controle de permissões
- **useBookingForm**: Lógica do formulário de agendamento
- **useTimeSlots**: Gerenciamento de horários

### Roteamento

#### Estrutura de Rotas
```typescript
// Rotas principais
const routes = [
  { path: "/", element: <Index /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/dashboard/appointments", element: <DashboardAppointments /> },
  { path: "/dashboard/services", element: <DashboardServices /> },
  { path: "/dashboard/team", element: <DashboardTeam /> },
  { path: "/dashboard/secretaries", element: <DashboardSecretaries /> },
  { path: "/booking/:slug", element: <PublicBooking /> }
];
```

## Backend (Supabase)

### Banco de Dados
Ver documentação detalhada em `BANCO_DE_DADOS.md`

#### Principais Tabelas
- **profiles**: Perfis de usuários
- **appointments**: Agendamentos
- **services**: Serviços oferecidos
- **team_members**: Membros da equipe
- **insurance_plans**: Planos de convênio
- **time_slots**: Horários disponíveis

### Row Level Security (RLS)

#### Políticas de Segurança
```sql
-- Exemplo: Usuários só podem ver seus próprios agendamentos
CREATE POLICY "Users can view their own appointments" 
  ON public.appointments FOR SELECT 
  USING (auth.uid() = professional_id);

-- Secretárias podem ver agendamentos dos profissionais que gerenciam
CREATE POLICY "Secretaries can view managed appointments"
  ON public.appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM secretary_assignments 
      WHERE secretary_id = auth.uid() 
      AND professional_id = appointments.professional_id
      AND is_active = true
    )
  );
```

### Edge Functions

#### Funções Implementadas
- **create-checkout**: Criação de sessões de pagamento
- **customer-portal**: Portal do cliente Stripe
- **verify-subscription**: Verificação de assinaturas
- **check-subscription**: Checagem de status

### Triggers e Funções

#### Triggers Automáticos
- **handle_new_user**: Criação automática de perfil
- **update_insurance_plan_count**: Atualização de contadores
- **update_client_statistics**: Estatísticas de clientes
- **handle_updated_at**: Atualização automática de timestamps

## Funcionalidades Implementadas

### 1. Autenticação e Perfis
- ✅ Login/Logout de usuários
- ✅ Registro de novos usuários
- ✅ Recuperação de senha
- ✅ Perfis de usuário completos
- ✅ Sistema de roles (Professional/Secretary/Admin)
- ✅ Mudança obrigatória de senha para secretárias

### 2. Gerenciamento de Agendamentos
- ✅ Criação de agendamentos manuais
- ✅ Visualização de agendamentos
- ✅ Edição de agendamentos
- ✅ Cancelamento de agendamentos
- ✅ Filtros por data e status
- ✅ Agendamentos em tempo real

### 3. Sistema de Horários
- ✅ Configuração de horários de trabalho
- ✅ Definição de intervalos de almoço
- ✅ Horários por membro da equipe
- ✅ Horários por dia da semana
- ✅ Modo batch para múltiplos dias

### 4. Gestão de Equipe
- ✅ Cadastro de membros da equipe
- ✅ Associação de serviços por membro
- ✅ Associação de convênios por membro
- ✅ Horários específicos por membro
- ✅ Ativação/desativação de membros

### 5. Serviços
- ✅ Cadastro de serviços
- ✅ Preços e durações
- ✅ Ativação/desativação
- ✅ Associação com membros da equipe

### 6. Convênios e Planos
- ✅ Cadastro de planos de convênio
- ✅ Limites por plano
- ✅ Limites por membro da equipe
- ✅ Controle automático de vagas

### 7. Secretárias
- ✅ Cadastro de secretárias
- ✅ Associação com profissionais
- ✅ Permissões específicas
- ✅ Gerenciamento de acesso

### 8. Relatórios Básicos
- ✅ Listagem de agendamentos
- ✅ Estatísticas básicas
- ✅ Exportação de dados

### 9. Sistema de Assinaturas
- ✅ Integração com Stripe
- ✅ Planos premium
- ✅ Portal do cliente
- ✅ Verificação de assinaturas

## Funcionalidades Parcialmente Implementadas

### 1. Agendamento Público
- 🟡 Interface de agendamento público existe
- 🔴 Validações completas de disponibilidade
- 🔴 Prevenção de conflitos
- 🔴 Confirmação por email

### 2. Notificações
- 🟡 Sistema de toast implementado
- 🔴 Notificações por email
- 🔴 Lembretes automáticos
- 🔴 Notificações push

### 3. Relatórios Avançados
- 🟡 Estrutura básica existe
- 🔴 Gráficos detalhados
- 🔴 Análises de performance
- 🔴 Exportação em múltiplos formatos

### 4. Pagamentos
- 🟡 Estrutura de pagamentos criada
- 🔴 Controle de pagamentos por agendamento
- 🔴 Relatórios financeiros
- 🔴 Integração completa

## Configuração e Deploy

### Variáveis de Ambiente
```env
VITE_SUPABASE_URL=https://iabhmwqracdcdnevtpzt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Scripts de Build
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

### Deploy no Lovable
- Deploy automático via plataforma Lovable
- URL de produção gerada automaticamente
- SSL/TLS configurado automaticamente

## Otimizações e Performance

### Frontend
- **Code Splitting**: Carregamento sob demanda
- **React.memo**: Otimização de re-renderização
- **useMemo/useCallback**: Cache de computações
- **TanStack Query**: Cache inteligente de dados
- **Lazy Loading**: Carregamento progressivo

### Backend
- **Índices de Banco**: Otimização de consultas
- **RLS Otimizado**: Políticas eficientes
- **Connection Pooling**: Pool de conexões
- **Edge Functions**: Processamento distribuído

### Estratégias de Cache
```typescript
// Exemplo de cache com TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: ['appointments', professionalId],
  queryFn: () => fetchAppointments(professionalId),
  staleTime: 5 * 60 * 1000, // 5 minutos
  cacheTime: 10 * 60 * 1000, // 10 minutos
});
```

## Segurança

### Autenticação
- **JWT Tokens**: Autenticação baseada em tokens
- **Refresh Tokens**: Renovação automática
- **Session Management**: Gerenciamento de sessões

### Autorização
- **Row Level Security**: Controle a nível de dados
- **Role-Based Access**: Controle por roles
- **API Protection**: Proteção de endpoints

### Validação de Dados
- **Zod Schemas**: Validação no frontend
- **Database Constraints**: Validação no banco
- **Sanitização**: Limpeza de dados de entrada

### Prevenção de Ataques
- **SQL Injection**: Prevenido por ORM
- **XSS**: Sanitização de HTML
- **CSRF**: Tokens CSRF
- **Rate Limiting**: Controle de taxa

## Próximos Passos

### Prioridade Alta
1. **Completar Agendamento Público**
   - Validações de disponibilidade
   - Prevenção de conflitos
   - Confirmações por email

2. **Sistema de Notificações**
   - Emails transacionais
   - Lembretes automáticos
   - Templates personalizáveis

3. **Relatórios Avançados**
   - Gráficos interativos
   - Análises de performance
   - Exportação completa

### Prioridade Média
1. **Mobile App**
   - React Native
   - Notificações push
   - Sincronização offline

2. **Integrações**
   - Calendários externos (Google, Outlook)
   - WhatsApp Business
   - Sistemas de pagamento locais

3. **Automações**
   - Workflows automatizados
   - Regras de negócio
   - Inteligência artificial

### Prioridade Baixa
1. **Multi-tenancy**
   - Suporte a múltiplas organizações
   - Isolamento de dados
   - Configurações personalizadas

2. **Marketplace**
   - Plugins de terceiros
   - Temas personalizados
   - Extensibilidade

---

**Última atualização**: Janeiro 2025
**Versão**: 1.0.0
**Mantenedores**: Equipe de Desenvolvimento
