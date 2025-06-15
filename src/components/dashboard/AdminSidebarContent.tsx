
import {
  Shield,
  BarChart3,
  Database,
  CreditCard,
  Webhook,
  Users,
  FileText,
  Settings
} from "lucide-react"
import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"

export function AdminSidebarContent() {
  console.log('AdminSidebarContent: Renderizando menu admin expandido');
  
  const adminMenuItems = [
    {
      title: "Dashboard",
      url: "/admin-panel",
      icon: BarChart3,
      description: "Visão geral do sistema"
    },
    {
      title: "Planos",
      url: "/admin-panel/plans",
      icon: Database,
      description: "Gerenciar planos de assinatura"
    },
    {
      title: "Stripe",
      url: "/admin-panel/stripe",
      icon: CreditCard,
      description: "Configurações do Stripe"
    },
    {
      title: "Webhooks",
      url: "/admin-panel/webhooks",
      icon: Webhook,
      description: "Gerenciar webhooks"
    },
    {
      title: "Usuários",
      url: "/admin-panel/users",
      icon: Users,
      description: "Gerenciar usuários"
    },
    {
      title: "Auditoria",
      url: "/admin-panel/audit",
      icon: FileText,
      description: "Logs de auditoria"
    },
    {
      title: "Configurações",
      url: "/admin-panel/config",
      icon: Settings,
      description: "Configurações do sistema"
    }
  ];
  
  return (
    <div className="flex flex-col h-full text-sm">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          <Shield className="inline mr-2 h-5 w-5 text-green-600" />
          Admin
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
