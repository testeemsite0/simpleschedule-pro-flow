
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AppointmentProvider } from './context/AppointmentContext';

// Pages
import Index from './pages/Index';
import Features from './pages/Features';
import About from './pages/About';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import DashboardSchedules from './pages/DashboardSchedules';
import DashboardReports from './pages/DashboardReports';
import DashboardBookingLink from './pages/DashboardBookingLink';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import Booking from './pages/Booking';
import DashboardAppointments from './pages/DashboardAppointments';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function App() {
  // Initialize QueryClient with proper configuration
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppointmentProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/features" element={<Features />} />
              <Route path="/about" element={<About />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/booking/:slug" element={<Booking />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/schedules" element={<DashboardSchedules />} />
              <Route path="/dashboard/appointments" element={<DashboardAppointments />} />
              <Route path="/dashboard/reports" element={<DashboardReports />} />
              <Route path="/dashboard/booking-link" element={<DashboardBookingLink />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<AdminPanel />} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </AppointmentProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
