import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AppointmentProvider } from "@/context/AppointmentContext";
const Home = lazy(() => import("./pages/Home"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Booking = lazy(() => import("./pages/Booking"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardAppointments = lazy(() => import("./pages/DashboardAppointments"));
const DashboardSchedules = lazy(() => import("./pages/DashboardSchedules"));
const DashboardTeam = lazy(() => import("./pages/DashboardTeam"));
const DashboardServices = lazy(() => import("./pages/DashboardServices"));
const DashboardInsurance = lazy(() => import("./pages/DashboardInsurance"));
const DashboardClients = lazy(() => import("./pages/DashboardClients"));
const DashboardBookingLink = lazy(() => import("./pages/DashboardBookingLink"));
const DashboardReports = lazy(() => import("./pages/DashboardReports"));
const DashboardPreferences = lazy(() => import("./pages/DashboardPreferences"));
const DashboardUnifiedBooking = lazy(() => import("./pages/DashboardUnifiedBooking"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PublicBooking = lazy(() => import("./pages/PublicBooking"));
const LoadingScreen = lazy(() => import("./components/LoadingScreen"));
const DashboardCompany = lazy(() => import("./pages/DashboardCompany"));
const DashboardSubscription = lazy(() => import("./pages/DashboardSubscription"));
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppointmentProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route
                  path="/"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <Home />
                    </Suspense>
                  }
                />
                <Route
                  path="/pricing"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <Pricing />
                    </Suspense>
                  }
                />
                <Route
                  path="/contact"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <Contact />
                    </Suspense>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <Login />
                    </Suspense>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <Register />
                    </Suspense>
                  }
                />
                <Route
                  path="/booking/:slug"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <Booking />
                    </Suspense>
                  }
                />
                <Route
                  path="/public-booking/:professionalId"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <PublicBooking />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <Dashboard />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/appointments"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <DashboardAppointments />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/schedules"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <DashboardSchedules />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/team"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <DashboardTeam />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/services"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <DashboardServices />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/insurance"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <DashboardInsurance />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/clients"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <DashboardClients />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/booking-link"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <DashboardBookingLink />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/reports"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <DashboardReports />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/preferences"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <DashboardPreferences />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/unified-booking"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <DashboardUnifiedBooking />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/company"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <DashboardCompany />
                    </Suspense>
                  }
                />
                
                <Route path="/dashboard/subscription" element={<DashboardSubscription />} />
                <Route
                  path="*"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <NotFound />
                    </Suspense>
                  }
                />
              </Routes>
            </BrowserRouter>
          </AppointmentProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
