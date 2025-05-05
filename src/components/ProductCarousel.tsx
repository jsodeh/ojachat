import { Product } from "@/types/chat";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Heart, Star } from "lucide-react";
import { useState } from "react";
import ProductModal from "./ProductModal";

interface ProductCarouselProps {
  products: Product[];
  className?: string;
}

const ProductCarousel = ({ products, className }: ProductCarouselProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (!products?.length) return null;

  return (
    <>
      <div className={cn("w-full max-w-3xl mx-auto my-4", className)}>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full relative"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {products.map((product) => (
              <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                <Card 
                  className="relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
                  onClick={() => setSelectedProduct(product)}
                >
                  <button 
                    className="absolute top-3 right-3 z-10 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle favorite toggle
                    }}
                  >
                    <Heart className="h-4 w-4 text-gray-600" />
                  </button>
                  <div className="relative aspect-square">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">4.5</span>
                    </div>
                    <h3 className="font-medium text-sm mb-1 text-gray-900 line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="text-base font-semibold text-gray-900">
                      ₦{product.price.toLocaleString()}
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute -left-4 -right-4 top-0 bottom-0 flex items-center justify-between">
            <CarouselPrevious className="relative translate-x-0 translate-y-0 left-0" />
            <CarouselNext className="relative translate-x-0 translate-y-0 right-0" />
          </div>
        </Carousel>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={true}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
};

export default ProductCarousel; 