
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-20 px-4 bg-secondary">
          <div className="container max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Entre em <span className="text-primary">contato</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 md:max-w-2xl mx-auto">
              Tire suas dúvidas ou solicite uma demonstração personalizada da nossa plataforma.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-6">
                    Fale conosco
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Nossa equipe está pronta para ajudar você a implementar a melhor solução de agendamentos para seu negócio.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                      <Mail className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-gray-600">contato@agendamentos.com</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                      <Phone className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Telefone</h3>
                      <p className="text-gray-600">(11) 9999-9999</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                      <Clock className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Horário de atendimento</h3>
                      <p className="text-gray-600">Segunda a sexta, das 9h às 18h</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                      <MapPin className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Localização</h3>
                      <p className="text-gray-600">São Paulo, SP - Brasil</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Envie sua mensagem</CardTitle>
                  <CardDescription>
                    Preencha o formulário abaixo e retornaremos em breve.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nome</Label>
                      <Input id="firstName" placeholder="Seu nome" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Sobrenome</Label>
                      <Input id="lastName" placeholder="Seu sobrenome" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="seu@email.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" type="tel" placeholder="(11) 99999-9999" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Assunto</Label>
                    <Input id="subject" placeholder="Como podemos ajudar?" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Descreva sua necessidade ou dúvida..."
                      rows={4}
                    />
                  </div>
                  
                  <Button className="w-full">
                    Enviar mensagem
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-primary px-4">
          <div className="container max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ou comece agora mesmo
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Crie sua conta gratuita e teste nossa plataforma.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">
                Começar gratuitamente
              </Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
