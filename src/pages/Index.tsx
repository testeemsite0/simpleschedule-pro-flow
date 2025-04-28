
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { professionals } from '@/data/mockData';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-20 px-4">
          <div className="container max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Agendamento online <span className="text-primary">simples</span> para profissionais
            </h1>
            <p className="text-xl text-gray-600 mb-8 md:max-w-2xl mx-auto">
              Automatize seus agendamentos, reduza faltas e ofereça uma experiência melhor para seus clientes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/register">
                  Começar gratuitamente
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/features">
                  Como funciona
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-12 bg-secondary px-4">
          <div className="container max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Tudo que você precisa para gerenciar suas consultas
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                    <line x1="16" x2="16" y1="2" y2="6"></line>
                    <line x1="8" x2="8" y1="2" y2="6"></line>
                    <line x1="3" x2="21" y1="10" y2="10"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Link personalizado</h3>
                <p className="text-gray-600">
                  Compartilhe seu link personalizado em redes sociais ou com seus clientes.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Horários flexíveis</h3>
                <p className="text-gray-600">
                  Configure horários disponíveis de acordo com sua agenda.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect width="20" height="14" x="2" y="3" rx="2"></rect>
                    <line x1="8" x2="16" y1="21" y2="21"></line>
                    <line x1="12" x2="12" y1="17" y2="21"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Notificações automáticas</h3>
                <p className="text-gray-600">
                  Envie lembretes por e-mail ou WhatsApp para reduzir faltas.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Professionals Section */}
        <section className="py-12 px-4">
          <div className="container max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Ideal para diversos profissionais
            </h2>
            <p className="text-xl text-center text-gray-600 mb-12 md:max-w-2xl mx-auto">
              Profissionais de diversas áreas já estão usando nossa plataforma
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {professionals.map((prof) => (
                <Card key={prof.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                        {prof.avatar ? (
                          <img 
                            src={prof.avatar} 
                            alt={prof.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                            <span className="text-primary font-medium">{prof.name[0]}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{prof.name}</h3>
                        <p className="text-sm text-gray-600">{prof.profession}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm mb-4">{prof.bio}</p>
                    
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/booking/${prof.slug}`}>
                        Ver agenda
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-12 bg-primary px-4">
          <div className="container max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para simplificar seus agendamentos?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Comece a usar agora mesmo e veja como é fácil.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">
                Criar conta grátis
              </Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
