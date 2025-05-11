
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

    console.log("Checking subscription for user ID:", userId);

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

    console.log("Subscriber data:", subscribers);

    // If subscription is active and premium, return true
    const isPremium = subscribers && 
                      subscribers.length > 0 && 
                      subscribers[0].subscribed === true && 
                      subscribers[0].subscription_tier === 'premium';

    // Count monthly appointments to check free tier limit
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    console.log(`Checking appointments from ${firstDay} to ${lastDay}`);

    // Use content-range header to get exact count
    const appointmentsResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/appointments?select=id&professional_id=eq.${userId}&date=gte.${firstDay}&date=lte.${lastDay}&free_tier_used=eq.true`,
      {
        headers: {
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
          'Prefer': 'count=exact',
        },
      }
    );
    
    // Properly parse the count from content-range header
    const contentRange = appointmentsResponse.headers.get('content-range');
    const appointmentCount = contentRange ? parseInt(contentRange.split('/')[1]) : 0;
    
    console.log("Monthly appointments count:", appointmentCount);
    console.log("Content-Range header:", contentRange);

    // The free tier limit is 5 appointments per month
    // Important: We strictly enforce this limit (less than 5, not less than or equal to 5)
    const isWithinFreeLimit = isPremium || appointmentCount < 5;
    
    console.log("Is Premium:", isPremium);
    console.log("Is Within Free Limit:", isWithinFreeLimit);
    console.log("Monthly Appointments Count:", appointmentCount);

    return new Response(
      JSON.stringify({
        isPremium,
        isWithinFreeLimit,
        monthlyAppointments: appointmentCount,
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
      JSON.stringify({ 
        error: error.message,
        isPremium: false,
        isWithinFreeLimit: true, // Default to allow operations if there's an error
        monthlyAppointments: 0
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
