
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import AppointmentReports from '@/components/dashboard/AppointmentReports';

const DashboardReports = () => {
  return (
    <DashboardLayout title="Relatórios de Agendamentos">
      <AppointmentReports />
    </DashboardLayout>
  );
};

export default DashboardReports;
