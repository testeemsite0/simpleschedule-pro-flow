
import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const DashboardBookingLink = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  if (!user) {
    return null;
  }
  
  const bookingLink = `${window.location.origin}/booking/${user.slug}`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(bookingLink);
    toast({
      title: 'Link copiado',
      description: 'Link de agendamento copiado para a área de transferência',
    });
  };
  
  return (
    <DashboardLayout title="Seu link de agendamento">
      <div className="space-y-8 max-w-3xl">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Link personalizado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Compartilhe este link com seus clientes para que eles possam agendar consultas diretamente.
          </p>
          
          <div className="flex items-center space-x-2">
            <Input 
              value={bookingLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button onClick={handleCopy}>
              Copiar
            </Button>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Compartilhar</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Envie seu link de agendamento para clientes ou adicione em suas redes sociais.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="w-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z"></path>
              </svg>
              Twitter
            </Button>
            <Button variant="outline" className="w-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              Instagram
            </Button>
            <Button variant="outline" className="w-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
              Facebook
            </Button>
            <Button variant="outline" className="w-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              Email
            </Button>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Adicionar ao seu site</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Copie e cole este código HTML para adicionar um botão de agendamento em seu site.
          </p>
          
          <div className="bg-secondary p-3 rounded-md font-mono text-sm overflow-x-auto mb-4">
            {`<a href="${bookingLink}" style="background-color: #3b82f6; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; font-family: sans-serif;">Agendar consulta</a>`}
          </div>
          
          <Button variant="secondary" onClick={() => {
            navigator.clipboard.writeText(`<a href="${bookingLink}" style="background-color: #3b82f6; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; font-family: sans-serif;">Agendar consulta</a>`);
            toast({
              title: 'Código copiado',
              description: 'Código HTML copiado para a área de transferência',
            });
          }}>
            Copiar código
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardBookingLink;
