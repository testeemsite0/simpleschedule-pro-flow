
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BookingStepsContentProps {
  children: React.ReactNode;
}

export const BookingStepsContent: React.FC<BookingStepsContentProps> = ({ children }) => {
  return (
    <div className="relative">
      <ScrollArea className="h-[400px] overflow-y-auto pr-4">
        <div className="space-y-6 pb-4">
          {children}
        </div>
      </ScrollArea>
    </div>
  );
};
