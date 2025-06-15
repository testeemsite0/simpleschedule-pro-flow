
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, Download, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface AuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin_user?: {
    name: string;
    email: string;
  };
}

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterTargetType, setFilterTargetType] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select(`
          *,
          admin_user:profiles!admin_audit_logs_admin_user_id_fkey(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;
      setLogs(data || []);
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

  const exportLogs = async () => {
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

  const getActionBadge = (action: string) => {
    const actionColors: Record<string, string> = {
      'create': 'default',
      'update': 'secondary',
      'delete': 'destructive',
      'login': 'default',
      'logout': 'outline'
    };

    return (
      <Badge variant={actionColors[action] as any || 'outline'}>
        {action.toUpperCase()}
      </Badge>
    );
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin_user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin_user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesTargetType = filterTargetType === 'all' || log.target_type === filterTargetType;

    return matchesSearch && matchesAction && matchesTargetType;
  });

  const uniqueActions = [...new Set(logs.map(log => log.action))];
  const uniqueTargetTypes = [...new Set(logs.map(log => log.target_type).filter(Boolean))];

  if (loading) {
    return <div className="text-center py-8">Carregando logs de auditoria...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ação, usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterTargetType} onValueChange={setFilterTargetType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {uniqueTargetTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={exportLogs}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum log encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Alvo</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{log.admin_user?.name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{log.admin_user?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell>
                      {log.target_type && (
                        <div>
                          <div className="font-medium">{log.target_type}</div>
                          {log.target_id && (
                            <div className="text-sm text-muted-foreground font-mono">
                              {log.target_id.substring(0, 8)}...
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.ip_address || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Log de Auditoria</DialogTitle>
                          </DialogHeader>
                          {selectedLog && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <strong>Data/Hora:</strong>
                                  <div>{new Date(selectedLog.created_at).toLocaleString('pt-BR')}</div>
                                </div>
                                <div>
                                  <strong>Usuário:</strong>
                                  <div>{selectedLog.admin_user?.name}</div>
                                  <div className="text-sm text-muted-foreground">{selectedLog.admin_user?.email}</div>
                                </div>
                                <div>
                                  <strong>Ação:</strong>
                                  <div>{getActionBadge(selectedLog.action)}</div>
                                </div>
                                <div>
                                  <strong>Tipo de Alvo:</strong>
                                  <div>{selectedLog.target_type || 'N/A'}</div>
                                </div>
                                <div>
                                  <strong>ID do Alvo:</strong>
                                  <div className="font-mono text-sm">{selectedLog.target_id || 'N/A'}</div>
                                </div>
                                <div>
                                  <strong>Endereço IP:</strong>
                                  <div className="font-mono">{selectedLog.ip_address || 'N/A'}</div>
                                </div>
                              </div>
                              
                              {selectedLog.user_agent && (
                                <div>
                                  <strong>User Agent:</strong>
                                  <div className="text-sm bg-gray-50 p-2 rounded mt-1">
                                    {selectedLog.user_agent}
                                  </div>
                                </div>
                              )}

                              {selectedLog.details && (
                                <div>
                                  <strong>Detalhes:</strong>
                                  <pre className="mt-1 p-2 bg-gray-50 rounded text-sm max-h-64 overflow-auto">
                                    {JSON.stringify(selectedLog.details, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
