import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppointmentProvider } from './context/AppointmentContext';
import { SubscriberProvider } from './context/SubscriberContext';
import { ProfessionalProvider } from './context/ProfessionalContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import Pricing from './pages/Pricing';
import AccountSettings from './pages/AccountSettings';
import DashboardAppointments from './pages/DashboardAppointments';
import DashboardSchedules from './pages/DashboardSchedules';
import DashboardTeam from './pages/DashboardTeam';
import TeamMemberSchedules from './pages/TeamMemberSchedules';
import DashboardInsurancePlans from './pages/DashboardInsurancePlans';
import DashboardServices from './pages/DashboardServices';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { SystemConfigProvider } from './context/SystemConfigContext';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import SubscriptionCancelled from './pages/SubscriptionCancelled';
import LandingPage from './pages/LandingPage';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const App = () => {
  const [isStripeLoading, setIsStripeLoading] = useState(true);

  useEffect(() => {
    const checkStripeStatus = async () => {
      if (stripePromise) {
        setIsStripeLoading(false);
      }
    };

    checkStripeStatus();
  }, []);

  return (
    <AuthProvider>
      <SystemConfigProvider>
        <ProfessionalProvider>
          <AppointmentProvider>
            <SubscriberProvider>
              <Router>
                <Elements stripe={stripePromise}>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/booking/:slug" element={<Booking />} />
                    <Route path="/subscription/success" element={<SubscriptionSuccess />} />
                    <Route path="/subscription/cancelled" element={<SubscriptionCancelled />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/account"
                      element={
                        <ProtectedRoute>
                          <AccountSettings />
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
                      path="/dashboard/insurance-plans"
                      element={
                        <ProtectedRoute>
                          <DashboardInsurancePlans />
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
                    {
                      path: "/dashboard/team/:memberId/schedules",
                      element: (
                        <ProtectedRoute>
                          <TeamMemberSchedules />
                        </ProtectedRoute>
                      ),
                    },
                  </Routes>
                </Elements>
              </Router>
            </SubscriberProvider>
          </AppointmentProvider>
        </ProfessionalProvider>
      </SystemConfigProvider>
    </AuthProvider>
  );
};

export default App;
