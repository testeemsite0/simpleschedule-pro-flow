
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeKey || !webhookSecret) {
      throw new Error('Stripe keys not configured');
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Webhook signature verification failed', { status: 400 });
    }

    // Log the webhook event
    const { error: logError } = await supabaseClient
      .from('webhook_logs')
      .insert({
        event_type: event.type,
        stripe_event_id: event.id,
        payload: event,
        processed: false,
        attempts: 0
      });

    if (logError) {
      console.error('Error logging webhook:', logError);
    }

    // Process the webhook event
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscriptionChange(event, supabaseClient);
          break;
        
        case 'customer.subscription.deleted':
          await handleSubscriptionCanceled(event, supabaseClient);
          break;
        
        case 'invoice.payment_succeeded':
          await handlePaymentSucceeded(event, supabaseClient);
          break;
        
        case 'invoice.payment_failed':
          await handlePaymentFailed(event, supabaseClient);
          break;
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Mark as processed
      await supabaseClient
        .from('webhook_logs')
        .update({ 
          processed: true, 
          processed_at: new Date().toISOString() 
        })
        .eq('stripe_event_id', event.id);

    } catch (processError) {
      console.error('Error processing webhook:', processError);
      
      // Update log with error
      await supabaseClient
        .from('webhook_logs')
        .update({ 
          error_message: processError.message,
          attempts: 1
        })
        .eq('stripe_event_id', event.id);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function handleSubscriptionChange(event: any, supabaseClient: any) {
  const subscription = event.data.object;
  const customerId = subscription.customer;
  
  // Get customer email
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' });
  const customer = await stripe.customers.retrieve(customerId);
  
  if (!customer.email) return;

  const subscriptionTier = getSubscriptionTier(subscription);
  const isActive = subscription.status === 'active';

  await supabaseClient
    .from('subscribers')
    .upsert({
      email: customer.email,
      stripe_customer_id: customerId,
      subscribed: isActive,
      subscription_tier: subscriptionTier,
      subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'email' });
}

async function handleSubscriptionCanceled(event: any, supabaseClient: any) {
  const subscription = event.data.object;
  const customerId = subscription.customer;
  
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' });
  const customer = await stripe.customers.retrieve(customerId);
  
  if (!customer.email) return;

  await supabaseClient
    .from('subscribers')
    .update({
      subscribed: false,
      subscription_end: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('email', customer.email);
}

async function handlePaymentSucceeded(event: any, supabaseClient: any) {
  const invoice = event.data.object;
  console.log('Payment succeeded for invoice:', invoice.id);
  
  // Add to subscription history
  await supabaseClient
    .from('subscription_history')
    .insert({
      stripe_subscription_id: invoice.subscription,
      status: 'paid',
      amount: invoice.amount_paid / 100,
      period_start: new Date(invoice.period_start * 1000).toISOString(),
      period_end: new Date(invoice.period_end * 1000).toISOString(),
    });
}

async function handlePaymentFailed(event: any, supabaseClient: any) {
  const invoice = event.data.object;
  console.log('Payment failed for invoice:', invoice.id);
  
  // Add to subscription history
  await supabaseClient
    .from('subscription_history')
    .insert({
      stripe_subscription_id: invoice.subscription,
      status: 'payment_failed',
      amount: invoice.amount_due / 100,
      period_start: new Date(invoice.period_start * 1000).toISOString(),
      period_end: new Date(invoice.period_end * 1000).toISOString(),
    });
}

function getSubscriptionTier(subscription: any): string {
  const priceId = subscription.items.data[0]?.price.id;
  
  // Map price IDs to tiers - this should match your subscription plans
  const tierMap: Record<string, string> = {
    'price_premium_monthly': 'Premium',
    'price_enterprise_monthly': 'Enterprise',
  };
  
  return tierMap[priceId] || 'Basic';
}
