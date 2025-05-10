
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const BookingLoadingState: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Booking form skeleton */}
      <div className="border rounded-lg overflow-hidden">
        <div className="p-6 border-b bg-accent/20">
          <Skeleton className="h-6 w-2/3" />
        </div>
        
        <div className="p-6 space-y-6">
          {/* Step indicator */}
          <div className="flex justify-between items-center mb-8">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-16 mt-2" />
              </div>
            ))}
          </div>
          
          {/* Selection content */}
          <div className="space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-14 rounded-md" />
              ))}
            </div>
            
            <Skeleton className="h-5 w-40 mt-6" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <Skeleton key={item} className="h-12 rounded-md" />
              ))}
            </div>
            
            <div className="flex justify-between mt-8">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingLoadingState;
