
import {
  BarChart,
  Calendar,
  Home,
  Settings,
  User,
  ListChecks,
  MessageSquare,
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import { useAuth } from "@/context/AuthContext"
import { useUserRoles } from "@/hooks/useUserRoles"
import { cn } from "@/lib/utils"
import { Shield } from 'lucide-react';

export function DashboardSidebarContent() {
  const { user } = useAuth();
  const { userRole, isSecretary, isAdmin } = useUserRoles();
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  const menuItems = [
    {
      title: "Início",
      url: "/dashboard",
      icon: Home,
      description: "Visão geral do seu negócio"
    },
    {
      title: "Agendamentos",
      url: "/dashboard/appointments",
      icon: Calendar,
      description: "Gerenciar seus agendamentos"
    },
    {
      title: "WhatsApp",
      url: "/dashboard/whatsapp",
      icon: MessageSquare,
      description: "Integração com WhatsApp Web"
    },
    {
      title: "Relatórios",
      url: "/dashboard/reports",
      icon: BarChart,
      description: "Análise de dados e desempenho"
    },
    {
      title: "Serviços",
      url: "/dashboard/services",
      icon: ListChecks,
      description: "Gerenciar serviços"
    },
    {
      title: "Perfil",
      url: "/dashboard/profile",
      icon: User,
      description: "Configurações do seu perfil"
    },
    {
      title: "Configurações",
      url: "/dashboard/settings",
      icon: Settings,
      description: "Configurações gerais do sistema"
    },
    ...(isAdmin || (!isSecretary && userRole === 'professional') ? [
      {
        title: "Secretárias",
        url: "/dashboard/secretaries",
        icon: Shield,
        description: "Gerenciar secretárias e permissões"
      }
    ] : []),
  ]

  return (
    <div className="flex flex-col h-full text-sm">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Menu
        </h2>
        <div className="space-y-1">
          {menuItems.map((item) => (
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
