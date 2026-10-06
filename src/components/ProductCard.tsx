import React, { useState } from 'react';
import { Product } from '../types';
import { ShoppingBag, Eye, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
}) => {
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    onAddToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock <= 0;

  // Fallback placeholder image if network drops
  const fallbackImage =
    product.category === 'Watches'
      ? 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-white border border-[#eee8de] flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer relative"
    >
      {/* Visual Asset Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f7f5f0]">
        <img
          src={imageError ? fallbackImage : product.image}
          alt={product.name}
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Subtle Tag (at most 1 subtle text tag, zero-pill discipline) */}
        {product.salePrice ? (
          <div className="absolute top-3 left-3 bg-[#151515] text-[#eee8de] text-[10px] uppercase font-bold tracking-widest px-2.5 py-1">
            Special Offer
          </div>
        ) : product.newArrival ? (
          <div className="absolute top-3 left-3 bg-[#8b7650] text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1">
            New Arrival
          </div>
        ) : product.bestSeller ? (
          <div className="absolute top-3 left-3 bg-[#f3ede3] text-[#8b7650] border border-[#dfd8cc] text-[10px] uppercase font-bold tracking-widest px-2.5 py-1">
            Best Seller
          </div>
        ) : null}

        {/* Quick View Hover Button */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-center">
          <span className="inline-flex items-center gap-1.5 text-xs text-white uppercase tracking-wider font-semibold drop-shadow">
            <Eye className="w-3.5 h-3.5" />
            View Details
          </span>
        </div>
      </div>

      {/* Content Metadata */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Stock Indicator */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-[#8b7650] mb-1.5">
            <span>{product.category}</span>
            {isOutOfStock ? (
              <span className="text-neutral-400 font-normal">Sold Out</span>
            ) : isLowStock ? (
              <span className="text-amber-700 font-medium">{product.stock} Left</span>
            ) : (
              <span className="text-[#666] font-normal">In Stock</span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-['Playfair_Display',serif] text-base sm:text-lg font-semibold text-[#151515] group-hover:text-[#8b7650] transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="mt-1 text-xs text-[#666] line-clamp-2 leading-relaxed">
            {product.shortDescription || product.description}
          </p>
        </div>

        {/* Price & Add to Cart Button */}
        <div className="mt-4 pt-3 border-t border-[#f4efe6]">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-[#151515] font-mono tabular-nums">
                PKR {product.salePrice ? product.salePrice.toLocaleString() : product.price.toLocaleString()}
              </span>
              {product.salePrice && (
                <span className="text-xs text-[#999] line-through font-mono tabular-nums">
                  PKR {product.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-3 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isOutOfStock
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-800 text-white'
                : 'bg-[#faf8f5] text-[#151515] border border-[#dfd8cc] hover:bg-[#151515] hover:text-white hover:border-[#151515]'
            }`}
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
