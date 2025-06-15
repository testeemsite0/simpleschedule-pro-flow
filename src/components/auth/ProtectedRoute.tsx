
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { EnhancedLoading } from '@/components/ui/enhanced-loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EnhancedLoading type="page" message="Verificando autenticação..." />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // TODO: Adicionar verificação de admin quando necessário
  if (requireAdmin) {
    // Implementar verificação de admin aqui
    console.log('Admin verification needed for user:', user?.id);
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
