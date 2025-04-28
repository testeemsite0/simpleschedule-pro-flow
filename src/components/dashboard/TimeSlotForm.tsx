
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { TimeSlot } from '@/types';
import { useAppointments } from '@/context/AppointmentContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TimeSlotFormProps {
  onSuccess?: () => void;
  initialData?: TimeSlot;
}

const dayOptions = [
  { value: '0', label: 'Domingo' },
  { value: '1', label: 'Segunda-feira' },
  { value: '2', label: 'Terça-feira' },
  { value: '3', label: 'Quarta-feira' },
  { value: '4', label: 'Quinta-feira' },
  { value: '5', label: 'Sexta-feira' },
  { value: '6', label: 'Sábado' },
];

const TimeSlotForm: React.FC<TimeSlotFormProps> = ({ onSuccess, initialData }) => {
  const isEditing = !!initialData;
  const { user } = useAuth();
  const { addTimeSlot, updateTimeSlot } = useAppointments();
  const { toast } = useToast();
  
  const [dayOfWeek, setDayOfWeek] = useState(initialData?.day_of_week.toString() || '');
  const [startTime, setStartTime] = useState(initialData?.start_time || '');
  const [endTime, setEndTime] = useState(initialData?.end_time || '');
  const [available, setAvailable] = useState(initialData?.available ?? true);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para adicionar horários',
        variant: 'destructive',
      });
      return;
    }
    
    if (!dayOfWeek || !startTime || !endTime) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const timeSlotData = {
        professional_id: user.id,
        day_of_week: parseInt(dayOfWeek),
        start_time: startTime,
        end_time: endTime,
        available,
      };
      
      let success;
      
      if (isEditing && initialData) {
        success = await updateTimeSlot({
          ...timeSlotData,
          id: initialData.id,
        });
      } else {
        success = await addTimeSlot(timeSlotData);
      }
      
      if (success) {
        toast({
          title: 'Sucesso',
          description: isEditing 
            ? 'Horário atualizado com sucesso' 
            : 'Horário adicionado com sucesso',
        });
        
        if (onSuccess) {
          onSuccess();
        }
        
        if (!isEditing) {
          setDayOfWeek('');
          setStartTime('');
          setEndTime('');
          setAvailable(true);
        }
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao processar sua solicitação',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Editar Horário' : 'Adicionar Novo Horário'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dayOfWeek">Dia da semana</Label>
            <Select
              value={dayOfWeek}
              onValueChange={setDayOfWeek}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o dia" />
              </SelectTrigger>
              <SelectContent>
                {dayOptions.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Horário inicial</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">Horário final</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="available"
              checked={available}
              onCheckedChange={setAvailable}
            />
            <Label htmlFor="available">Disponível para agendamento</Label>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Adicionar horário'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TimeSlotForm;
