
import React from 'react';
import { DashboardSidebarContent } from './DashboardSidebarContent';
import { DashboardHeader } from './DashboardHeader';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBreadcrumbs?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title,
  showBreadcrumbs = true 
}) => {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border">
        <DashboardSidebarContent />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title={title} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <div className="container mx-auto px-6 py-6">
            {showBreadcrumbs && <Breadcrumbs items={[]} />}
            {title && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
