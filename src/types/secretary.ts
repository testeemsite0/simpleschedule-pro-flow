
export interface UserRole {
  id: string;
  user_id: string;
  role: 'professional' | 'secretary' | 'admin';
  created_at: string;
}

export interface SecretaryAssignment {
  id: string;
  secretary_id: string;
  professional_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppointmentPayment {
  id: string;
  appointment_id: string;
  amount: number;
  payment_method: 'cash' | 'debit' | 'credit' | 'pix' | 'insurance';
  payment_status: 'pending' | 'paid' | 'partial' | 'refunded';
  notes?: string;
  paid_at?: string;
  recorded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentStatusHistory {
  id: string;
  appointment_id: string;
  old_status?: string;
  new_status: string;
  changed_by?: string;
  notes?: string;
  created_at: string;
}
