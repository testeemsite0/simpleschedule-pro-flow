
import React, { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';
import { 
  Calendar, 
  Clock, 
  User, 
  Settings, 
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const menuItems = [
    {
      icon: Calendar,
      label: 'Agendamentos',
      href: '/dashboard',
    },
    {
      icon: Clock,
      label: 'Horários',
      href: '/dashboard/schedules',
    },
    {
      icon: User,
      label: 'Perfil',
      href: '/dashboard/profile',
    },
    {
      icon: LinkIcon,
      label: 'Link de Agendamento',
      href: '/dashboard/booking-link',
    },
    {
      icon: Settings,
      label: 'Configurações',
      href: '/dashboard/settings',
    },
  ];
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm hidden md:flex flex-col">
        <div className="p-4 border-b">
          <Logo />
        </div>
        
        <div className="p-4 flex-1">
          <nav className="space-y-1">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  window.location.pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-900 hover:bg-gray-100"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium">
                {user?.name[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.profession}
              </p>
            </div>
          </div>
          <Button 
            variant="outline"
            className="w-full mt-4"
            onClick={handleLogout}
          >
            Sair
          </Button>
        </div>
      </aside>
      
      {/* Mobile Header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow-sm md:hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <Logo />
            <button className="text-gray-500 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">{title}</h1>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
