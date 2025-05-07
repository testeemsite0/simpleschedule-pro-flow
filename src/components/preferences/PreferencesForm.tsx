
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import WorkingDaysSelector from './WorkingDaysSelector';
import TimeSelector from './TimeSelector';

export interface PreferencesFormData {
  default_appointment_duration: number;
  appointment_buffer_minutes: number;
  working_hours_start: string;
  working_hours_end: string;
  working_days: number[];
  notifications_enabled: boolean;
  reminder_hours_before: number;
  calendar_view: 'day' | 'week' | 'month';
}

interface PreferencesFormProps {
  initialData?: PreferencesFormData;
  onSubmit: (data: PreferencesFormData) => void;
  isSubmitting: boolean;
  simplified?: boolean; // Add simplified mode flag
}

const defaultValues: PreferencesFormData = {
  default_appointment_duration: 60,
  appointment_buffer_minutes: 0,
  working_hours_start: '08:00',
  working_hours_end: '18:00',
  working_days: [1, 2, 3, 4, 5],
  notifications_enabled: true,
  reminder_hours_before: 24,
  calendar_view: 'week'
};

export const PreferencesForm: React.FC<PreferencesFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  simplified = false
}) => {
  const [formData, setFormData] = React.useState<PreferencesFormData>(
    initialData || defaultValues
  );
  
  const handleChange = (field: keyof PreferencesFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Preferências Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Exibição do Calendário</h3>
            <div className="space-y-2">
              <Label htmlFor="calendar_view">Visualização padrão do calendário</Label>
              <Select
                value={formData.calendar_view}
                onValueChange={(value: 'day' | 'week' | 'month') => handleChange('calendar_view', value)}
              >
                <SelectTrigger id="calendar_view" className="w-full">
                  <SelectValue placeholder="Selecione a visualização padrão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Dia</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {!simplified && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Horários de Trabalho</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="working_hours_start">Horário de início</Label>
                    <TimeSelector
                      value={formData.working_hours_start}
                      onChange={(value) => handleChange('working_hours_start', value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="working_hours_end">Horário de fim</Label>
                    <TimeSelector
                      value={formData.working_hours_end}
                      onChange={(value) => handleChange('working_hours_end', value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 block">Dias de trabalho</Label>
                  <WorkingDaysSelector
                    selectedDays={formData.working_days}
                    onChange={(days) => handleChange('working_days', days)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configurações de Agendamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default_appointment_duration">Duração padrão da consulta (minutos)</Label>
                    <Input
                      id="default_appointment_duration"
                      type="number"
                      min="15"
                      step="15"
                      value={formData.default_appointment_duration}
                      onChange={(e) => handleChange('default_appointment_duration', parseInt(e.target.value) || 60)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointment_buffer_minutes">Intervalo entre consultas (minutos)</Label>
                    <Input
                      id="appointment_buffer_minutes"
                      type="number"
                      min="0"
                      step="5"
                      value={formData.appointment_buffer_minutes}
                      onChange={(e) => handleChange('appointment_buffer_minutes', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notificações</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications_enabled">Enviar notificações de agendamento</Label>
              <Switch
                id="notifications_enabled"
                checked={formData.notifications_enabled}
                onCheckedChange={(checked) => handleChange('notifications_enabled', checked)}
              />
            </div>
            
            {formData.notifications_enabled && (
              <div className="space-y-2">
                <Label htmlFor="reminder_hours_before">Enviar lembrete antes do agendamento (horas)</Label>
                <Input
                  id="reminder_hours_before"
                  type="number"
                  min="1"
                  max="72"
                  value={formData.reminder_hours_before}
                  onChange={(e) => handleChange('reminder_hours_before', parseInt(e.target.value) || 24)}
                />
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar Preferências'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};
