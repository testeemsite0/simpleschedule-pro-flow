
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const BookingLoadingState: React.FC = () => {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        <p className="text-center">Carregando...</p>
      </CardContent>
    </Card>
  );
};

export default BookingLoadingState;
