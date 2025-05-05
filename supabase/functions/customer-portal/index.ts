
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Get request body
    const { userId, returnUrl } = await req.json();

    if (!userId || !returnUrl) {
      throw new Error('Missing required parameters');
    }

    // Get subscriber info from database
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

    if (!subscribers || subscribers.length === 0 || !subscribers[0].stripe_customer_id) {
      throw new Error('No stripe customer found for this user');
    }

    const stripeCustomerId = subscribers[0].stripe_customer_id;

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    // Return the URL to redirect to
    return new Response(
      JSON.stringify({ url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Customer portal error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
