
import {
  Home,
  Shield,
  Users,
  Settings,
  BarChart3,
  CreditCard,
} from "lucide-react"
import { NavLink } from "react-router-dom"

import { cn } from "@/lib/utils"

export function AdminSidebarContent() {
  const adminMenuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      description: "Visão geral do sistema"
    },
    {
      title: "Painel Admin",
      url: "/admin-panel",
      icon: Shield,
      description: "Administração do sistema"
    },
    {
      title: "Usuários",
      url: "/dashboard/clients",
      icon: Users,
      description: "Gerenciar usuários"
    },
    {
      title: "Relatórios",
      url: "/dashboard/reports",
      icon: BarChart3,
      description: "Relatórios do sistema"
    },
    {
      title: "Assinaturas",
      url: "/dashboard/subscription",
      icon: CreditCard,
      description: "Gerenciar assinaturas"
    },
    {
      title: "Configurações",
      url: "/dashboard/preferences",
      icon: Settings,
      description: "Configurações do sistema"
    }
  ];

  return (
    <div className="flex flex-col h-full text-sm">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Admin Menu
        </h2>
        <div className="space-y-1">
          {adminMenuItems.map((item) => (
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
      </div>
    </div>
  )
}
