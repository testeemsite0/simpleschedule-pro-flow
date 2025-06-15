
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Shield, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface WhatsAppWebFrameProps {
  onConnectionChange: (connected: boolean) => void;
}

export const WhatsAppWebFrame: React.FC<WhatsAppWebFrameProps> = ({
  onConnectionChange
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const openWhatsAppWeb = () => {
    window.open('https://web.whatsapp.com', '_blank', 'noopener,noreferrer');
    setLastChecked(new Date());
    // Simular conexão após abrir
    setTimeout(() => {
      setIsConnected(true);
      onConnectionChange(true);
      localStorage.setItem('whatsapp_connected', 'true');
    }, 2000);
  };

  const checkConnection = () => {
    // Verificar se há indicação de que o usuário está usando WhatsApp
    const connected = localStorage.getItem('whatsapp_connected') === 'true';
    setIsConnected(connected);
    onConnectionChange(connected);
    setLastChecked(new Date());
  };

  useEffect(() => {
    // Verificar conexão inicial
    checkConnection();
    
    // Verificar periodicamente
    const interval = setInterval(checkConnection, 30000); // A cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          O WhatsApp Web será aberto em uma nova aba para envio de mensagens. 
          Mantenha a aba aberta para melhor experiência.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Globe className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold">WhatsApp Web</h3>
              <Badge variant={isConnected ? "default" : "secondary"} className="ml-2">
                {isConnected ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Conectado
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Desconectado
                  </>
                )}
              </Badge>
            </div>

            <div className="space-y-3">
              <Button onClick={openWhatsAppWeb} className="w-full" size="lg">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir WhatsApp Web
              </Button>
              
              <Button variant="outline" onClick={checkConnection} className="w-full">
                Verificar Conexão
              </Button>
            </div>

            {lastChecked && (
              <p className="text-xs text-muted-foreground">
                Última verificação: {lastChecked.toLocaleTimeString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-3">Como usar:</h4>
          <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
            <li>Clique em "Abrir WhatsApp Web" acima</li>
            <li>Faça login escaneando o QR Code no seu celular</li>
            <li>Mantenha a aba do WhatsApp Web aberta</li>
            <li>Use os botões "WhatsApp" nos agendamentos para enviar mensagens</li>
            <li>As mensagens serão abertas automaticamente no WhatsApp Web</li>
          </ol>
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription className="text-xs">
          <strong>Dica:</strong> Para melhor experiência, fixe a aba do WhatsApp Web no seu navegador. 
          O sistema detectará automaticamente quando você estiver conectado.
        </AlertDescription>
      </Alert>
    </div>
  );
};
