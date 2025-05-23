import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Check, ShoppingCart, MessageSquare, Clock, Image, Users, Truck } from "lucide-react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BillingCycle = "monthly" | "annually";

const SubscriptionModal = ({ isOpen, onClose }: SubscriptionModalProps) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  const plans = [
    {
      name: "Basic",
      description: "For personal use with self pickup.",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "20 Chats per month",
        "500 words per month",
        "5 Minutes voice mode",
        "Self Pickup",
        "Standard support"
      ],
      popular: false,
      color: "bg-white dark:bg-gray-800"
    },
    {
      name: "Market PRO",
      description: "Enhanced features with home deliveries.",
      monthlyPrice: 25000,
      annualPrice: 250000,
      features: [
        "100 chats per month",
        "2,000 words per month",
        "30 Minutes voice mode",
        "2 Home Deliveries",
        "Image shopping (20 Max)",
        "Online shopping",
        "Priority support"
      ],
      popular: true,
      color: "bg-green-50 dark:bg-green-900"
    },
    {
      name: "OjaPRIME",
      description: "Premium plan with unlimited features.",
      monthlyPrice: 150000,
      annualPrice: 1620000,
      features: [
        "Unlimited chats",
        "Unlimited words",
        "Unlimited voice mode",
        "Unlimited image shopping",
        "Unlimited online shopping",
        "10 Home deliveries",
        "Auto shopper",
        "24/7 Premium support"
      ],
      popular: false,
      color: "bg-white dark:bg-gray-800"
    }
  ];

  const handlePlanSelect = (planName: string) => {
    console.log(`Selected plan: ${planName}`);
    // Implement payment processing logic here
    onClose();
  };

  const getDiscountPercentage = (monthly: number, annual: number) => {
    if (monthly === 0) return 0;
    const monthlyTotal = monthly * 12;
    const savings = monthlyTotal - annual;
    return Math.round((savings / monthlyTotal) * 100);
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "Free";
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-w-[90%] p-0 gap-0 bg-green-50 dark:bg-gray-900 border-0 my-4 sm:my-6 max-h-[90vh] overflow-hidden">
        <div className="p-6 sm:p-8 max-w-full overflow-y-auto max-h-[80vh]">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">Choose the plan</h2>
            <p className="text-gray-500 dark:text-gray-400">Get started now</p>
          </div>

          {/* Billing toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-1 inline-flex">
              <button
                onClick={() => setBillingCycle("annually")}
                className={`px-4 py-2 rounded-md text-sm ${
                  billingCycle === "annually"
                    ? "bg-green-600 text-white"
                    : "bg-transparent text-gray-700 dark:text-gray-300"
                }`}
              >
                Annually
                {billingCycle === "annually" && (
                  <span className="ml-2 text-xs bg-green-700 text-white px-1.5 py-0.5 rounded-full">
                    Save 10%
                  </span>
                )}
              </button>
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-md text-sm ${
                  billingCycle === "monthly"
                    ? "bg-green-600 text-white"
                    : "bg-transparent text-gray-700 dark:text-gray-300"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Plans grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`${plan.color} rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-green-600 text-white text-xs px-2 py-1 rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{plan.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{plan.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(billingCycle === "monthly" ? plan.monthlyPrice : Math.round(plan.annualPrice / 12))}
                      </span>
                      {plan.monthlyPrice > 0 && <span className="text-gray-500 dark:text-gray-400 ml-1">/ Month</span>}
                    </div>
                    {billingCycle === "annually" && plan.monthlyPrice > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Billed {formatCurrency(plan.annualPrice)} annually
                        <span className="ml-1 text-green-600 dark:text-green-400">
                          (Save {getDiscountPercentage(plan.monthlyPrice, plan.annualPrice)}%)
                        </span>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="mr-2 mt-1">
                          <div className="h-4 w-4 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePlanSelect(plan.name)}
                    className={`w-full ${
                      plan.popular
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.monthlyPrice === 0 ? "Get Started" : "Subscribe"}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            All plans include access to the OjaChat marketplace. No credit card required for basic plan.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal; 