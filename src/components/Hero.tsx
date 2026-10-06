import React from 'react';
import { ArrowRight, Sparkles, Shield, Clock, Award } from 'lucide-react';

interface HeroProps {
  onExploreWatches: () => void;
  onExplorePerfumes: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreWatches,
  onExplorePerfumes,
}) => {
  return (
    <section id="hero" className="relative pt-8 pb-16 md:py-20 overflow-hidden">
      {/* Decorative ambient subtle glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#f0ebd1]/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Brand Statement */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f3ede3] text-[#8b7650] border border-[#e5dcce]">
              <Sparkles className="w-3.5 h-3.5 text-[#a88849]" />
              <span className="text-[11px] font-semibold uppercase tracking-widest">
                Curated Luxury Boutique · Est. 2026
              </span>
            </div>

            <h1 className="font-['Playfair_Display',serif] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#151515] leading-[1.12]">
              Timeless Precision & <br className="hidden sm:inline" />
              <span className="italic font-normal text-[#8b7650]">Signature Scents</span>
            </h1>

            <p className="text-base sm:text-lg text-[#555] max-w-xl font-normal leading-relaxed">
              A.royal unites two worlds of uncompromising luxury: Swiss-grade horological timepieces and rare concentrated haute parfumerie. Curated for those who command distinction.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <button
                onClick={onExploreWatches}
                className="inline-flex items-center gap-2 px-7 py-4 bg-[#151515] text-[#eee8de] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#8b7650] hover:text-white transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>Explore Timepieces</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExplorePerfumes}
                className="inline-flex items-center gap-2 px-7 py-4 bg-white text-[#151515] border border-[#dfd8cc] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#faf8f5] hover:border-[#151515] transition-all shadow-sm cursor-pointer"
              >
                <span>Discover Scents</span>
                <Sparkles className="w-3.5 h-3.5 text-[#8b7650]" />
              </button>
            </div>

            {/* Trust Highlights */}
            <div className="pt-8 border-t border-[#eee8de] grid grid-cols-3 gap-6">
              <div>
                <p className="font-['Playfair_Display',serif] text-xl font-bold text-[#151515]">
                  100%
                </p>
                <p className="text-[11px] uppercase tracking-wider text-[#777] font-medium mt-0.5">
                  Certified Authentic
                </p>
              </div>
              <div>
                <p className="font-['Playfair_Display',serif] text-xl font-bold text-[#151515]">
                  30%
                </p>
                <p className="text-[11px] uppercase tracking-wider text-[#777] font-medium mt-0.5">
                  Pure Oil Extrait
                </p>
              </div>
              <div>
                <p className="font-['Playfair_Display',serif] text-xl font-bold text-[#151515]">
                  Insured
                </p>
                <p className="text-[11px] uppercase tracking-wider text-[#777] font-medium mt-0.5">
                  Courier Delivery
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase (Matching reference's dual overlapping showcase cards) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-sm overflow-hidden bg-gradient-to-br from-[#ddd7cb] via-[#b3a898] to-[#8d8578] shadow-2xl border border-[#d6cec0]">
              <div className="h-[460px] sm:h-[500px] flex items-center justify-center p-6 relative">
                {/* Background ambient lighting */}
                <div className="absolute inset-0 bg-radial from-white/20 to-transparent pointer-events-none" />

                {/* Card 1: Featured Watch (Rotated Left) */}
                <div className="w-44 sm:w-56 bg-white/95 backdrop-blur-md p-3.5 rounded shadow-xl border border-white/70 transform -rotate-3 hover:rotate-0 transition-transform duration-500 z-10">
                  <div className="aspect-[4/5] overflow-hidden rounded bg-neutral-100 mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=80"
                      alt="Royal Chronograph"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8b7650]">
                    Master Watchmaker
                  </p>
                  <p className="font-['Playfair_Display',serif] text-sm font-semibold text-[#151515] mt-0.5">
                    Royal Chronograph
                  </p>
                  <p className="text-xs font-semibold text-[#8b7650] mt-0.5">
                    PKR 24,999
                  </p>
                </div>

                {/* Card 2: Featured Perfume (Rotated Right) */}
                <div className="w-40 sm:w-52 bg-white/95 backdrop-blur-md p-3.5 rounded shadow-xl border border-white/70 transform rotate-3 hover:rotate-0 transition-transform duration-500 mt-12 -ml-6 z-20">
                  <div className="aspect-[4/5] overflow-hidden rounded bg-neutral-100 mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=80"
                      alt="Royal Oud"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8b7650]">
                    Haute Parfumerie
                  </p>
                  <p className="font-['Playfair_Display',serif] text-sm font-semibold text-[#151515] mt-0.5">
                    Royal Oud Extrait
                  </p>
                  <p className="text-xs font-semibold text-[#8b7650] mt-0.5">
                    PKR 14,500
                  </p>
                </div>

                {/* Floating Seal Badge */}
                <div className="absolute bottom-4 right-4 bg-black/85 backdrop-blur-md text-[#c9ad79] px-3.5 py-1.5 rounded text-[10px] tracking-widest uppercase font-semibold border border-[#c9ad79]/30">
                  Curated Edition
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Strip */}
        <div className="mt-14 pt-8 border-t border-[#eee8de] grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f4efe6] flex items-center justify-center text-[#8b7650] shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#151515]">
                100% Genuine
              </p>
              <p className="text-[11px] text-[#666]">Inspected by horologists</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f4efe6] flex items-center justify-center text-[#8b7650] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#151515]">
                2-Year Warranty
              </p>
              <p className="text-[11px] text-[#666]">Comprehensive guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f4efe6] flex items-center justify-center text-[#8b7650] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#151515]">
                Extrait Concentration
              </p>
              <p className="text-[11px] text-[#666]">14+ hours longevity</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f4efe6] flex items-center justify-center text-[#8b7650] shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#151515]">
                Luxury Packaging
              </p>
              <p className="text-[11px] text-[#666]">Velvet wooden gift casing</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
