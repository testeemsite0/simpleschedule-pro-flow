
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  last_appointment: string | null;
  total_appointments: number;
  total_revenue: number;
  notes: string | null;
}

interface ClientListProps {
  clients: Client[];
  loading: boolean;
  onAddNew: () => void;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

export const ClientList: React.FC<ClientListProps> = ({ 
  clients, 
  loading, 
  onAddNew, 
  onEdit, 
  onDelete 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.includes(searchTerm))
  );
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button onClick={onAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>
      
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-md">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-4 w-40 mt-2" />
            </div>
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center p-6 border rounded-md">
          <p className="text-muted-foreground mb-2">Nenhum cliente encontrado</p>
          <Button variant="outline" onClick={onAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Cliente
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Consultas</TableHead>
                <TableHead>Última Consulta</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {client.email && <div className="text-sm">{client.email}</div>}
                      {client.phone && <div className="text-sm text-muted-foreground">{client.phone}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {client.total_appointments} consultas
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {client.last_appointment 
                      ? format(new Date(client.last_appointment), "dd 'de' MMMM, yyyy", { locale: ptBR })
                      : "Nenhuma"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onEdit(client)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive" 
                        onClick={() => onDelete(client.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
