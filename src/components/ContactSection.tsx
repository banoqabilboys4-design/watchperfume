import React from 'react';
import { MessageCircle, Mail, Phone, MapPin, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="py-20 bg-[#faf9f6] border-t border-[#eee8de]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <p className="text-[11px] uppercase font-bold tracking-[0.25em] text-[#8b7650]">
            Concierge & Inquiries
          </p>
          <h2 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-bold tracking-tight text-[#151515]">
            At Your Service
          </h2>
          <p className="text-xs sm:text-sm text-[#666]">
            Whether inquiring about a bespoke horological timekeeper, fragrance recommendations, or parcel logistics, our executive team is reachable 7 days a week.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. WhatsApp Priority Card */}
          <div className="p-8 bg-white border border-[#25D366]/40 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#25D366]/5 rounded-bl-full pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-full bg-[#25D366]/15 text-[#128C7E] flex items-center justify-center mb-5">
                <MessageCircle className="w-6 h-6 text-[#25D366]" />
              </div>
              <h3 className="font-['Playfair_Display',serif] text-lg font-bold text-[#151515]">
                WhatsApp Live Concierge
              </h3>
              <p className="text-xs text-[#666] mt-2 leading-relaxed">
                Connect directly with our master watchmakers and fragrance consultants for real-time video inspection, custom sizing, and instantaneous order assistance.
              </p>
              <div className="mt-4 font-mono text-sm font-bold text-[#151515]">
                +92 301 6145941
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#f4efe6]">
              <a
                href="https://wa.me/923016145941"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* 2. Email & Formal Desk */}
          <div className="p-8 bg-white border border-[#eee8de] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#f4efe6] text-[#8b7650] flex items-center justify-center mb-5">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-['Playfair_Display',serif] text-lg font-bold text-[#151515]">
                Executive Correspondence
              </h3>
              <p className="text-xs text-[#666] mt-2 leading-relaxed">
                For corporate gifting, numbered collector allocations, and official order dispatch alerts:
              </p>
              <div className="mt-4 space-y-1 text-xs">
                <p className="font-semibold text-[#151515]">concierge@aroyal.com</p>
                <p className="text-[11px] text-[#777]">Orders alert desk: wahab.naseem6040@gmail.com</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#f4efe6]">
              <a
                href="mailto:concierge@aroyal.com"
                className="w-full py-3 px-4 bg-[#151515] hover:bg-[#8b7650] text-[#eee8de] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Send Formal Message</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 3. Boutiques & Hours */}
          <div className="p-8 bg-white border border-[#eee8de] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#f4efe6] text-[#8b7650] flex items-center justify-center mb-5">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-['Playfair_Display',serif] text-lg font-bold text-[#151515]">
                Private Salons & Hours
              </h3>
              <p className="text-xs text-[#666] mt-2 leading-relaxed">
                Private viewings available by reservation across Pakistan:
              </p>
              <div className="mt-4 space-y-1.5 text-xs text-[#555]">
                <p className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#8b7650]" />
                  <span>Mon – Sat: 11:00 AM – 9:00 PM PKT</span>
                </p>
                <p className="text-[#888] pl-5">Sunday: By Private Concierge Appointment</p>
                <p className="text-[#333] font-semibold pt-1">
                  Lahore · Karachi · Islamabad
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#f4efe6] text-[11px] text-[#777] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8b7650]" />
              <span>Insured White-Glove Courier Dispatch Nationwide</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
