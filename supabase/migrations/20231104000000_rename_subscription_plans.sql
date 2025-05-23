-- Rename subscription plans to follow the new naming scheme

-- Rename "Market PRO" to "OjaPRIME PRO"
UPDATE subscription_plans 
SET name = 'OjaPRIME PRO',
    description = 'OjaPRIME PRO features with increased limits'
WHERE name = 'Market PRO';

-- Rename "OjaPRIME" to "OjaPRIME MAX"
UPDATE subscription_plans 
SET name = 'OjaPRIME MAX',
    description = 'OjaPRIME MAX with unlimited usage and premium features'
WHERE name = 'OjaPRIME';

-- Update payment links to reflect the new plan names
UPDATE payment_links
SET link_url = 'https://paystack.com/pay/ojaprime-pro'
WHERE link_url = 'https://paystack.com/pay/ojachat-pro';

UPDATE payment_links
SET link_url = 'https://paystack.com/pay/ojaprime-max'
WHERE link_url = 'https://paystack.com/pay/ojachat-prime'; 