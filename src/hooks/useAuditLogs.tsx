
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AuditLog } from '@/types/admin';

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      // Primeiro buscar os logs de auditoria
      const { data: logsData, error: logsError } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (logsError) throw logsError;

      // Buscar perfis dos usuários admin (CORRIGIDO: usar profiles ao invés de auth.users)
      const adminUserIds = [...new Set(logsData?.map(log => log.admin_user_id).filter(Boolean) || [])];
      
      let profilesData: any[] = [];
      if (adminUserIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', adminUserIds);

        if (!profilesError) {
          profilesData = profiles || [];
        }
      }

      // Combinar os dados com a tipagem correta
      const logsWithUsers: AuditLog[] = (logsData || []).map(log => ({
        id: log.id,
        admin_user_id: log.admin_user_id,
        action: log.action,
        target_type: log.target_type,
        target_id: log.target_id,
        details: log.details,
        ip_address: log.ip_address ? String(log.ip_address) : null,
        user_agent: log.user_agent,
        created_at: log.created_at,
        admin_user: log.admin_user_id 
          ? profilesData.find(p => p.id === log.admin_user_id) 
          : undefined
      }));

      setLogs(logsWithUsers);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar logs de auditoria',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async (filteredLogs: AuditLog[]) => {
    try {
      const csvContent = [
        ['Data/Hora', 'Usuário', 'Ação', 'Tipo de Alvo', 'ID do Alvo', 'IP', 'Detalhes'].join(','),
        ...filteredLogs.map(log => [
          new Date(log.created_at).toLocaleString('pt-BR'),
          log.admin_user?.name || 'N/A',
          log.action,
          log.target_type || '',
          log.target_id || '',
          log.ip_address || '',
          JSON.stringify(log.details).replace(/,/g, ';')
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Sucesso',
        description: 'Logs exportados com sucesso',
      });
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao exportar logs',
        variant: 'destructive',
      });
    }
  };

  return {
    logs,
    loading,
    exportLogs
  };
}
