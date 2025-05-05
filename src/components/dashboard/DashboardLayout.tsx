import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
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
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0 pt-6">
          <DashboardSidebarContent />
        </SheetContent>
      </Sheet>
      
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
