
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PreferencesForm } from '@/components/preferences/PreferencesForm';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';

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
    <DashboardLayout title="Preferências do Sistema">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-blue-600" />
          <p className="text-muted-foreground">
            Configure suas preferências pessoais de trabalho, horários, notificações e outras configurações do sistema.
          </p>
        </div>

        <PreferencesForm
          onSubmit={handlePreferencesSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </DashboardLayout>
  );
};

export default DashboardPreferences;
