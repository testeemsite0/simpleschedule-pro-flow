
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
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-background border-r">
        <div className="p-4 h-16 flex items-center border-b">
          <Link to="/dashboard" className="font-semibold text-xl text-primary">
            AgendaFácil
          </Link>
        </div>
        
        <div className="p-4">
          <DashboardNavigation />
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1">
        {/* Header */}
        <DashboardHeader title={title} />
        
        {/* Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
