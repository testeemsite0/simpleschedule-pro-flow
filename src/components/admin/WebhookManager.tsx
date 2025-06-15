
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Eye, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface WebhookLog {
  id: string;
  event_type: string;
  stripe_event_id: string;
  payload: any;
  processed: boolean;
  error_message: string | null;
  attempts: number;
  created_at: string;
  processed_at: string | null;
}

const WebhookManager = () => {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchWebhookLogs();
  }, []);

  const fetchWebhookLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching webhook logs:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar logs de webhook',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const retryWebhook = async (logId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-webhook-retry', {
        body: { logId }
      });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Webhook reenviado para processamento',
      });

      fetchWebhookLogs();
    } catch (error) {
      console.error('Error retrying webhook:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao reenviar webhook',
        variant: 'destructive',
      });
    }
  };

  const deleteWebhookLog = async (logId: string) => {
    if (!confirm('Tem certeza que deseja excluir este log?')) return;

    try {
      const { error } = await supabase
        .from('webhook_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Log excluído com sucesso',
      });

      fetchWebhookLogs();
    } catch (error) {
      console.error('Error deleting webhook log:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir log',
        variant: 'destructive',
      });
    }
  };

  const clearOldLogs = async () => {
    if (!confirm('Tem certeza que deseja limpar logs antigos (mais de 30 dias)?')) return;

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { error } = await supabase
        .from('webhook_logs')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Logs antigos removidos com sucesso',
      });

      fetchWebhookLogs();
    } catch (error) {
      console.error('Error clearing old logs:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao limpar logs antigos',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (log: WebhookLog) => {
    if (log.processed) {
      return <Badge variant="default" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Processado
      </Badge>;
    } else if (log.error_message) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        Erro
      </Badge>;
    } else {
      return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando logs de webhook...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Logs de Webhooks do Stripe</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchWebhookLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" onClick={clearOldLogs}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Antigos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum webhook recebido ainda</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Stripe Event ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tentativas</TableHead>
                  <TableHead>Recebido em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.event_type}</TableCell>
                    <TableCell className="font-mono text-sm">{log.stripe_event_id}</TableCell>
                    <TableCell>{getStatusBadge(log)}</TableCell>
                    <TableCell>{log.attempts}</TableCell>
                    <TableCell>
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
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
                              <DialogTitle>Detalhes do Webhook</DialogTitle>
                            </DialogHeader>
                            {selectedLog && (
                              <div className="space-y-4">
                                <div>
                                  <strong>Evento:</strong> {selectedLog.event_type}
                                </div>
                                <div>
                                  <strong>Stripe Event ID:</strong> {selectedLog.stripe_event_id}
                                </div>
                                <div>
                                  <strong>Status:</strong> {getStatusBadge(selectedLog)}
                                </div>
                                {selectedLog.error_message && (
                                  <div>
                                    <strong>Erro:</strong>
                                    <pre className="mt-1 p-2 bg-red-50 rounded text-sm">
                                      {selectedLog.error_message}
                                    </pre>
                                  </div>
                                )}
                                <div>
                                  <strong>Payload:</strong>
                                  <pre className="mt-1 p-2 bg-gray-50 rounded text-sm max-h-64 overflow-auto">
                                    {JSON.stringify(selectedLog.payload, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {!log.processed && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => retryWebhook(log.id)}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteWebhookLog(log.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Webhooks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{logs.length}</div>
              <p className="text-sm text-muted-foreground">Total Recebidos</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {logs.filter(log => log.processed).length}
              </div>
              <p className="text-sm text-muted-foreground">Processados</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {logs.filter(log => log.error_message && !log.processed).length}
              </div>
              <p className="text-sm text-muted-foreground">Com Erro</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {logs.filter(log => !log.processed && !log.error_message).length}
              </div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookManager;
