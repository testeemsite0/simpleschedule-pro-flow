
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Service } from '@/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface ServiceFormProps {
  service: Service | null;
  onSave: (serviceData: Omit<Service, 'id' | 'professional_id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  description: z.string().optional(),
  price: z.number().min(0, { message: 'Preço deve ser maior ou igual a zero' }),
  duration_minutes: z.number().int().min(5, { message: 'Duração mínima é de 5 minutos' }),
  active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const ServiceForm: React.FC<ServiceFormProps> = ({ service, onSave, onCancel }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: service?.name || '',
      description: service?.description || '',
      price: service?.price || 0,
      duration_minutes: service?.duration_minutes || 60,
      active: service?.active !== undefined ? service.active : true,
    },
  });

  // Update form when service changes
  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        description: service.description || '',
        price: service.price,
        duration_minutes: service.duration_minutes,
        active: service.active,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        duration_minutes: 60,
        active: true,
      });
    }
  }, [service, form]);

  const onSubmit = (data: FormValues) => {
    // Ensure all required fields are present before calling onSave
    const serviceData = {
      name: data.name,
      description: data.description,
      price: data.price,
      duration_minutes: data.duration_minutes,
      active: data.active,
    };
    
    onSave(serviceData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do serviço</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Corte de cabelo" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva detalhes do serviço..." 
                  rows={3}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01"
                    value={field.value}
                    onChange={e => field.onChange(parseFloat(e.target.value || '0'))}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duração (minutos)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="5" 
                    step="5"
                    value={field.value}
                    onChange={e => field.onChange(parseInt(e.target.value || '60'))}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Disponível para agendamento
                </FormLabel>
                <div className="text-sm text-muted-foreground">
                  Serviços inativos não aparecem para seus clientes
                </div>
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

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {service ? 'Salvar alterações' : 'Criar serviço'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ServiceForm;
