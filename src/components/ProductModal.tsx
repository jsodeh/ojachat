import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Minus, Plus, Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface ProductModalProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    rating: number;
    ratingCount: number;
  };
  open: boolean;
  onClose: () => void;
}

const COLORS = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Gray", value: "#808080" },
  { name: "Red", value: "#FF0000" },
  { name: "Blue", value: "#0000FF" },
];

const ProductModal = ({ product, open, onClose }: ProductModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      selectedColor: selectedColor.name,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            Back
          </button>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2 rounded-full transition-colors ${
              isFavorite
                ? "bg-red-50 text-red-500"
                : "hover:bg-gray-100 text-gray-400"
            }`}
          >
            <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </DialogHeader>

        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover rounded-xl"
          />
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            SALE
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Color</h4>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor.name === color.name
                      ? "border-green-500"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center text-yellow-400">
                <Star className="h-4 w-4 fill-current" />
                <span className="ml-1 text-sm text-gray-600">
                  {product.rating} ({product.ratingCount})
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className={`text-gray-600 text-sm ${!showFullDescription && "line-clamp-2"}`}>
              {product.description}
            </p>
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-sm text-gray-500 hover:text-gray-700 mt-1"
            >
              {showFullDescription ? "Read less" : "Read more"}
            </button>
          </div>

          <div className="text-xl font-bold">₦{product.price.toLocaleString()}</div>

          <div className="flex items-center justify-between bg-gray-50 rounded-full p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 hover:bg-white rounded-full"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 hover:bg-white rounded-full"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <Button
            onClick={handleAddToCart}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-6"
          >
            Add to cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal; 