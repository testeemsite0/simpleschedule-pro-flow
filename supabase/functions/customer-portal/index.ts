
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    console.log("Customer portal function called");
    
    // For demo purposes, we'll return a simulated customer portal URL
    // In a real application, this would create a Stripe customer portal session
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    
    // Initialize Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    
    if (!user) throw new Error("User not authenticated");
    
    console.log("User authenticated:", user.email);
    
    // For demo, update the subscriber record to simulate cancellation
    // In real app, this would redirect to Stripe Customer Portal
    await supabaseClient
      .from('subscribers')
      .upsert({
        user_id: user.id,
        email: user.email,
        subscribed: false,
        cancellation_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      
    // Record cancellation in subscription history
    await supabaseClient
      .from('subscription_history')
      .insert({
        user_id: user.id,
        subscription_tier: 'Premium',
        amount: 3990,
        period_start: new Date().toISOString(),
        period_end: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
        cancellation_date: new Date().toISOString(),
        status: 'canceled'
      });
      
    console.log("Subscription canceled for user:", user.email);
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Assinatura cancelada com sucesso. Você continuará com acesso Premium até o fim do período atual."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in customer portal:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
