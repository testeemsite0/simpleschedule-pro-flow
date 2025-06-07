
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PreferencesForm } from '@/components/preferences/PreferencesForm';
import { CompanyProfileTab } from '@/components/preferences/CompanyProfileTab';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Settings, Building2 } from 'lucide-react';

const DashboardPreferences = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePreferencesSubmit = async (data: any) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('DashboardPreferences: Saving preferences:', data);
      
      const { error } = await supabase
        .from('system_preferences')
        .upsert({
          professional_id: user.id,
          ...data
        });
        
      if (error) {
        console.error('DashboardPreferences: Error saving preferences:', error);
        throw error;
      }
      
      console.log('DashboardPreferences: Preferences saved successfully');
      toast.success('Preferências salvas com sucesso!', {
        description: 'Suas configurações foram atualizadas.',
      });
    } catch (error) {
      console.error('DashboardPreferences: Error:', error);
      toast.error('Erro ao salvar preferências', {
        description: 'Tente novamente em alguns instantes.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Preferências">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-blue-600" />
          <p className="text-muted-foreground">
            Configure suas preferências pessoais e da empresa para personalizar a experiência do sistema.
          </p>
        </div>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Perfil da Empresa
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Preferências do Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <CompanyProfileTab />
          </TabsContent>

          <TabsContent value="system">
            <PreferencesForm
              onSubmit={handlePreferencesSubmit}
              isSubmitting={isSubmitting}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPreferences;
