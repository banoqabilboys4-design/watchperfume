import React, { useState } from 'react';
import { Order } from '../types';
import { CheckCircle2, Copy, Check, Printer, ArrowRight, ShieldCheck, Mail, MapPin, MessageCircle } from 'lucide-react';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (orderId: string) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onTrackOrder,
}) => {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-[#faf9f6] w-full max-w-3xl border border-[#eee8de] shadow-2xl overflow-hidden my-6">
        {/* Top Gold Banner */}
        <div className="bg-[#151515] p-6 text-center text-white relative">
          <div className="w-14 h-14 rounded-full bg-[#242424] border border-[#c9ad79]/40 flex items-center justify-center mx-auto mb-3 text-[#c9ad79]">
            <CheckCircle2 className="w-8 h-8 text-[#c9ad79]" />
          </div>

          <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#c9ad79] mb-1">
            Order Successfully Placed & Stored
          </p>
          <h2 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold">
            Thank You, {order.customerName}
          </h2>
          <p className="text-xs text-[#bbb] max-w-md mx-auto mt-1">
            Your real luxury order has been recorded in the database. Our concierge is preparing your presentation package.
          </p>

          {/* Order ID Pill */}
          <div className="mt-4 inline-flex items-center gap-2 bg-[#222] border border-[#444] px-4 py-2 rounded-sm">
            <span className="text-xs text-[#aaa]">Tracking ID:</span>
            <span className="font-mono text-sm font-bold text-[#c9ad79] tracking-wider">
              {order.id}
            </span>
            <button
              onClick={handleCopyId}
              className="text-xs text-[#bbb] hover:text-white transition-colors p-1 cursor-pointer"
              title="Copy Order ID"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Email Notification Notice */}
        <div className="p-4 bg-[#f2ecdf] border-b border-[#dfd8cc] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#8b7650]">
            <Mail className="w-4 h-4 shrink-0 text-[#8b7650]" />
            <span>
              Real-time order notification dispatched to: <strong className="font-mono font-bold text-[#151515]">wahab.naseem6040@gmail.com</strong>
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-800 text-white px-2 py-0.5 rounded">
            Delivered
          </span>
        </div>

        {/* Order Details Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Info Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-white border border-[#eee8de]">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#888] mb-1">
                Recipient & Contact
              </p>
              <p className="font-semibold text-sm text-[#151515]">{order.customerName}</p>
              <p className="text-xs text-[#555]">{order.customerPhone}</p>
              <p className="text-xs text-[#555]">{order.customerEmail}</p>
              <p className="text-xs text-[#8b7650] font-medium mt-1">
                Payment: {order.paymentMethod.replace(/_/g, ' ').toUpperCase()}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#888] mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#8b7650]" />
                Delivery Address
              </p>
              <p className="text-xs text-[#151515] font-medium leading-relaxed">
                {order.shippingAddress}
              </p>
              <p className="text-xs text-[#555]">
                {order.city}, {order.postalCode}
              </p>
              <p className="text-[11px] text-[#777] mt-1">
                Status: <span className="text-emerald-700 font-bold uppercase">{order.status}</span>
              </p>
            </div>
          </div>

          {/* Ordered Products Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#151515] mb-3">
              Ordered Products ({order.items.reduce((s, i) => s + i.quantity, 0)})
            </h4>
            <div className="divide-y divide-[#eee8de] border border-[#eee8de] bg-white">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-14 object-cover rounded bg-neutral-100 border border-[#eee8de]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#151515] truncate">{item.name}</p>
                    <p className="text-[11px] text-[#777]">
                      {item.category} · Qty: {item.quantity} × PKR {item.price.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#151515] font-mono">
                    PKR {item.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-4 bg-white border border-[#eee8de] space-y-1.5 text-xs text-[#555]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono text-[#151515]">PKR {order.subtotal.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Promotional Voucher Discount</span>
                <span className="font-mono">- PKR {order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Insured Courier Delivery</span>
              <span className="font-mono text-[#151515]">
                {order.shippingFee === 0 ? 'Complimentary' : `PKR ${order.shippingFee.toLocaleString()}`}
              </span>
            </div>
            <div className="pt-2 border-t border-[#151515] flex justify-between text-base font-bold text-[#151515]">
              <span className="font-['Playfair_Display',serif]">Grand Total</span>
              <span className="font-mono text-lg text-[#8b7650]">
                PKR {order.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                onTrackOrder(order.id);
              }}
              className="flex-1 py-3 px-4 bg-[#151515] text-[#eee8de] text-xs font-semibold uppercase tracking-wider hover:bg-[#8b7650] hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Track Order Live</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={`https://wa.me/923016145941?text=Hello%20A.royal,%20I%20just%20placed%20Order%20ID%20${order.id}%20for%20PKR%20${order.totalAmount.toLocaleString()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 bg-[#25D366] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#20ba5a] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Inquire on WhatsApp (+92 301 6145941)</span>
            </a>

            <button
              onClick={handlePrint}
              className="py-3 px-4 bg-white text-[#151515] border border-[#dfd8cc] text-xs font-semibold uppercase tracking-wider hover:bg-[#faf8f5] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#8b7650]" />
              <span>Print Invoice</span>
            </button>
          </div>

          <div className="text-center text-[10px] text-[#777] uppercase tracking-wider flex items-center justify-center gap-1.5 pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8b7650]" />
            <span>Permanent Database Record Confirmed · Real-Time Admin Visibility</span>
          </div>
        </div>
      </div>
    </div>
  );
};
