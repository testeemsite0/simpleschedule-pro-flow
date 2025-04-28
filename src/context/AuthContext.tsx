
import React, { createContext, useState, useContext, ReactNode } from "react";
import { Professional } from "../types";
import { professionals } from "../data/mockData";

interface AuthContextType {
  user: Professional | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, profession: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Professional | null>(null);
  
  // In a real app, these would communicate with a backend
  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - find user with matching email
    const foundUser = professionals.find(p => p.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    
    return false;
  };
  
  const register = async (
    name: string, 
    email: string, 
    password: string, 
    profession: string
  ): Promise<boolean> => {
    // Mock registration
    // In a real app, this would create a new user in the database
    const newUser: Professional = {
      id: `${professionals.length + 1}`,
      name,
      email,
      profession,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
    };
    
    setUser(newUser);
    return true;
  };
  
  const logout = () => {
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
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
