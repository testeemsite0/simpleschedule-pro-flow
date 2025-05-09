
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedBookingForm } from '@/components/booking/UnifiedBookingForm';
import { UnifiedBookingProvider } from '@/context/UnifiedBookingContext';
import { useAuth } from '@/context/AuthContext';
import AppointmentList from '@/components/dashboard/AppointmentList';
import AppointmentTabs from '@/components/dashboard/AppointmentTabs';

const DashboardUnifiedBooking = () => {
  const [activeTab, setActiveTab] = useState("appointments");
  const { user } = useAuth();
  
  return (
    <DashboardLayout title="Agendamentos">
      <div className="space-y-8">
        <Tabs defaultValue="appointments" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="appointments">Ver Agendamentos</TabsTrigger>
            <TabsTrigger value="new-booking">Novo Agendamento</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appointments" className="space-y-6 pt-4">
            <AppointmentTabs />
          </TabsContent>
          
          <TabsContent value="new-booking" className="space-y-6 pt-4">
            <UnifiedBookingProvider professionalId={user?.id} isAdminView={true}>
              <UnifiedBookingForm 
                title="Novo Agendamento" 
                showStepIndicator={true}
                isAdminView={true}
                allowWalkIn={true}
              />
            </UnifiedBookingProvider>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DashboardUnifiedBooking;
