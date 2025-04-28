
import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
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
