
import React, { useState } from "react";
import { ClientInfoStep } from "../ClientInfoStep";
import { BookingFormActions } from "./BookingFormActions";

interface ClientInfoFormProps {
  onSubmit: (name: string, email: string, phone: string, notes: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const ClientInfoForm: React.FC<ClientInfoFormProps> = ({
  onSubmit,
  onBack,
  isLoading = false
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, email, phone, notes);
  };

  return (
    <form onSubmit={handleSubmit}>
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
      
      <BookingFormActions 
        onBack={onBack}
        isLoading={isLoading}
      />
    </form>
  );
};
