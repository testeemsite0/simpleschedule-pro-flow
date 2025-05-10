
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingScreen from '@/components/ui/loading-screen';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect to the unified booking page
        navigate('/dashboard/unified-booking');
      } else {
        navigate('/login');
      }
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return null; // This won't render as we're redirecting
};

export default Dashboard;
