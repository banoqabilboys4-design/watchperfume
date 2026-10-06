import React, { useState } from 'react';
import { CartItem } from '../types';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck, Check } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  discount: number;
  onApplyCoupon: (code: string) => boolean;
  appliedCoupon: string | null;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  discount,
  onApplyCoupon,
  appliedCoupon,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; error: boolean } | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => {
    const price = item.product.salePrice || item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const freeShippingThreshold = 15000;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingFee = subtotal >= freeShippingThreshold || items.length === 0 ? 0 : 450;
  const total = Math.max(0, subtotal - discount + shippingFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const ok = onApplyCoupon(couponCode.trim());
    if (ok) {
      setCouponMsg({ text: 'VIP discount of 10% applied successfully!', error: false });
      setCouponCode('');
    } else {
      setCouponMsg({ text: 'Invalid promotional voucher code. Try "ROYAL10"', error: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#faf9f6] border-l border-[#eee8de] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-[#eee8de] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#8b7650]" />
              <h2 className="font-['Playfair_Display',serif] text-lg font-bold text-[#151515]">
                Your Shopping Bag
              </h2>
              <span className="text-xs text-[#777] font-medium font-mono">
                ({items.reduce((s, i) => s + i.quantity, 0)})
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-[#151515] transition-colors rounded-full hover:bg-neutral-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-5 py-3 bg-[#f5efe4] border-b border-[#e5dcce] text-xs">
            {amountToFreeShipping === 0 ? (
              <p className="text-emerald-800 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-700" />
                Complimentary insured delivery unlocked!
              </p>
            ) : (
              <p className="text-[#8b7650] font-medium">
                Add <span className="font-bold">PKR {amountToFreeShipping.toLocaleString()}</span> more for complimentary shipping.
              </p>
            )}
            <div className="mt-2 w-full h-1.5 bg-[#dfd8cc] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8b7650] transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-[#ccc] mx-auto stroke-[1.2]" />
                <p className="font-['Playfair_Display',serif] text-lg font-medium text-[#444]">
                  Your bag is currently empty
                </p>
                <p className="text-xs text-[#888] max-w-xs mx-auto">
                  Explore our horological timepieces and concentrated signature perfumes to find your signature piece.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2.5 bg-[#151515] text-[#eee8de] text-xs font-semibold uppercase tracking-wider hover:bg-[#8b7650] hover:text-white transition-all cursor-pointer"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => {
                const itemPrice = item.product.salePrice || item.product.price;
                const itemTotal = itemPrice * item.quantity;

                return (
                  <div
                    key={item.product.id}
                    className="p-3 bg-white border border-[#eee8de] flex gap-3.5 relative group"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-24 rounded bg-neutral-100 overflow-hidden shrink-0 border border-[#eee8de]">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-[#8b7650]">
                            {item.product.category}
                          </p>
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer p-0.5"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="font-['Playfair_Display',serif] text-sm font-semibold text-[#151515] leading-snug">
                          {item.product.name}
                        </h4>
                        <p className="text-xs font-medium text-[#151515] font-mono mt-0.5">
                          PKR {itemPrice.toLocaleString()}
                        </p>
                      </div>

                      {/* Quantity Stepper & Total */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#f7f5f0]">
                        <div className="inline-flex items-center border border-[#dfd8cc] bg-white">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                            className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#555] hover:bg-[#f4efe6] transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-[#151515] font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1))}
                            disabled={item.quantity >= item.product.stock}
                            className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#555] hover:bg-[#f4efe6] transition-colors disabled:opacity-30 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-xs font-bold text-[#151515] font-mono">
                          PKR {itemTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Module */}
          {items.length > 0 && (
            <div className="p-5 bg-white border-t border-[#eee8de] space-y-4">
              {/* Voucher Code Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-[#999] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder={appliedCoupon ? `Applied: ${appliedCoupon}` : 'Voucher: ROYAL10'}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#dfd8cc] bg-[#faf9f6] uppercase tracking-wider focus:outline-none focus:border-[#8b7650]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f4efe6] hover:bg-[#eae1d2] text-[#8b7650] border border-[#dfd8cc] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {couponMsg && (
                <p className={`text-[11px] font-medium ${couponMsg.error ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {couponMsg.text}
                </p>
              )}

              {/* Price Calculation */}
              <div className="space-y-1.5 text-xs text-[#555]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#151515]">PKR {subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>VIP Voucher Discount</span>
                    <span className="font-mono">- PKR {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Insured Courier Delivery</span>
                  <span className="font-mono text-[#151515]">
                    {shippingFee === 0 ? 'Complimentary' : `PKR ${shippingFee.toLocaleString()}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#eee8de] flex justify-between text-sm font-bold text-[#151515]">
                  <span className="font-['Playfair_Display',serif]">Estimated Total</span>
                  <span className="font-mono text-base">PKR {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 px-4 bg-[#151515] text-[#eee8de] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#8b7650] hover:text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#777] uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8b7650]" />
                <span>Verified SSL Checkout · Insured Dispatch</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
