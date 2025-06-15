
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceToggleProps {
  initialState?: boolean;
}

export function MaintenanceToggle({ initialState = false }: MaintenanceToggleProps) {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(initialState);
  const [isUpdating, setIsUpdating] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    fetchMaintenanceMode();
  }, []);

  const fetchMaintenanceMode = async () => {
    try {
      console.log('MaintenanceToggle: Fetching maintenance mode status...');
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('id, maintenance_mode')
        .maybeSingle();

      if (error) {
        console.error('MaintenanceToggle: Error fetching maintenance mode:', error);
        return;
      }

      if (data) {
        console.log('MaintenanceToggle: Current maintenance mode:', data.maintenance_mode);
        setIsEnabled(data.maintenance_mode);
        setSettingsId(data.id);
      }
    } catch (error) {
      console.error('MaintenanceToggle: Error in fetchMaintenanceMode:', error);
    }
  };

  const toggleMaintenance = async (enabled: boolean) => {
    if (!settingsId) {
      console.error('MaintenanceToggle: No settings ID available');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      console.log('MaintenanceToggle: Updating maintenance mode to:', enabled);
      
      const { error } = await supabase
        .from('system_settings')
        .update({ maintenance_mode: enabled })
        .eq('id', settingsId);
        
      if (error) {
        console.error('MaintenanceToggle: Error updating maintenance mode:', error);
        throw error;
      }
      
      setIsEnabled(enabled);
      console.log('MaintenanceToggle: Maintenance mode updated successfully');
      
      toast({
        title: enabled ? "Modo de manutenção ativado" : "Modo de manutenção desativado",
        description: enabled 
          ? "O agendamento online está temporariamente desabilitado."
          : "O agendamento online foi reativado com sucesso.",
      });
    } catch (error) {
      console.error("MaintenanceToggle: Error in toggleMaintenance:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o modo de manutenção: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Modo de Manutenção</CardTitle>
        </div>
        <CardDescription>
          Ative este modo para desabilitar temporariamente o agendamento online.
          Seus clientes verão uma mensagem informando que o sistema está em manutenção.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Switch 
            id="maintenance-mode" 
            checked={isEnabled} 
            onCheckedChange={toggleMaintenance}
            disabled={isUpdating || !settingsId}
          />
          <Label htmlFor="maintenance-mode">
            {isEnabled ? "Manutenção ativada" : "Manutenção desativada"}
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
