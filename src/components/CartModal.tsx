import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus, Minus, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/router";

interface CartModalProps {
  open: boolean;
  onClose: () => void;
}

const CartModal = ({ open, onClose }: CartModalProps) => {
  const { items, updateQuantity, totalAmount } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <SheetTitle className="text-xl font-semibold">Cart</SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {item.selectedColor && (
                      <div className="absolute -top-1 -right-1">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      ₦{item.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t p-4 space-y-4">
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Selected items ({items.length})</span>
              <span>Total: ₦{totalAmount.toLocaleString()}</span>
            </div>
            <Button 
              className="w-full bg-green-700 hover:bg-green-800 text-white py-6"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartModal; 