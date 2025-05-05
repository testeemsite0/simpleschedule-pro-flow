
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardSidebarContent } from './DashboardSidebarContent';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const isDashboardPage = location.pathname.startsWith('/dashboard');
  
  return (
    <div className="flex h-screen bg-gray-100 text-gray-700">
      {/* Mobile Sidebar */}
      <MobileSidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <DashboardSidebarContent />
      </MobileSidebar>
      
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 md:border-r md:bg-white",
        !isDashboardPage ? "hidden" : ""
      )}>
        <DashboardSidebarContent />
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:ml-60">
        <header className="mb-4">
          <h1 className="text-3xl font-semibold">{title}</h1>
        </header>
        
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
