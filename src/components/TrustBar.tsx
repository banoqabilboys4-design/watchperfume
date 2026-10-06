import React from 'react';
import { ShieldCheck, Truck, Sparkles, Clock } from 'lucide-react';

export const TrustBar: React.FC = () => {
  return (
    <section className="bg-white border-y border-[#eee8de] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-[#f5efe4] text-[#8b7650] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-['Playfair_Display',serif] text-sm font-bold text-[#151515]">
                Certified Authenticity
              </h4>
              <p className="text-xs text-[#666] mt-0.5 leading-relaxed">
                Every timepiece and perfume flacon comes with our official numbered certificate of provenance.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-[#f5efe4] text-[#8b7650] flex items-center justify-center shrink-0 mt-0.5">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-['Playfair_Display',serif] text-sm font-bold text-[#151515]">
                Insured Nationwide Courier
              </h4>
              <p className="text-xs text-[#666] mt-0.5 leading-relaxed">
                Complimentary insured express delivery on orders over PKR 15,000 with real-time tracking.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-[#f5efe4] text-[#8b7650] flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-['Playfair_Display',serif] text-sm font-bold text-[#151515]">
                Rare Concentrated Extraits
              </h4>
              <p className="text-xs text-[#666] mt-0.5 leading-relaxed">
                Perfumes formulated with 25-35% essential oil concentration for majestic longevity.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-[#f5efe4] text-[#8b7650] flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-['Playfair_Display',serif] text-sm font-bold text-[#151515]">
                2-Year Horology Warranty
              </h4>
              <p className="text-xs text-[#666] mt-0.5 leading-relaxed">
                Comprehensive international guarantee covering movements, seals, and workmanship.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
