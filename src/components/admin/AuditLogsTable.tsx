
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AuditLog } from '@/types/admin';
import { AuditLogDetailDialog } from './AuditLogDetailDialog';

interface AuditLogsTableProps {
  logs: AuditLog[];
}

export function AuditLogsTable({ logs }: AuditLogsTableProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum log encontrado</p>
      </div>
    );
  }

  return (
    <>
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
          {logs.map((log) => (
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewDetails(log)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AuditLogDetailDialog
        log={selectedLog}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
