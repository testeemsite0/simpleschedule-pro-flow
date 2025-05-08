
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface TeamInsurancePlanManagerProps {
  open: boolean;
  onClose: () => void;
  planId: string | null;
  planName: string | null;
  professionalId: string;
}

interface TeamMember {
  id: string;
  name: string;
}

interface MemberAssignment {
  memberId: string;
  name: string;
  assigned: boolean;
  limitPerMember: number | null;
  currentAppointments: number;
}

export const TeamInsurancePlanManager: React.FC<TeamInsurancePlanManagerProps> = ({
  open,
  onClose,
  planId,
  planName,
  professionalId,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<MemberAssignment[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open && planId) {
      fetchData();
    }
  }, [open, planId]);

  const fetchData = async () => {
    if (!planId) return;
    
    try {
      setLoading(true);
      
      // Fetch all team members
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('id, name')
        .eq('professional_id', professionalId)
        .eq('active', true);
        
      if (teamError) throw teamError;

      // Fetch existing assignments
      const { data: assignments, error: assignmentError } = await supabase
        .from('team_member_insurance_plans')
        .select('*')
        .eq('insurance_plan_id', planId);
        
      if (assignmentError) throw assignmentError;

      // Create member assignments
      const memberAssignments = teamMembers.map((member: TeamMember) => {
        const assignment = assignments?.find(a => a.team_member_id === member.id);
        
        return {
          memberId: member.id,
          name: member.name,
          assigned: !!assignment,
          limitPerMember: assignment?.limit_per_member || null,
          currentAppointments: assignment?.current_appointments || 0
        };
      });

      setMembers(memberAssignments);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAssignment = (memberId: string) => {
    setMembers(prevMembers => 
      prevMembers.map(member => 
        member.memberId === memberId 
          ? { ...member, assigned: !member.assigned } 
          : member
      )
    );
  };

  const handleLimitChange = (memberId: string, value: string) => {
    const numericValue = value === '' ? null : parseInt(value, 10);
    
    setMembers(prevMembers => 
      prevMembers.map(member => 
        member.memberId === memberId 
          ? { ...member, limitPerMember: numericValue } 
          : member
      )
    );
  };

  const handleSave = async () => {
    if (!planId) return;
    
    try {
      setSaving(true);
      
      // Get current assignments from database
      const { data: currentAssignments, error: fetchError } = await supabase
        .from('team_member_insurance_plans')
        .select('team_member_id')
        .eq('insurance_plan_id', planId);
        
      if (fetchError) throw fetchError;
      
      const currentlyAssigned = new Set(currentAssignments?.map(a => a.team_member_id));
      
      // Process assignments
      for (const member of members) {
        if (member.assigned) {
          if (currentlyAssigned.has(member.memberId)) {
            // Update existing assignment
            const { error: updateError } = await supabase
              .from('team_member_insurance_plans')
              .update({ limit_per_member: member.limitPerMember })
              .eq('team_member_id', member.memberId)
              .eq('insurance_plan_id', planId);
              
            if (updateError) throw updateError;
          } else {
            // Create new assignment
            const { error: insertError } = await supabase
              .from('team_member_insurance_plans')
              .insert({
                team_member_id: member.memberId,
                insurance_plan_id: planId,
                limit_per_member: member.limitPerMember,
                current_appointments: 0
              });
              
            if (insertError) throw insertError;
          }
          
          currentlyAssigned.delete(member.memberId);
        }
      }
      
      // Remove assignments that were unselected
      for (const memberIdToRemove of currentlyAssigned) {
        const { error: deleteError } = await supabase
          .from('team_member_insurance_plans')
          .delete()
          .eq('team_member_id', memberIdToRemove)
          .eq('insurance_plan_id', planId);
          
        if (deleteError) throw deleteError;
      }
      
      toast({
        title: 'Sucesso',
        description: 'Configuração de convênios da equipe atualizada',
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving assignments:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar as configurações',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Acesso à Convênio</DialogTitle>
          <DialogDescription>
            Configure quais membros da equipe podem atender {planName}
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {members.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    Não há membros na equipe cadastrados.
                  </p>
                ) : (
                  members.map(member => (
                    <Card key={member.memberId}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2 pt-1">
                            <Checkbox 
                              id={`member-${member.memberId}`}
                              checked={member.assigned}
                              onCheckedChange={() => handleToggleAssignment(member.memberId)}
                            />
                            <div>
                              <Label 
                                htmlFor={`member-${member.memberId}`}
                                className="text-base font-medium cursor-pointer"
                              >
                                {member.name}
                              </Label>
                              
                              {member.assigned && member.currentAppointments > 0 && (
                                <div className="mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {member.currentAppointments} agendamento(s)
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {member.assigned && (
                            <div className="w-32">
                              <Label 
                                htmlFor={`limit-${member.memberId}`}
                                className="text-xs block mb-1"
                              >
                                Limite individual
                              </Label>
                              <Input
                                id={`limit-${member.memberId}`}
                                type="number"
                                min="1"
                                placeholder="Ilimitado"
                                value={member.limitPerMember === null ? '' : member.limitPerMember}
                                onChange={(e) => handleLimitChange(member.memberId, e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
