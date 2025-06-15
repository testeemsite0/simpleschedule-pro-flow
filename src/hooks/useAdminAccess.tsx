
import React from 'react';
import { useUserRoles } from './useUserRoles';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export function useAdminAccess() {
  const { isAdmin, loading } = useUserRoles();

  const AccessDeniedComponent = () => (
    <DashboardLayout title="Acesso Negado">
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Você não tem permissão para acessar esta área.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );

  return {
    loading,
    hasAccess: isAdmin,
    AccessDeniedComponent
  };
}
