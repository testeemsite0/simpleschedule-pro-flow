
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Settings, Save, Info, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

export const WhatsAppSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    autoSend: false,
    defaultCountryCode: '+55',
    confirmBeforeSend: true,
    saveToHistory: true,
    maxMessageLength: 4096,
    openInNewTab: true,
    showCharacterCount: true
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('whatsapp_settings');
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) });
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('whatsapp_settings', JSON.stringify(settings));
    toast.success('Configurações salvas com sucesso!');
  };

  const clearHistory = () => {
    if (window.confirm('Deseja realmente limpar todo o histórico de mensagens?')) {
      localStorage.removeItem('whatsapp_history');
      toast.success('Histórico limpo com sucesso!');
    }
  };

  const exportHistory = () => {
    const history = JSON.parse(localStorage.getItem('whatsapp_history') || '[]');
    if (history.length === 0) {
      toast.error('Nenhum histórico para exportar');
      return;
    }

    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `whatsapp_history_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('Histórico exportado com sucesso!');
  };

  const getHistoryCount = () => {
    const history = JSON.parse(localStorage.getItem('whatsapp_history') || '[]');
    return history.length;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Envio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Abrir em nova aba</Label>
              <p className="text-sm text-muted-foreground">
                Abrir WhatsApp Web sempre em nova aba
              </p>
            </div>
            <Switch
              checked={settings.openInNewTab}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, openInNewTab: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Confirmar antes de enviar</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar confirmação antes de abrir WhatsApp Web
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
              <Label>Mostrar contador de caracteres</Label>
              <p className="text-sm text-muted-foreground">
                Exibir contador de caracteres nas mensagens
              </p>
            </div>
            <Switch
              checked={settings.showCharacterCount}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, showCharacterCount: checked })
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
            <p className="text-xs text-muted-foreground">
              Usado quando o número não possui código do país
            </p>
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
              min="100"
              max="4096"
            />
            <p className="text-xs text-muted-foreground">
              WhatsApp permite até 4096 caracteres por mensagem
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Mensagens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Salvar no histórico</Label>
              <p className="text-sm text-muted-foreground">
                Manter registro das mensagens enviadas ({getHistoryCount()} mensagens salvas)
              </p>
            </div>
            <Switch
              checked={settings.saveToHistory}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, saveToHistory: checked })
              }
            />
          </div>

          {getHistoryCount() > 0 && (
            <>
              <Separator />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={exportHistory}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Histórico
                </Button>
                <Button
                  variant="outline"
                  onClick={clearHistory}
                  className="flex-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Histórico
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Como funciona:</strong> Quando você clicar em um botão WhatsApp nos agendamentos, 
          o sistema abrirá o WhatsApp Web automaticamente com a mensagem já preenchida. 
          Você só precisa revisar e clicar em enviar.
        </AlertDescription>
      </Alert>

      <Button onClick={handleSave} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        Salvar Configurações
      </Button>
    </div>
  );
};
