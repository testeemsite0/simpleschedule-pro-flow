
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const DashboardBookingLink = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const bookingLink = user?.slug 
    ? `${window.location.origin}/booking/${user.slug}`
    : '';
  
  const handleCopyLink = () => {
    if (bookingLink) {
      navigator.clipboard.writeText(bookingLink);
      setCopied(true);
      toast({
        title: 'Link copiado',
        description: 'Link de agendamento copiado para a área de transferência.',
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <DashboardLayout title="Link de Agendamento">
      <div className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Link Personalizado</AlertTitle>
          <AlertDescription>
            Compartilhe este link com seus clientes para que eles possam agendar diretamente pelo sistema.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Seu Link de Agendamento</CardTitle>
            <CardDescription>
              Compartilhe este link nas suas redes sociais ou diretamente com seus clientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input 
                value={bookingLink}
                readOnly
                className="font-mono"
              />
              <Button 
                onClick={handleCopyLink}
                variant="outline"
                size="icon"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardBookingLink;
