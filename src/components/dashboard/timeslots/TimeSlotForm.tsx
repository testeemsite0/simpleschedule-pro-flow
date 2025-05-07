
import React from 'react';
import TimeSlotFormCore from './TimeSlotFormCore';
import { TimeSlot } from '@/types';

interface TimeSlotFormProps {
  onSuccess?: () => void;
  initialData?: TimeSlot;
  onCancel?: () => void;
}

const TimeSlotForm: React.FC<TimeSlotFormProps> = ({ onSuccess, initialData, onCancel }) => {
  return (
    <div className="max-h-[60vh] overflow-y-auto p-4">
      <TimeSlotFormCore
        onSuccess={onSuccess}
        initialData={initialData}
        onCancel={onCancel}
      />
    </div>
  );
};

export default TimeSlotForm;
