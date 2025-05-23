-- Update subscription plan features and add delivery options

-- Update Basic Plan (Free)
UPDATE subscription_plans 
SET features = jsonb_set(
    jsonb_set(
      features, 
      '{delivery_type}', 
      '"self_pickup"'
    ),
    '{free_deliveries}', 
    'false'
  ),
  limits = jsonb_set(
    limits, 
    '{free_deliveries_count}', 
    '0'
  )
WHERE name = 'Basic Plan';

-- Update Market PRO Plan
UPDATE subscription_plans 
SET features = jsonb_set(
    jsonb_set(
      features, 
      '{delivery_type}', 
      '"standard"'
    ),
    '{free_deliveries}', 
    'true'
  ),
  limits = jsonb_set(
    limits, 
    '{free_deliveries_count}', 
    '2'
  )
WHERE name = 'Market PRO';

-- Update OjaPRIME Plan - Step 1: Add delivery features
UPDATE subscription_plans 
SET features = jsonb_set(
    jsonb_set(
      features, 
      '{delivery_type}', 
      '"premium"'
    ),
    '{free_deliveries}', 
    'true'
  ),
  limits = jsonb_set(
    limits, 
    '{free_deliveries_count}', 
    '10'
  )
WHERE name = 'OjaPRIME';

-- Update OjaPRIME Plan - Step 2: Add discount features
UPDATE subscription_plans 
SET features = jsonb_set(
    jsonb_set(
      features,
      '{discount_percent}',
      '30'
    ),
    '{discount_months}',
    '6'
  )
WHERE name = 'OjaPRIME';

-- Create payment_links table for subscription plans
CREATE TABLE IF NOT EXISTS payment_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  link_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert sample payment links
INSERT INTO payment_links (plan_id, provider, link_url, is_active)
SELECT 
  id, 
  'Paystack', 
  CASE 
    WHEN name = 'Market PRO' THEN 'https://paystack.com/pay/ojachat-pro'
    WHEN name = 'OjaPRIME' THEN 'https://paystack.com/pay/ojachat-prime'
    ELSE ''
  END,
  TRUE
FROM subscription_plans
WHERE name IN ('Market PRO', 'OjaPRIME');

-- Enable RLS on payment_links
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to payment links
CREATE POLICY "Allow public read access to payment links" 
ON payment_links FOR SELECT USING (true); 