
import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardNavigation } from './DashboardNavigation';
import { DashboardHeader } from './DashboardHeader';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DashboardLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Fixed position */}
      <div className="w-full md:w-64 bg-background border-r md:fixed md:h-screen md:overflow-hidden flex flex-col">
        <div className="p-4 h-16 flex items-center border-b shrink-0">
          <Link to="/dashboard" className="font-semibold text-xl text-primary">
            AgendaFácil
          </Link>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4">
            <DashboardNavigation />
          </div>
        </ScrollArea>
      </div>
      
      {/* Main content - with margin to account for fixed sidebar */}
      <div className="flex-1 md:ml-64">
        {/* Header */}
        <DashboardHeader title={title} />
        
        {/* Content with scroll */}
        <ScrollArea className="max-h-[calc(100vh-4rem)]">
          <main className="p-6">
            {children}
          </main>
        </ScrollArea>
      </div>
    </div>
  );
};
