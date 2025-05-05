
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

    // Get the current user from the request
    const body = await req.json();
    const { userId, userEmail, successUrl, cancelUrl } = body;

    if (!userId || !userEmail || !successUrl || !cancelUrl) {
      throw new Error('Missing required parameters');
    }

    // Get the premium price ID from the database
    const { data: systemConfig, error: configError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/system_config?select=*&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
          'Content-Type': 'application/json',
        },
      }
    ).then(res => res.json());

    if (configError || !systemConfig || systemConfig.length === 0) {
      throw new Error('Could not retrieve system configuration');
    }

    const priceId = systemConfig[0].stripe_price_id;

    // Check if user already has a stripe customer ID
    const { data: subscriber, error: subscriberError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/subscribers?select=*&user_id=eq.${userId}&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
          'Content-Type': 'application/json',
        },
      }
    ).then(res => res.json());

    if (subscriberError) {
      throw subscriberError;
    }

    let stripeCustomerId = subscriber && subscriber.length > 0 ? subscriber[0].stripe_customer_id : null;

    // If no stripe customer ID, create one
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          user_id: userId,
        },
      });
      stripeCustomerId = customer.id;

      // Create or update subscriber record
      if (subscriber && subscriber.length > 0) {
        await fetch(
          `${Deno.env.get('SUPABASE_URL')}/rest/v1/subscribers?id=eq.${subscriber[0].id}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              stripe_customer_id: stripeCustomerId,
            }),
          }
        );
      } else {
        await fetch(
          `${Deno.env.get('SUPABASE_URL')}/rest/v1/subscribers`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              user_id: userId,
              email: userEmail,
              stripe_customer_id: stripeCustomerId,
              subscribed: false,
            }),
          }
        );
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: userId,
      },
      subscription_data: {
        metadata: {
          user_id: userId,
        },
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
