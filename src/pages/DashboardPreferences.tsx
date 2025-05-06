
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PreferencesForm, PreferencesFormData } from '@/components/preferences/PreferencesForm';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Define the correct type for calendar_view
type CalendarView = 'day' | 'week' | 'month';

const DashboardPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferences, setPreferences] = useState<PreferencesFormData | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);
  
  const fetchPreferences = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Check if preferences exist for this user
      const { data, error } = await supabase
        .from('system_preferences')
        .select('*')
        .eq('professional_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error code
        throw error;
      }
      
      if (data) {
        // Ensure calendar_view is one of the allowed values
        let calendarView: CalendarView = 'week';
        if (data.calendar_view === 'day' || data.calendar_view === 'week' || data.calendar_view === 'month') {
          calendarView = data.calendar_view as CalendarView;
        }
        
        setPreferences({
          default_appointment_duration: data.default_appointment_duration || 60,
          appointment_buffer_minutes: data.appointment_buffer_minutes || 0,
          working_hours_start: data.working_hours_start || '08:00',
          working_hours_end: data.working_hours_end || '18:00',
          working_days: data.working_days || [1, 2, 3, 4, 5],
          notifications_enabled: data.notifications_enabled !== null ? data.notifications_enabled : true,
          reminder_hours_before: data.reminder_hours_before || 24,
          calendar_view: calendarView
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as preferências',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (data: PreferencesFormData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Check if preferences exist for this user
      const { data: existingData, error: existingError } = await supabase
        .from('system_preferences')
        .select('id')
        .eq('professional_id', user.id)
        .single();
      
      let result;
      
      if (existingData) {
        // Update existing preferences
        result = await supabase
          .from('system_preferences')
          .update({
            default_appointment_duration: data.default_appointment_duration,
            appointment_buffer_minutes: data.appointment_buffer_minutes,
            working_hours_start: data.working_hours_start,
            working_hours_end: data.working_hours_end,
            working_days: data.working_days,
            notifications_enabled: data.notifications_enabled,
            reminder_hours_before: data.reminder_hours_before,
            calendar_view: data.calendar_view,
            updated_at: new Date().toISOString()
          })
          .eq('professional_id', user.id);
      } else {
        // Insert new preferences
        result = await supabase
          .from('system_preferences')
          .insert({
            professional_id: user.id,
            default_appointment_duration: data.default_appointment_duration,
            appointment_buffer_minutes: data.appointment_buffer_minutes,
            working_hours_start: data.working_hours_start,
            working_hours_end: data.working_hours_end,
            working_days: data.working_days,
            notifications_enabled: data.notifications_enabled,
            reminder_hours_before: data.reminder_hours_before,
            calendar_view: data.calendar_view
          });
      }
      
      if (result.error) throw result.error;
      
      // Update local state
      setPreferences(data);
      
      toast({
        title: 'Sucesso',
        description: 'Preferências salvas com sucesso',
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as preferências',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout title="Preferências">
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Personalize as configurações do seu sistema de agendamentos
        </p>
        
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            {loading ? (
              <Card>
                <CardHeader>
                  <CardTitle>Carregando...</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Carregando suas preferências...</p>
                </CardContent>
              </Card>
            ) : (
              <PreferencesForm 
                initialData={preferences || undefined}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Funcionalidade de configuração detalhada de notificações será implementada em breve.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPreferences;
