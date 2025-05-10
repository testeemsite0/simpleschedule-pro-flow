
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { RegisterFormValues } from '@/types/auth';

interface FormFieldsProps {
  form: UseFormReturn<RegisterFormValues>;
}

export const NameField = ({ form }: FormFieldsProps) => (
  <FormField
    control={form.control}
    name="name"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Nome completo</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const EmailField = ({ form }: FormFieldsProps) => (
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input type="email" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const ProfessionField = ({ form }: FormFieldsProps) => (
  <FormField
    control={form.control}
    name="profession"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Profissão</FormLabel>
        <Select 
          value={field.value} 
          onValueChange={field.onChange}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua profissão" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="psicologo">Psicólogo(a)</SelectItem>
            <SelectItem value="fisioterapeuta">Fisioterapeuta</SelectItem>
            <SelectItem value="advogado">Advogado(a)</SelectItem>
            <SelectItem value="nutricionista">Nutricionista</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const PasswordField = ({ form }: FormFieldsProps) => (
  <FormField
    control={form.control}
    name="password"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Senha</FormLabel>
        <FormControl>
          <Input type="password" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const ConfirmPasswordField = ({ form }: FormFieldsProps) => (
  <FormField
    control={form.control}
    name="confirmPassword"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Confirmar senha</FormLabel>
        <FormControl>
          <Input type="password" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);
