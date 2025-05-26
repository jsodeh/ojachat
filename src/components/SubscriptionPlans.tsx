import { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
 '100 chats per month',
 '2,000 words per month',
 '15 Minutes voice mode',
      'Image Search',
 '2 Market Runs',
 'Priority support'
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
 '3x Basic Plan features',
 'Unlimited voice mode',
 'Unlimited chat and words',
 'Up to 1 hour voice mode',
 '5 Market Runs',
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
 'SMS mode'
    ]
  },
 {
    id: 'prime',
    name: 'PRIME',
    description: 'Unlock the full potential',
    price: {
      monthly: 49.99,
      yearly: 499.99
    },
    features: [
 'Unlimited chats',
 'Unlimited words',
 'Unlimited voice mode',
 'Unlimited image search',
 'Unlimited online shopping',
 '10 Market Runs',
 'Live shopper Mode',
      'Auto Shopper',
 'Auto shopper Mode',
 '24/7 Premium support',
 'WhatsApp and SMS connect',
 'Phone Call Back'
    ]
  }
];

export default function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState<string>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const { subscription, upgradeSubscription } = useSubscription();

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      await upgradeSubscription(selectedPlan as SubscriptionPlan, 'monthly'); // Assuming monthly for now, adjust if needed
      toast.success('Subscription upgraded successfully');
    } catch (error) {
      toast.error('Failed to upgrade subscription');
      console.error('Upgrade error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const freePlanFeatures = [
    'Text based chat (20 chats/month)',
    'Image upload (via attachment icon)',
    'Image search',
    'Personal add to cart',
    'Self pickup',
    'Pay per delivery'
  ];
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Choose Your Plan</h2>
        <p className="text-muted-foreground mt-2">
          Select the plan that best fits your needs
        </p>
      </div>

      <Tabs defaultValue="paid" className="w-full flex flex-col items-center">
        <TabsList className="grid w-full grid-cols-2 max-w-sm mb-4">
          <TabsTrigger value="free" disabled>Free Plan</TabsTrigger>
          <TabsTrigger value="paid">Paid Plans</TabsTrigger>
        </TabsList>
        <TabsContent value="free" className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Free Plan</CardTitle>
              <CardDescription>Explore the basic features at no cost</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {freePlanFeatures.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" disabled>Current Plan</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="paid" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      ₦{plan.price.monthly.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">/monthly</span>
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
                  <Button className="w-full" variant={selectedPlan === plan.id ? 'default' : 'outline'} onClick={() => setSelectedPlan(plan.id)}>
                    {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

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