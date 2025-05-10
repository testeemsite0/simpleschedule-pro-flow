
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FullPageLoadingState } from '@/components/ui/loading-states';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Redirect to the unified booking page
        navigate('/dashboard/unified-booking');
      } else {
        navigate('/login');
      }
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return <FullPageLoadingState message="Carregando seu painel..." />;
  }
  
  return null; // This won't render as we're redirecting
};

export default Dashboard;
