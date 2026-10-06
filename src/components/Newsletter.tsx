import React, { useState } from 'react';
import { Mail, ArrowRight, Check, Copy } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
  };

  const handleCopyVoucher = () => {
    navigator.clipboard.writeText('ROYAL10');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 bg-[#151515] text-[#eee8de] border-t border-[#2d2a26]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <p className="text-[11px] uppercase font-bold tracking-[0.25em] text-[#c9ad79]">
          The Private Salon · A.royal VIP
        </p>

        <h2 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-bold tracking-tight text-white max-w-xl mx-auto leading-tight">
          Receive Private Access to Numbered Horology Releases & Rare Extraits
        </h2>

        <p className="text-xs sm:text-sm text-[#aaa] max-w-md mx-auto leading-relaxed">
          Members receive preview access to limited series timepieces, private olfactory launches, and an instant 10% welcome privilege.
        </p>

        {!subscribed ? (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-2 pt-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-[#777] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full pl-10 pr-4 py-3 bg-[#222] border border-[#3a3a3a] text-xs text-white placeholder:text-[#666] focus:outline-none focus:border-[#c9ad79]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#c9ad79] text-[#151515] hover:bg-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Join</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <div className="max-w-md mx-auto p-4 bg-[#242424] border border-[#c9ad79]/40 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-semibold">
              <Check className="w-4 h-4" />
              <span>Welcome to the Private Salon. Here is your 10% VIP voucher:</span>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className="font-mono text-base font-bold text-[#c9ad79] bg-[#151515] px-4 py-1.5 border border-[#3a3a3a]">
                ROYAL10
              </span>
              <button
                onClick={handleCopyVoucher}
                className="text-xs text-[#aaa] hover:text-white p-2 border border-[#444] cursor-pointer flex items-center gap-1"
                title="Copy code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
