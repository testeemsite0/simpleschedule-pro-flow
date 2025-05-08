
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { InsurancePlan } from '@/types';
import { Plus, Users } from 'lucide-react';
import { InsurancePlanForm } from '@/components/insurance/InsurancePlanForm';
import { InsurancePlanList } from '@/components/insurance/InsurancePlanList';
import { TeamInsurancePlanManager } from '@/components/insurance/TeamInsurancePlanManager';

const DashboardInsurance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [selectedPlanForTeam, setSelectedPlanForTeam] = useState<{id: string, name: string} | null>(null);
  
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
      
      console.log('Fetched insurance plans:', data);
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
    setSelectedPlan(plan || null);
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (planId: string) => {
    if (!confirm('Tem certeza que deseja excluir este convênio?')) {
      return;
    }
    
    try {
      // First check if there are any appointments using this insurance plan
      const { data: appointmentsCount, error: countError } = await supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('insurance_plan_id', planId);
        
      if (countError) throw countError;
      
      if ((appointmentsCount as any)?.count > 0) {
        toast({
          title: 'Não foi possível excluir',
          description: 'Este convênio possui agendamentos associados e não pode ser removido.',
          variant: 'destructive',
        });
        return;
      }
      
      // Remove any team member associations first
      const { error: teamAssocError } = await supabase
        .from('team_member_insurance_plans')
        .delete()
        .eq('insurance_plan_id', planId);
        
      if (teamAssocError) throw teamAssocError;
      
      // Now delete the insurance plan
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
  
  const handleManageTeamAccess = (planId: string, planName: string) => {
    setSelectedPlanForTeam({ id: planId, name: planName });
    setTeamDialogOpen(true);
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
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Seus Convênios</CardTitle>
            <CardDescription>
              Gerencie os convênios aceitos por sua empresa e quais membros da equipe podem atendê-los
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InsurancePlanList 
              plans={insurancePlans}
              loading={loading}
              onEdit={handleOpenDialog}
              onDelete={handleDelete}
              onAddNew={() => handleOpenDialog()}
              onManageTeamAccess={handleManageTeamAccess}
            />
          </CardContent>
        </Card>
      </div>
      
      <InsurancePlanForm 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        selectedPlan={selectedPlan}
        onSuccess={fetchInsurancePlans}
        userId={user?.id || ''}
      />
      
      <TeamInsurancePlanManager
        open={teamDialogOpen}
        onClose={() => setTeamDialogOpen(false)}
        planId={selectedPlanForTeam?.id || null}
        planName={selectedPlanForTeam?.name || null}
        professionalId={user?.id || ''}
      />
    </DashboardLayout>
  );
};

export default DashboardInsurance;
