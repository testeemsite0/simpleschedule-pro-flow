
import {
  BarChart,
  Calendar,
  Home,
  Settings,
  User,
  ListChecks,
  Clock,
  Users,
  Shield,
  UserRound,
  Link2,
  Building,
  CreditCard,
  Sliders,
  ShieldCheck,
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import { useAuth } from "@/context/AuthContext"
import { useUserRoles } from "@/hooks/useUserRoles"
import { cn } from "@/lib/utils"

export function DashboardSidebarContent() {
  const { user } = useAuth();
  const { userRole, isSecretary, isAdmin } = useUserRoles();
  const location = useLocation()

  const menuSections = [
    {
      title: "Principal",
      items: [
        {
          title: "Início",
          url: "/dashboard",
          icon: Home,
          description: "Visão geral do seu negócio",
          roles: ['professional', 'secretary', 'admin']
        },
        {
          title: "Agendamentos",
          url: "/dashboard/unified-booking",
          icon: Calendar,
          description: "Gerenciar seus agendamentos",
          roles: ['professional', 'secretary', 'admin']
        },
        {
          title: "Horários",
          url: "/dashboard/schedules",
          icon: Clock,
          description: "Configurar horários de atendimento",
          roles: ['professional', 'admin']
        },
      ]
    },
    {
      title: "Gerenciamento",
      items: [
        {
          title: "Equipe",
          url: "/dashboard/team",
          icon: Users,
          description: "Gerenciar membros da equipe",
          roles: ['professional', 'admin']
        },
        {
          title: "Serviços",
          url: "/dashboard/services",
          icon: ListChecks,
          description: "Gerenciar serviços",
          roles: ['professional', 'admin']
        },
        {
          title: "Convênios",
          url: "/dashboard/insurance",
          icon: Shield,
          description: "Gerenciar convênios médicos",
          roles: ['professional', 'admin']
        },
        {
          title: "Clientes",
          url: "/dashboard/clients",
          icon: UserRound,
          description: "Gerenciar clientes",
          roles: ['professional', 'secretary', 'admin']
        },
      ]
    },
    {
      title: "Ferramentas",
      items: [
        {
          title: "Link de Agendamento",
          url: "/dashboard/booking-link",
          icon: Link2,
          description: "Criar links de agendamento",
          roles: ['professional', 'admin']
        },
        {
          title: "Relatórios",
          url: "/dashboard/reports",
          icon: BarChart,
          description: "Análise de dados e desempenho",
          roles: ['professional', 'admin']
        },
      ]
    },
    {
      title: "Configurações",
      items: [
        {
          title: "Empresa",
          url: "/dashboard/company",
          icon: Building,
          description: "Informações da empresa",
          roles: ['professional', 'admin']
        },
        {
          title: "Preferências",
          url: "/dashboard/preferences",
          icon: Sliders,
          description: "Configurações do sistema",
          roles: ['professional', 'admin']
        },
        {
          title: "Perfil",
          url: "/dashboard/profile",
          icon: User,
          description: "Configurações do seu perfil",
          roles: ['professional', 'secretary', 'admin']
        },
        {
          title: "Assinatura",
          url: "/dashboard/subscription",
          icon: CreditCard,
          description: "Gerenciar assinatura",
          roles: ['professional', 'admin']
        },
      ]
    }
  ];

  // Add secretary management section if user has permission
  if (isAdmin || (!isSecretary && userRole === 'professional')) {
    menuSections[1].items.push({
      title: "Secretárias",
      url: "/dashboard/secretaries",
      icon: Shield,
      description: "Gerenciar secretárias e permissões",
      roles: ['professional', 'admin']
    });
  }

  // Add admin panel for admin users
  if (isAdmin) {
    menuSections.push({
      title: "Administração",
      items: [
        {
          title: "Painel Admin",
          url: "/admin-panel",
          icon: ShieldCheck,
          description: "Administração do sistema",
          roles: ['admin']
        }
      ]
    });
  }

  // Filter items based on user role
  const filteredSections = menuSections.map(section => ({
    ...section,
    items: section.items.filter(item => item.roles.includes(userRole))
  })).filter(section => section.items.length > 0);

  return (
    <div className="flex flex-col h-full text-sm">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Menu
        </h2>
        <div className="space-y-6">
          {filteredSections.map((section, sectionIndex) => (
            <div key={section.title} className="space-y-1">
              {sectionIndex > 0 && (
                <div className="px-4 py-2">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.url}
                  to={item.url}
                  className={({ isActive }) =>
                    cn(
                      "group flex w-full items-center rounded-md border border-transparent px-4 py-2 hover:bg-secondary hover:text-foreground transition-colors",
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
          ))}
        </div>
      </div>
    </div>
  )
}
