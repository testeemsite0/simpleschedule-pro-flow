
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use the service role key to perform writes (upsert) in Supabase
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if user has a subscription in the subscribers table
    const { data: subscriber, error: subError } = await supabaseClient
      .from('subscribers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // For demonstration purposes, we'll check if user is in a subscription list
    // In production, this would validate with Stripe
    if (subscriber && subscriber.subscribed) {
      logStep("User has active subscription", { 
        tier: subscriber.subscription_tier,
        end: subscriber.subscription_end 
      });
      
      return new Response(JSON.stringify({
        subscribed: true,
        subscription_tier: subscriber.subscription_tier || 'Premium',
        subscription_end: subscriber.subscription_end
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check for appointment limits for free tier
    const { count, error: countError } = await supabaseClient
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('professional_id', user.id)
      .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    if (countError) {
      throw new Error(`Error checking appointment count: ${countError.message}`);
    }

    logStep("User does not have active subscription", { appointmentCount: count });
    
    // Update subscriber record
    await supabaseClient
      .from('subscribers')
      .upsert({
        user_id: user.id,
        email: user.email,
        subscribed: false,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    return new Response(JSON.stringify({
      subscribed: false,
      appointment_count: count
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
