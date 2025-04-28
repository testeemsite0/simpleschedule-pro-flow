
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  
  return (
    <header className="bg-white shadow-sm py-4 px-4 sm:px-6">
      <div className="container max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Logo />
        </Link>
        
        <nav className="hidden md:flex space-x-8 text-sm">
          <Link to="/" className="text-gray-700 hover:text-primary transition-colors">
            Início
          </Link>
          <Link to="/features" className="text-gray-700 hover:text-primary transition-colors">
            Funcionalidades
          </Link>
          <Link to="/pricing" className="text-gray-700 hover:text-primary transition-colors">
            Preços
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-primary transition-colors">
            Sobre
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden md:inline">
                Olá, {user?.name.split(' ')[0]}
              </span>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
              >
                Sair
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Cadastrar</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
