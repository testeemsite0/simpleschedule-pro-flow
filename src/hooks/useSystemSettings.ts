
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemSettings {
  id: string;
  maintenance_mode: boolean;
  system_notifications: boolean;
  debug_mode: boolean;
}

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      console.log('useSystemSettings: Fetching system settings...');
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('useSystemSettings: Error fetching settings:', error);
        throw error;
      }

      if (data) {
        console.log('useSystemSettings: Settings loaded:', data);
        setSettings(data);
      } else {
        console.log('useSystemSettings: No settings found, creating default...');
        // Criar configuração padrão se não existir
        const { data: newSettings, error: createError } = await supabase
          .from('system_settings')
          .insert({
            maintenance_mode: false,
            system_notifications: true,
            debug_mode: false
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        setSettings(newSettings);
      }
    } catch (error) {
      console.error('useSystemSettings: Error in fetchSettings:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar configurações do sistema',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof Omit<SystemSettings, 'id'>, value: boolean) => {
    if (!settings) return false;

    try {
      console.log('useSystemSettings: Updating setting:', key, '=', value);
      
      const { error } = await supabase
        .from('system_settings')
        .update({ [key]: value })
        .eq('id', settings.id);

      if (error) {
        console.error('useSystemSettings: Error updating setting:', error);
        throw error;
      }

      setSettings(prev => prev ? { ...prev, [key]: value } : null);
      console.log('useSystemSettings: Setting updated successfully');
      return true;
    } catch (error) {
      console.error('useSystemSettings: Error in updateSetting:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar configuração',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    updateSetting,
    refetch: fetchSettings
  };
};
