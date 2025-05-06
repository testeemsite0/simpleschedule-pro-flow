
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ClientInfoStepProps {
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
}

export const ClientInfoStep: React.FC<ClientInfoStepProps> = ({
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  notes,
  setNotes
}) => {
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
        />
      </div>
    </div>
  );
};
