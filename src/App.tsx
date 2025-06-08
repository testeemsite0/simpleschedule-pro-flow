import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AppointmentProvider } from "@/context/AppointmentContext";
import { ImprovedLoading } from "@/components/ui/improved-loading";

// Lazy load components with better loading states
const Home = lazy(() => import("@/pages/Index"));
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
const DashboardCompany = lazy(() => import("./pages/DashboardCompany"));
const DashboardSubscription = lazy(() => import("./pages/DashboardSubscription"));
const DashboardSecretaries = lazy(() => import("./pages/DashboardSecretaries"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Enhanced loading component for pages
const PageLoadingFallback = ({ message }: { message?: string }) => (
  <ImprovedLoading 
    variant="page" 
    message={message || "Carregando página..."}
    showProgress={true}
  />
);

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
                    <Suspense fallback={<PageLoadingFallback message="Carregando página inicial..." />}>
                      <Home />
                    </Suspense>
                  }
                />
                <Route
                  path="/pricing"
                  element={
                    <Suspense fallback={<PageLoadingFallback message="Carregando preços..." />}>
                      <Pricing />
                    </Suspense>
                  }
                />
                <Route
                  path="/contact"
                  element={
                    <Suspense fallback={<PageLoadingFallback message="Carregando contato..." />}>
                      <Contact />
                    </Suspense>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <Suspense fallback={<PageLoadingFallback message="Carregando login..." />}>
                      <Login />
                    </Suspense>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <Suspense fallback={<PageLoadingFallback message="Carregando cadastro..." />}>
                      <Register />
                    </Suspense>
                  }
                />
                <Route
                  path="/booking/:slug"
                  element={
                    <Suspense fallback={<PageLoadingFallback message="Carregando agendamento..." />}>
                      <Booking />
                    </Suspense>
                  }
                />
                <Route
                  path="/public-booking/:professionalId"
                  element={
                    <Suspense fallback={<PageLoadingFallback message="Carregando agendamento..." />}>
                      <PublicBooking />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <Suspense fallback={<PageLoadingFallback message="Carregando dashboard..." />}>
                      <Dashboard />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/appointments"
                  element={
                    <Suspense fallback={<PageLoadingFallback message="Carregando agendamentos..." />}>
                      <DashboardAppointments />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/schedules"
                  element={
                    <Suspense fallback={<PageLoadingFallback message="Carregando horários..." />}>
                      <DashboardSchedules />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/team"
                  element={
                    <Suspense fallback={<PageLoadingFallback message="Carregando equipe..." />}>
                      <DashboardTeam />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/services"
                  element={
                    <Suspense fallback={<PageLoadingFallback message="Carregando serviços..." />}>
                      <DashboardServices />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/insurance"
                  element={
                    <Suspense fallback={<PageLoadingFallback message="Carregando convênios..." />}>
                      <DashboardInsurance />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/clients"
                  element={
                    <Suspense fallback={<PageLoadingFallback message="Carregando clientes..." />}>
                      <DashboardClients />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/booking-link"
                  element={
                    <Suspense fallback={<PageLoadingFallback message="Carregando link de agendamento..." />}>
                      <DashboardBookingLink />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/reports"
                  element={
                    <Suspense fallback={<PageLoadingFallback message="Carregando relatórios..." />}>
                      <DashboardReports />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/preferences"
                  element={
                    <Suspense fallback={<PageLoadingFallback message="Carregando preferências..." />}>
                      <DashboardPreferences />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/unified-booking"
                  element={
                    <Suspense fallback={<PageLoadingFallback message="Carregando agendamento..." />}>
                      <DashboardUnifiedBooking />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/company"
                  element={
                    <Suspense fallback={<PageLoadingFallback message="Carregando empresa..." />}>
                      <DashboardCompany />
                    </Suspense>
                  }
                />
                
                <Route 
                  path="/dashboard/subscription" 
                  element={
                    <Suspense fallback={<PageLoadingFallback message="Carregando assinatura..." />}>
                      <DashboardSubscription />
                    </Suspense>
                  } 
                />
                <Route
                  path="/dashboard/secretaries"
                  element={<DashboardSecretaries />}
                />
                <Route
                  path="*"
                  element={
                    <Suspense fallback={<PageLoadingFallback message="Carregando..." />}>
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
