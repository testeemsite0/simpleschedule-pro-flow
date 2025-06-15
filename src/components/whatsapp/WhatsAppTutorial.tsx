
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Monitor, MessageSquare, Users, CheckCircle, Info } from 'lucide-react';

export const WhatsAppTutorial: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Como Funciona a Integração WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Esta integração abre o WhatsApp Web em nova aba com mensagens pré-preenchidas. 
              Você mantém total controle sobre o que é enviado.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Monitor className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">1. Configuração Inicial</h4>
                <p className="text-sm text-muted-foreground">
                  Abra o WhatsApp Web e faça login escaneando o QR Code com seu celular. 
                  Mantenha a aba aberta para melhor experiência.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <MessageSquare className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">2. Enviando Mensagens</h4>
                <p className="text-sm text-muted-foreground">
                  Nos agendamentos, use os botões "Conversa" (para abrir chat direto) ou 
                  "Template" (para enviar mensagem pré-formatada).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">3. Templates de Mensagem</h4>
                <p className="text-sm text-muted-foreground">
                  Crie templates personalizados na aba "Templates" com variáveis como nome do cliente, 
                  data e horário que são preenchidas automaticamente.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <Smartphone className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium">4. Formato dos Telefones</h4>
                <p className="text-sm text-muted-foreground">
                  O sistema formata automaticamente os números. Certifique-se de que os telefones 
                  dos clientes estão cadastrados corretamente (com DDD).
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variáveis Disponíveis nos Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{'{{clientName}}'}</Badge>
              <span className="text-sm">Nome do cliente</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{'{{date}}'}</Badge>
              <span className="text-sm">Data do agendamento</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{'{{time}}'}</Badge>
              <span className="text-sm">Horário de início</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{'{{professionalName}}'}</Badge>
              <span className="text-sm">Nome do profissional</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{'{{endTime}}'}</Badge>
              <span className="text-sm">Horário de término</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Dica:</strong> Para melhor experiência, fixe a aba do WhatsApp Web no navegador 
          (clique com o botão direito na aba → "Fixar aba"). Assim ela ficará sempre visível e acessível.
        </AlertDescription>
      </Alert>
    </div>
  );
};
