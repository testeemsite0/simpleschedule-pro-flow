
import React, { useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Badge } from '@/components/ui/badge';
import { Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminDashboard from '@/components/admin/AdminDashboard';

const AdminPanel = () => {
  const { user } = useAuth();
  const { userRole, isAdmin, loading: rolesLoading, refetch } = useUserRoles();
  const { toast } = useToast();
  
  // Debug logs to help identify the issue
  useEffect(() => {
    console.log('AdminPanel Debug Info:', {
      user: user?.id,
      userRole,
      isAdmin,
      rolesLoading
    });
  }, [user, userRole, isAdmin, rolesLoading]);

  const handleRefreshPermissions = async () => {
    console.log('AdminPanel: Refreshing permissions...');
    await refetch();
    toast({
      title: 'Permissões atualizadas',
      description: 'As permissões foram recarregadas do banco de dados.',
    });
  };
  
  if (rolesLoading) {
    return (
      <DashboardLayout title="Painel Administrativo">
        <div className="flex items-center justify-center py-8">
          <div className="text-center space-y-4">
            <p>Verificando permissões...</p>
            <Button 
              variant="outline" 
              onClick={handleRefreshPermissions}
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Permissões
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!user) {
    return (
      <DashboardLayout title="Acesso Negado">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Você precisa estar logado para acessar esta área.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }
  
  if (!isAdmin) {
    return (
      <DashboardLayout title="Acesso Negado">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p>Você não tem permissão para acessar esta área.</p>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Usuário:</strong> {user.email}</p>
                <p><strong>Role atual:</strong> {userRole}</p>
                <p><strong>É admin:</strong> {isAdmin ? 'Sim' : 'Não'}</p>
                <p><strong>User ID:</strong> {user.id}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleRefreshPermissions}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar Permissões
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title="Dashboard Administrativo">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-600" />
            Dashboard Administrativo
          </h1>
          <p className="text-sm text-muted-foreground">
            Logado como: {user.email} 
            <Badge variant="destructive" className="ml-2">Admin</Badge>
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefreshPermissions}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <AdminDashboard />
    </DashboardLayout>
  );
};

export default AdminPanel;
