
import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardNavigation } from './DashboardNavigation';
import { DashboardHeader } from './DashboardHeader';

interface DashboardLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Fixed position */}
      <aside className="w-full md:w-64 bg-background border-r md:fixed md:h-screen z-20">
        <div className="p-4 h-16 flex items-center border-b">
          <Link to="/dashboard" className="font-semibold text-xl text-primary">
            AgendaFácil
          </Link>
        </div>
        
        <div className="overflow-y-auto h-[calc(100vh-4rem)]">
          <DashboardNavigation />
        </div>
      </aside>
      
      {/* Main content - with margin to account for fixed sidebar */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Header - Fixed at the top of the content area */}
        <DashboardHeader title={title} />
        
        {/* Content - Scrollable area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
