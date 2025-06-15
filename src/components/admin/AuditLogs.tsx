
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { AuditFilters } from './AuditFilters';
import { AuditLogsTable } from './AuditLogsTable';

const AuditLogs = () => {
  const { logs, loading, exportLogs } = useAuditLogs();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterTargetType, setFilterTargetType] = useState('all');

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

  const handleExport = () => {
    exportLogs(filteredLogs);
  };

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
          <AuditFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterAction={filterAction}
            setFilterAction={setFilterAction}
            filterTargetType={filterTargetType}
            setFilterTargetType={setFilterTargetType}
            uniqueActions={uniqueActions}
            uniqueTargetTypes={uniqueTargetTypes}
            onExport={handleExport}
          />

          <AuditLogsTable logs={filteredLogs} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
