
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export function MaintenanceNotice() {
  return (
    <Card className="border-yellow-300 bg-yellow-50">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <CardTitle className="text-lg text-yellow-800">Sistema em Manutenção</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-yellow-800">
          Nosso sistema de agendamento está temporariamente indisponível para manutenção.
          Por favor, tente novamente mais tarde ou entre em contato diretamente por telefone para agendar sua consulta.
        </CardDescription>
      </CardContent>
    </Card>
  );
}
