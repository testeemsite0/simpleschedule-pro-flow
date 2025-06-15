
import {
  BarChart,
  Calendar,
  Home,
  Settings,
  User,
  ListChecks,
  Clock,
  Users,
  FileText,
  Link2,
  UserRound,
  Shield,
  Building2,
  CreditCard,
  UserCog,
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import { useAuth } from "@/context/AuthContext"
import { useUserRoles } from "@/hooks/useUserRoles"
import { cn } from "@/lib/utils"

export function DashboardSidebarContent() {
  const { user } = useAuth();
  const { userRole, isSecretary, isAdmin, isProfessional } = useUserRoles();
  const location = useLocation()

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      description: "Visão geral do seu negócio",
      allowedRoles: ['professional', 'secretary', 'admin']
    },
    {
      title: "Agendamentos",
      url: "/dashboard/unified-booking",
      icon: Calendar,
      description: "Sistema unificado de agendamentos",
      allowedRoles: ['professional', 'secretary', 'admin']
    },
    {
      title: "Horários",
      url: "/dashboard/schedules",
      icon: Clock,
      description: "Configurar horários de trabalho",
      allowedRoles: ['professional', 'admin']
    },
    {
      title: "Equipe",
      url: "/dashboard/team",
      icon: Users,
      description: "Gerenciar equipe",
      allowedRoles: ['professional', 'admin']
    },
    {
      title: "Serviços",
      url: "/dashboard/services",
      icon: ListChecks,
      description: "Gerenciar serviços",
      allowedRoles: ['professional', 'admin']
    },
    {
      title: "Convênios",
      url: "/dashboard/insurance",
      icon: Shield,
      description: "Gerenciar convênios",
      allowedRoles: ['professional', 'admin']
    },
    {
      title: "Clientes",
      url: "/dashboard/clients",
      icon: UserRound,
      description: "Gerenciar clientes",
      allowedRoles: ['professional', 'secretary', 'admin']
    },
    {
      title: "Link de Agendamento",
      url: "/dashboard/booking-link",
      icon: Link2,
      description: "Configurar link de agendamento",
      allowedRoles: ['professional', 'admin']
    },
    {
      title: "Relatórios",
      url: "/dashboard/reports",
      icon: BarChart,
      description: "Análise de dados e desempenho",
      allowedRoles: ['professional', 'admin']
    },
    ...(isAdmin || (!isSecretary && userRole === 'professional') ? [
      {
        title: "Secretárias",
        url: "/dashboard/secretaries",
        icon: UserCog,
        description: "Gerenciar secretárias e permissões",
        allowedRoles: ['professional', 'admin']
      }
    ] : []),
    {
      title: "Empresa",
      url: "/dashboard/company",
      icon: Building2,
      description: "Configurações da empresa",
      allowedRoles: ['professional', 'admin']
    },
    {
      title: "Configurações",
      url: "/dashboard/settings",
      icon: Settings,
      description: "Configurações gerais do sistema",
      allowedRoles: ['professional', 'secretary', 'admin']
    },
    {
      title: "Assinatura",
      url: "/dashboard/subscription",
      icon: CreditCard,
      description: "Gerenciar assinatura",
      allowedRoles: ['professional', 'admin']
    },
    {
      title: "Perfil",
      url: "/dashboard/profile",
      icon: User,
      description: "Configurações do seu perfil",
      allowedRoles: ['professional', 'secretary', 'admin']
    },
    ...(isAdmin ? [
      {
        title: "Painel Admin",
        url: "/dashboard/admin",
        icon: Shield,
        description: "Painel administrativo do sistema",
        allowedRoles: ['admin']
      }
    ] : []),
  ]

  const filteredMenuItems = menuItems.filter(item => 
    item.allowedRoles.includes(userRole)
  );

  return (
    <div className="flex flex-col h-full text-sm">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Menu
        </h2>
        <div className="space-y-1">
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              className={({ isActive }) =>
                cn(
                  "group flex w-full items-center rounded-md border border-transparent px-4 py-2 hover:bg-secondary hover:text-foreground",
                  isActive
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground"
                )
              }
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}
