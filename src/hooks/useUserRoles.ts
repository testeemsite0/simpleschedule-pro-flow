
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { UserRole, SecretaryAssignment } from '@/types/secretary';

export const useUserRoles = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>('professional');
  const [secretaryAssignments, setSecretaryAssignments] = useState<SecretaryAssignment[]>([]);
  const [managedProfessionals, setManagedProfessionals] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);
  const retryCountRef = useRef(0);
  const cacheRef = useRef<{[key: string]: { role: string, assignments: SecretaryAssignment[], timestamp: number }}>({});
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const MAX_RETRIES = 3;

  const fetchUserRole = useCallback(async () => {
    if (!user || fetchingRef.current) return;

    // Check cache first
    const cached = cacheRef.current[user.id];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setUserRole(cached.role);
      setSecretaryAssignments(cached.assignments);
      setManagedProfessionals(cached.assignments.map(a => a.professional_id));
      setLoading(false);
      setError(null);
      return;
    }

    fetchingRef.current = true;
    setError(null);

    try {
      // Use a more resilient approach to fetch roles
      const [roleResult, assignmentsResult] = await Promise.allSettled([
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('secretary_assignments')
          .select('*')
          .eq('secretary_id', user.id)
          .eq('is_active', true)
      ]);

      let role = 'professional';
      let assignmentsList: SecretaryAssignment[] = [];

      // Handle role result with fallback
      if (roleResult.status === 'fulfilled') {
        const { data: roleData, error: roleError } = roleResult.value;
        
        if (roleError) {
          console.warn('Role fetch error (using fallback):', roleError);
          // Check if it's an RLS recursion error
          if (roleError.message?.includes('infinite recursion') || 
              roleError.message?.includes('policy')) {
            console.warn('RLS policy error detected, using safe fallback');
            // Safe fallback - assume professional role
            role = 'professional';
          } else {
            throw roleError;
          }
        } else {
          role = roleData?.role || 'professional';
        }
      } else {
        console.warn('Role fetch failed, using fallback:', roleResult.reason);
        role = 'professional';
      }

      // Handle assignments result with fallback
      if (assignmentsResult.status === 'fulfilled') {
        const { data: assignments, error: assignmentsError } = assignmentsResult.value;
        
        if (assignmentsError) {
          console.warn('Assignments fetch error (using empty list):', assignmentsError);
          assignmentsList = [];
        } else {
          assignmentsList = assignments || [];
        }
      } else {
        console.warn('Assignments fetch failed, using empty list:', assignmentsResult.reason);
        assignmentsList = [];
      }

      // Update cache
      cacheRef.current[user.id] = {
        role,
        assignments: assignmentsList,
        timestamp: Date.now()
      };

      setUserRole(role);
      setSecretaryAssignments(assignmentsList);
      setManagedProfessionals(assignmentsList.map(a => a.professional_id));
      retryCountRef.current = 0; // Reset retry count on success

      // Try to create default role if none exists and no errors occurred
      if (roleResult.status === 'fulfilled' && !roleResult.value.data && !roleResult.value.error) {
        try {
          await supabase
            .from('user_roles')
            .insert({ user_id: user.id, role: 'professional' });
        } catch (insertError) {
          console.warn('Error creating default role (non-critical):', insertError);
        }
      }
    } catch (error: any) {
      console.error('Critical error in fetchUserRole:', error);
      
      // Check if it's an RLS recursion error
      if (error.message?.includes('infinite recursion') || 
          error.message?.includes('policy')) {
        console.warn('RLS recursion detected, using emergency fallback');
        setUserRole('professional');
        setSecretaryAssignments([]);
        setManagedProfessionals([]);
        setError('Sistema temporariamente em modo limitado devido a problemas de configuração');
      } else if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        setError(`Tentativa ${retryCountRef.current}/${MAX_RETRIES} falhou. Tentando novamente...`);
        
        // Retry with exponential backoff
        setTimeout(() => {
          fetchingRef.current = false;
          fetchUserRole();
        }, Math.pow(2, retryCountRef.current) * 1000);
        return;
      } else {
        setError('Erro ao carregar permissões do usuário. Usando configuração padrão.');
        setUserRole('professional');
        setSecretaryAssignments([]);
        setManagedProfessionals([]);
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserRole();
    } else {
      setUserRole('professional');
      setSecretaryAssignments([]);
      setManagedProfessionals([]);
      setError(null);
      setLoading(false);
    }
  }, [user, fetchUserRole]);

  const isSecretary = userRole === 'secretary';
  const isProfessional = userRole === 'professional';
  const isAdmin = userRole === 'admin';

  const canManageProfessional = useCallback((professionalId: string) => {
    return isProfessional && user?.id === professionalId ||
           isSecretary && managedProfessionals.includes(professionalId) ||
           isAdmin;
  }, [isProfessional, isSecretary, isAdmin, user?.id, managedProfessionals]);

  const refetch = useCallback(() => {
    if (user) {
      // Clear cache and retry count to force fresh fetch
      delete cacheRef.current[user.id];
      retryCountRef.current = 0;
      setError(null);
      fetchUserRole();
    }
  }, [user, fetchUserRole]);

  return {
    userRole,
    isSecretary,
    isProfessional,
    isAdmin,
    secretaryAssignments,
    managedProfessionals,
    canManageProfessional,
    loading,
    error,
    refetch
  };
};
