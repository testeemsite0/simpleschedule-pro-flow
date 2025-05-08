
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Pencil, Trash2 } from 'lucide-react';
import { Service } from '@/types';

interface ServiceListProps {
  services: Service[];
  loading: boolean;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  onToggleActive: (service: Service) => void;
  openAddServiceDialog: () => void;
}

export const ServiceList: React.FC<ServiceListProps> = ({
  services,
  loading,
  onEdit,
  onDelete,
  onToggleActive,
  openAddServiceDialog
}) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  if (loading) {
    return <p className="text-center py-8">Carregando serviços...</p>;
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Você ainda não tem serviços cadastrados.</p>
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={openAddServiceDialog}
        >
          Adicionar seu primeiro serviço
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Preço</TableHead>
          <TableHead>Duração</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((service) => (
          <TableRow key={service.id}>
            <TableCell className="font-medium">{service.name}</TableCell>
            <TableCell>{formatPrice(service.price)}</TableCell>
            <TableCell>{service.duration_minutes} minutos</TableCell>
            <TableCell>
              {service.active ? (
                <span className="inline-flex items-center text-green-600">
                  <CheckCircle className="mr-1" size={16} />
                  Ativo
                </span>
              ) : (
                <span className="inline-flex items-center text-gray-500">
                  <XCircle className="mr-1" size={16} />
                  Inativo
                </span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleActive(service)}
                title={service.active ? 'Desativar' : 'Ativar'}
              >
                {service.active ? <XCircle size={16} /> : <CheckCircle size={16} />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(service)}
                title="Editar"
              >
                <Pencil size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(service.id)}
                title="Excluir"
              >
                <Trash2 size={16} />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
