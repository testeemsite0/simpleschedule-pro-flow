
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
  hideButtons?: boolean;
}

export const ClientInfoStep: React.FC<ClientInfoStepProps> = ({
  onClientInfoSubmit,
  isLoading = false,
  onBack,
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

  const validateForm = () => {
    if (!name || !name.trim()) {
      setError("Nome é obrigatório");
      return false;
    }
    
    if (!email || !email.trim()) {
      setError("Email é obrigatório");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email em formato inválido");
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = () => {
    console.log("ClientInfoStep: Form submitted with:", { name, email, phone, notes });
    
    if (!validateForm()) {
      console.error("ClientInfoStep: Form validation failed");
      return;
    }
    
    console.log("ClientInfoStep: Form validation passed, calling onClientInfoSubmit");
    onClientInfoSubmit(name, email, phone, notes);
  };

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
            if (error) setError(''); // Clear error when user starts typing
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
            if (error) setError(''); // Clear error when user starts typing
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
      
      {!hideButtons && (
        <div className="flex justify-between mt-4">
          {onBack && (
            <Button variant="outline" onClick={onBack} disabled={isLoading}>
              Voltar
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Processando..." : "Avançar"}
          </Button>
        </div>
      )}
    </div>
  );
};
