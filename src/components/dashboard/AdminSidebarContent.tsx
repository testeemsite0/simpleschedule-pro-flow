
import { Shield } from "lucide-react"
import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"

export function AdminSidebarContent() {
  console.log('AdminSidebarContent: Renderizando menu admin simplificado');
  
  return (
    <div className="flex flex-col h-full text-sm">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Admin
        </h2>
        <div className="space-y-1">
          <NavLink
            to="/admin-panel"
            className={({ isActive }) =>
              cn(
                "group flex w-full items-center rounded-md border border-transparent px-4 py-2 hover:bg-secondary hover:text-foreground transition-colors",
                isActive
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground"
              )
            }
          >
            <Shield className="mr-2 h-4 w-4" />
            Painel Admin
          </NavLink>
        </div>
      </div>
    </div>
  )
}
