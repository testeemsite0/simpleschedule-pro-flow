
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Globe, Settings, Plus } from 'lucide-react';
import { WhatsAppWebFrame } from '@/components/whatsapp/WhatsAppWebFrame';
import { MessageTemplates } from '@/components/whatsapp/MessageTemplates';
import { WhatsAppSettings } from '@/components/whatsapp/WhatsAppSettings';

const DashboardWhatsApp = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('whatsapp');

  useEffect(() => {
    // Verificar se há conexão ativa (simulado)
    const checkConnection = () => {
      const connected = localStorage.getItem('whatsapp_connected') === 'true';
      setIsConnected(connected);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout title="WhatsApp Web">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Gerencie suas mensagens do WhatsApp diretamente na plataforma
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Conectado" : "Desconectado"}
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              WhatsApp Web
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="whatsapp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  WhatsApp Web
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WhatsAppWebFrame onConnectionChange={setIsConnected} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <MessageTemplates />
          </TabsContent>

          <TabsContent value="settings">
            <WhatsAppSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DashboardWhatsApp;
