
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Professional, Appointment, TimeSlot } from '@/types';
import { useBooking } from '@/context/BookingContext';

export const useBookingData = (slug: string | undefined) => {
  const { 
    setProfessional, 
    setAppointments, 
    setTimeSlots, 
    setLoading 
  } = useBooking();
  
  // Fetch professional data directly from Supabase
  useEffect(() => {
    const fetchProfessionalData = async () => {
      setLoading(true);
      try {
        if (!slug) {
          console.error("No slug provided");
          setLoading(false);
          return;
        }

        // Fetch the professional by slug from the profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('slug', slug)
          .single();

        if (profileError) {
          console.error("Error fetching professional by slug:", profileError);
          setLoading(false);
          return;
        }

        if (!profileData) {
          console.error("No professional found with slug:", slug);
          setLoading(false);
          return;
        }

        console.log("Found professional:", profileData);
        
        const professionalData: Professional = {
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          profession: profileData.profession,
          bio: profileData.bio || undefined,
          slug: profileData.slug,
          address: undefined,
          avatar: profileData.avatar || undefined
        };
        
        setProfessional(professionalData);
        
        await fetchAppointmentsAndTimeSlots(professionalData.id);
      } catch (error) {
        console.error("Error fetching professional data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfessionalData();
  }, [slug, setProfessional, setLoading]);
  
  const fetchAppointmentsAndTimeSlots = async (professionalId: string) => {
    try {
      // Fetch professional's appointments
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('*')
        .eq('professional_id', professionalId);
        
      // Fetch professional's time slots
      const { data: timeSlotsData } = await supabase
        .from('time_slots')
        .select('*')
        .eq('professional_id', professionalId)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });
       
      console.log("Appointments data:", appointmentsData);
      console.log("Time slots data:", timeSlotsData);
      
      // Convert the data and make sure the status is correctly typed
      if (appointmentsData) {
        const typedAppointments: Appointment[] = appointmentsData.map(app => {
          // Validate and ensure the status is one of the allowed values
          let status: "scheduled" | "completed" | "canceled" = "scheduled";
          if (app.status === "completed") status = "completed";
          else if (app.status === "canceled") status = "canceled";
          
          return {
            ...app,
            status
          } as Appointment;
        });
        
        setAppointments(typedAppointments);
      } else {
        setAppointments([]);
      }
      
      setTimeSlots(timeSlotsData as TimeSlot[] || []);
    } catch (error) {
      console.error("Error fetching appointments and time slots:", error);
    }
  };

  return { fetchAppointmentsAndTimeSlots };
};
