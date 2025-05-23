// This is a Supabase Edge Function that resets usage limits for subscriptions
// It should be scheduled to run once per day using a CRON trigger

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.2';

// Define the expected shape of subscription data from the query
interface SubscriptionWithPlan {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  end_date: string | null;
  subscription_plans: {
    price: number;
  };
}

// Edge function handler
Deno.serve(async (req) => {
  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Initialize Supabase client with service role key (has full access)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const now = new Date().toISOString();
    
    // Get subscriptions where the end date has passed or free users who haven't had a reset in 31 days
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        id, 
        user_id, 
        plan_id,
        status,
        end_date,
        subscription_plans(price)
      `)
      .or(`end_date.lt.${now},and(subscription_plans.price.eq.0,updated_at.lt.${new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString()})`)
      .eq('status', 'active');
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No subscriptions need resetting',
        count: 0
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    }
    
    // Transform the data to match our expected format
    const subscriptionsToReset = data.map(sub => ({
      ...sub,
      subscription_plans: {
        price: sub.subscription_plans[0]?.price || 0
      }
    })) as SubscriptionWithPlan[];
    
    // Get list of user IDs to reset
    const userIds = subscriptionsToReset.map(sub => sub.user_id);
    
    // Reset usage for these users
    const { error: resetError } = await supabase
      .from('subscription_usage')
      .update({
        used_amount: 0,
        reset_date: now
      })
      .in('user_id', userIds);
    
    if (resetError) throw resetError;
    
    // Update subscription end dates for paid plans (extend by another period)
    for (const sub of subscriptionsToReset) {
      // Skip free plans as they don't have end dates
      if (sub.subscription_plans.price > 0 && sub.end_date) {
        const currentEndDate = new Date(sub.end_date);
        
        // Add 1 month to the current end date
        const newEndDate = new Date(currentEndDate);
        newEndDate.setMonth(newEndDate.getMonth() + 1);
        
        await supabase
          .from('user_subscriptions')
          .update({
            end_date: newEndDate.toISOString(),
            updated_at: now
          })
          .eq('id', sub.id);
      } else {
        // For free plans, just update the updated_at date
        await supabase
          .from('user_subscriptions')
          .update({
            updated_at: now
          })
          .eq('id', sub.id);
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Usage limits have been reset',
      count: subscriptionsToReset.length
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}); 