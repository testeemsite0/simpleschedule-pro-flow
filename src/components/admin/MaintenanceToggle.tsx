
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface MaintenanceToggleProps {
  initialState?: boolean;
}

export function MaintenanceToggle({ initialState = false }: MaintenanceToggleProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(initialState);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleMaintenance = async (enabled: boolean) => {
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      // Esta é uma implementação de exemplo - você precisará criar esta tabela no Supabase
      // ou adaptar para usar uma tabela existente
      const { error } = await supabase
        .from('system_preferences')
        .update({ maintenance_mode: enabled })
        .eq('professional_id', user.id);
        
      if (error) throw error;
      
      setIsEnabled(enabled);
      toast({
        title: enabled ? "Modo de manutenção ativado" : "Modo de manutenção desativado",
        description: enabled 
          ? "O agendamento online está temporariamente desabilitado."
          : "O agendamento online foi reativado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao alterar modo de manutenção:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o modo de manutenção.",
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
            disabled={isUpdating}
          />
          <Label htmlFor="maintenance-mode">
            {isEnabled ? "Manutenção ativada" : "Manutenção desativada"}
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
