
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AuditLog } from '@/types/admin';

interface AuditLogDetailDialogProps {
  log: AuditLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditLogDetailDialog({ log, isOpen, onClose }: AuditLogDetailDialogProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Log de Auditoria</DialogTitle>
        </DialogHeader>
        {log && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Data/Hora:</strong>
                <div>{new Date(log.created_at).toLocaleString('pt-BR')}</div>
              </div>
              <div>
                <strong>Usuário:</strong>
                <div>{log.admin_user?.name}</div>
                <div className="text-sm text-muted-foreground">{log.admin_user?.email}</div>
              </div>
              <div>
                <strong>Ação:</strong>
                <div>{getActionBadge(log.action)}</div>
              </div>
              <div>
                <strong>Tipo de Alvo:</strong>
                <div>{log.target_type || 'N/A'}</div>
              </div>
              <div>
                <strong>ID do Alvo:</strong>
                <div className="font-mono text-sm">{log.target_id || 'N/A'}</div>
              </div>
              <div>
                <strong>Endereço IP:</strong>
                <div className="font-mono">{log.ip_address || 'N/A'}</div>
              </div>
            </div>
            
            {log.user_agent && (
              <div>
                <strong>User Agent:</strong>
                <div className="text-sm bg-gray-50 p-2 rounded mt-1">
                  {log.user_agent}
                </div>
              </div>
            )}

            {log.details && (
              <div>
                <strong>Detalhes:</strong>
                <pre className="mt-1 p-2 bg-gray-50 rounded text-sm max-h-64 overflow-auto">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
