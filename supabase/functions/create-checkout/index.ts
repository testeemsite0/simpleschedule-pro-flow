
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
    console.log("Create checkout function called");
    
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
    
    // For demonstration purposes, simulate a subscription
    // In a real app, this would create a Stripe checkout session
    
    // Get system config for price
    const { data: configData, error: configError } = await supabaseClient
      .from('system_config')
      .select('*')
      .limit(1)
      .single();
      
    if (configError) {
      throw new Error(`Error fetching system config: ${configError.message}`);
    }
    
    const premiumPrice = configData?.premium_price || 39.90;
    const stripePriceId = configData?.stripe_price_id || 'price_demo';
    
    // Update subscriber record
    const subscriptionEnd = new Date();
    subscriptionEnd.setDate(subscriptionEnd.getDate() + 30); // 30 days subscription
    
    await supabaseClient
      .from('subscribers')
      .upsert({
        user_id: user.id,
        email: user.email,
        subscribed: true,
        subscription_tier: 'Premium',
        subscription_end: subscriptionEnd.toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      
    // Add to subscription history
    await supabaseClient
      .from('subscription_history')
      .insert({
        user_id: user.id,
        subscription_tier: 'Premium',
        amount: premiumPrice * 100, // Store in cents
        period_start: new Date().toISOString(),
        period_end: subscriptionEnd.toISOString(),
        status: 'active',
        stripe_subscription_id: 'sub_demo_' + Math.random().toString(36).substring(7)
      });
      
    console.log("Subscription created for user:", user.email);
    
    // In a real app, return the checkout URL
    return new Response(JSON.stringify({ 
      success: true,
      url: '/success-checkout',
      message: "Assinatura criada com sucesso. Seu plano Premium está ativo!"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in create checkout:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
