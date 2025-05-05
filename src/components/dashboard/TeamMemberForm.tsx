
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { TeamMember } from '@/types';

interface FormValues {
  name: string;
  email?: string;
  position?: string;
  active: boolean;
}

interface TeamMemberFormProps {
  member?: TeamMember | null;
  onSave: (data: Partial<TeamMember>) => void;
  onCancel: () => void;
}

const TeamMemberForm: React.FC<TeamMemberFormProps> = ({
  member,
  onSave,
  onCancel,
}) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: '',
      email: '',
      position: '',
      active: true,
    }
  });
  
  useEffect(() => {
    if (member) {
      setValue('name', member.name);
      setValue('email', member.email || '');
      setValue('position', member.position || '');
      setValue('active', member.active);
    }
  }, [member, setValue]);
  
  const onSubmit = (data: FormValues) => {
    onSave({
      name: data.name,
      email: data.email,
      position: data.position,
      active: data.active,
    });
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome <span className="text-destructive">*</span></Label>
        <Input
          id="name"
          {...register('name', { required: 'Nome é obrigatório' })}
          placeholder="Nome completo"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="email@exemplo.com"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="position">Cargo / Especialidade</Label>
        <Input
          id="position"
          {...register('position')}
          placeholder="Ex: Psicólogo, Barbeiro Senior, etc."
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Checkbox
          id="active"
          {...register('active')}
          defaultChecked
        />
        <Label htmlFor="active" className="text-sm">Membro ativo</Label>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {member ? 'Atualizar' : 'Adicionar'} Membro
        </Button>
      </div>
    </form>
  );
};

export default TeamMemberForm;
