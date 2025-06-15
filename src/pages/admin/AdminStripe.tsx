
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import StripeIntegrationPanel from '@/components/admin/StripeIntegrationPanel';
import { useAdminAccess } from '@/hooks/useAdminAccess';

const AdminStripe = () => {
  const { loading, hasAccess, AccessDeniedComponent } = useAdminAccess();

  if (loading) {
    return (
      <DashboardLayout title="Integração Stripe">
        <div className="flex items-center justify-center py-8">
          <p>Verificando permissões...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!hasAccess) {
    return <AccessDeniedComponent />;
  }

  return (
    <DashboardLayout title="Integração Stripe">
      <StripeIntegrationPanel />
    </DashboardLayout>
  );
};

export default AdminStripe;
