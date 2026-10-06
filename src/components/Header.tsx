import React, { useState } from 'react';
import { ShoppingBag, Search, ShieldCheck, Menu, X, Clock, Sparkles, MessageCircle } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenTrackOrder: () => void;
  onOpenAdmin: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectCategory: (category: 'All' | 'Watches' | 'Perfumes') => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenTrackOrder,
  onOpenAdmin,
  searchQuery,
  onSearchChange,
  onSelectCategory,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [topBannerVisible, setTopBannerVisible] = useState(true);

  const handleNav = (category?: 'All' | 'Watches' | 'Perfumes', targetId?: string) => {
    if (category) onSelectCategory(category);
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Subtle Luxury Announcement Banner */}
      {topBannerVisible && (
        <div className="bg-[#151515] text-[#eee8de] text-[11px] tracking-widest uppercase font-medium px-4 py-2 flex items-center justify-between border-b border-[#2d2a26]">
          <div className="flex-1 text-center">
            <span className="text-[#c9ad79] font-semibold">Haute Horlogerie & Parfumerie</span>
            <span className="mx-2 text-[#666]">·</span>
            <span>Complimentary Insured Courier on Orders Over PKR 15,000</span>
          </div>
          <button
            onClick={() => setTopBannerVisible(false)}
            className="text-neutral-400 hover:text-white text-xs p-1 cursor-pointer transition-colors"
            title="Dismiss"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#faf9f6]/95 backdrop-blur-md border-b border-[#eee8de] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#151515] hover:text-[#c9ad79] transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Brand Logo Zone */}
            <div className="flex-shrink-0 flex items-center">
              <a
                href="#hero"
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('All', 'hero');
                }}
                className="group flex flex-col items-start cursor-pointer"
              >
                <div className="flex items-baseline gap-1.5">
                  <span className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-extrabold tracking-tight text-[#151515] group-hover:text-[#8b7650] transition-colors">
                    A.royal
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c9ad79] mb-1"></span>
                </div>
                <span className="text-[9px] tracking-[0.25em] uppercase text-[#8b7650] font-semibold -mt-1 hidden sm:block">
                  Luxury That Defines You
                </span>
              </a>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.15em] text-[#444]">
              <button
                onClick={() => handleNav('All', 'hero')}
                className="hover:text-[#151515] hover:border-b-2 hover:border-[#c9ad79] pb-1 transition-all cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => handleNav('Watches', 'catalog')}
                className="flex items-center gap-1 hover:text-[#151515] hover:border-b-2 hover:border-[#c9ad79] pb-1 transition-all cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-[#8b7650]" />
                Watches
              </button>
              <button
                onClick={() => handleNav('Perfumes', 'catalog')}
                className="flex items-center gap-1 hover:text-[#151515] hover:border-b-2 hover:border-[#c9ad79] pb-1 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8b7650]" />
                Perfumes
              </button>
              <button
                onClick={() => handleNav(undefined, 'story')}
                className="hover:text-[#151515] hover:border-b-2 hover:border-[#c9ad79] pb-1 transition-all cursor-pointer"
              >
                Heritage
              </button>
              <button
                onClick={() => handleNav(undefined, 'reviews')}
                className="hover:text-[#151515] hover:border-b-2 hover:border-[#c9ad79] pb-1 transition-all cursor-pointer"
              >
                Reviews
              </button>
              <button
                onClick={() => handleNav(undefined, 'contact')}
                className="hover:text-[#151515] hover:border-b-2 hover:border-[#c9ad79] pb-1 transition-all cursor-pointer"
              >
                Contact
              </button>
              <button
                onClick={onOpenTrackOrder}
                className="hover:text-[#151515] hover:border-b-2 hover:border-[#c9ad79] pb-1 transition-all cursor-pointer text-[#8b7650]"
              >
                Track Order
              </button>
            </nav>

            {/* Action Zone: Search, Track, Admin, Cart */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-[#444] hover:text-[#151515] transition-colors cursor-pointer"
                aria-label="Search catalog"
                title="Search luxury catalog"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* WhatsApp Concierge */}
              <a
                href="https://wa.me/923016145941"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1.5 bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-colors"
                title="Chat on WhatsApp (+92 301 6145941)"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp</span>
              </a>

              {/* Admin Portal Button */}
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 bg-[#f4efe6] hover:bg-[#eae1d2] text-[#8b7650] border border-[#dfd8cc] rounded transition-colors cursor-pointer"
                title="Admin Security & Order Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#8b7650]" />
                <span className="hidden sm:inline">Admin</span>
              </button>

              {/* Cart Drawer Trigger */}
              <button
                onClick={onOpenCart}
                className="relative flex items-center gap-2 p-2 text-[#151515] hover:text-[#8b7650] transition-colors cursor-pointer"
                aria-label="Open Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#151515] text-[#c9ad79] border border-[#c9ad79]/40 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
                <span className="hidden lg:inline text-xs font-semibold uppercase tracking-wider text-[#444]">
                  Bag
                </span>
              </button>
            </div>
          </div>

          {/* Quick Search Dropdown Bar */}
          {searchOpen && (
            <div className="py-3 px-2 border-t border-[#eee8de] bg-[#faf9f6] flex items-center gap-3 animate-fadeIn">
              <Search className="w-4 h-4 text-[#8b7650]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search luxury watches, perfumes, sapphire, oud, extrait..."
                className="flex-1 bg-transparent border-none text-sm text-[#151515] focus:outline-none placeholder:text-[#999]"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="text-xs text-[#666] hover:text-[#151515]"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setSearchOpen(false)}
                className="text-xs text-[#8b7650] font-semibold uppercase tracking-wider hover:underline"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Mobile Slide-Down Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 px-6 border-t border-[#eee8de] bg-[#faf9f6] flex flex-col gap-3 text-sm font-medium animate-fadeIn">
            <button
              onClick={() => handleNav('All', 'hero')}
              className="text-left py-2 hover:text-[#8b7650] transition-colors border-b border-[#f0ebd1]"
            >
              Home
            </button>
            <button
              onClick={() => handleNav('Watches', 'catalog')}
              className="text-left py-2 flex items-center justify-between hover:text-[#8b7650] transition-colors border-b border-[#f0ebd1]"
            >
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#8b7650]" />
                Luxury Watches
              </span>
              <span className="text-xs text-[#8b7650] uppercase font-bold">Chronographs & Automatics</span>
            </button>
            <button
              onClick={() => handleNav('Perfumes', 'catalog')}
              className="text-left py-2 flex items-center justify-between hover:text-[#8b7650] transition-colors border-b border-[#f0ebd1]"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8b7650]" />
                Haute Parfumerie
              </span>
              <span className="text-xs text-[#8b7650] uppercase font-bold">Extraits & Oud</span>
            </button>
            <button
              onClick={() => handleNav(undefined, 'story')}
              className="text-left py-2 hover:text-[#8b7650] transition-colors border-b border-[#f0ebd1]"
            >
              Heritage & Craftsmanship
            </button>
            <button
              onClick={() => handleNav(undefined, 'reviews')}
              className="text-left py-2 hover:text-[#8b7650] transition-colors border-b border-[#f0ebd1]"
            >
              Customer Reviews
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTrackOrder();
              }}
              className="text-left py-2 text-[#8b7650] font-semibold flex items-center gap-2 border-b border-[#f0ebd1]"
            >
              Track Your Order Status
            </button>
            <a
              href="https://wa.me/923016145941"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left py-2 text-[#128C7E] font-semibold flex items-center gap-2 border-b border-[#f0ebd1]"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Chat on WhatsApp (+92 301 6145941)</span>
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="text-left py-2 text-[#8b7650] font-semibold flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Management Portal
            </button>
          </div>
        )}
      </header>
    </>
  );
};
