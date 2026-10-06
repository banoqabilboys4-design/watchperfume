import React from 'react';
import { INITIAL_REVIEWS } from '../data/products';
import { Star, ShieldCheck, Quote } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  return (
    <section id="reviews" className="py-20 bg-white border-t border-[#eee8de]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <p className="text-[11px] uppercase font-bold tracking-[0.25em] text-[#8b7650]">
            Patron Testimonials
          </p>
          <h2 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-bold tracking-tight text-[#151515]">
            Reflections of Discerning Connoisseurs
          </h2>
          <p className="text-xs sm:text-sm text-[#666]">
            Verified reviews from patrons across Pakistan and the international diaspora.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {INITIAL_REVIEWS.slice(0, 3).map((review) => (
            <div
              key={review.id}
              className="p-6 bg-[#faf9f6] border border-[#eee8de] flex flex-col justify-between relative group hover:shadow-lg transition-all"
            >
              <div>
                {/* Rating stars & verified badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-[#8b7650]">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#8b7650]" />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-semibold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Verified Buyer</span>
                  </div>
                </div>

                {/* Comment quote */}
                <p className="text-xs sm:text-sm text-[#444] font-serif leading-relaxed italic mb-6">
                  "{review.comment}"
                </p>
              </div>

              {/* Author & Product */}
              <div className="pt-4 border-t border-[#eee8de]">
                <p className="font-semibold text-xs text-[#151515]">{review.author}</p>
                <p className="text-[11px] text-[#777]">{review.location}</p>
                <div className="mt-2 text-[10px] uppercase font-bold tracking-wider text-[#8b7650]">
                  Acquired: {review.productName}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
