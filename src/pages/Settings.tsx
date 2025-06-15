
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import SubscriptionManagement from '@/components/dashboard/SubscriptionManagement';
import { useAuth } from '@/context/AuthContext';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, User, Bell, Globe, Shield } from 'lucide-react';

interface UserPreferences {
  theme: string;
  language: string;
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  reminderHours: number;
  autoConfirm: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordLastChanged: string;
}

const Settings = () => {
  const { user } = useAuth();
  const { settings, updateSettings } = useCompanySettings();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    emailNotifications: true,
    smsNotifications: false,
    reminderHours: 24,
    autoConfirm: false,
  });
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 60,
    passwordLastChanged: '',
  });

  useEffect(() => {
    fetchUserPreferences();
    fetchSecuritySettings();
  }, [user]);

  const fetchUserPreferences = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('system_preferences')
        .select('*')
        .eq('professional_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
        return;
      }

      if (data) {
        setPreferences(prev => ({
          ...prev,
          timezone: settings?.timezone || 'America/Sao_Paulo',
          emailNotifications: data.notifications_enabled || true,
          reminderHours: data.reminder_hours_before || 24,
        }));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchSecuritySettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('password_changed')
        .eq('id', user.id)
        .single();

      if (data) {
        setSecuritySettings(prev => ({
          ...prev,
          passwordLastChanged: data.password_changed ? 'Alterada' : 'Nunca alterada',
        }));
      }
    } catch (error) {
      console.error('Error fetching security settings:', error);
    }
  };

  const saveGeneralSettings = async () => {
    setLoading(true);
    try {
      // Update system preferences
      const { error: prefsError } = await supabase
        .from('system_preferences')
        .upsert({
          professional_id: user?.id,
          notifications_enabled: preferences.emailNotifications,
          reminder_hours_before: preferences.reminderHours,
          updated_at: new Date().toISOString(),
        });

      if (prefsError) throw prefsError;

      // Update company settings timezone
      if (settings) {
        await updateSettings({
          timezone: preferences.timezone,
        });
      }

      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('system_preferences')
        .upsert({
          professional_id: user?.id,
          notifications_enabled: preferences.emailNotifications,
          reminder_hours_before: preferences.reminderHours,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Configurações de notificação salvas!');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Erro ao salvar configurações de notificação');
    } finally {
      setLoading(false);
    }
  };

  const saveSecuritySettings = async () => {
    setLoading(true);
    try {
      // Aqui você implementaria a lógica de segurança
      toast.success('Configurações de segurança salvas!');
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast.error('Erro ao salvar configurações de segurança');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Configurações">
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Assinatura
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Gerencie suas preferências gerais de conta e sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema da Interface</Label>
                  <Select value={preferences.theme} onValueChange={(value) => setPreferences(prev => ({ ...prev, theme: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select value={preferences.language} onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Select value={preferences.timezone} onValueChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                      <SelectItem value="America/New_York">Nova York (UTC-5)</SelectItem>
                      <SelectItem value="Europe/London">Londres (UTC+0)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tóquio (UTC+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Tempo de Sessão (minutos)</Label>
                  <Input
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                    min="15"
                    max="480"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Confirmação Automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Confirmar automaticamente novos agendamentos
                    </p>
                  </div>
                  <Switch
                    checked={preferences.autoConfirm}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, autoConfirm: checked }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveGeneralSettings} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>
                Controle como e quando você é notificado sobre agendamentos e atividades.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações sobre agendamentos por email
                    </p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações sobre agendamentos por SMS
                    </p>
                  </div>
                  <Switch
                    checked={preferences.smsNotifications}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, smsNotifications: checked }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="reminderHours">Lembrete (horas antes)</Label>
                <Select 
                  value={preferences.reminderHours.toString()} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, reminderHours: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hora antes</SelectItem>
                    <SelectItem value="2">2 horas antes</SelectItem>
                    <SelectItem value="6">6 horas antes</SelectItem>
                    <SelectItem value="12">12 horas antes</SelectItem>
                    <SelectItem value="24">24 horas antes</SelectItem>
                    <SelectItem value="48">48 horas antes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveNotificationSettings} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar Notificações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
              <CardDescription>
                Gerencie a segurança da sua conta e dados pessoais.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticação de Dois Fatores</Label>
                    <p className="text-sm text-muted-foreground">
                      Adicionar uma camada extra de segurança à sua conta
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorEnabled}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: checked }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label>Status da Senha</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Última alteração: {securitySettings.passwordLastChanged}
                  </p>
                  <Button variant="outline" className="mt-2">
                    Alterar Senha
                  </Button>
                </div>

                <div>
                  <Label>Sessões Ativas</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Visualize e gerencie dispositivos conectados à sua conta
                  </p>
                  <Button variant="outline" className="mt-2">
                    Gerenciar Sessões
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveSecuritySettings} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar Segurança
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscription">
          <SubscriptionManagement />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Settings;
