import React, { useState } from 'react';
import { CartItem, Order } from '../types';
import { placeOrder } from '../services/api';
import { X, Lock, ShieldCheck, Truck, CreditCard, Building2, Banknote, AlertCircle, Loader2 } from 'lucide-react';
import { STORE_SETTINGS } from '../data/products';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  discount: number;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  discount,
  onOrderSuccess,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    orderNotes: '',
    paymentMethod: 'cash_on_delivery' as 'cash_on_delivery' | 'bank_transfer' | 'credit_card',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => {
    const price = item.product.salePrice || item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const shippingFee = subtotal >= STORE_SETTINGS.freeShippingThreshold ? 0 : STORE_SETTINGS.standardShippingFee;
  const totalAmount = Math.max(0, subtotal - discount + shippingFee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter your full recipient name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      setErrorMsg('Please enter a valid reachable contact phone number.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Please enter a valid email address for receipt delivery.');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('Please enter your complete street address for courier dispatch.');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMsg('Please specify your destination city.');
      return;
    }
    if (!formData.postalCode.trim()) {
      setErrorMsg('Please enter your postal / zip code.');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Your shopping bag is empty.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        customerName: formData.fullName,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        shippingAddress: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        orderNotes: formData.orderNotes,
        paymentMethod: formData.paymentMethod,
        items: items.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          category: i.product.category,
          price: i.product.salePrice || i.product.price,
          quantity: i.quantity,
          image: i.product.image,
        })),
        discount,
      };

      const placed = await placeOrder(orderPayload);
      onOrderSuccess(placed);
    } catch (err: any) {
      console.error('Order checkout error:', err);
      setErrorMsg(err.message || 'An error occurred while processing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-[#faf9f6] w-full max-w-4xl border border-[#eee8de] shadow-2xl overflow-hidden my-4 sm:my-8">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#eee8de] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-[#8b7650]" />
            <div>
              <h2 className="font-['Playfair_Display',serif] text-xl font-bold text-[#151515]">
                A.royal Secure Checkout
              </h2>
              <p className="text-[11px] text-[#777] uppercase tracking-wider">
                Direct Courier Dispatch · Order Notification to Logistics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-neutral-400 hover:text-[#151515] transition-colors rounded-full hover:bg-neutral-100 cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#eee8de]">
            {/* Left Column: Customer & Shipping Details */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="font-['Playfair_Display',serif] text-base font-semibold text-[#151515] mb-3">
                  1. Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#666] mb-1">
                      Full Recipient Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Wahab Nadeem"
                      className="w-full px-3.5 py-2.5 text-xs border border-[#dfd8cc] bg-white rounded-none focus:outline-none focus:border-[#8b7650]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#666] mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +92 300 1234567"
                      className="w-full px-3.5 py-2.5 text-xs border border-[#dfd8cc] bg-white rounded-none focus:outline-none focus:border-[#8b7650]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#666] mb-1">
                      Email Address (for Receipt & Tracking) *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. wahab.naseem6040@gmail.com"
                      className="w-full px-3.5 py-2.5 text-xs border border-[#dfd8cc] bg-white rounded-none focus:outline-none focus:border-[#8b7650]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-['Playfair_Display',serif] text-base font-semibold text-[#151515] mb-3">
                  2. Shipping Destination
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#666] mb-1">
                      Complete Street Address *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="House / Apartment #, Street name, Phase / Sector"
                      className="w-full px-3.5 py-2 text-xs border border-[#dfd8cc] bg-white rounded-none focus:outline-none focus:border-[#8b7650]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#666] mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Lahore, Karachi, Islamabad"
                        className="w-full px-3.5 py-2.5 text-xs border border-[#dfd8cc] bg-white rounded-none focus:outline-none focus:border-[#8b7650]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#666] mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        placeholder="e.g. 54000"
                        className="w-full px-3.5 py-2.5 text-xs border border-[#dfd8cc] bg-white rounded-none focus:outline-none focus:border-[#8b7650]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#666] mb-1">
                      Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.orderNotes}
                      onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
                      placeholder="e.g. Ring bell, handle glass bottle with care"
                      className="w-full px-3.5 py-2 text-xs border border-[#dfd8cc] bg-white rounded-none focus:outline-none focus:border-[#8b7650]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-['Playfair_Display',serif] text-base font-semibold text-[#151515] mb-3">
                  3. Payment Method
                </h3>
                <div className="space-y-2.5">
                  <label
                    className={`flex items-start gap-3 p-3.5 border cursor-pointer transition-colors ${
                      formData.paymentMethod === 'cash_on_delivery'
                        ? 'border-[#8b7650] bg-[#fbf9f4]'
                        : 'border-[#dfd8cc] bg-white hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={formData.paymentMethod === 'cash_on_delivery'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'cash_on_delivery' })}
                      className="mt-0.5 text-[#8b7650] focus:ring-[#8b7650]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-[#8b7650]" />
                        <span className="text-xs font-bold text-[#151515] uppercase tracking-wider">
                          Cash on Delivery (COD)
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666] mt-0.5">
                        Inspect the insured parcel upon arrival and pay in cash to the authorized courier agent.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3.5 border cursor-pointer transition-colors ${
                      formData.paymentMethod === 'bank_transfer'
                        ? 'border-[#8b7650] bg-[#fbf9f4]'
                        : 'border-[#dfd8cc] bg-white hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={formData.paymentMethod === 'bank_transfer'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'bank_transfer' })}
                      className="mt-0.5 text-[#8b7650] focus:ring-[#8b7650]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#8b7650]" />
                        <span className="text-xs font-bold text-[#151515] uppercase tracking-wider">
                          Direct Bank Transfer / IBFT
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666] mt-0.5">
                        Meezan Bank Ltd · Account: {STORE_SETTINGS.bankDetails.accountNumber} · IBAN: {STORE_SETTINGS.bankDetails.iban}
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3.5 border cursor-pointer transition-colors ${
                      formData.paymentMethod === 'credit_card'
                        ? 'border-[#8b7650] bg-[#fbf9f4]'
                        : 'border-[#dfd8cc] bg-white hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={formData.paymentMethod === 'credit_card'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'credit_card' })}
                      className="mt-0.5 text-[#8b7650] focus:ring-[#8b7650]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#8b7650]" />
                        <span className="text-xs font-bold text-[#151515] uppercase tracking-wider">
                          Debit / Credit Card
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666] mt-0.5">
                        Visa, Mastercard & UnionPay encrypted token gateway.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Placement */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-white flex flex-col justify-between">
              <div>
                <h3 className="font-['Playfair_Display',serif] text-base font-semibold text-[#151515] mb-4">
                  Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} Items)
                </h3>

                {/* Ordered Items List */}
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1 mb-6">
                  {items.map((item) => {
                    const price = item.product.salePrice || item.product.price;
                    return (
                      <div key={item.product.id} className="flex gap-3 text-xs items-center">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-14 object-cover rounded bg-neutral-100 border border-[#eee8de]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#151515] truncate">
                            {item.product.name}
                          </p>
                          <p className="text-[11px] text-[#777]">
                            Qty: {item.quantity} × PKR {price.toLocaleString()}
                          </p>
                        </div>
                        <span className="font-bold text-[#151515] font-mono">
                          PKR {(price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Calculations */}
                <div className="space-y-2 pt-4 border-t border-[#eee8de] text-xs text-[#555]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono text-[#151515]">PKR {subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Promotional Discount</span>
                      <span className="font-mono">- PKR {discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Insured Nationwide Delivery</span>
                    <span className="font-mono text-[#151515]">
                      {shippingFee === 0 ? 'Complimentary' : `PKR ${shippingFee.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-[#151515] flex justify-between text-base font-bold text-[#151515]">
                    <span className="font-['Playfair_Display',serif]">Grand Total</span>
                    <span className="font-mono text-lg text-[#8b7650]">
                      PKR {totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Notification Guarantee Notice */}
                <div className="mt-6 p-3.5 bg-[#faf8f5] border border-[#dfd8cc] rounded-sm space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8b7650]">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Real-Time Order Routing</span>
                  </div>
                  <p className="text-[11px] text-[#666] leading-relaxed">
                    Upon order submission, a permanent record is saved to the database and an instant order dispatch alert is delivered to our headquarters: <strong className="text-[#333]">wahab.naseem6040@gmail.com</strong>.
                  </p>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-[#151515] text-[#eee8de] text-xs font-semibold uppercase tracking-[0.18em] hover:bg-[#8b7650] hover:text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#c9ad79]" />
                      <span>Transmitting Real Order...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-[#c9ad79]" />
                      <span>Confirm & Place Order (PKR {totalAmount.toLocaleString()})</span>
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-[10px] text-[#777] uppercase tracking-wider flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#8b7650]" />
                  <span>Encrypted 256-Bit SSL Checkout · Genuine Luxury Guarantee</span>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
