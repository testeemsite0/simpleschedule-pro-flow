
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onCancel?: () => void;
  isLoading: boolean;
  isEditing: boolean;
  batchMode: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  isLoading,
  isEditing,
  batchMode
}) => {
  return (
    <div className="pt-4 border-t mt-4 flex justify-end gap-2">
      {onCancel && (
        <Button type="button" onClick={onCancel} variant="outline">
          Cancelar
        </Button>
      )}
      <Button type="submit" disabled={isLoading}>
        {isLoading 
          ? 'Salvando...' 
          : isEditing 
            ? 'Salvar alterações' 
            : batchMode 
              ? 'Adicionar horários em lote' 
              : 'Adicionar horário'}
      </Button>
    </div>
  );
};

export default FormActions;
