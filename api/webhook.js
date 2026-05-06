import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
export default async function handler(req, res) {
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
  // Map Stripe price IDs to plan names
  // You'll need to update these with your actual Stripe price IDs
  const planMap = {
    'price_starter': 'Starter',
    'price_creator': 'Creator', 
    'price_pro': 'Pro',
    'price_agency': 'Agency',
    'price_studio': 'Studio',
  };

  // Helper to update user plan in Supabase
  async function updateUserPlan(email, plan) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ plan, episodes_used: 0 }),
      });
      return response.ok;
    } catch(e) {
      console.error('Supabase update error:', e);
      return false;
    }
  }
  
  try {
    const event = req.body;
    const eventType = event.type;

    console.log('Webhook received:', eventType);

    // Handle subscription created or updated
    if (eventType === 'customer.subscription.created' || 
        eventType === 'customer.subscription.updated') {
      
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const status = subscription.status;
      const priceId = subscription.items?.data[0]?.price?.id;

      // Get customer email from Stripe
      const customerRes = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        },
      });
      const customer = await customerRes.json();
      const email = customer.email;

      if (!email) {
        console.log('No email found for customer:', customerId);
        return res.status(200).json({ received: true });
      }

      // Determine plan from price ID
      let plan = 'trial';
      for (const [key, value] of Object.entries(planMap)) {
        if (priceId && priceId.includes(key)) {
          plan = value;
          break;
        }
      }

      // If active subscription — upgrade plan
      if (status === 'active') {
        // Try to find plan by amount if price ID mapping fails
        if (plan === 'trial') {
          const amount = subscription.items?.data[0]?.price?.unit_amount;
          if (amount === 1900) plan = 'Starter';
          else if (amount === 3900) plan = 'Creator';
          else if (amount === 6900) plan = 'Pro';
          else if (amount === 14900) plan = 'Agency';
          else if (amount === 29900) plan = 'Studio';
        }
// Send welcome email
await resend.emails.send({
await resend.emails.send({
  from: 'Series Lab <hello@tryserieslab.com>',
  to: [email],
  subject: 'Welcome to Series Lab — you\'re in 🎬',
  text: `Hey there,\n\nWelcome to Series Lab! Your ${plan} plan is now active.\n\nLog in at https://tryserieslab.com\n\n- Series Lab Team`,
});
console.log(`Welcome email sent to ${email}`);  from: 'Series Lab <hello@tryserieslab.com>',
  to: [email],
  subject: 'Welcome to Series Lab — you\'re in 🎬',
  text: `Hey there,

Welcome to Series Lab! Your ${plan} plan is now active.

Log in at https://tryserieslab.com to get started.

- Series Lab Team`,
});
console.log(`Welcome email sent to ${email}`);
        await updateUserPlan(email, plan);
        console.log(`Upgraded ${email} to ${plan}`);
      }
    }

    // Handle subscription cancelled
    if (eventType === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const customerRes = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        },
      });
      const customer = await customerRes.json();
      const email = customer.email;

      if (email) {
        await updateUserPlan(email, 'trial');
        console.log(`Downgraded ${email} to trial`);
      }
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}
