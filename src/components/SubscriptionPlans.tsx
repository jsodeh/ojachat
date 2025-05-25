import { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { SubscriptionPlan } from '@/types/subscription';

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Essential features for everyday use',
    price: {
      monthly: 9.99,
      yearly: 99.99
    },
    features: [
      'Text Chat',
      'Image Upload',
      'Image Search',
      'Voice Notes',
      'Web Shopper',
      'Food Delivery',
      'Shop Online'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Advanced features for power users',
    price: {
      monthly: 19.99,
      yearly: 199.99
    },
    features: [
      'All Basic Features',
      'Screenshare',
      'SMS Mode',
      'Whatsapp Assistant',
      'Auto Shopper',
      'Follow up Calls',
      'Priority Support'
    ]
  }
];

export default function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('basic');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const { subscription, upgradeSubscription } = useSubscription();

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      await upgradeSubscription(selectedPlan, billingCycle);
      toast.success('Subscription upgraded successfully');
    } catch (error) {
      toast.error('Failed to upgrade subscription');
      console.error('Upgrade error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Choose Your Plan</h2>
        <p className="text-muted-foreground mt-2">
          Select the plan that best fits your needs
        </p>
      </div>

      <div className="flex justify-center">
        <RadioGroup
          value={billingCycle}
          onValueChange={(value) => setBillingCycle(value as 'monthly' | 'yearly')}
          className="flex items-center space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="monthly" id="monthly" />
            <Label htmlFor="monthly">Monthly</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yearly" id="yearly" />
            <Label htmlFor="yearly">Yearly (Save 20%)</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              selectedPlan === plan.id ? 'border-primary' : ''
            }`}
          >
            {selectedPlan === plan.id && (
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">
                  ${plan.price[billingCycle]}
                </span>
                <span className="text-muted-foreground">/{billingCycle}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={selectedPlan === plan.id ? 'default' : 'outline'}
                onClick={() => setSelectedPlan(plan.id as SubscriptionPlan)}
              >
                {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleUpgrade}
          disabled={isLoading || !selectedPlan}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Upgrade Now'
          )}
        </Button>
      </div>
    </div>
  );
} 