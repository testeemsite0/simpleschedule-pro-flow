
import React from 'react';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import Logo from '@/components/ui/Logo';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary px-4 py-12">
      <div className="mb-8">
        <Logo />
      </div>
      
      <ForgotPasswordForm />
    </div>
  );
};

export default ForgotPassword;
