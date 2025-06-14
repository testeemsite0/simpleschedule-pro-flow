export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      appointment_payments: {
        Row: {
          amount: number
          appointment_id: string
          created_at: string
          id: string
          notes: string | null
          paid_at: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          recorded_by: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          appointment_id: string
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          recorded_by?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          appointment_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          recorded_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_status_history: {
        Row: {
          appointment_id: string
          changed_by: string | null
          created_at: string
          id: string
          new_status: string
          notes: string | null
          old_status: string | null
        }
        Insert: {
          appointment_id: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: string
          notes?: string | null
          old_status?: string | null
        }
        Update: {
          appointment_id?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_status_history_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string | null
          date: string
          end_time: string
          free_tier_used: boolean
          id: string
          insurance_plan_id: string | null
          notes: string | null
          price: number | null
          professional_id: string
          service_id: string | null
          source: string | null
          start_time: string
          status: string
          team_member_id: string | null
          updated_at: string | null
        }
        Insert: {
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          date: string
          end_time: string
          free_tier_used?: boolean
          id?: string
          insurance_plan_id?: string | null
          notes?: string | null
          price?: number | null
          professional_id: string
          service_id?: string | null
          source?: string | null
          start_time: string
          status: string
          team_member_id?: string | null
          updated_at?: string | null
        }
        Update: {
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          date?: string
          end_time?: string
          free_tier_used?: boolean
          id?: string
          insurance_plan_id?: string | null
          notes?: string | null
          price?: number | null
          professional_id?: string
          service_id?: string | null
          source?: string | null
          start_time?: string
          status?: string
          team_member_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_insurance_plan_id_fkey"
            columns: ["insurance_plan_id"]
            isOneToOne: false
            referencedRelation: "insurance_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          email: string | null
          id: string
          last_appointment: string | null
          name: string
          notes: string | null
          phone: string | null
          professional_id: string
          total_appointments: number | null
          total_revenue: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          last_appointment?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          professional_id: string
          total_appointments?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          last_appointment?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          professional_id?: string
          total_appointments?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          address: string | null
          company_name: string | null
          company_type: string
          created_at: string
          display_name: string
          id: string
          logo_url: string | null
          phone: string | null
          professional_id: string
          timezone: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          company_type?: string
          created_at?: string
          display_name: string
          id?: string
          logo_url?: string | null
          phone?: string | null
          professional_id: string
          timezone?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string | null
          company_type?: string
          created_at?: string
          display_name?: string
          id?: string
          logo_url?: string | null
          phone?: string | null
          professional_id?: string
          timezone?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      insurance_plans: {
        Row: {
          created_at: string
          current_appointments: number | null
          id: string
          limit_per_plan: number | null
          name: string
          professional_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_appointments?: number | null
          id?: string
          limit_per_plan?: number | null
          name: string
          professional_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_appointments?: number | null
          id?: string
          limit_per_plan?: number | null
          name?: string
          professional_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          is_active: boolean | null
          professional_id: string
          subject: string
          type: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          professional_id: string
          subject: string
          type: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          professional_id?: string
          subject?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          bio: string | null
          company_name: string | null
          company_type: string | null
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          name: string
          password_changed: boolean | null
          profession: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          company_name?: string | null
          company_type?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          id: string
          name: string
          password_changed?: boolean | null
          profession: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          company_name?: string | null
          company_type?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          name?: string
          password_changed?: boolean | null
          profession?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      secretary_assignments: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          professional_id: string
          secretary_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          professional_id: string
          secretary_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          professional_id?: string
          secretary_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          name: string
          price: number
          professional_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          name: string
          price: number
          professional_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          name?: string
          price?: number
          professional_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      stripe_config: {
        Row: {
          created_at: string
          id: string
          test_mode: boolean | null
          updated_at: string
          webhook_endpoint_secret: string | null
          webhook_events: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          test_mode?: boolean | null
          updated_at?: string
          webhook_endpoint_secret?: string | null
          webhook_events?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          test_mode?: boolean | null
          updated_at?: string
          webhook_endpoint_secret?: string | null
          webhook_events?: string[] | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_history: {
        Row: {
          amount: number | null
          cancellation_date: string | null
          created_at: string
          id: string
          period_end: string | null
          period_start: string | null
          status: string | null
          stripe_subscription_id: string | null
          subscription_tier: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          cancellation_date?: string | null
          created_at?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          cancellation_date?: string | null
          created_at?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_plan_features: {
        Row: {
          created_at: string
          feature_id: string
          id: string
          subscription_plan_id: string
        }
        Insert: {
          created_at?: string
          feature_id: string
          id?: string
          subscription_plan_id: string
        }
        Update: {
          created_at?: string
          feature_id?: string
          id?: string
          subscription_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_plan_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "system_features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_plan_features_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          currency: string | null
          description: string | null
          display_order: number | null
          features: Json | null
          id: string
          interval_type: string | null
          is_active: boolean | null
          max_appointments: number | null
          max_team_members: number | null
          name: string
          price: number
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          interval_type?: string | null
          is_active?: boolean | null
          max_appointments?: number | null
          max_team_members?: number | null
          name: string
          price: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          interval_type?: string | null
          is_active?: boolean | null
          max_appointments?: number | null
          max_team_members?: number | null
          name?: string
          price?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      system_config: {
        Row: {
          created_at: string
          id: string
          premium_price: number
          stripe_price_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          premium_price?: number
          stripe_price_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          premium_price?: number
          stripe_price_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_features: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          label: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          label: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_preferences: {
        Row: {
          appointment_buffer_minutes: number | null
          calendar_view: string | null
          created_at: string
          default_appointment_duration: number | null
          id: string
          notifications_enabled: boolean | null
          professional_id: string
          reminder_hours_before: number | null
          updated_at: string
          working_days: number[] | null
          working_hours_end: string | null
          working_hours_start: string | null
        }
        Insert: {
          appointment_buffer_minutes?: number | null
          calendar_view?: string | null
          created_at?: string
          default_appointment_duration?: number | null
          id?: string
          notifications_enabled?: boolean | null
          professional_id: string
          reminder_hours_before?: number | null
          updated_at?: string
          working_days?: number[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Update: {
          appointment_buffer_minutes?: number | null
          calendar_view?: string | null
          created_at?: string
          default_appointment_duration?: number | null
          id?: string
          notifications_enabled?: boolean | null
          professional_id?: string
          reminder_hours_before?: number | null
          updated_at?: string
          working_days?: number[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          debug_mode: boolean
          id: string
          maintenance_mode: boolean
          system_notifications: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          debug_mode?: boolean
          id?: string
          maintenance_mode?: boolean
          system_notifications?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          debug_mode?: boolean
          id?: string
          maintenance_mode?: boolean
          system_notifications?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      team_member_insurance_plans: {
        Row: {
          created_at: string
          current_appointments: number | null
          id: string
          insurance_plan_id: string
          limit_per_member: number | null
          team_member_id: string
        }
        Insert: {
          created_at?: string
          current_appointments?: number | null
          id?: string
          insurance_plan_id: string
          limit_per_member?: number | null
          team_member_id: string
        }
        Update: {
          created_at?: string
          current_appointments?: number | null
          id?: string
          insurance_plan_id?: string
          limit_per_member?: number | null
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_insurance_plans_insurance_plan_id_fkey"
            columns: ["insurance_plan_id"]
            isOneToOne: false
            referencedRelation: "insurance_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_insurance_plans_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_services: {
        Row: {
          created_at: string
          id: string
          service_id: string
          team_member_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          service_id: string
          team_member_id: string
        }
        Update: {
          created_at?: string
          id?: string
          service_id?: string
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_services_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          active: boolean
          avatar: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          position: string | null
          professional_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          avatar?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          position?: string | null
          professional_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          avatar?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          position?: string | null
          professional_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      time_slots: {
        Row: {
          appointment_duration_minutes: number | null
          available: boolean | null
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          lunch_break_end: string | null
          lunch_break_start: string | null
          professional_id: string
          start_time: string
          team_member_id: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_duration_minutes?: number | null
          available?: boolean | null
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          lunch_break_end?: string | null
          lunch_break_start?: string | null
          professional_id: string
          start_time: string
          team_member_id?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_duration_minutes?: number | null
          available?: boolean | null
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          lunch_break_end?: string | null
          lunch_break_start?: string | null
          professional_id?: string
          start_time?: string
          team_member_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_slots_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_slots_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          attempts: number | null
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          payload: Json | null
          processed: boolean | null
          processed_at: string | null
          stripe_event_id: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          processed?: boolean | null
          processed_at?: string | null
          stripe_event_id?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          processed?: boolean | null
          processed_at?: string | null
          stripe_event_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_team_member_accept_insurance: {
        Args: { member_id: string; plan_id: string }
        Returns: boolean
      }
      count_appointments_by_source: {
        Args: Record<PropertyKey, never>
        Returns: {
          source: string
          count: number
        }[]
      }
      count_subscribers_by_tier: {
        Args: Record<PropertyKey, never>
        Returns: {
          subscription_tier: string
          count: number
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_secretary_professionals: {
        Args: { secretary_user_id: string }
        Returns: {
          professional_id: string
        }[]
      }
      has_role: {
        Args: { _role: string } | { _user_id: string; _role: string }
        Returns: boolean
      }
      is_secretary_for_professional: {
        Args: { secretary_user_id: string; target_professional_id: string }
        Returns: boolean
      }
    }
    Enums: {
      payment_method: "cash" | "debit" | "credit" | "pix" | "insurance"
      payment_status: "pending" | "paid" | "partial" | "refunded"
      user_role: "professional" | "secretary" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      payment_method: ["cash", "debit", "credit", "pix", "insurance"],
      payment_status: ["pending", "paid", "partial", "refunded"],
      user_role: ["professional", "secretary", "admin"],
    },
  },
} as const
