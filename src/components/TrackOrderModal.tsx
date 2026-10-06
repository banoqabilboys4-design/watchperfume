import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { trackOrder } from '../services/api';
import { X, Search, PackageCheck, CheckCircle, Truck, MapPin, AlertCircle, Loader2, MessageCircle } from 'lucide-react';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

const STATUS_STEPS: OrderStatus[] = ['Order Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  initialOrderId = '',
}) => {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [verification, setVerification] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  React.useEffect(() => {
    if (initialOrderId && isOpen) {
      setOrderId(initialOrderId);
    }
  }, [initialOrderId, isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setSearched(true);
    setErrorMessage(null);

    try {
      const result = await trackOrder(orderId.trim(), verification.trim());
      if (result.order) {
        setOrder(result.order);
      } else {
        setOrder(null);
        setErrorMessage(result.error || 'No matching order found in the database.');
      }
    } catch (err: any) {
      console.error(err);
      setOrder(null);
      setErrorMessage(err.message || 'Error communicating with tracking service.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'Cancelled') return -1;
    // Map legacy 'Pending' to 'Order Placed'
    const normalizedStatus = status === 'Pending' ? 'Order Placed' : status;
    return STATUS_STEPS.indexOf(normalizedStatus as OrderStatus);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-[#faf9f6] w-full max-w-2xl border border-[#eee8de] shadow-2xl overflow-hidden my-4 sm:my-8">
        {/* Header */}
        <div className="p-5 border-b border-[#eee8de] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-[#8b7650]" />
            <div>
              <h2 className="font-['Playfair_Display',serif] text-lg font-bold text-[#151515]">
                Real Order Tracking
              </h2>
              <p className="text-[11px] text-[#777]">
                Live database fulfillment tracking for watches & perfumes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-[#151515] transition-colors rounded-full hover:bg-neutral-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Verification Search Form */}
        <div className="p-6 bg-[#faf8f5] border-b border-[#eee8de]">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#666] mb-1">
                  1. Order ID *
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-[#8b7650] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. AR-2026-10892"
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-[#dfd8cc] bg-white uppercase font-mono tracking-wider focus:outline-none focus:border-[#8b7650]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#666] mb-1">
                  2. Phone or Email *
                </label>
                <input
                  type="text"
                  required
                  value={verification}
                  onChange={(e) => setVerification(e.target.value)}
                  placeholder="e.g. 03001234567 or email"
                  className="w-full px-3.5 py-2.5 text-xs border border-[#dfd8cc] bg-white focus:outline-none focus:border-[#8b7650]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-[#777]">
                Requires valid Order ID and contact matching the database record.
              </span>
              <button
                type="submit"
                disabled={loading || !orderId.trim()}
                className="px-6 py-2.5 bg-[#151515] text-[#eee8de] text-xs font-semibold uppercase tracking-wider hover:bg-[#8b7650] hover:text-white transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#c9ad79]" /> : 'Track Order'}
              </button>
            </div>
          </form>
        </div>

        {/* Results Area */}
        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#8b7650] mx-auto" />
              <p className="text-xs text-[#777]">Querying live database...</p>
            </div>
          ) : searched && !order ? (
            <div className="py-10 text-center space-y-3 bg-white border border-[#eee8de] p-6">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <p className="font-['Playfair_Display',serif] text-base font-semibold text-[#151515]">
                {errorMessage || 'Order Not Found'}
              </p>
              <p className="text-xs text-[#777] max-w-sm mx-auto leading-relaxed">
                Please verify that your Order ID and phone/email match your checkout receipt. You can also chat with our concierge on WhatsApp:
              </p>
              <a
                href="https://wa.me/923016145941"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#25D366] text-white rounded text-xs font-semibold hover:bg-[#20ba5a] transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp (+92 301 6145941)</span>
              </a>
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Status Header */}
              <div className="p-5 bg-white border border-[#eee8de] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f4efe6] pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#888] tracking-wider block">
                      Order Reference
                    </span>
                    <h3 className="font-mono text-base font-bold text-[#8b7650]">
                      {order.id}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#888] tracking-wider block">
                      Order Date
                    </span>
                    <p className="text-xs text-[#151515] font-medium">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Tracking Progress Timeline */}
                {order.status === 'Cancelled' ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded text-center font-semibold">
                    This order was cancelled by administrator or patron request.
                  </div>
                ) : (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#666] mb-4">
                      Current Stage: <span className="text-[#8b7650] font-bold">{order.status === 'Pending' ? 'Order Placed' : order.status}</span>
                    </p>

                    {/* Step Timeline */}
                    <div className="grid grid-cols-5 gap-2 relative">
                      {STATUS_STEPS.map((step, idx) => {
                        const currentIdx = getStepIndex(order.status);
                        const isDone = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div key={step} className="flex flex-col items-center text-center">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-1 ${
                                isCurrent
                                  ? 'bg-[#8b7650] text-white ring-4 ring-[#8b7650]/20'
                                  : isDone
                                  ? 'bg-[#151515] text-[#c9ad79]'
                                  : 'bg-[#eee8de] text-neutral-400'
                              }`}
                            >
                              {isDone ? '✓' : idx + 1}
                            </div>
                            <span
                              className={`text-[10px] font-semibold leading-tight ${
                                isDone ? 'text-[#151515]' : 'text-neutral-400'
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Destination & Ordered Products */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-[#eee8de] text-xs">
                  <p className="text-[10px] uppercase font-bold text-[#888] tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#8b7650]" />
                    Delivery Destination
                  </p>
                  <p className="font-semibold text-[#151515]">{order.customerName}</p>
                  <p className="text-[#666] leading-relaxed">{order.shippingAddress}</p>
                  <p className="text-[#666]">{order.city}, {order.postalCode}</p>
                  <p className="text-[#8b7650] font-mono mt-1">{order.customerPhone}</p>
                </div>

                <div className="p-4 bg-white border border-[#eee8de] text-xs flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#888] tracking-wider mb-1">
                      Ordered Products ({order.items.length})
                    </p>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-[#555]">
                          <span className="truncate pr-2">{it.quantity}x {it.name}</span>
                          <span className="font-mono text-[#151515] shrink-0">PKR {it.total.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#f4efe6] flex justify-between font-bold text-[#151515]">
                    <span>Total Amount:</span>
                    <span className="font-mono text-sm text-[#8b7650]">PKR {order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Support CTA */}
              <div className="p-3.5 bg-[#25D366]/10 border border-[#25D366]/20 rounded-sm flex items-center justify-between text-xs text-[#128C7E]">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 shrink-0 text-[#25D366]" />
                  <span>Questions about your parcel? Chat with dispatch concierge.</span>
                </div>
                <a
                  href={`https://wa.me/923016145941?text=Hello%20A.royal,%20inquiring%20about%20Order%20ID%20${order.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline hover:opacity-80 shrink-0 ml-2"
                >
                  WhatsApp Concierge
                </a>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#777] space-y-1">
              <p>Enter your Order ID (from invoice) and your phone number or email to view real status.</p>
              <p className="text-[11px] text-[#999]">All telemetry is fetched live from the database.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
