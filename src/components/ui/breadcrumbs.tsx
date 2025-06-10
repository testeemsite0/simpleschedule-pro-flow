
import React from "react"
import { ChevronRight, Home } from "lucide-react"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  title: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}
    >
      <Link
        to="/dashboard"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {items.length > 0 && (
        <ChevronRight className="h-4 w-4 mx-1" />
      )}
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        
        return (
          <React.Fragment key={index}>
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.title}
              </Link>
            ) : (
              <span
                className={cn(
                  isLast ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {item.title}
              </span>
            )}
            
            {!isLast && <ChevronRight className="h-4 w-4 mx-1" />}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
