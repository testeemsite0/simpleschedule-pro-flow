
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppointmentProvider } from "./context/AppointmentContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DashboardAppointments from "./pages/DashboardAppointments";
import DashboardServices from "./pages/DashboardServices";
import DashboardTeam from "./pages/DashboardTeam";
import DashboardSchedules from "./pages/DashboardSchedules";
import DashboardPreferences from "./pages/DashboardPreferences";
import DashboardBookingLink from "./pages/DashboardBookingLink";
import DashboardUnifiedBooking from "./pages/DashboardUnifiedBooking";
import DashboardReports from "./pages/DashboardReports";
import DashboardInsurance from "./pages/DashboardInsurance";
import DashboardCompany from "./pages/DashboardCompany";
import DashboardClients from "./pages/DashboardClients";
import TeamMemberSchedules from "./pages/TeamMemberSchedules";
import Booking from "./pages/Booking";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppointmentProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/about" element={<About />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/appointments" element={<DashboardAppointments />} />
                <Route path="/dashboard/services" element={<DashboardServices />} />
                <Route path="/dashboard/team" element={<DashboardTeam />} />
                <Route path="/dashboard/schedules" element={<DashboardSchedules />} />
                <Route path="/dashboard/preferences" element={<DashboardPreferences />} />
                <Route path="/dashboard/booking-link" element={<DashboardBookingLink />} />
                <Route path="/dashboard/unified-booking" element={<DashboardUnifiedBooking />} />
                <Route path="/dashboard/reports" element={<DashboardReports />} />
                <Route path="/dashboard/insurance" element={<DashboardInsurance />} />
                <Route path="/dashboard/company" element={<DashboardCompany />} />
                <Route path="/dashboard/clients" element={<DashboardClients />} />
                <Route path="/dashboard/team/:teamMemberId/schedules" element={<TeamMemberSchedules />} />
                <Route path="/booking/:slug" element={<Booking />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AppointmentProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
