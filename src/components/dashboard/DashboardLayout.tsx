
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
      <div className="w-full md:w-64 bg-background border-r md:fixed md:h-screen overflow-y-auto">
        <div className="p-4 h-16 flex items-center border-b">
          <Link to="/dashboard" className="font-semibold text-xl text-primary">
            AgendaFácil
          </Link>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <DashboardNavigation />
        </div>
      </div>
      
      {/* Main content - with margin to account for fixed sidebar */}
      <div className="flex-1 md:ml-64">
        {/* Header */}
        <DashboardHeader title={title} />
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </div>
    </div>
  );
};
