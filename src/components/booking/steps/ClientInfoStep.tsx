
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ClientInfoStepProps {
  onClientInfoSubmit: (name: string, email: string, phone: string, notes?: string) => void;
  isLoading?: boolean;
  onBack?: () => void;
  defaultValues?: {
    name?: string;
    email?: string;
    phone?: string;
    notes?: string;
  };
  hideButtons?: boolean; // Add this prop to hide buttons when used in UnifiedBookingForm
}

export const ClientInfoStep: React.FC<ClientInfoStepProps> = ({
  onClientInfoSubmit,
  isLoading = false,
  onBack,
  defaultValues = {},
  hideButtons = false // Default to showing buttons for backward compatibility
}) => {
  const [name, setName] = useState(defaultValues.name || '');
  const [email, setEmail] = useState(defaultValues.email || '');
  const [phone, setPhone] = useState(defaultValues.phone || '');
  const [notes, setNotes] = useState(defaultValues.notes || '');

  // Update form fields if defaultValues change
  useEffect(() => {
    if (defaultValues.name) setName(defaultValues.name);
    if (defaultValues.email) setEmail(defaultValues.email);
    if (defaultValues.phone) setPhone(defaultValues.phone);
    if (defaultValues.notes) setNotes(defaultValues.notes);
  }, [defaultValues]);

  const handleSubmit = () => {
    onClientInfoSubmit(name, email, phone, notes);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Informações do cliente</h2>
      
      <div className="space-y-2">
        <Label htmlFor="name">Nome completo <span className="text-destructive">*</span></Label>
        <Input 
          id="name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
        <Input 
          id="email" 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
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
      
      {!hideButtons && onBack && (
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={onBack} disabled={isLoading}>
            Voltar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            Avançar
          </Button>
        </div>
      )}
    </div>
  );
};
