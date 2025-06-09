
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  const location = useLocation();
  
  // Gera breadcrumbs automáticos baseado na rota se não forem fornecidos
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Início', path: '/dashboard', icon: <Home className="h-4 w-4" /> }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Mapeia segmentos para labels amigáveis
      const labelMap: Record<string, string> = {
        'dashboard': 'Dashboard',
        'appointments': 'Agendamentos',
        'secretaries': 'Secretárias',
        'services': 'Serviços',
        'reports': 'Relatórios',
        'settings': 'Configurações',
        'profile': 'Perfil',
        'schedules': 'Horários',
        'team': 'Equipe',
        'clients': 'Clientes',
        'insurance': 'Convênios'
      };

      if (index > 0) { // Pula o primeiro 'dashboard'
        breadcrumbs.push({
          label: labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
          path: currentPath
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-muted-foreground mb-4", className)}>
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.path}>
          {index === breadcrumbItems.length - 1 ? (
            <span className="flex items-center space-x-1 font-medium text-foreground">
              {item.icon}
              <span>{item.label}</span>
            </span>
          ) : (
            <>
              <Link
                to={item.path}
                className="flex items-center space-x-1 hover:text-foreground transition-colors"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
