
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import SubscriptionManagement from '@/components/dashboard/SubscriptionManagement';
import AvailablePlans from '@/components/dashboard/AvailablePlans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const DashboardSubscription = () => {
  return (
    <DashboardLayout title="Minha Assinatura">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Status da Assinatura</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionManagement />
          </CardContent>
        </Card>

        <Separator />

        <AvailablePlans />
      </div>
    </DashboardLayout>
  );
};

export default DashboardSubscription;
