import React from 'react';
import { ShieldCheck, Lock, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

interface FooterProps {
  onOpenTrackOrder: () => void;
  onOpenAdmin: () => void;
  onSelectCategory: (category: 'Watches' | 'Perfumes') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenTrackOrder,
  onOpenAdmin,
  onSelectCategory,
}) => {
  return (
    <footer className="bg-[#151515] text-[#eee8de] border-t border-[#2d2a26] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#2d2a26]">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-baseline gap-1.5">
              <span className="font-['Playfair_Display',serif] text-2xl font-bold tracking-tight text-white">
                A.royal
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9ad79] mb-1"></span>
            </div>
            <p className="text-xs text-[#999] max-w-sm leading-relaxed">
              Curator of master horological timepieces and concentrated signature perfumes. Dedicated to uncompromising refinement, 100% certified authenticity, and white-glove patron care.
            </p>
            <div className="pt-2 text-xs text-[#aaa] space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#c9ad79]" />
                <span>concierge@aroyal.com</span>
              </div>
              <a
                href="https://wa.me/923016145941"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#25D366] hover:underline font-semibold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp: +92 301 6145941 (Chat on WhatsApp)</span>
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#c9ad79]" />
                <span>Executive Boutiques: Lahore · Karachi · Islamabad</span>
              </div>
            </div>
          </div>

          {/* Timepieces Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9ad79]">
              Horology
            </h4>
            <ul className="space-y-2 text-xs text-[#aaa]">
              <li>
                <button
                  onClick={() => onSelectCategory('Watches')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  All Luxury Watches
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Watches')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Dual-Chrono Calibres
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Watches')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Automatic Exhibition Watches
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Watches')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Maritime Divers (300M)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Watches')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Tourbillon Skeleton Series
                </button>
              </li>
            </ul>
          </div>

          {/* Perfumes Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9ad79]">
              Haute Parfumerie
            </h4>
            <ul className="space-y-2 text-xs text-[#aaa]">
              <li>
                <button
                  onClick={() => onSelectCategory('Perfumes')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  All Signature Scents
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Perfumes')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Cambodian Aged Oud
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Perfumes')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Extrait de Parfum (30%+)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Perfumes')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Golden Amber Resins
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Perfumes')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Sultan's Blend Pure Parfum
                </button>
              </li>
            </ul>
          </div>

          {/* Patron Care & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9ad79]">
              Patron Services
            </h4>
            <ul className="space-y-2 text-xs text-[#aaa]">
              <li>
                <button
                  onClick={onOpenTrackOrder}
                  className="hover:text-[#c9ad79] text-[#c9ad79] font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Track Live Order</span>
                </button>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Insured Courier Policies</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">2-Year Horology Warranty</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Certificate of Provenance</span>
              </li>
              <li className="pt-2 border-t border-[#2d2a26]">
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-white text-xs font-mono text-[#888] flex items-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3 h-3 text-[#c9ad79]" />
                  <span>Admin Security Portal</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#777] gap-4">
          <p>© 2026 A.royal Luxury Haus. All rights reserved. Registered trademark.</p>
          <div className="flex items-center gap-4 text-[#888]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#c9ad79]" />
              <span>Encrypted Checkout</span>
            </span>
            <span>·</span>
            <span>Cash on Delivery & Bank Transfer</span>
            <span>·</span>
            <span>Insured White-Glove Courier</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
