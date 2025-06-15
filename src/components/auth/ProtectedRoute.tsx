
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { EnhancedLoading } from '@/components/ui/enhanced-loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { isAdmin, loading: rolesLoading } = useUserRoles();
  
  if (isLoading || rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EnhancedLoading type="page" message="Verificando autenticação..." />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && !isAdmin) {
    console.log('Admin verification failed for user:', user?.id);
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
