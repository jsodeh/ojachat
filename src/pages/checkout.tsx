import { ChevronLeft, CreditCard } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter } from "next/router";

const SHIPPING_ADDRESSES = [
  {
    id: "home",
    name: "Home",
    address: "1744 Wheeler Ridge",
    details: "(216) 1849-456",
  },
  {
    id: "office",
    name: "Office",
    address: "425 Buffalo, NY",
    details: "(216) 1849-456",
  },
];

const PAYMENT_METHODS = [
  {
    id: "credit-card",
    name: "Credit Card",
    icon: "/mastercard-logo.png",
  },
  {
    id: "paypal",
    name: "Paypal",
    icon: "/paypal-logo.png",
  },
  {
    id: "google-pay",
    name: "Google Pay",
    icon: "/google-pay-logo.png",
  },
];

const SHIPPING_FEE = 50.00;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount } = useCart();
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold">Checkout</h1>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Shipping to</h2>
            </div>
            <RadioGroup defaultValue="home" className="space-y-3">
              {SHIPPING_ADDRESSES.map((address) => (
                <div
                  key={address.id}
                  className="flex items-center space-x-3 bg-white p-4 rounded-xl"
                >
                  <RadioGroupItem value={address.id} id={address.id} />
                  <div className="flex-1">
                    <label
                      htmlFor={address.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {address.name}
                    </label>
                    <p className="text-sm text-gray-500">{address.address}</p>
                    <p className="text-sm text-gray-500">{address.details}</p>
                  </div>
                  <button className="text-green-700">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        d="M15.8333 4.16667L4.16667 15.8333M4.16667 4.16667L15.8333 15.8333"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Payment Method */}
          <div>
            <h2 className="text-lg font-medium mb-4">Payment method</h2>
            <RadioGroup defaultValue="credit-card" className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center space-x-3 bg-white p-4 rounded-xl"
                >
                  <RadioGroupItem value={method.id} id={method.id} />
                  <img
                    src={method.icon}
                    alt={method.name}
                    className="h-6 w-auto"
                  />
                  <label
                    htmlFor={method.id}
                    className="flex-1 text-sm font-medium cursor-pointer"
                  >
                    {method.name}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-4 rounded-xl space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Shipping Fee</span>
              <span>₦{SHIPPING_FEE.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Sub total</span>
              <span>₦{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-semibold pt-3 border-t">
              <span>Total</span>
              <span>₦{(totalAmount + SHIPPING_FEE).toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Button */}
          <Button
            className="w-full bg-green-700 hover:bg-green-800 text-white py-6"
            onClick={() => {
              // Handle payment logic here
              console.log("Processing payment...");
            }}
          >
            Payment
          </Button>
        </div>
      </div>
    </div>
  );
} 