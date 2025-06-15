
import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, Shield } from 'lucide-react';

interface WhatsAppWebFrameProps {
  onConnectionChange: (connected: boolean) => void;
}

export const WhatsAppWebFrame: React.FC<WhatsAppWebFrameProps> = ({
  onConnectionChange
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Simular detecção de conexão
    const checkConnection = () => {
      try {
        // Em uma implementação real, você verificaria o estado do WhatsApp Web
        const connected = Math.random() > 0.5; // Simulação
        onConnectionChange(connected);
        localStorage.setItem('whatsapp_connected', connected.toString());
      } catch (error) {
        console.error('Erro ao verificar conexão WhatsApp:', error);
      }
    };

    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, [onConnectionChange]);

  return (
    <div className="space-y-4">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Faça login no WhatsApp Web normalmente. Suas conversas e dados permanecem seguros e privados.
        </AlertDescription>
      </Alert>

      <div className="border rounded-lg overflow-hidden bg-background">
        <div className="flex items-center gap-2 p-3 border-b bg-muted/50">
          <Globe className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">WhatsApp Web</span>
        </div>
        
        <div className="relative" style={{ height: '600px' }}>
          <iframe
            ref={iframeRef}
            src="https://web.whatsapp.com"
            className="w-full h-full border-0"
            title="WhatsApp Web"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>
      </div>

      <Alert>
        <AlertDescription className="text-xs">
          <strong>Dica:</strong> Mantenha esta aba aberta para receber e enviar mensagens. 
          O sistema detectará automaticamente quando você estiver conectado.
        </AlertDescription>
      </Alert>
    </div>
  );
};
