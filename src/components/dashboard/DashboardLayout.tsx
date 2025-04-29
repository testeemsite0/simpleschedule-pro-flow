
import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  CalendarIcon,
  LinkIcon,
  UserIcon,
  HomeIcon,
  LogOutIcon,
  SettingsIcon
} from 'lucide-react';

type DashboardLayoutProps = {
  children: ReactNode;
  title?: string;  // Make the title prop optional
};

// List of admin emails
const ADMIN_EMAILS = ['admin@azulschedule.com'];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Check if current user is an admin
    if (user && user.email && ADMIN_EMAILS.includes(user.email)) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);
  
  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <HomeIcon size={18} /> },
    { path: '/dashboard/schedules', label: 'Horários', icon: <CalendarIcon size={18} /> },
    { path: '/dashboard/booking-link', label: 'Link de Agendamento', icon: <LinkIcon size={18} /> },
    { path: '/dashboard/profile', label: 'Perfil', icon: <UserIcon size={18} /> },
    { path: '/dashboard/settings', label: 'Configurações', icon: <SettingsIcon size={18} /> },
  ];
  
  // Add admin panel link for admin users
  if (isAdmin) {
    navItems.push({ 
      path: '/admin', 
      label: 'Painel Admin', 
      icon: <SettingsIcon size={18} /> 
    });
  }
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-primary">SimpleSchedule</Link>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-600">
                Olá, {user.name.split(' ')[0]}
                {isAdmin && <span className="ml-1 text-xs font-semibold text-primary">(Admin)</span>}
              </span>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="flex items-center gap-2"
            >
              <LogOutIcon size={16} />
              Sair
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-50 border-r p-4 hidden md:block">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        
        {/* Mobile navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-10">
          <div className="flex justify-between px-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-3 ${
                  isActive(item.path)
                    ? 'text-primary'
                    : 'text-gray-600'
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Main content */}
        <main className="flex-1 bg-gray-50">
          <div className="container mx-auto p-6">
            {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
