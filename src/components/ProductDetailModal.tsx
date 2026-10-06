import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { X, ShoppingBag, Zap, Shield, Check, Truck, Clock, Sparkles, MessageCircle } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image || (product.images && product.images[0]) || '');
      setQuantity(1);
    }
  }, [product?.id]);

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAdd = () => {
    if (product.stock <= 0) return;
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuy = () => {
    if (product.stock <= 0) return;
    onBuyNow(product, quantity);
  };

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative bg-[#faf9f6] w-full max-w-4xl border border-[#eee8de] shadow-2xl overflow-hidden my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-[#444] hover:text-[#151515] bg-white/80 rounded-full border border-[#eee8de] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Column */}
          <div className="p-6 sm:p-8 bg-white border-b md:border-b-0 md:border-r border-[#eee8de] flex flex-col justify-between">
            <div>
              {/* Main Image */}
              <div className="aspect-[4/5] rounded overflow-hidden bg-[#f7f5f0] border border-[#eee8de] mb-4">
                <img
                  src={selectedImage}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transition-all duration-300"
                />
              </div>

              {/* Gallery Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-16 h-16 rounded overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        selectedImage === img
                          ? 'border-[#8b7650] shadow-sm'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Packaging Note */}
            <div className="mt-6 pt-4 border-t border-[#f4efe6] flex items-center gap-2.5 text-xs text-[#666]">
              <Shield className="w-4 h-4 text-[#8b7650] shrink-0" />
              <span>Includes velvet-lined wooden presentation box & authenticity card.</span>
            </div>
          </div>

          {/* Details Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category & Stock */}
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-[#8b7650] mb-2">
                <span>{product.category}</span>
                {isOutOfStock ? (
                  <span className="text-rose-700">Out of Stock</span>
                ) : isLowStock ? (
                  <span className="text-amber-700">Only {product.stock} items remaining</span>
                ) : (
                  <span className="text-emerald-700">In Stock ({product.stock} available)</span>
                )}
              </div>

              {/* Product Title */}
              <h2 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold text-[#151515] leading-tight mb-2">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-bold text-[#151515] font-mono tabular-nums">
                  PKR {product.salePrice ? product.salePrice.toLocaleString() : product.price.toLocaleString()}
                </span>
                {product.salePrice && (
                  <span className="text-sm text-[#999] line-through font-mono tabular-nums">
                    PKR {product.price.toLocaleString()}
                  </span>
                )}
                {product.salePrice && (
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                    Save PKR {(product.price - product.salePrice).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Short & Full Description */}
              <p className="text-xs sm:text-sm text-[#555] leading-relaxed mb-4">
                {product.description}
              </p>

              {/* Horological / Perfume Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mb-6 p-4 bg-white border border-[#eee8de] rounded-sm space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8b7650]">
                    {product.category === 'Perfumes' ? 'Fragrance Pyramid' : 'Horological Details'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-[10px] uppercase font-semibold text-[#888]">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="text-[#222] font-medium">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions: Quantity + Add + Buy Now */}
            <div className="pt-4 border-t border-[#eee8de] space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#666]">
                  Quantity:
                </span>
                <div className="inline-flex items-center border border-[#dfd8cc] bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock || quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center text-sm font-bold text-[#444] hover:bg-[#f4efe6] transition-colors disabled:opacity-30 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-[#151515] font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={isOutOfStock || quantity >= product.stock}
                    className="w-8 h-8 flex items-center justify-center text-sm font-bold text-[#444] hover:bg-[#f4efe6] transition-colors disabled:opacity-30 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAdd}
                  disabled={isOutOfStock}
                  className={`py-3.5 px-4 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isOutOfStock
                      ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      : added
                      ? 'bg-emerald-800 text-white'
                      : 'bg-white text-[#151515] border border-[#151515] hover:bg-[#151515] hover:text-white'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuy}
                  disabled={isOutOfStock}
                  className="py-3.5 px-4 bg-[#151515] text-[#eee8de] text-xs font-semibold uppercase tracking-wider hover:bg-[#8b7650] hover:text-white transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4 text-[#c9ad79]" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* WhatsApp Concierge Contact Button */}
              <a
                href={`https://wa.me/923016145941?text=Hello%20A.royal,%20I%20am%20inquiring%20about%20the%20${encodeURIComponent(product.name)}%20(PKR%20${(product.salePrice || product.price).toLocaleString()})`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] text-xs font-semibold rounded-none flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Chat on WhatsApp (+92 301 6145941)</span>
              </a>

              {/* Delivery Guarantees */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-[#777]">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#8b7650]" />
                  Express Insured Shipping
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#8b7650]" />
                  Dispatch within 24h
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
