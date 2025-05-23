-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  interval_type VARCHAR(20) NOT NULL CHECK (interval_type IN ('monthly', 'yearly', 'lifetime')),
  features JSONB,
  limits JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user subscriptions table to track user subscription status
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'canceled', 'expired', 'trial', 'past_due')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT TRUE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  payment_provider VARCHAR(50),
  payment_reference VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create subscription usage tracking table for metered features
CREATE TABLE IF NOT EXISTS subscription_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  feature_name VARCHAR(255) NOT NULL,
  used_amount INTEGER NOT NULL DEFAULT 0,
  reset_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, subscription_id, feature_name)
);

-- Insert the specified subscription plans
INSERT INTO subscription_plans (name, description, price, currency, interval_type, features, limits)
VALUES 
  (
    'Basic Plan', 
    'Free tier with limited usage', 
    0.00, 
    'NGN',
    'monthly',
    '{
      "standard_support": true,
      "image_shopping": true,
      "online_shopping": true,
      "group_shopping": false,
      "auto_shopper": false,
      "voice_mode": true,
      "free_deliveries": false
    }',
    '{
      "chats_per_month": 10,
      "words_per_month": 1000,
      "voice_minutes_per_month": 10,
      "image_shopping_count": 5,
      "online_shopping_count": 5,
      "free_deliveries_count": 0
    }'
  ),
  
  (
    'Market PRO', 
    'Premium features with increased limits', 
    25000.00, 
    'NGN',
    'monthly',
    '{
      "standard_support": true,
      "priority_support": true,
      "image_shopping": true,
      "online_shopping": true,
      "group_shopping": true,
      "auto_shopper": false,
      "voice_mode": true,
      "free_deliveries": false
    }',
    '{
      "chats_per_month": -1,
      "words_per_month": 10000,
      "voice_minutes_per_month": 120,
      "image_shopping_count": 20,
      "online_shopping_count": 20,
      "free_deliveries_count": 0
    }'
  ),
  
  (
    'OjaPRIME', 
    'Full access with unlimited usage and premium features', 
    150000.00, 
    'NGN',
    'monthly',
    '{
      "standard_support": true,
      "priority_support": true,
      "premium_support": true,
      "image_shopping": true,
      "online_shopping": true,
      "group_shopping": true,
      "auto_shopper": true,
      "voice_mode": true,
      "free_deliveries": true
    }',
    '{
      "chats_per_month": -1,
      "words_per_month": -1,
      "voice_minutes_per_month": -1,
      "image_shopping_count": -1,
      "online_shopping_count": -1,
      "free_deliveries_count": 10
    }'
  );

-- Enable Row Level Security (RLS)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Anyone can read subscription plans
CREATE POLICY "Anyone can read subscription plans" 
  ON subscription_plans FOR SELECT 
  USING (true);

-- Only admins can modify subscription plans
CREATE POLICY "Only admins can create/update/delete subscription plans" 
  ON subscription_plans FOR ALL 
  USING (auth.uid() IN (SELECT auth.uid() FROM auth.users WHERE auth.email() IN ('admin@example.com')));

-- Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions" 
  ON user_subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

-- Only authorized users can create/update subscriptions
CREATE POLICY "Authorized users can create/update subscriptions" 
  ON user_subscriptions FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.uid() IN (SELECT auth.uid() FROM auth.users WHERE auth.email() IN ('admin@example.com')));

CREATE POLICY "Authorized users can update subscriptions" 
  ON user_subscriptions FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT auth.uid() FROM auth.users WHERE auth.email() IN ('admin@example.com')));

-- Usage tracking policies
CREATE POLICY "Users can view their own usage" 
  ON subscription_usage FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" 
  ON subscription_usage FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.uid() IN (SELECT auth.uid() FROM auth.users WHERE auth.email() IN ('admin@example.com')));

CREATE POLICY "Authorized users can update usage" 
  ON subscription_usage FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT auth.uid() FROM auth.users WHERE auth.email() IN ('admin@example.com'))); 