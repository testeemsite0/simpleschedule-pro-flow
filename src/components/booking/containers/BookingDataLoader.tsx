
import React from 'react';
import { Button } from '@/components/ui/button';

interface BookingDataLoaderProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export const BookingDataLoader: React.FC<BookingDataLoaderProps> = ({
  onRefresh,
  isLoading
}) => {
  return (
    <div className="py-4 flex justify-center">
      <Button 
        onClick={onRefresh}
        variant="outline"
        disabled={isLoading}
      >
        {isLoading ? "Carregando..." : "Forçar atualização de dados"}
      </Button>
    </div>
  );
};
