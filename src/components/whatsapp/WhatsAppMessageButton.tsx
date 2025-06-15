
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send } from 'lucide-react';
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
      message: 'Olá {{clientName}}! Seu agendamento foi confirmado para {{date}} às {{time}} com {{professionalName}}. Aguardamos você! 😊',
      variables: ['clientName', 'date', 'time', 'professionalName']
    },
    {
      id: 'reminder',
      name: 'Lembrete de Agendamento',
      category: 'appointment_reminder',
      message: 'Oi {{clientName}}! Lembrando que você tem um agendamento amanhã ({{date}}) às {{time}} com {{professionalName}}. Confirme sua presença! 📅',
      variables: ['clientName', 'date', 'time', 'professionalName']
    }
  ];

  const allTemplates = [...defaultTemplates, ...templates];

  const replaceVariables = (template: string) => {
    const date = new Date(appointment.date).toLocaleDateString('pt-BR');
    
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
    if (!cleaned.startsWith('55') && cleaned.length === 11) {
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
      
      // Abrir WhatsApp Web em nova aba
      window.open(whatsappUrl, '_blank');
      
      toast.success('Redirecionando para WhatsApp Web...');
      setIsOpen(false);
      
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
        localStorage.setItem('whatsapp_history', JSON.stringify(history));
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      toast.error('Erro ao abrir WhatsApp Web');
    }
  };

  if (!appointment.client_phone) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">
          <MessageSquare className="h-4 w-4 mr-1" />
          WhatsApp
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Enviar WhatsApp
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">{appointment.client_name}</p>
            <p className="text-xs text-muted-foreground">{appointment.client_phone}</p>
          </div>

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
              placeholder="Digite sua mensagem ou selecione um template"
              rows={4}
            />
            <div className="text-xs text-muted-foreground">
              {message.length}/4096 caracteres
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={sendWhatsAppMessage} className="flex-1 bg-green-600 hover:bg-green-700">
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
