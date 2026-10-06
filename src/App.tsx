import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order, ProductCategory } from './types';
import { fetchProducts } from './services/api';
import { INITIAL_PRODUCTS } from './data/products';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustBar } from './components/TrustBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { BrandStory } from './components/BrandStory';
import { ReviewsSection } from './components/ReviewsSection';
import { ContactSection } from './components/ContactSection';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { Clock, Sparkles, Filter, X } from 'lucide-react';

const LOCAL_CART_KEY = 'aroyal_cart_v2';

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Cart state with localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Coupons & Discounts
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);

  // Active Category & Filters
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Watches' | 'Perfumes'>('All');
  const [subFilter, setSubFilter] = useState<'All' | 'BestSellers' | 'NewArrivals'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Panels
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState<string>('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Save cart whenever it updates
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to sync cart to localStorage', err);
    }
  }, [cart]);

  // Recalculate discount whenever cart or coupon changes
  useEffect(() => {
    if (appliedCoupon === 'ROYAL10') {
      const subtotal = cart.reduce((acc, item) => {
        const price = item.product.salePrice || item.product.price;
        return acc + price * item.quantity;
      }, 0);
      setDiscount(Math.round(subtotal * 0.1));
    } else {
      setDiscount(0);
    }
  }, [cart, appliedCoupon]);

  // Load products on mount
  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const prods = await fetchProducts();
      setProducts(prods);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Cart Handlers
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex].quantity = Math.min(product.stock, newQty);
        return updated;
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleBuyNow = (product: Product, quantity: number) => {
    handleAddToCart(product, quantity);
    setSelectedProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleApplyCoupon = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === 'ROYAL10' || clean === 'VIP10') {
      setAppliedCoupon('ROYAL10');
      return true;
    }
    return false;
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setCart([]);
    localStorage.removeItem(LOCAL_CART_KEY);
    setIsCheckoutOpen(false);
    setConfirmedOrder(order);
  };

  const handleOpenTrackSpecificOrder = (orderId: string) => {
    setTrackOrderId(orderId);
    setIsTrackOrderOpen(true);
  };

  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Filter Products
  const filteredProducts = products.filter((product) => {
    // 1. Category Filter (Strictly Watches or Perfumes only)
    if (selectedCategory !== 'All' && product.category !== selectedCategory) {
      return false;
    }

    // 2. Sub Filter
    if (subFilter === 'BestSellers' && !product.bestSeller) {
      return false;
    }
    if (subFilter === 'NewArrivals' && !product.newArrival) {
      return false;
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchCat = product.category.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchShort = product.shortDescription?.toLowerCase().includes(q);
      const matchSpecs = Object.values(product.specifications || {}).some((v) =>
        v.toLowerCase().includes(q)
      );
      if (!matchName && !matchCat && !matchDesc && !matchShort && !matchSpecs) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-[#151515]">
      {/* Header */}
      <Header
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTrackOrder={() => {
          setTrackOrderId('');
          setIsTrackOrderOpen(true);
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSubFilter('All');
        }}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onExploreWatches={() => {
            setSelectedCategory('Watches');
            setSubFilter('All');
            const el = document.getElementById('catalog');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onExplorePerfumes={() => {
            setSelectedCategory('Perfumes');
            setSubFilter('All');
            const el = document.getElementById('catalog');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Trust Value Props */}
        <TrustBar />

        {/* PRODUCTS CATALOG SECTION */}
        <section id="catalog" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#eee8de]">
            <div>
              <p className="text-[11px] uppercase font-bold tracking-[0.25em] text-[#8b7650] mb-1">
                The Curated Collection
              </p>
              <h2 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-bold text-[#151515]">
                {selectedCategory === 'All'
                  ? 'Masterpieces & Signature Scents'
                  : selectedCategory === 'Watches'
                  ? 'Luxury Horology Collection'
                  : 'Haute Parfumerie & Pure Oud'}
              </h2>
            </div>

            {/* Filter Tabs (Interactive Filter Controls) */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category selector */}
              <div className="inline-flex p-1 bg-[#eee8de]/70 rounded-none border border-[#dfd8cc]">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    selectedCategory === 'All'
                      ? 'bg-[#151515] text-[#eee8de] shadow-sm'
                      : 'text-[#555] hover:text-[#151515]'
                  }`}
                >
                  All ({products.length})
                </button>
                <button
                  onClick={() => setSelectedCategory('Watches')}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === 'Watches'
                      ? 'bg-[#151515] text-[#eee8de] shadow-sm'
                      : 'text-[#555] hover:text-[#151515]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-[#8b7650]" />
                  <span>Watches ({products.filter((p) => p.category === 'Watches').length})</span>
                </button>
                <button
                  onClick={() => setSelectedCategory('Perfumes')}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === 'Perfumes'
                      ? 'bg-[#151515] text-[#eee8de] shadow-sm'
                      : 'text-[#555] hover:text-[#151515]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#8b7650]" />
                  <span>Perfumes ({products.filter((p) => p.category === 'Perfumes').length})</span>
                </button>
              </div>

              {/* Sub-Filters */}
              <div className="inline-flex gap-1.5 ml-auto sm:ml-2">
                <button
                  onClick={() => setSubFilter('All')}
                  className={`px-3 py-1.5 text-xs font-medium border cursor-pointer transition-colors ${
                    subFilter === 'All'
                      ? 'bg-white border-[#151515] text-[#151515] font-semibold'
                      : 'border-transparent text-[#777] hover:text-[#151515]'
                  }`}
                >
                  Featured
                </button>
                <button
                  onClick={() => setSubFilter('BestSellers')}
                  className={`px-3 py-1.5 text-xs font-medium border cursor-pointer transition-colors ${
                    subFilter === 'BestSellers'
                      ? 'bg-white border-[#151515] text-[#151515] font-semibold'
                      : 'border-transparent text-[#777] hover:text-[#151515]'
                  }`}
                >
                  Best Sellers
                </button>
                <button
                  onClick={() => setSubFilter('NewArrivals')}
                  className={`px-3 py-1.5 text-xs font-medium border cursor-pointer transition-colors ${
                    subFilter === 'NewArrivals'
                      ? 'bg-white border-[#151515] text-[#151515] font-semibold'
                      : 'border-transparent text-[#777] hover:text-[#151515]'
                  }`}
                >
                  New Arrivals
                </button>
              </div>
            </div>
          </div>

          {/* Active Search Notification */}
          {searchQuery && (
            <div className="mb-6 p-3 bg-[#f5efe4] border border-[#dfd8cc] flex items-center justify-between text-xs text-[#8b7650]">
              <span>
                Displaying results matching: <strong className="text-[#151515]">"{searchQuery}"</strong> ({filteredProducts.length} items found)
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs uppercase font-bold text-[#151515] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Filter</span>
              </button>
            </div>
          )}

          {/* Product Grid */}
          {loadingProducts ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#8b7650] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#777] uppercase tracking-wider">
                Loading Luxury Atelier Catalog...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-24 text-center bg-white border border-[#eee8de] p-8 space-y-3">
              <p className="font-['Playfair_Display',serif] text-xl font-semibold text-[#151515]">
                No Masterpieces Found
              </p>
              <p className="text-xs text-[#777] max-w-sm mx-auto">
                No items matched your selected criteria. Try resetting your search or choosing another collection.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSubFilter('All');
                  setSearchQuery('');
                }}
                className="px-6 py-2.5 bg-[#151515] text-[#eee8de] text-xs font-semibold uppercase tracking-wider hover:bg-[#8b7650] hover:text-white transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={(p) => setSelectedProduct(p)}
                  onAddToCart={(p, qty) => handleAddToCart(p, qty || 1)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Heritage Story */}
        <BrandStory />

        {/* Customer Reviews */}
        <ReviewsSection />

        {/* Concierge & WhatsApp Contact */}
        <ContactSection />

        {/* VIP Newsletter */}
        <Newsletter />
      </main>

      {/* Footer */}
      <Footer
        onOpenTrackOrder={() => {
          setTrackOrderId('');
          setIsTrackOrderOpen(true);
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSubFilter('All');
          const el = document.getElementById('catalog');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* --- MODALS & DRAWERS --- */}

      {/* 1. Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, q) => handleAddToCart(p, q)}
        onBuyNow={(p, q) => handleBuyNow(p, q)}
      />

      {/* 2. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCheckout}
        discount={discount}
        onApplyCoupon={handleApplyCoupon}
        appliedCoupon={appliedCoupon}
      />

      {/* 3. Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        discount={discount}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* 4. Order Confirmation Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onTrackOrder={(id) => handleOpenTrackSpecificOrder(id)}
      />

      {/* 5. Track Order Modal */}
      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
        initialOrderId={trackOrderId}
      />

      {/* 6. Admin Portal Modal */}
      <AdminPortalModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onRefreshProducts={loadProducts}
      />
    </div>
  );
}
