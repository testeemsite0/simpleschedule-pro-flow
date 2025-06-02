
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ClientInfoStepProps {
  onClientInfoSubmit: (name: string, email: string, phone: string, notes?: string) => void;
  isLoading?: boolean;
  defaultValues?: {
    name?: string;
    email?: string;
    phone?: string;
    notes?: string;
  };
  hideButtons?: boolean;
}

export const ClientInfoStep: React.FC<ClientInfoStepProps> = ({
  onClientInfoSubmit,
  isLoading = false,
  defaultValues = {},
  hideButtons = false
}) => {
  const [name, setName] = useState(defaultValues.name || '');
  const [email, setEmail] = useState(defaultValues.email || '');
  const [phone, setPhone] = useState(defaultValues.phone || '');
  const [notes, setNotes] = useState(defaultValues.notes || '');
  const [error, setError] = useState('');

  console.log("ClientInfoStep: Initialized with values:", {
    name,
    email,
    phone,
    defaultValues
  });

  // Update form fields if defaultValues change
  useEffect(() => {
    console.log("ClientInfoStep: Default values changed:", defaultValues);
    if (defaultValues.name !== undefined) setName(defaultValues.name);
    if (defaultValues.email !== undefined) setEmail(defaultValues.email);
    if (defaultValues.phone !== undefined) setPhone(defaultValues.phone);
    if (defaultValues.notes !== undefined) setNotes(defaultValues.notes);
  }, [defaultValues]);

  // Auto-save when required fields are filled and valid
  useEffect(() => {
    if (name.trim() && email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('');
      console.log("ClientInfoStep: Auto-saving valid data");
      onClientInfoSubmit(name, email, phone, notes);
    } else if (name.trim() || email.trim()) {
      // Show error only if user has started typing
      if (name.trim() && !email.trim()) {
        setError("Email é obrigatório");
      } else if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Email em formato inválido");
      } else if (email.trim() && !name.trim()) {
        setError("Nome é obrigatório");
      }
    }
  }, [name, email, phone, notes, onClientInfoSubmit]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Informações do cliente</h2>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded border border-red-200">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="name">Nome completo <span className="text-destructive">*</span></Label>
        <Input 
          id="name" 
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          required
          disabled={isLoading}
          placeholder="Digite o nome completo"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
        <Input 
          id="email" 
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          required
          disabled={isLoading}
          placeholder="exemplo@email.com"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input 
          id="phone" 
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(00) 00000-0000"
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notas ou motivo da consulta</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Forneça detalhes adicionais se necessário"
          rows={3}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};
