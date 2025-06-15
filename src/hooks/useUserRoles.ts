
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
  const fetchingRef = useRef(false);
  const cacheRef = useRef<{[key: string]: { role: string, assignments: SecretaryAssignment[], timestamp: number }}>({});
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetchUserRole = useCallback(async (forceRefresh = false) => {
    if (!user || fetchingRef.current) return;

    console.log('useUserRoles: Fetching role for user', user.id, { forceRefresh });

    // Check cache first (unless forced refresh)
    const cached = cacheRef.current[user.id];
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('useUserRoles: Using cached role', cached.role);
      setUserRole(cached.role);
      setSecretaryAssignments(cached.assignments);
      setManagedProfessionals(cached.assignments.map(a => a.professional_id));
      setLoading(false);
      return;
    }

    fetchingRef.current = true;

    try {
      console.log('useUserRoles: Fetching fresh data from database');
      
      // Fetch role and secretary assignments in parallel
      const [roleResult, assignmentsResult] = await Promise.all([
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

      const { data: roleData, error: roleError } = roleResult;
      const { data: assignments, error: assignmentsError } = assignmentsResult;

      console.log('useUserRoles: Database response', {
        roleData,
        roleError: roleError?.message,
        assignments: assignments?.length || 0,
        assignmentsError: assignmentsError?.message
      });

      if (roleError && !roleError.message.includes('PGRST116')) {
        console.error('Error fetching user role:', roleError);
      }

      if (assignmentsError) {
        console.error('Error fetching secretary assignments:', assignmentsError);
      }

      const role = roleData?.role || 'professional';
      const assignmentsList = assignments || [];

      console.log('useUserRoles: Setting role to', role);

      // Update cache
      cacheRef.current[user.id] = {
        role,
        assignments: assignmentsList,
        timestamp: Date.now()
      };

      setUserRole(role);
      setSecretaryAssignments(assignmentsList);
      setManagedProfessionals(assignmentsList.map(a => a.professional_id));

      // Create default role if none exists
      if (!roleData && !roleError) {
        console.log('useUserRoles: Creating default role for user');
        try {
          await supabase
            .from('user_roles')
            .insert({ user_id: user.id, role: 'professional' });
        } catch (insertError) {
          console.error('Error creating default role:', insertError);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setUserRole('professional');
      setSecretaryAssignments([]);
      setManagedProfessionals([]);
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
      setLoading(false);
    }
  }, [user, fetchUserRole]);

  const isSecretary = userRole === 'secretary';
  const isProfessional = userRole === 'professional';
  const isAdmin = userRole === 'admin';

  console.log('useUserRoles: Current state', {
    userRole,
    isAdmin,
    isSecretary,
    isProfessional,
    loading
  });

  const canManageProfessional = useCallback((professionalId: string) => {
    return isProfessional && user?.id === professionalId ||
           isSecretary && managedProfessionals.includes(professionalId) ||
           isAdmin;
  }, [isProfessional, isSecretary, isAdmin, user?.id, managedProfessionals]);

  const refetch = useCallback(() => {
    if (user) {
      console.log('useUserRoles: Manual refetch requested');
      // Clear cache to force fresh fetch
      delete cacheRef.current[user.id];
      fetchUserRole(true);
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
    refetch
  };
};
