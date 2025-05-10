
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const BookingLoadingState: React.FC = () => {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          <div className="space-y-2 w-full max-w-md">
            <Skeleton className="h-8 w-2/3 mx-auto" />
            <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden mx-auto mt-4">
              <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            
            <div className="space-y-3 mt-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
            </div>
          </div>
          
          <p className="text-center text-muted-foreground mt-4">
            Carregando informações de agendamento...
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingLoadingState;
