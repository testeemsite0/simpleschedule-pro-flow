
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Send, ExternalLink, Phone } from 'lucide-react';
import { useWhatsAppTemplates } from '@/hooks/useWhatsAppTemplates';
import { Appointment } from '@/types';
import { toast } from 'sonner';

interface WhatsAppMessageButtonProps {
  appointment: Appointment;
  professionalName: string;
}

export const WhatsAppMessageButton: React.FC<WhatsAppMessageButtonProps> = ({
  appointment,
  professionalName
}) => {
  const { templates } = useWhatsAppTemplates();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [message, setMessage] = useState('');

  const defaultTemplates = [
    {
      id: 'confirmation',
      name: 'Confirmação de Agendamento',
      category: 'appointment_confirmation',
      message: 'Olá {{clientName}}! 😊\n\nSeu agendamento foi confirmado:\n📅 Data: {{date}}\n🕐 Horário: {{time}}\n👨‍⚕️ Profissional: {{professionalName}}\n\nAguardamos você!',
      variables: ['clientName', 'date', 'time', 'professionalName']
    },
    {
      id: 'reminder',
      name: 'Lembrete de Agendamento',
      category: 'appointment_reminder',
      message: 'Oi {{clientName}}! 📅\n\nLembrando que você tem um agendamento:\n📅 Data: {{date}}\n🕐 Horário: {{time}}\n👨‍⚕️ Profissional: {{professionalName}}\n\nPor favor, confirme sua presença! 🙏',
      variables: ['clientName', 'date', 'time', 'professionalName']
    },
    {
      id: 'cancellation',
      name: 'Cancelamento de Agendamento',
      category: 'appointment_cancellation',
      message: 'Olá {{clientName}},\n\nInformamos que seu agendamento do dia {{date}} às {{time}} foi cancelado.\n\nPara reagendar, entre em contato conosco.',
      variables: ['clientName', 'date', 'time']
    }
  ];

  const allTemplates = [...defaultTemplates, ...templates];

  const replaceVariables = (template: string) => {
    const date = new Date(appointment.date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    return template
      .replace(/\{\{clientName\}\}/g, appointment.client_name)
      .replace(/\{\{date\}\}/g, date)
      .replace(/\{\{time\}\}/g, appointment.start_time)
      .replace(/\{\{professionalName\}\}/g, professionalName)
      .replace(/\{\{endTime\}\}/g, appointment.end_time || '');
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = allTemplates.find(t => t.id === templateId);
    if (template) {
      const processedMessage = replaceVariables(template.message);
      setMessage(processedMessage);
    }
    setSelectedTemplate(templateId);
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Se não começar com código do país, adiciona +55
    if (!cleaned.startsWith('55') && cleaned.length >= 10) {
      return `55${cleaned}`;
    }
    
    return cleaned;
  };

  const sendWhatsAppMessage = () => {
    if (!appointment.client_phone) {
      toast.error('Cliente não possui telefone cadastrado');
      return;
    }

    if (!message.trim()) {
      toast.error('Selecione um template ou digite uma mensagem');
      return;
    }

    try {
      const phoneNumber = formatPhoneNumber(appointment.client_phone);
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
      
      // Abrir WhatsApp Web em nova aba/janela
      const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      
      if (newWindow) {
        toast.success('Abrindo WhatsApp Web com a mensagem...');
        
        // Marcar como conectado
        localStorage.setItem('whatsapp_connected', 'true');
        
        // Salvar no histórico se configurado
        const settings = JSON.parse(localStorage.getItem('whatsapp_settings') || '{"saveToHistory": true}');
        if (settings.saveToHistory) {
          const history = JSON.parse(localStorage.getItem('whatsapp_history') || '[]');
          history.push({
            appointmentId: appointment.id,
            clientName: appointment.client_name,
            phone: appointment.client_phone,
            message,
            sentAt: new Date().toISOString()
          });
          localStorage.setItem('whatsapp_history', JSON.stringify(history.slice(-50))); // Manter apenas últimas 50
        }
        
        setIsOpen(false);
        setMessage('');
        setSelectedTemplate('');
      } else {
        toast.error('Não foi possível abrir WhatsApp Web. Verifique se pop-ups estão bloqueados.');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      toast.error('Erro ao abrir WhatsApp Web');
    }
  };

  const sendDirectWhatsApp = () => {
    if (!appointment.client_phone) {
      toast.error('Cliente não possui telefone cadastrado');
      return;
    }

    const phoneNumber = formatPhoneNumber(appointment.client_phone);
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    localStorage.setItem('whatsapp_connected', 'true');
    toast.success('Abrindo conversa no WhatsApp Web...');
  };

  if (!appointment.client_phone) {
    return null;
  }

  return (
    <>
      {/* Botão rápido para abrir conversa */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={sendDirectWhatsApp}
        className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
      >
        <Phone className="h-4 w-4 mr-1" />
        Conversa
      </Button>

      {/* Botão com templates */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">
            <MessageSquare className="h-4 w-4 mr-1" />
            Template
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              Enviar Mensagem WhatsApp
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{appointment.client_name}</p>
                    <p className="text-xs text-muted-foreground">{appointment.client_phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <label className="text-sm font-medium">Template:</label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {allTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mensagem:</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem ou selecione um template acima"
                rows={6}
                className="resize-none"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{message.length}/4096 caracteres</span>
                {message.length > 4000 && (
                  <span className="text-orange-600">Mensagem muito longa</span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button 
                onClick={sendWhatsAppMessage} 
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!message.trim() || message.length > 4096}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
