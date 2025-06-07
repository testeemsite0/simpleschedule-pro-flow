
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { UserRole, SecretaryAssignment } from '@/types/secretary';

export const useUserRoles = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>('professional');
  const [secretaryAssignments, setSecretaryAssignments] = useState<SecretaryAssignment[]>([]);
  const [managedProfessionals, setManagedProfessionals] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserRole();
      fetchSecretaryAssignments();
    }
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
        return;
      }

      if (data) {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
    }
  };

  const fetchSecretaryAssignments = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Se é secretária, busca os profissionais que ela gerencia
      const { data: assignments, error } = await supabase
        .from('secretary_assignments')
        .select('*')
        .eq('secretary_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching secretary assignments:', error);
        return;
      }

      if (assignments) {
        setSecretaryAssignments(assignments);
        setManagedProfessionals(assignments.map(a => a.professional_id));
      }
    } catch (error) {
      console.error('Error in fetchSecretaryAssignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const isSecretary = userRole === 'secretary';
  const isProfessional = userRole === 'professional';
  const isAdmin = userRole === 'admin';

  const canManageProfessional = (professionalId: string) => {
    return isProfessional && user?.id === professionalId ||
           isSecretary && managedProfessionals.includes(professionalId) ||
           isAdmin;
  };

  return {
    userRole,
    isSecretary,
    isProfessional,
    isAdmin,
    secretaryAssignments,
    managedProfessionals,
    canManageProfessional,
    loading,
    refetch: () => {
      fetchUserRole();
      fetchSecretaryAssignments();
    }
  };
};
