
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { InsurancePlan } from '@/types';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const DashboardInsurance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null);
  const [planName, setPlanName] = useState('');
  
  useEffect(() => {
    if (user) {
      fetchInsurancePlans();
    }
  }, [user]);
  
  const fetchInsurancePlans = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('insurance_plans')
        .select('*')
        .eq('professional_id', user.id)
        .order('name');
        
      if (error) throw error;
      
      setInsurancePlans(data || []);
    } catch (error) {
      console.error('Error fetching insurance plans:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os convênios',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenDialog = (plan?: InsurancePlan) => {
    if (plan) {
      setSelectedPlan(plan);
      setPlanName(plan.name);
      setIsEditing(true);
    } else {
      setSelectedPlan(null);
      setPlanName('');
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };
  
  const handleSave = async () => {
    if (!planName.trim() || !user) return;
    
    try {
      if (isEditing && selectedPlan) {
        // Update existing plan
        const { error } = await supabase
          .from('insurance_plans')
          .update({ name: planName.trim() })
          .eq('id', selectedPlan.id);
          
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Convênio atualizado com sucesso',
        });
      } else {
        // Create new plan
        const { error } = await supabase
          .from('insurance_plans')
          .insert([{
            name: planName.trim(),
            professional_id: user.id,
          }]);
          
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Convênio adicionado com sucesso',
        });
      }
      
      // Reset and close dialog
      setPlanName('');
      setSelectedPlan(null);
      setIsEditing(false);
      setIsDialogOpen(false);
      
      // Refresh data
      fetchInsurancePlans();
    } catch (error) {
      console.error('Error saving insurance plan:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o convênio',
        variant: 'destructive',
      });
    }
  };
  
  const handleDelete = async (planId: string) => {
    if (!confirm('Tem certeza que deseja excluir este convênio?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('insurance_plans')
        .delete()
        .eq('id', planId);
        
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Convênio removido com sucesso',
      });
      
      // Refresh data
      fetchInsurancePlans();
    } catch (error) {
      console.error('Error deleting insurance plan:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao remover o convênio',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <DashboardLayout title="Gerenciar Convênios">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Gerencie os convênios médicos ou opções de pagamento para seus clientes.
          </p>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Convênio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? 'Editar Convênio' : 'Adicionar Novo Convênio'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Convênio</Label>
                  <Input
                    id="name"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="Ex: Unimed, Bradesco Saúde, etc."
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>
                    {isEditing ? 'Atualizar' : 'Adicionar'} Convênio
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Seus Convênios</CardTitle>
            <CardDescription>
              Gerencie os convênios aceitos por sua empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8">Carregando convênios...</p>
            ) : insurancePlans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Você ainda não tem convênios cadastrados.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  A opção "Particular" é padrão e não precisa ser cadastrada.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => handleOpenDialog()}
                >
                  Adicionar seu primeiro convênio
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Convênio</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {insurancePlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>
                        {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(plan)}
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(plan.id)}
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardInsurance;
