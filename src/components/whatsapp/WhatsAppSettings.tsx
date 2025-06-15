
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Save, Info } from 'lucide-react';
import { toast } from 'sonner';

export const WhatsAppSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    autoSend: false,
    defaultCountryCode: '+55',
    confirmBeforeSend: true,
    saveToHistory: true,
    maxMessageLength: 4096
  });

  const handleSave = () => {
    localStorage.setItem('whatsapp_settings', JSON.stringify(settings));
    toast.success('Configurações salvas com sucesso!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Envio Automático</Label>
              <p className="text-sm text-muted-foreground">
                Enviar mensagens automaticamente sem confirmação
              </p>
            </div>
            <Switch
              checked={settings.autoSend}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, autoSend: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Confirmar antes de enviar</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar confirmação antes de enviar mensagens
              </p>
            </div>
            <Switch
              checked={settings.confirmBeforeSend}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, confirmBeforeSend: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Salvar no histórico</Label>
              <p className="text-sm text-muted-foreground">
                Manter registro das mensagens enviadas
              </p>
            </div>
            <Switch
              checked={settings.saveToHistory}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, saveToHistory: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="countryCode">Código do país padrão</Label>
            <Input
              id="countryCode"
              value={settings.defaultCountryCode}
              onChange={(e) => 
                setSettings({ ...settings, defaultCountryCode: e.target.value })
              }
              placeholder="+55"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxLength">Tamanho máximo da mensagem</Label>
            <Input
              id="maxLength"
              type="number"
              value={settings.maxMessageLength}
              onChange={(e) => 
                setSettings({ ...settings, maxMessageLength: parseInt(e.target.value) })
              }
              min="1"
              max="4096"
            />
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Como funciona:</strong> Quando você clicar em um agendamento e selecionar 
          "Enviar mensagem WhatsApp", o sistema abrirá o WhatsApp Web automaticamente com 
          a mensagem já preenchida. Você só precisa clicar em enviar.
        </AlertDescription>
      </Alert>

      <Button onClick={handleSave} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        Salvar Configurações
      </Button>
    </div>
  );
};
