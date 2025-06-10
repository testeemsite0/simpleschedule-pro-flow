
import { useState, useEffect, useCallback, startTransition, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePasswordChangeRequired = (userId?: string) => {
  const [isPasswordChangeRequired, setIsPasswordChangeRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const checkingRef = useRef(false);
  const cacheRef = useRef<{[key: string]: { required: boolean, timestamp: number }}>({});
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const checkPasswordChangeRequired = useCallback(async () => {
    if (!userId || checkingRef.current) {
      startTransition(() => {
        setLoading(false);
      });
      return;
    }

    // Check cache first
    const cached = cacheRef.current[userId];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      startTransition(() => {
        setIsPasswordChangeRequired(cached.required);
        setLoading(false);
      });
      return;
    }

    checkingRef.current = true;

    try {
      // Single optimized query to check both profile and role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('password_changed')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error checking profile:', profileError);
        startTransition(() => {
          setIsPasswordChangeRequired(false);
          setLoading(false);
        });
        return;
      }

      // If password already changed, no need to check role
      if (profile?.password_changed) {
        const result = false;
        cacheRef.current[userId] = { required: result, timestamp: Date.now() };
        startTransition(() => {
          setIsPasswordChangeRequired(result);
          setLoading(false);
        });
        return;
      }

      // Only check role if password hasn't been changed
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'secretary')
        .maybeSingle();

      if (roleError) {
        console.error('Error checking user role:', roleError);
        const result = false;
        cacheRef.current[userId] = { required: result, timestamp: Date.now() };
        startTransition(() => {
          setIsPasswordChangeRequired(result);
          setLoading(false);
        });
        return;
      }

      // Only require password change if user is a secretary AND hasn't changed password
      const result = !!roleData;
      cacheRef.current[userId] = { required: result, timestamp: Date.now() };
      
      startTransition(() => {
        setIsPasswordChangeRequired(result);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error in password change check:', error);
      const result = false;
      cacheRef.current[userId] = { required: result, timestamp: Date.now() };
      startTransition(() => {
        setIsPasswordChangeRequired(result);
        setLoading(false);
      });
    } finally {
      checkingRef.current = false;
    }
  }, [userId]);

  useEffect(() => {
    let mounted = true;
    
    if (!userId) {
      startTransition(() => {
        setLoading(false);
        setIsPasswordChangeRequired(false);
      });
      return;
    }

    // Use a small delay to batch with other operations
    const timeoutId = setTimeout(() => {
      if (mounted) {
        startTransition(() => {
          checkPasswordChangeRequired();
        });
      }
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
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
        // Update cache
        cacheRef.current[userId] = { required: false, timestamp: Date.now() };
        startTransition(() => {
          setIsPasswordChangeRequired(false);
        });
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
