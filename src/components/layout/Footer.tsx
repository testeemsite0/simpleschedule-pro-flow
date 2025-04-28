
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t py-8 px-4 sm:px-6">
      <div className="container max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Logo className="mb-4" />
            <p className="text-sm text-gray-600">
              Agendamento online simples e eficiente para profissionais.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-sm mb-3">Produto</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/features" className="text-gray-600 hover:text-primary transition-colors">
                  Funcionalidades
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-primary transition-colors">
                  Preços
                </Link>
              </li>
              <li>
                <Link to="/testimonials" className="text-gray-600 hover:text-primary transition-colors">
                  Depoimentos
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-sm mb-3">Empresa</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-primary transition-colors">
                  Sobre
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-primary transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-600 hover:text-primary transition-colors">
                  Carreiras
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-sm mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-primary transition-colors">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-primary transition-colors">
                  Termos
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} SimpleSchedule. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
