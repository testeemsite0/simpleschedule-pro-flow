
import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary px-4 py-12">
      <div className="mb-8">
        <Logo />
      </div>
      
      <LoginForm />
    </div>
  );
};

export default Login;
