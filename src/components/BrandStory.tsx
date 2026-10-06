import React from 'react';
import { Clock, Sparkles, Award } from 'lucide-react';

export const BrandStory: React.FC = () => {
  return (
    <section id="story" className="py-20 bg-[#f7f5f0] border-t border-[#eee8de]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Visual Composition */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="aspect-[3/4] rounded-sm overflow-hidden bg-neutral-200 border border-[#eee8de] shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=700&q=80"
                  alt="A.royal Horology Assembly"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 bg-white border border-[#eee8de]">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#8b7650]">
                  Micro-Horology
                </p>
                <p className="text-xs text-[#555] mt-1 font-serif">
                  Hand-regulated balance wheels & surgical steel.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <div className="p-4 bg-[#151515] text-[#eee8de]">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#c9ad79]">
                  Pure Essences
                </p>
                <p className="text-xs text-[#bbb] mt-1 font-serif">
                  Wild agarwood aged for 7 years before blending.
                </p>
              </div>
              <div className="aspect-[3/4] rounded-sm overflow-hidden bg-neutral-200 border border-[#eee8de] shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=700&q=80"
                  alt="A.royal Fragrance Flacon"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Prose */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f3ede3] text-[#8b7650] border border-[#e5dcce]">
              <Award className="w-3.5 h-3.5 text-[#a88849]" />
              <span className="text-[11px] font-semibold uppercase tracking-widest">
                Our Sovereign Philosophy
              </span>
            </div>

            <h2 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-bold tracking-tight text-[#151515] leading-tight">
              Where Precision Horology Meets the Art of Concentrated Perfumery
            </h2>

            <p className="text-sm sm:text-base text-[#555] leading-relaxed">
              Founded on the belief that true luxury requires neither exaggeration nor compromise, <strong>A.royal</strong> curates exclusively two forms of personal expression: the timepiece you carry into history, and the scent that announces your arrival.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="p-5 bg-white border border-[#eee8de]">
                <div className="flex items-center gap-2 text-[#8b7650] mb-2">
                  <Clock className="w-4 h-4" />
                  <h3 className="font-['Playfair_Display',serif] text-base font-bold text-[#151515]">
                    The Horology Atelier
                  </h3>
                </div>
                <p className="text-xs text-[#666] leading-relaxed">
                  Every A.royal watch employs 316L medical-grade stainless steel, scratchproof domed sapphire crystals, and precision automatic or chronograph movements inspected for strict beat variance.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#eee8de]">
                <div className="flex items-center gap-2 text-[#8b7650] mb-2">
                  <Sparkles className="w-4 h-4" />
                  <h3 className="font-['Playfair_Display',serif] text-base font-bold text-[#151515]">
                    Haute Parfumerie
                  </h3>
                </div>
                <p className="text-xs text-[#666] leading-relaxed">
                  Formulated at concentrated Extrait de Parfum potencies (up to 35% pure oil), our signature fragrances feature authentic wild agarwood oud, rare Taif rose, and French amber resins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
