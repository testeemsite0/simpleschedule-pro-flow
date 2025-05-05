
import { Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DashboardAppointments from './pages/DashboardAppointments';
import DashboardSchedules from './pages/DashboardSchedules';
import DashboardServices from './pages/DashboardServices';
import DashboardTeam from './pages/DashboardTeam'; 
import DashboardInsurance from './pages/DashboardInsurance';
import DashboardReports from './pages/DashboardReports';
import DashboardClients from './pages/DashboardClients';
import DashboardBookingLink from './pages/DashboardBookingLink';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import About from './pages/About';
import Pricing from './pages/Pricing';
import Features from './pages/Features';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Booking from './pages/Booking';
import './App.css';
import { Toaster } from './components/ui/toaster';

const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/booking/:slug" element={<Booking />} />
        
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/appointments" element={<DashboardAppointments />} />
        <Route path="/dashboard/schedules" element={<DashboardSchedules />} />
        <Route path="/dashboard/services" element={<DashboardServices />} />
        <Route path="/dashboard/team" element={<DashboardTeam />} />
        <Route path="/dashboard/insurance" element={<DashboardInsurance />} />
        <Route path="/dashboard/reports" element={<DashboardReports />} />
        <Route path="/dashboard/clients" element={<DashboardClients />} />
        <Route path="/dashboard/booking-link" element={<DashboardBookingLink />} />
        <Route path="/dashboard/settings" element={<Settings />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
