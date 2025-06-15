
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, MessageSquare } from 'lucide-react';
import { useWhatsAppTemplates } from '@/hooks/useWhatsAppTemplates';

interface MessageTemplate {
  id: string;
  name: string;
  category: string;
  message: string;
  variables: string[];
  createdAt: string;
  isDefault?: boolean;
}

export const MessageTemplates: React.FC = () => {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useWhatsAppTemplates();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'appointment_confirmation',
    message: '',
    variables: [] as string[]
  });

  const categories = [
    { value: 'appointment_confirmation', label: 'Confirmação de Agendamento' },
    { value: 'appointment_reminder', label: 'Lembrete de Agendamento' },
    { value: 'appointment_cancellation', label: 'Cancelamento de Agendamento' },
    { value: 'appointment_rescheduling', label: 'Reagendamento' },
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'general', label: 'Geral' }
  ];

  const defaultTemplates: MessageTemplate[] = [
    {
      id: 'default_confirmation',
      name: 'Confirmação de Agendamento',
      category: 'appointment_confirmation',
      message: 'Olá {{clientName}}! Seu agendamento foi confirmado para {{date}} às {{time}} com {{professionalName}}. Aguardamos você! 😊',
      variables: ['clientName', 'date', 'time', 'professionalName'],
      createdAt: new Date().toISOString(),
      isDefault: true
    },
    {
      id: 'default_reminder',
      name: 'Lembrete de Agendamento',
      category: 'appointment_reminder',
      message: 'Oi {{clientName}}! Lembrando que você tem um agendamento amanhã ({{date}}) às {{time}} com {{professionalName}}. Confirme sua presença! 📅',
      variables: ['clientName', 'date', 'time', 'professionalName'],
      createdAt: new Date().toISOString(),
      isDefault: true
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const templateData = {
      ...formData,
      id: editingTemplate?.id || Date.now().toString(),
      createdAt: editingTemplate?.createdAt || new Date().toISOString()
    };

    if (editingTemplate) {
      updateTemplate(templateData);
    } else {
      addTemplate(templateData);
    }

    setFormData({ name: '', category: 'appointment_confirmation', message: '', variables: [] });
    setEditingTemplate(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      message: template.message,
      variables: template.variables
    });
    setIsDialogOpen(true);
  };

  const extractVariables = (message: string) => {
    const matches = message.match(/\{\{(\w+)\}\}/g);
    return matches ? matches.map(match => match.slice(2, -2)) : [];
  };

  const handleMessageChange = (message: string) => {
    setFormData({
      ...formData,
      message,
      variables: extractVariables(message)
    });
  };

  const allTemplates: MessageTemplate[] = [...defaultTemplates, ...templates];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Templates de Mensagem</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Editar Template' : 'Novo Template'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Template</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleMessageChange(e.target.value)}
                  placeholder="Use {{variableName}} para variáveis. Ex: Olá {{clientName}}, seu agendamento é às {{time}}"
                  rows={4}
                  required
                />
                {formData.variables.length > 0 && (
                  <div className="mt-2">
                    <Label className="text-xs">Variáveis detectadas:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.variables.map((variable) => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingTemplate ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {allTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{template.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {categories.find(c => c.value === template.category)?.label}
                  </Badge>
                  {!template.isDefault && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{template.message}</p>
              {template.variables.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {template.variables.map((variable) => (
                    <Badge key={variable} variant="secondary" className="text-xs">
                      {variable}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
