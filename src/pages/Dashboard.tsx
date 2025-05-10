
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, ClipboardListIcon, UsersIcon, SettingsIcon } from 'lucide-react';
import { FullPageLoadingState } from '@/components/ui/loading-states';

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <FullPageLoadingState message="Carregando seu painel..." />;
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sessão Expirada</CardTitle>
            <CardDescription>
              Por favor, faça login novamente para acessar o painel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login" className="block w-full bg-primary text-white py-2 px-4 rounded text-center">
              Fazer Login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <DashboardLayout title="Visão Geral">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
              Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Gerencie seus agendamentos e consulte sua agenda.
            </p>
            <Link 
              to="/dashboard/unified-booking" 
              className="text-sm text-primary underline hover:text-primary/80"
            >
              Ver Agendamentos
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ClipboardListIcon className="mr-2 h-5 w-5 text-primary" />
              Horários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure sua disponibilidade e horários de atendimento.
            </p>
            <Link 
              to="/dashboard/schedules" 
              className="text-sm text-primary underline hover:text-primary/80"
            >
              Gerenciar Horários
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <UsersIcon className="mr-2 h-5 w-5 text-primary" />
              Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione e gerencie membros da sua equipe.
            </p>
            <Link 
              to="/dashboard/team" 
              className="text-sm text-primary underline hover:text-primary/80"
            >
              Gerenciar Equipe
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <SettingsIcon className="mr-2 h-5 w-5 text-primary" />
              Link de Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure e compartilhe seu link de agendamento personalizado.
            </p>
            <Link 
              to="/dashboard/booking-link" 
              className="text-sm text-primary underline hover:text-primary/80"
            >
              Gerenciar Link
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
