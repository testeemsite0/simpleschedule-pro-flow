
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePasswordChangeRequired = (userId?: string) => {
  const [isPasswordChangeRequired, setIsPasswordChangeRequired] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkPasswordChangeRequired = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // First check if user has password_changed field in profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('password_changed')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error checking profile:', profileError);
        setIsPasswordChangeRequired(false);
        setLoading(false);
        return;
      }

      // If password_changed is false or null, check if user is a secretary
      if (!profile?.password_changed) {
        // Check if user is a secretary by looking at user_roles directly
        // Using a simple query to avoid RLS policy recursion
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'secretary')
          .maybeSingle();

        if (roleError) {
          console.error('Error checking user role:', roleError);
          // If we can't check the role, assume no password change required
          setIsPasswordChangeRequired(false);
        } else {
          // Only require password change if user is a secretary AND hasn't changed password
          setIsPasswordChangeRequired(!!roleData);
        }
      } else {
        setIsPasswordChangeRequired(false);
      }
    } catch (error) {
      console.error('Error in password change check:', error);
      setIsPasswordChangeRequired(false);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // Always start with loading true and no password change required
    setLoading(true);
    setIsPasswordChangeRequired(false);

    if (!userId) {
      setLoading(false);
      return;
    }

    // Use a small delay to avoid synchronous issues
    const timeoutId = setTimeout(() => {
      checkPasswordChangeRequired();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [checkPasswordChangeRequired, userId]);

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
