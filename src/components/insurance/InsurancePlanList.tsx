
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { InsurancePlan } from '@/types';

interface InsurancePlanListProps {
  plans: InsurancePlan[];
  onEdit: (plan: InsurancePlan) => void;
  onDelete: (planId: string) => void;
  loading: boolean;
  onAddNew: () => void;
}

export const InsurancePlanList: React.FC<InsurancePlanListProps> = ({ 
  plans, 
  onEdit, 
  onDelete, 
  loading,
  onAddNew
}) => {
  if (loading) {
    return <p className="text-center py-8">Carregando convênios...</p>;
  }
  
  if (plans.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Você ainda não tem convênios cadastrados.</p>
        <p className="text-sm text-muted-foreground mt-1">
          A opção "Particular" é padrão e não precisa ser cadastrada.
        </p>
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={onAddNew}
        >
          Adicionar seu primeiro convênio
        </Button>
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome do Convênio</TableHead>
          <TableHead>Limite de Agendamentos</TableHead>
          <TableHead>Agendamentos Atuais</TableHead>
          <TableHead>Data de Criação</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {plans.map((plan) => (
          <TableRow key={plan.id}>
            <TableCell className="font-medium">{plan.name}</TableCell>
            <TableCell>{plan.limit_per_plan ? plan.limit_per_plan : "Ilimitado"}</TableCell>
            <TableCell>{plan.current_appointments || 0}</TableCell>
            <TableCell>
              {new Date(plan.created_at).toLocaleDateString('pt-BR')}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(plan)}
                title="Editar"
              >
                <Pencil size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(plan.id)}
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
