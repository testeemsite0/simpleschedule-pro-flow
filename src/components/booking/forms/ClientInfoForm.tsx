
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
  const [error, setError] = useState("");

  const validateEmail = (email: string): boolean => {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!name.trim()) {
      setError("Nome é obrigatório");
      return;
    }
    
    if (!email.trim()) {
      setError("Email é obrigatório");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor, insira um email válido");
      return;
    }
    
    // Clear any previous errors
    setError("");
    
    // Call the onSubmit callback with form data
    console.log("Submitting client info:", { name, email, phone, notes });
    onSubmit(name, email, phone, notes);
  };

  // Create a wrapper function for the BookingFormActions component
  const handleSubmitButtonClick = () => {
    // This function is empty because form submission is handled by the form's onSubmit
    // The button inside BookingFormActions has type="submit" which triggers the form's onSubmit
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded border border-red-200">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      
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
        onSubmit={handleSubmitButtonClick}
        submitLabel="Finalizar Agendamento"
      />
    </form>
  );
};
