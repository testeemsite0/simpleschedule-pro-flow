
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download } from 'lucide-react';
import { AuditLog } from '@/types/admin';

interface AuditFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterAction: string;
  setFilterAction: (action: string) => void;
  filterTargetType: string;
  setFilterTargetType: (type: string) => void;
  uniqueActions: string[];
  uniqueTargetTypes: string[];
  onExport: () => void;
}

export function AuditFilters({
  searchTerm,
  setSearchTerm,
  filterAction,
  setFilterAction,
  filterTargetType,
  setFilterTargetType,
  uniqueActions,
  uniqueTargetTypes,
  onExport
}: AuditFiltersProps) {
  return (
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

      <Button variant="outline" onClick={onExport}>
        <Download className="h-4 w-4 mr-2" />
        Exportar
      </Button>
    </div>
  );
}
