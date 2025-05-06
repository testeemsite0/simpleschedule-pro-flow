
import React, { useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const workingDays = [
  { id: 0, label: 'Domingo' },
  { id: 1, label: 'Segunda-feira' },
  { id: 2, label: 'Terça-feira' },
  { id: 3, label: 'Quarta-feira' },
  { id: 4, label: 'Quinta-feira' },
  { id: 5, label: 'Sexta-feira' },
  { id: 6, label: 'Sábado' },
];

// Validation schema
const preferencesFormSchema = z.object({
  default_appointment_duration: z.coerce.number().int().min(5).max(480),
  appointment_buffer_minutes: z.coerce.number().int().min(0).max(60),
  working_hours_start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  working_hours_end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  working_days: z.array(z.number().min(0).max(6)),
  notifications_enabled: z.boolean(),
  reminder_hours_before: z.coerce.number().int().min(1).max(72),
  calendar_view: z.enum(['day', 'week', 'month'])
});

export type PreferencesFormData = z.infer<typeof preferencesFormSchema>;

interface PreferencesFormProps {
  initialData?: Partial<PreferencesFormData>;
  onSubmit: (data: PreferencesFormData) => Promise<void>;
  isSubmitting: boolean;
}

export const PreferencesForm: React.FC<PreferencesFormProps> = ({ 
  initialData, 
  onSubmit, 
  isSubmitting 
}) => {
  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: {
      default_appointment_duration: 60,
      appointment_buffer_minutes: 0,
      working_hours_start: '08:00',
      working_hours_end: '18:00',
      working_days: [1, 2, 3, 4, 5], // Monday to Friday by default
      notifications_enabled: true,
      reminder_hours_before: 24,
      calendar_view: 'week',
      ...initialData
    }
  });
  
  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        default_appointment_duration: initialData.default_appointment_duration || 60,
        appointment_buffer_minutes: initialData.appointment_buffer_minutes || 0,
        working_hours_start: initialData.working_hours_start || '08:00',
        working_hours_end: initialData.working_hours_end || '18:00',
        working_days: initialData.working_days || [1, 2, 3, 4, 5],
        notifications_enabled: initialData.notifications_enabled !== undefined ? initialData.notifications_enabled : true,
        reminder_hours_before: initialData.reminder_hours_before || 24,
        calendar_view: initialData.calendar_view || 'week'
      });
    }
  }, [initialData, form]);
  
  const handleSubmit = async (data: PreferencesFormData) => {
    await onSubmit(data);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências do Sistema</CardTitle>
        <CardDescription>
          Personalize as configurações do seu sistema de agendamentos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Horários de Trabalho</h3>
                
                <FormField
                  control={form.control}
                  name="working_hours_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário de Início</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="working_hours_end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário de Término</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="working_days"
                  render={() => (
                    <FormItem>
                      <div className="mb-2">
                        <FormLabel>Dias de Trabalho</FormLabel>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {workingDays.map((day) => (
                          <FormField
                            key={day.id}
                            control={form.control}
                            name="working_days"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={day.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(day.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, day.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== day.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {day.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configurações de Agendamento</h3>
                
                <FormField
                  control={form.control}
                  name="default_appointment_duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração Padrão (minutos)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Duração padrão para novos agendamentos
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="appointment_buffer_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intervalo Entre Consultas (minutos)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Tempo entre um agendamento e outro
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="calendar_view"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visualização Padrão do Calendário</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a visualização" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="day">Diária</SelectItem>
                          <SelectItem value="week">Semanal</SelectItem>
                          <SelectItem value="month">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notificações</h3>
                
                <FormField
                  control={form.control}
                  name="notifications_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Notificações Automáticas
                        </FormLabel>
                        <FormDescription>
                          Enviar notificações automáticas para clientes
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reminder_hours_before"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lembrete (horas antes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} disabled={!form.watch('notifications_enabled')} />
                      </FormControl>
                      <FormDescription>
                        Quantas horas antes enviar lembretes de agendamento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Preferências'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
