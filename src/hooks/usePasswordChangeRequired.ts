
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePasswordChangeRequired = (userId?: string) => {
  const [isPasswordChangeRequired, setIsPasswordChangeRequired] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPasswordChangeRequired();
  }, [userId]);

  const checkPasswordChangeRequired = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Verifica se é secretária
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'secretary')
        .single();

      if (userRole) {
        // Verifica se já mudou a senha (usando um campo na tabela profiles ou um flag)
        const { data: profile } = await supabase
          .from('profiles')
          .select('password_changed')
          .eq('id', userId)
          .single();

        // Se não tem o campo ou é false, precisa mudar a senha
        setIsPasswordChangeRequired(!profile?.password_changed);
      }
    } catch (error) {
      console.error('Error checking password change requirement:', error);
    } finally {
      setLoading(false);
    }
  };

  const markPasswordChanged = async () => {
    if (!userId) return;

    try {
      await supabase
        .from('profiles')
        .update({ password_changed: true })
        .eq('id', userId);

      setIsPasswordChangeRequired(false);
    } catch (error) {
      console.error('Error marking password as changed:', error);
    }
  };

  return {
    isPasswordChangeRequired,
    loading,
    markPasswordChanged
  };
};
