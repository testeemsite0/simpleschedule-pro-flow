
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useToast } from '@/hooks/use-toast';

export const useAdminAccess = () => {
  const { user } = useAuth();
  const { userRole, isAdmin, loading, refetch } = useUserRoles();
  const { toast } = useToast();

  const handleRefreshPermissions = async () => {
    console.log('AdminAccess: Refreshing permissions...');
    await refetch();
    toast({
      title: 'Permissões atualizadas',
      description: 'As permissões foram recarregadas do banco de dados.',
    });
  };

  const AccessDeniedComponent = () => (
    <DashboardLayout title="Acesso Negado">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p>Você não tem permissão para acessar esta área.</p>
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>Usuário:</strong> {user?.email}</p>
              <p><strong>Role atual:</strong> {userRole}</p>
              <p><strong>É admin:</strong> {isAdmin ? 'Sim' : 'Não'}</p>
              <p><strong>User ID:</strong> {user?.id}</p>
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

  return {
    loading,
    hasAccess: user && isAdmin,
    AccessDeniedComponent
  };
};
