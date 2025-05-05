
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { TeamMember, Service } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface TeamMemberServiceFormProps {
  teamMember: TeamMember;
  availableServices: Service[];
  onSave: (selectedServiceIds: string[]) => void;
  onCancel: () => void;
}

const TeamMemberServiceForm: React.FC<TeamMemberServiceFormProps> = ({
  teamMember,
  availableServices,
  onSave,
  onCancel
}) => {
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCurrentServices = async () => {
      try {
        const { data } = await supabase
          .from('team_member_services')
          .select('service_id')
          .eq('team_member_id', teamMember.id);
          
        const serviceIds = new Set((data || []).map(item => item.service_id));
        setSelectedServices(serviceIds);
      } catch (error) {
        console.error('Error fetching team member services:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (teamMember.id) {
      fetchCurrentServices();
    } else {
      setLoading(false);
    }
  }, [teamMember.id]);
  
  const handleToggleService = (serviceId: string) => {
    setSelectedServices(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(serviceId)) {
        newSelection.delete(serviceId);
      } else {
        newSelection.add(serviceId);
      }
      return newSelection;
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(Array.from(selectedServices));
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <h3 className="font-medium text-lg">{teamMember.name}</h3>
        <p className="text-sm text-muted-foreground">
          Selecione os serviços oferecidos por este profissional
        </p>
      </div>
      
      {loading ? (
        <p className="text-center">Carregando serviços...</p>
      ) : availableServices.length === 0 ? (
        <div className="py-3 text-center">
          <p className="text-muted-foreground">
            Não há serviços cadastrados. Adicione serviços primeiro.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {availableServices.map(service => (
            <div key={service.id} className="flex items-start space-x-2 p-2 border rounded-md">
              <Checkbox 
                id={`service-${service.id}`}
                checked={selectedServices.has(service.id)}
                onCheckedChange={() => handleToggleService(service.id)}
              />
              <div>
                <Label 
                  htmlFor={`service-${service.id}`} 
                  className="font-medium cursor-pointer"
                >
                  {service.name}
                </Label>
                <div className="text-sm text-muted-foreground">
                  {service.duration_minutes} minutos • {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(service.price)}
                </div>
                {service.description && (
                  <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          Salvar
        </Button>
      </div>
    </form>
  );
};

export default TeamMemberServiceForm;
