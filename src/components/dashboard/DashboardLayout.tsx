
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Settings, LayoutDashboard, FileText, UserRound, Link2, BarChart2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DashboardLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  const navItems = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { title: 'Agendamentos', icon: <Calendar size={20} />, path: '/dashboard/appointments' },
    { title: 'Horários', icon: <Clock size={20} />, path: '/dashboard/schedules' },
    { title: 'Equipe', icon: <Users size={20} />, path: '/dashboard/team' },
    { title: 'Serviços', icon: <FileText size={20} />, path: '/dashboard/services' },
    { title: 'Clientes', icon: <UserRound size={20} />, path: '/dashboard/clients' },
    { title: 'Link de Agendamento', icon: <Link2 size={20} />, path: '/dashboard/booking-link' },
    { title: 'Relatórios', icon: <BarChart2 size={20} />, path: '/dashboard/reports' },
    { title: 'Preferências', icon: <Settings size={20} />, path: '/dashboard/preferences' },
  ];
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-background border-r">
        <div className="p-4 h-16 flex items-center border-b">
          <Link to="/dashboard" className="font-semibold text-xl text-primary">
            AgendaFácil
          </Link>
        </div>
        
        <div className="p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-primary/10'
                }`}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-4">
          <h1 className="font-semibold text-xl">{title}</h1>
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          )}
        </header>
        
        {/* Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
