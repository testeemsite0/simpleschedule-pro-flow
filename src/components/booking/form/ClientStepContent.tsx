
import React from 'react';
import { ClientInfoStep } from '../ClientInfoStep';

interface ClientStepContentProps {
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
}

export const ClientStepContent: React.FC<ClientStepContentProps> = ({
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
    <ClientInfoStep 
      name={name}
      setName={setName}
      email={email}
      setEmail={setEmail}
      phone={phone}
      setPhone={setPhone}
      notes={notes}
      setNotes={setNotes}
    />
  );
};
