
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get subscriber data from database
    const { data: subscribers, error: subscriberError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', userId);

    if (subscriberError) {
      console.error('Error fetching subscriber:', subscriberError);
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

    console.log(`Checking appointments from ${firstDay} to ${lastDay} for professional: ${userId}`);

    // Count appointments that count against free tier limit
    const { count, error: countError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('professional_id', userId)
      .eq('free_tier_used', true)
      .gte('date', firstDay)
      .lte('date', lastDay);
    
    if (countError) {
      console.error('Error counting appointments:', countError);
      throw countError;
    }
    
    const appointmentCount = count || 0;
    console.log("Monthly appointments count:", appointmentCount);

    // The free tier limit is 5 appointments per month
    // Premium users have no limits
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
