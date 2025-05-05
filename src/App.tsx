
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
import DashboardAppointments from './pages/DashboardAppointments';
import DashboardSchedules from './pages/DashboardSchedules';
import DashboardTeam from './pages/DashboardTeam';
import TeamMemberSchedules from './pages/TeamMemberSchedules';
import DashboardServices from './pages/DashboardServices';

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
            <Route path="/" element={<Navigate to="/login" />} />
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
            <Route
              path="/dashboard/appointments"
              element={
                <ProtectedRoute>
                  <DashboardAppointments />
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
