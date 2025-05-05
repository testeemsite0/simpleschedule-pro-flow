
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get subscriber data from database
    const { data: subscribers, error: subscriberError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/subscribers?select=*&user_id=eq.${userId}`,
      {
        headers: {
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
        },
      }
    ).then(res => res.json());

    if (subscriberError) {
      throw subscriberError;
    }

    // If subscription is active and premium, return true
    const isPremium = subscribers && 
                      subscribers.length > 0 && 
                      subscribers[0].subscribed === true && 
                      subscribers[0].subscription_tier === 'premium';

    // Count monthly appointments to check free tier limit
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const { data: appointments, error: appointmentsError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/appointments?select=count&professional_id=eq.${userId}&date=gte.${firstDay}&date=lte.${lastDay}`,
      {
        headers: {
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
          'Prefer': 'count=exact',
        },
      }
    ).then(res => ({
      data: null,
      error: null,
      count: parseInt(res.headers.get('content-range')?.split('/')[1] || '0'),
    }));

    if (appointmentsError) {
      throw appointmentsError;
    }

    // The free tier limit is 5 appointments per month
    const isWithinFreeLimit = appointments.count < 5;

    return new Response(
      JSON.stringify({
        isPremium,
        isWithinFreeLimit,
        monthlyAppointments: appointments.count,
        subscriptionEnd: subscribers?.[0]?.subscription_end || null,
        subscription: subscribers?.[0] || null
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
