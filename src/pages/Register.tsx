
import React from 'react';
import { Navigate } from 'react-router-dom';
import RegisterForm from '@/components/auth/RegisterForm';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';

const Register = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary px-4 py-12">
      <div className="mb-8">
        <Logo />
      </div>
      
      <RegisterForm />
    </div>
  );
};

export default Register;
