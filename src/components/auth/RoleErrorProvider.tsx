
import React from 'react';
import { useUserRoles } from '@/hooks/useUserRoles';
import { RoleErrorHandler } from '@/components/ui/role-error-handler';
import { useAuth } from '@/context/AuthContext';

interface RoleErrorProviderProps {
  children: React.ReactNode;
}

export const RoleErrorProvider: React.FC<RoleErrorProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { error: roleError, refetch: retryRoles, loading: roleLoading } = useUserRoles();
  
  return (
    <>
      {/* Show role error handler if there are role-related issues */}
      {user && roleError && (
        <RoleErrorHandler 
          error={roleError} 
          onRetry={retryRoles}
          loading={roleLoading}
        />
      )}
      {children}
    </>
  );
};
