
import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppointmentProvider } from './context/AppointmentContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import Pricing from './pages/Pricing';
import DashboardSchedules from './pages/DashboardSchedules';
import DashboardTeam from './pages/DashboardTeam';
import TeamMemberSchedules from './pages/TeamMemberSchedules';
import DashboardServices from './pages/DashboardServices';
import DashboardReports from './pages/DashboardReports';
import DashboardClients from './pages/DashboardClients';
import DashboardBookingLink from './pages/DashboardBookingLink';
import DashboardPreferences from './pages/DashboardPreferences';
import DashboardInsurance from './pages/DashboardInsurance';
import DashboardUnifiedBooking from './pages/DashboardUnifiedBooking';
import AdminPanel from './pages/AdminPanel';
import Index from './pages/Index';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <AppointmentProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/booking/:slug" element={<Booking />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Removed the /dashboard/appointments route */}
            <Route
              path="/dashboard/unified-booking"
              element={
                <ProtectedRoute>
                  <DashboardUnifiedBooking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/schedules"
              element={
                <ProtectedRoute>
                  <DashboardSchedules />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/team"
              element={
                <ProtectedRoute>
                  <DashboardTeam />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/services"
              element={
                <ProtectedRoute>
                  <DashboardServices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/reports"
              element={
                <ProtectedRoute>
                  <DashboardReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/clients"
              element={
                <ProtectedRoute>
                  <DashboardClients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/booking-link"
              element={
                <ProtectedRoute>
                  <DashboardBookingLink />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/insurance"
              element={
                <ProtectedRoute>
                  <DashboardInsurance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/preferences"
              element={
                <ProtectedRoute>
                  <DashboardPreferences />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/team/:memberId/schedules"
              element={
                <ProtectedRoute>
                  <TeamMemberSchedules />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AppointmentProvider>
    </AuthProvider>
  );
};

export default App;
