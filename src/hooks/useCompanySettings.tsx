
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface CompanySettings {
  id: string;
  professional_id: string;
  company_name?: string;
  display_name: string;
  company_type: string;
  timezone: string;
  address?: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export const useCompanySettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('useCompanySettings: Fetching company settings for user:', user.id);
      
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('professional_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('useCompanySettings: Error fetching settings:', error);
        throw error;
      }

      console.log('useCompanySettings: Settings loaded:', data);
      setSettings(data);
    } catch (err) {
      console.error('useCompanySettings: Error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<Omit<CompanySettings, 'id' | 'professional_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return false;

    try {
      console.log('useCompanySettings: Updating settings:', updates);
      
      if (settings) {
        // Update existing settings
        const { data, error } = await supabase
          .from('company_settings')
          .update(updates)
          .eq('professional_id', user.id)
          .select()
          .single();

        if (error) throw error;
        setSettings(data);
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from('company_settings')
          .insert({
            professional_id: user.id,
            display_name: user.name || 'Empresa',
            ...updates
          })
          .select()
          .single();

        if (error) throw error;
        setSettings(data);
      }

      console.log('useCompanySettings: Settings updated successfully');
      return true;
    } catch (err) {
      console.error('useCompanySettings: Update error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar configurações');
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings
  };
};
