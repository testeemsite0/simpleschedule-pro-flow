import { lazy } from "react";

// Lazy load components with better loading states
const Home = lazy(() => import("@/pages/Index"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const Contact = lazy(() => import("@/pages/Contact"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Booking = lazy(() => import("@/pages/Booking"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const DashboardAppointments = lazy(() => import("@/pages/DashboardAppointments"));
const DashboardSchedules = lazy(() => import("@/pages/DashboardSchedules"));
const DashboardTeam = lazy(() => import("@/pages/DashboardTeam"));
const DashboardServices = lazy(() => import("@/pages/DashboardServices"));
const DashboardInsurance = lazy(() => import("@/pages/DashboardInsurance"));
const DashboardClients = lazy(() => import("@/pages/DashboardClients"));
const DashboardBookingLink = lazy(() => import("@/pages/DashboardBookingLink"));
const DashboardReports = lazy(() => import("@/pages/DashboardReports"));
const DashboardPreferences = lazy(() => import("@/pages/DashboardPreferences"));
const DashboardUnifiedBooking = lazy(() => import("@/pages/DashboardUnifiedBooking"));
const DashboardWhatsApp = lazy(() => import("@/pages/DashboardWhatsApp"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const PublicBooking = lazy(() => import("@/pages/PublicBooking"));
const DashboardCompany = lazy(() => import("@/pages/DashboardCompany"));
const DashboardSubscription = lazy(() => import("@/pages/DashboardSubscription"));
const DashboardSecretaries = lazy(() => import("@/pages/DashboardSecretaries"));
const Profile = lazy(() => import("@/pages/Profile"));
const Settings = lazy(() => import("@/pages/Settings"));

export interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  loadingMessage: string;
}

export const routeConfigs: RouteConfig[] = [
  {
    path: "/",
    component: Home,
    loadingMessage: "Carregando página inicial..."
  },
  {
    path: "/pricing",
    component: Pricing,
    loadingMessage: "Carregando preços..."
  },
  {
    path: "/contact",
    component: Contact,
    loadingMessage: "Carregando contato..."
  },
  {
    path: "/login",
    component: Login,
    loadingMessage: "Carregando login..."
  },
  {
    path: "/register",
    component: Register,
    loadingMessage: "Carregando cadastro..."
  },
  {
    path: "/booking/:slug",
    component: Booking,
    loadingMessage: "Carregando agendamento..."
  },
  {
    path: "/public-booking/:professionalId",
    component: PublicBooking,
    loadingMessage: "Carregando agendamento..."
  },
  {
    path: "/dashboard",
    component: Dashboard,
    loadingMessage: "Carregando dashboard..."
  },
  {
    path: "/dashboard/appointments",
    component: DashboardAppointments,
    loadingMessage: "Carregando agendamentos..."
  },
  {
    path: "/dashboard/schedules",
    component: DashboardSchedules,
    loadingMessage: "Carregando horários..."
  },
  {
    path: "/dashboard/team",
    component: DashboardTeam,
    loadingMessage: "Carregando equipe..."
  },
  {
    path: "/dashboard/services",
    component: DashboardServices,
    loadingMessage: "Carregando serviços..."
  },
  {
    path: "/dashboard/insurance",
    component: DashboardInsurance,
    loadingMessage: "Carregando convênios..."
  },
  {
    path: "/dashboard/clients",
    component: DashboardClients,
    loadingMessage: "Carregando clientes..."
  },
  {
    path: "/dashboard/booking-link",
    component: DashboardBookingLink,
    loadingMessage: "Carregando link de agendamento..."
  },
  {
    path: "/dashboard/reports",
    component: DashboardReports,
    loadingMessage: "Carregando relatórios..."
  },
  {
    path: "/dashboard/preferences",
    component: DashboardPreferences,
    loadingMessage: "Carregando preferências..."
  },
  {
    path: "/dashboard/unified-booking",
    component: DashboardUnifiedBooking,
    loadingMessage: "Carregando agendamento..."
  },
  {
    path: "/dashboard/whatsapp",
    component: DashboardWhatsApp,
    loadingMessage: "Carregando WhatsApp..."
  },
  {
    path: "/dashboard/company",
    component: DashboardCompany,
    loadingMessage: "Carregando empresa..."
  },
  {
    path: "/dashboard/subscription",
    component: DashboardSubscription,
    loadingMessage: "Carregando assinatura..."
  },
  {
    path: "/dashboard/secretaries",
    component: DashboardSecretaries,
    loadingMessage: "Carregando secretárias..."
  },
  {
    path: "/dashboard/profile",
    component: Profile,
    loadingMessage: "Carregando perfil..."
  },
  {
    path: "/dashboard/settings",
    component: Settings,
    loadingMessage: "Carregando configurações..."
  },
  {
    path: "*",
    component: NotFound,
    loadingMessage: "Carregando..."
  }
];
