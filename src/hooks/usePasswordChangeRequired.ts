
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
        .maybeSingle();

      if (userRole) {
        // Verifica se já mudou a senha
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('password_changed')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error('Error checking password change requirement:', error);
          setIsPasswordChangeRequired(false);
        } else {
          // Se não tem o campo ou é false, precisa mudar a senha
          setIsPasswordChangeRequired(!profile?.password_changed);
        }
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
      const { error } = await supabase
        .from('profiles')
        .update({ password_changed: true })
        .eq('id', userId);

      if (error) {
        console.error('Error marking password as changed:', error);
      } else {
        setIsPasswordChangeRequired(false);
      }
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
