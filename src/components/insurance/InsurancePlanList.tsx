
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, PlusCircle, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface InsurancePlanListProps {
  plans: any[];
  loading: boolean;
  onEdit: (plan: any) => void;
  onDelete: (planId: string) => void;
  onAddNew: () => void;
  onManageTeamAccess?: (planId: string, planName: string) => void;
}

export const InsurancePlanList: React.FC<InsurancePlanListProps> = ({
  plans,
  loading,
  onEdit,
  onDelete,
  onAddNew,
  onManageTeamAccess
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-muted-foreground">Carregando convênios...</p>
      </div>
    );
  }
  
  if (plans.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          Você ainda não tem nenhum convênio cadastrado.
        </p>
        <Button onClick={onAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Convênio
        </Button>
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Limite</TableHead>
          <TableHead>Agendamentos</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {plans.map((plan) => (
          <TableRow key={plan.id}>
            <TableCell className="font-medium">{plan.name}</TableCell>
            <TableCell>
              {plan.limit_per_plan ? (
                <Badge variant="secondary">
                  {plan.limit_per_plan}
                </Badge>
              ) : (
                <span className="text-muted-foreground text-sm">Ilimitado</span>
              )}
            </TableCell>
            <TableCell>
              {plan.current_appointments || '0'}
              {plan.limit_per_plan && (
                <span className="text-muted-foreground text-sm ml-1">
                  /{plan.limit_per_plan}
                </span>
              )}
            </TableCell>
            <TableCell className="text-right space-x-2">
              {onManageTeamAccess && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onManageTeamAccess(plan.id, plan.name)}
                >
                  <Users className="h-4 w-4 mr-1" />
                  Equipe
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onEdit(plan)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onDelete(plan.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
