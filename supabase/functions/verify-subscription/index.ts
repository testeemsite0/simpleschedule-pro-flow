
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

    const body = await req.json();
    const { userId } = body;

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

    // If no subscriber record, user is not premium
    if (!subscribers || subscribers.length === 0 || !subscribers[0].stripe_customer_id) {
      return new Response(
        JSON.stringify({
          isPremium: false,
          subscription: null,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const stripeCustomerId = subscribers[0].stripe_customer_id;

    // Get customer's subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
      expand: ['data.default_payment_method'],
    });

    // Check if there's an active subscription
    const isPremium = subscriptions.data.length > 0;
    const activeSubscription = isPremium ? subscriptions.data[0] : null;

    // Update the subscriber record in the database
    if (isPremium !== subscribers[0].subscribed || 
        (isPremium && subscribers[0].subscription_tier !== 'premium') || 
        (!isPremium && subscribers[0].subscription_tier === 'premium')) {
      
      const subscriptionEnd = activeSubscription ? 
        new Date(activeSubscription.current_period_end * 1000).toISOString() : 
        null;
        
      await fetch(
        `${Deno.env.get('SUPABASE_URL')}/rest/v1/subscribers?id=eq.${subscribers[0].id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            subscribed: isPremium,
            subscription_tier: isPremium ? 'premium' : 'free',
            subscription_end: subscriptionEnd,
          }),
        }
      );
    }

    return new Response(
      JSON.stringify({
        isPremium,
        subscription: activeSubscription ? {
          id: activeSubscription.id,
          status: activeSubscription.status,
          currentPeriodEnd: activeSubscription.current_period_end,
          cancelAtPeriodEnd: activeSubscription.cancel_at_period_end,
        } : null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error verifying subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
