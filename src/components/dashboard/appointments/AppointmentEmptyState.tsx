
import React from 'react';
import { Card } from '@/components/ui/card';

const AppointmentEmptyState = () => {
  return (
    <Card className="p-6 text-center">
      <p className="text-muted-foreground">Nenhum agendamento encontrado.</p>
    </Card>
  );
};

export default AppointmentEmptyState;
