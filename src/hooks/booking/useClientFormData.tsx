
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseClientFormDataProps {
  initialName?: string;
  initialEmail?: string;
  initialPhone?: string;
  initialNotes?: string;
}

export const useClientFormData = ({
  initialName = '',
  initialEmail = '',
  initialPhone = '',
  initialNotes = ''
}: UseClientFormDataProps = {}) => {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [notes, setNotes] = useState(initialNotes);
  const { toast } = useToast();

  const validateClientInfo = () => {
    if (!name) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, informe seu nome completo',
        variant: 'destructive',
      });
      return false;
    }
    
    if (!email) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, informe seu email',
        variant: 'destructive',
      });
      return false;
    }
    
    return true;
  };

  return {
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    notes,
    setNotes,
    validateClientInfo
  };
};
