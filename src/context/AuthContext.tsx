
import React, { createContext, useContext, ReactNode } from "react";
import { AuthContextType } from "@/types/auth";
import { useAuthState } from "@/hooks/useAuthState";
import { useAuthMethods } from "@/hooks/useAuthMethods";
import { usePasswordChangeRequired } from "@/hooks/usePasswordChangeRequired";
import ForcePasswordChange from "@/components/auth/ForcePasswordChange";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuthState();
  const { login, register, logout } = useAuthMethods();
  const { isPasswordChangeRequired, loading: passwordCheckLoading, markPasswordChanged } = usePasswordChangeRequired(user?.id);
  
  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated but we're still checking password requirements, show loading
  if (user && passwordCheckLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user needs to change password, show the password change component
  if (user && isPasswordChangeRequired) {
    return <ForcePasswordChange onPasswordChanged={markPasswordChanged} />;
  }
  
  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
