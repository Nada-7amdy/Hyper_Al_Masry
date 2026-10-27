import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Plus, ShoppingBag, Star, Heart, Percent, ChevronRight, ChevronLeft, 
  Mic, QrCode, Sparkles, Clock, Flame, TrendingUp, ThumbsUp, Check, X, ArrowLeft,
  ShoppingBag as CartIcon, Camera, Tag, MapPin, Building, Home, PlusCircle, Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Category, CATEGORIES, PRODUCTS, POPULAR_SEARCHES, RECENT_SEARCHES, SUGGESTIONS, getActiveCatalogProducts } from '../data';
import { Tab } from '../types';
import { Button, Card, Chip, Input, ProductCard, CategoryCard, Modal, Loader, EmptyState, formatPrice } from './DesignSystem';

// PROMO SLIDES for the e-commerce banner slider
const PROMO_SLIDES = [
  {
    id: 1,
    title: "مهرجان الفواكه الطازجة قطاف الصباح",
    subtitle: "خصم يصل إلى 25% على جميع الفواكه الطازجة والعضوية اليوم",
    badge: "عروض الصيف اليانعة",
    image: "https://images.unsplash.com/photo-1610832958506-ee5633619141?w=1200&auto=format&fit=crop&q=80",
    buttonText: "تسوق الفاكهة الطازجة",
    action: "خضروات وفواكه"
  },
  {
    id: 2,
    title: "قطعيات لحوم بلدية فاخرة طازجة يومياً",
    subtitle: "لحوم بلدي ممتازة خاضعة للرقابة الصحية الدقيقة بخصومات حصرية",
    badge: "جودة بلدية مضمونة",
    image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=1200&auto=format&fit=crop&q=80",
    buttonText: "تصفح اللحوم والمجمدات",
    action: "لحوم ومجمدات"
  },
  {
    id: 3,
    title: "توصيل مجاني فائق السرعة لباب منزلك",
    subtitle: "توصيل مجاني لكل طلبات البقالة والسوبر ماركت التي تتخطى 150 ج.م",
    badge: "سرعة وراحة بال",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200&auto=format&fit=crop&q=80",
    buttonText: "ابدأ ملء سلتك الآن",
    action: null
  }
];


interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  badgeText?: string;
  badgeColor?: string;
  products: Product[];
  cart: any[];
  addToCart: (product: Product) => void;
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  onViewAll?: () => void;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title,
  subtitle,
  icon,
  badgeText,
  badgeColor = "text-emerald-500 bg-emerald-500/10",
  products,
  cart,
  addToCart,
  favorites,
  toggleFavorite,
  onViewAll
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="space-y-0.5 text-right">
          <div className={`flex items-center gap-1.5 justify-end font-extrabold text-[10px] sm:text-xs px-2.5 py-1 rounded-full w-fit ml-auto ${badgeColor}`}>
            {icon}
            <span>{badgeText}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-[10px] sm:text-xs text-slate-400 dark:text-gray-500">{subtitle}</p>}
        </div>
        
        {/* Scroll controllers & View All */}
        <div className="flex items-center gap-3">
          {onViewAll && (
            <button 
              onClick={onViewAll}
              className="text-xs font-bold text-slate-400 hover:text-[#19C37D] transition-colors pl-2"
            >
              شاهد الكل
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => scroll('left')}
              className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:border-[#19C37D] hover:text-[#19C37D] dark:hover:text-[#19C37D] transition-colors cursor-pointer shadow-sm"
              aria-label="السابق"
            >
              <ChevronLeft size={13} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:border-[#19C37D] hover:text-[#19C37D] dark:hover:text-[#19C37D] transition-colors cursor-pointer shadow-sm"
              aria-label="التالي"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide flex-row-reverse snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((p) => (
          <ProductCard 
            key={p.id}
            product={p}
            cart={cart}
            addToCart={addToCart}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </section>
  );
};

interface HomeRedesignProps {
  cart: any[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  setActiveTab: (tab: Tab) => void;
  setIsCartOpen: (open: boolean) => void;
  cartTotal: number;
  selectedCategory: Category | null;
  onSelectCategory: (category: Category | null) => void;
  showToast?: (message: string, type?: 'success' | 'info') => void;
  products?: Product[];
}

export const HomeRedesign: React.FC<HomeRedesignProps> = ({
  cart,
  addToCart,
  favorites,
  toggleFavorite,
  setActiveTab,
  setIsCartOpen,
  cartTotal,
  selectedCategory,
  onSelectCategory,
  showToast = (_msg: string, _type?: 'success' | 'info') => {},
  products
}) => {
  // Filter product sections from full master products list or active catalog
  const activeProducts = products || getActiveCatalogProducts();
  const dealProducts = activeProducts.filter(p => p.isDeal);
  const bestSellers = activeProducts.filter(p => p.isBestSeller);
  const freshProducts = activeProducts.filter(p => p.isFresh);
  const newArrivals = activeProducts.filter(p => p.isRecommended);
  const weeklyOffers = activeProducts.filter(p => p.isSeasonal);
  // State for search experience
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(RECENT_SEARCHES);

  // Delivery Address selector states with LocalStorage persistence
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>(() => {
    return localStorage.getItem('almasri_selected_address') || "المنزل - شارع التسعين، التجمع الخامس";
  });
  const [savedAddresses, setSavedAddresses] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('almasri_saved_addresses');
      return saved ? JSON.parse(saved) : [
        { id: 'addr1', tag: 'المنزل', address: 'شارع التسعين، التجمع الخامس، القاهرة', type: 'home' },
        { id: 'addr2', tag: 'العمل', address: 'مبنى ٣، القرية الذكية، طريق الإسكندرية الصحراوي', type: 'work' },
        { id: 'addr3', tag: 'بيت العائلة', address: 'ش عثمان بن عفان، مصر الجديدة، القاهرة', type: 'family' }
      ];
    } catch {
      return [
        { id: 'addr1', tag: 'المنزل', address: 'شارع التسعين، التجمع الخامس، القاهرة', type: 'home' }
      ];
    }
  });
  const [newAddressText, setNewAddressText] = useState('');
  const [newAddressTag, setNewAddressTag] = useState('أخرى');
  const [isLocating, setIsLocating] = useState(false);

  // Sync address states to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('almasri_selected_address', selectedAddress);
      localStorage.setItem('almasri_saved_addresses', JSON.stringify(savedAddresses));
    } catch {
      // Safe fallback
    }
  }, [selectedAddress, savedAddresses]);

  const detectCurrentLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      showToast("خاصية تحديد الموقع غير مدعومة في متصفحك", "info");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const autoAddr = "موقعي الحالي (GPS) - التجمع الخامس، القاهرة";
        setSelectedAddress(autoAddr);
        const newAddr = {
          id: 'addr_gps_' + Date.now(),
          tag: 'موقعي الحالي',
          address: `إحداثيات: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (التجمع الخامس)`,
          type: 'other'
        };
        setSavedAddresses(prev => [newAddr, ...prev.filter(a => a.tag !== 'موقعي الحالي')]);
        setIsAddressModalOpen(false);
        showToast("تم تحديد موقعك بدقة عبر الـ GPS وتعيينه للتوصيل! 📍", "success");
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation fallback:", err);
        showToast("يرجى اختيار منطقتك الفاخرة من القائمة أدناه 📍", "info");
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };
  
  // Custom interactive dialog states
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceQueryText, setVoiceQueryText] = useState('جاري الاستماع لطلبك...');
  const [isBarcodeScannerActive, setIsBarcodeScannerActive] = useState(false);
  const [scannerStep, setScannerStep] = useState<'idle' | 'scanning' | 'found'>('idle');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);

  // Active Promo slider index
  const [activePromoIndex, setActivePromoIndex] = useState(0);

  // Auto-slide banner promo effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePromoIndex(prev => (prev + 1) % PROMO_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  // Add search query to recent searches
  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    setSearchQuery(query);
    if (!recentSearches.includes(query)) {
      const updated = [query, ...recentSearches.slice(0, 4)];
      setRecentSearches(updated);
    }
    setIsSearchFocused(false);
    
    // Switch to Market Tab and filter by search query
    setActiveTab(Tab.MARKET);
    localStorage.setItem('almasri_search_query', query);
  };

  // Simulated Voice Search
  const triggerVoiceSearch = () => {
    setIsVoiceActive(true);
    setVoiceQueryText('جاري الاستماع لطلبك...');
    
    setTimeout(() => {
      setVoiceQueryText('« زيت زيتون بكر »');
    }, 1500);

    setTimeout(() => {
      setIsVoiceActive(false);
      handleSearchSubmit('زيت زيتون');
    }, 2800);
  };

  // Simulated Barcode Scanner
  const triggerBarcodeScanner = () => {
    setIsBarcodeScannerActive(true);
    setScannerStep('scanning');
    
    setTimeout(() => {
      const dealProd = activeProducts.find(p => p.id === 'p_deal_2') || activeProducts[0];
      setScannedProduct(dealProd);
      setScannerStep('found');
      
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch (e) {
        console.log("Audio beep blocked or unsupported");
      }
    }, 2500);
  };

  return (
    <div className="space-y-8 py-2 max-w-7xl mx-auto">
      
      {/* 1. Dynamic Shopping Greeting, Quick Cart Pill, and Promo Delivery Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/5 pb-4 flex-col-reverse md:flex-row text-right">
        {/* Dynamic Welcoming Greeting text - encourages shopping immediately */}
        <div className="space-y-1 text-right w-full md:w-auto">
          <span className="text-[10px] sm:text-xs font-extrabold text-[#19C37D] bg-[#19C37D]/10 dark:bg-[#19C37D]/15 px-3 py-1 rounded-full inline-block font-cairo">
            🔥 عروض حصرية اليوم في هايبر المصري
          </span>
          <h1 className="text-xl sm:text-3xl font-serif font-extrabold text-slate-900 dark:text-white">
            مرحبًا، ماذا تريد أن تشتري اليوم؟ 🥬
          </h1>
          <p className="text-xs text-slate-400 dark:text-gray-500 font-cairo">
            تسوّق من تشكيلة واسعة من الخضروات، اللحوم، البقالة، والأكثر مبيعًا بخصومات فورية.
          </p>
        </div>

        {/* Quick Cart Pill & Indicator */}
        <div 
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/10 transition-all cursor-pointer group active:scale-95 self-stretch sm:self-auto justify-center"
        >
          <div className="relative">
            <div className="p-1.5 rounded-xl bg-[#19C37D]/10 text-[#19C37D] group-hover:bg-[#19C37D] group-hover:text-black transition-all">
              <CartIcon size={14} />
            </div>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {cart.length}
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 dark:text-gray-500 leading-none font-cairo">سلتك الحالية</p>
            <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1 font-mono">
              {cartTotal > 0 ? formatPrice(cartTotal) : '٠ ج.م'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Full-Width Search Bar */}
      <div className="relative w-full max-w-3xl mx-auto group z-20">
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10">
          <Search size={18} className="text-slate-400 group-focus-within:text-[#19C37D] transition-colors" />
        </div>
        
        <input
          type="text"
          placeholder="ابحث عن أرز، لحوم بلدي، خضروات طازجة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(searchQuery)}
          className="w-full bg-slate-50 dark:bg-[#151515] border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pr-12 pl-24 text-sm focus:outline-none focus:border-[#19C37D]/50 focus:bg-white dark:focus:bg-black transition-all text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:shadow-[0_0_25px_rgba(25,195,125,0.1)] text-right"
          dir="rtl"
        />

        {/* Quick action buttons inside search input */}
        <div className="absolute inset-y-1.5 left-2 flex items-center gap-1 z-10">
          <button 
            onClick={triggerVoiceSearch}
            className="p-2 rounded-xl text-slate-400 hover:text-[#19C37D] hover:bg-slate-200/50 dark:hover:bg-white/10 transition-all cursor-pointer"
            title="البحث الصوتي الذكي"
          >
            <Mic size={16} />
          </button>
          <button 
            onClick={triggerBarcodeScanner}
            className="p-2 rounded-xl text-slate-400 hover:text-[#19C37D] hover:bg-slate-200/50 dark:hover:bg-white/10 transition-all cursor-pointer"
            title="مسح الباركود للكشف عن الأسعار"
          >
            <QrCode size={16} />
          </button>
        </div>

        {/* EXPANDED SMART SEARCH OVERLAY */}
        <AnimatePresence>
          {isSearchFocused && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setIsSearchFocused(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-40 overflow-hidden text-right p-5"
              >
                <div className="space-y-4">
                  {searchQuery ? (
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 font-cairo">اقتراحات مطابقة</p>
                      <div className="space-y-1">
                        {SUGGESTIONS.filter(item => item.text.includes(searchQuery)).map((s, i) => (
                          <button
                            key={i}
                            onClick={() => handleSearchSubmit(s.text)}
                            className="w-full py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between flex-row-reverse text-right transition-colors text-slate-700 dark:text-slate-300 font-cairo"
                          >
                            <span className="text-sm font-medium">{s.text}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-400">{s.category}</span>
                          </button>
                        ))}
                        {SUGGESTIONS.filter(item => item.text.includes(searchQuery)).length === 0 && (
                          <p className="text-xs text-slate-400 py-2 font-cairo">اضغط Enter للبحث عن "{searchQuery}"</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5 justify-end font-cairo">
                          <span>الأكثر بحثاً الآن</span>
                          <Flame size={11} className="text-[#19C37D]" />
                        </p>
                        <div className="flex flex-wrap gap-2 justify-end">
                          {POPULAR_SEARCHES.map((ps, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSearchSubmit(ps)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-[#19C37D]/10 hover:text-[#19C37D] text-slate-600 dark:text-slate-300 border border-slate-200/40 dark:border-white/5 transition-all cursor-pointer font-cairo"
                            >
                              {ps}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-100 dark:border-white/5 pt-3.5 mt-2">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5 justify-end font-cairo">
                          <span>عمليات البحث الأخيرة</span>
                          <Clock size={11} className="text-slate-400" />
                        </p>
                        <div className="space-y-1">
                          {recentSearches.map((rs, idx) => (
                            <div key={idx} className="flex items-center justify-between flex-row-reverse group/rs font-cairo">
                              <button
                                onClick={() => handleSearchSubmit(rs)}
                                className="flex-1 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-[#19C37D] text-right transition-colors"
                              >
                                {rs}
                              </button>
                              <button 
                                onClick={() => setRecentSearches(prev => prev.filter(s => s !== rs))}
                                className="p-1 text-slate-400 hover:text-red-400 opacity-0 group-hover/rs:opacity-100 transition-opacity"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Delivery Address (With Interactive address selector modal) */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-emerald-500/[0.02] to-[#19C37D]/[0.08] dark:from-emerald-500/[0.01] dark:to-[#19C37D]/[0.05] border border-slate-200/60 dark:border-white/5 rounded-2xl p-3.5 text-right flex-row-reverse">
        <div className="flex items-center gap-3 flex-row-reverse w-full sm:w-auto">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 animate-pulse">
            <MapPin size={16} />
          </div>
          <div className="space-y-0.5 text-right">
            <p className="text-[10px] text-slate-400 dark:text-gray-500 leading-none font-cairo">موقع التوصيل المحدد</p>
            <button 
              onClick={() => setIsAddressModalOpen(true)}
              className="text-sm font-black text-slate-800 dark:text-slate-100 hover:text-[#19C37D] transition-colors flex items-center gap-1.5 flex-row-reverse group cursor-pointer mt-0.5 font-cairo"
            >
              <span>{selectedAddress}</span>
              <span className="text-[10px] text-emerald-500 group-hover:underline font-bold font-cairo">(تغيير العنوان)</span>
            </button>
          </div>
        </div>
        <div className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-500/10 dark:bg-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-cairo">
          <Sparkles size={12} />
          <span>توصيل سريع مجاني متاح حالياً للتجمع والخامس! ⚡</span>
        </div>
      </div>

      {/* Interactive Delivery Address selector modal */}
      <Modal 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)} 
        title="اختر عنوان التوصيل"
        size="md"
      >
        {/* GPS Auto-detect Button */}
        <button
          onClick={detectCurrentLocation}
          disabled={isLocating}
          className="w-full mb-4 py-3 px-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer font-cairo shadow-sm"
        >
          {isLocating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <span>جاري تحديد موقعك الجغرافي...</span>
            </>
          ) : (
            <>
              <Navigation size={14} className="animate-pulse" />
              <span>📍 تحديد موقعي الحالي تلقائياً عبر الـ GPS</span>
            </>
          )}
        </button>

        {/* Cairo / Giza Luxury Delivery Zones Chips */}
        <div className="space-y-2 mb-4 text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-cairo">مناطق التوصيل السريع الفاخرة</p>
          <div className="flex flex-wrap gap-1.5 justify-end">
            {[
              { name: "التجمع الخامس", estimate: "25 دقيقة ⚡" },
              { name: "الشيخ زايد", estimate: "35 دقيقة ⚡" },
              { name: "الزمالك", estimate: "20 دقيقة ⚡" },
              { name: "المعادي", estimate: "30 دقيقة ⚡" },
              { name: "مصر الجديدة", estimate: "25 دقيقة ⚡" },
              { name: "المهندسين والدقي", estimate: "25 دقيقة ⚡" }
            ].map(zone => (
              <button
                key={zone.name}
                onClick={() => {
                  const addrStr = `منطقة ${zone.name} - توصيل ${zone.estimate}`;
                  setSelectedAddress(addrStr);
                  setIsAddressModalOpen(false);
                  showToast(`تم تعيين منطقة التوصيل: ${zone.name} 📍 (${zone.estimate})`, 'info');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer font-cairo ${
                  selectedAddress.includes(zone.name)
                    ? 'bg-emerald-500 text-black border-emerald-500 shadow-sm'
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 hover:border-emerald-500/40'
                }`}
              >
                <span>{zone.name}</span>
                <span className="text-[9px] opacity-75 mr-1 font-mono">({zone.estimate})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Saved Addresses list */}
        <div className="space-y-3 mb-5 text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">عناوينك المسجلة</p>
          {savedAddresses.map(addr => (
            <div 
              key={addr.id}
              onClick={() => {
                setSelectedAddress(`${addr.tag} - ${addr.address}`);
                setIsAddressModalOpen(false);
                showToast(`تم تغيير عنوان التوصيل إلى: ${addr.tag} 📍`, 'info');
              }}
              className={`p-4 rounded-2xl border text-right cursor-pointer transition-all flex items-start gap-3 flex-row-reverse ${
                selectedAddress.startsWith(addr.tag)
                  ? 'border-[#19C37D] bg-[#19C37D]/5 dark:bg-[#19C37D]/10'
                  : 'border-slate-200/65 dark:border-white/5 hover:border-emerald-500/30 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 mt-0.5">
                {addr.type === 'home' ? <Home size={16} /> : addr.type === 'work' ? <Building size={16} /> : <MapPin size={16} />}
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between flex-row-reverse">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{addr.tag}</span>
                  {selectedAddress.startsWith(addr.tag) && (
                    <span className="text-[10px] font-bold text-emerald-500 px-2 py-0.5 rounded-full bg-emerald-500/10">المحدد حالياً</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed mt-1">{addr.address}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Custom Address */}
        <div className="border-t border-slate-100 dark:border-white/5 pt-4 space-y-3 text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">إضافة عنوان جديد</p>
          <div className="flex gap-2 flex-row-reverse">
            <input 
              type="text"
              placeholder="اكتب العنوان بالتفصيل هنا..."
              value={newAddressText}
              onChange={(e) => setNewAddressText(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-[#1c1c20] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs text-right focus:outline-none focus:border-[#19C37D]"
              dir="rtl"
            />
            <select
              value={newAddressTag}
              onChange={(e) => setNewAddressTag(e.target.value)}
              className="bg-slate-50 dark:bg-[#1c1c20] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-right focus:outline-none text-slate-800 dark:text-slate-200 font-cairo"
            >
              <option value="المنزل">المنزل</option>
              <option value="العمل">العمل</option>
              <option value="بيت العائلة">بيت العائلة</option>
              <option value="أخرى">أخرى</option>
            </select>
          </div>
          <Button 
            onClick={() => {
              if (!newAddressText.trim()) return;
              const newId = 'addr' + (savedAddresses.length + 1);
              const newAddr = {
                id: newId,
                tag: newAddressTag,
                address: newAddressText,
                type: newAddressTag === 'المنزل' ? 'home' : newAddressTag === 'العمل' ? 'work' : 'other'
              };
              setSavedAddresses(prev => [...prev, newAddr]);
              setSelectedAddress(`${newAddressTag} - ${newAddressText}`);
              setNewAddressText('');
              setIsAddressModalOpen(false);
              showToast("تم حفظ عنوانك الجديد وتحديده للتوصيل! 🏠", "success");
            }}
            fullWidth
            variant="primary"
            className="text-xs py-2.5 h-10 font-bold font-cairo"
            leftIcon={<PlusCircle size={14} />}
          >
            حفظ وتعيين كعنوان التوصيل الحالي
          </Button>
        </div>
      </Modal>

      {/* 4. Promotional Banner (PROMO_SLIDES) */}
      <div className="relative aspect-[21/9] sm:aspect-[24/8] w-full rounded-2xl overflow-hidden shadow-md border border-slate-200/50 dark:border-white/5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePromoIndex}
            initial={{ opacity: 0, scale: 1.015 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0"
          >
            <img 
              src={PROMO_SLIDES[activePromoIndex].image} 
              alt={PROMO_SLIDES[activePromoIndex].title} 
              className="w-full h-full object-cover brightness-[0.38]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/85 via-black/40 to-transparent"></div>

            <div className="absolute inset-y-0 right-0 p-4 sm:p-8 md:p-10 flex flex-col justify-center items-end max-w-lg space-y-2 sm:space-y-3 text-right z-10">
              <span className="text-[8px] sm:text-[10px] font-black tracking-wider px-2.5 py-1 rounded-md bg-[#19C37D] text-black uppercase font-cairo">
                {PROMO_SLIDES[activePromoIndex].badge}
              </span>
              <h2 className="text-sm sm:text-2xl md:text-3xl font-serif font-black text-white leading-tight">
                {PROMO_SLIDES[activePromoIndex].title}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-300 font-medium leading-relaxed line-clamp-2 sm:line-clamp-none font-cairo">
                {PROMO_SLIDES[activePromoIndex].subtitle}
              </p>
              
              <div className="pt-2 sm:pt-3">
                <button
                  onClick={() => {
                    if (PROMO_SLIDES[activePromoIndex].action) {
                      const targetCat = CATEGORIES.find(c => c.name === PROMO_SLIDES[activePromoIndex].action);
                      if (targetCat) onSelectCategory(targetCat);
                    } else {
                      setActiveTab(Tab.MARKET);
                    }
                  }}
                  className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold bg-[#19C37D] hover:bg-[#12a164] hover:scale-105 active:scale-95 text-black transition-all flex items-center gap-1.5 cursor-pointer shadow-lg font-cairo"
                >
                  <span>{PROMO_SLIDES[activePromoIndex].buttonText}</span>
                  <ArrowLeft size={11} className="sm:size-12" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Indicator Dot Navigation */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {PROMO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActivePromoIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activePromoIndex === idx ? 'w-5 bg-[#19C37D]' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`شريحة رقم ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 5. Category Shortcuts */}
      <div className="w-full">
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-3xl mx-auto">
          {[
            { label: '🥩 لحوم بلدي', cat: 'لحوم ومجمدات' },
            { label: '🥛 ألبان طازجة', cat: 'ألبان وأجبان' },
            { label: '🍎 خضار وفاكهة', cat: 'خضروات وفواكه' },
            { label: '🍞 مخبوزات فرن', cat: 'مخبوزات' },
            { label: '🥤 مشروبات', cat: 'مشروبات' },
            { label: '🧴 منظفات ورعاية', cat: 'منظفات ورعاية' },
            { label: '🧂 بقالة ومؤن', cat: 'بقالة ومؤن' }
          ].map((shortcut, idx) => (
            <button
              key={idx}
              onClick={() => {
                const targetCat = CATEGORIES.find(c => c.name === shortcut.cat);
                if (targetCat) onSelectCategory(targetCat);
              }}
              className="px-3.5 py-2 rounded-xl text-[11px] font-bold bg-slate-50 hover:bg-[#19C37D]/15 dark:bg-[#16161a] dark:hover:bg-[#19C37D]/20 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-white/5 hover:border-[#19C37D]/35 dark:hover:border-[#19C37D]/30 transition-all cursor-pointer shadow-sm font-cairo"
            >
              {shortcut.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= SECTION 1: POPULAR FEATURED CATEGORIES (Featured immediately) ================= */}
      <section id="popular-categories-section" className="space-y-4">
        <div className="text-right space-y-0.5">
          <div className="flex items-center gap-1.5 justify-end text-[#19C37D] font-extrabold text-xs">
            <Sparkles size={14} />
            <span>تسوق حسب احتياج عائلتك</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white">تصفح أقسام السوبر ماركت</h2>
          <p className="text-[11px] sm:text-xs text-slate-400 max-w-xl ml-auto">اختر قسماً لتصفح المنتجات المتوفرة فوراً في المتجر.</p>
        </div>

        {/* Dense Category Grid layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory?.id === cat.id;
            return (
              <CategoryCard 
                key={cat.id}
                category={cat}
                cat={cat}
                isSelected={isSelected}
                onSelect={onSelectCategory}
              />
            );
          })}
        </div>
      </section>

      {/* ================= SECTION 2: TODAY'S DEALS CAROUSEL ================= */}
      <ProductCarousel 
        title="خصومات سوبر ماركت اليوم"
        subtitle="عروض يومية متميزة بأسعار خاصة جداً وكميات محدودة"
        icon={<Flame size={12} className="fill-red-500" />}
        badgeText="خصومات وعروض اليوم المحدودة"
        badgeColor="text-red-500 bg-red-500/10"
        products={dealProducts}
        cart={cart}
        addToCart={addToCart}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        onViewAll={() => setActiveTab(Tab.MARKET)}
      />

      {/* ================= SECTION 3: BEST SELLERS CAROUSEL ================= */}
      <ProductCarousel 
        title="الأكثر مبيعاً ورواجاً في الهايبر"
        subtitle="المنتجات الأساسية الأعلى طلباً وتقييماً من قبل عائلاتنا"
        icon={<TrendingUp size={12} />}
        badgeText="الطلبات المرتفعة هذا الأسبوع"
        badgeColor="text-[#19C37D] bg-[#19C37D]/10"
        products={bestSellers}
        cart={cart}
        addToCart={addToCart}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        onViewAll={() => setActiveTab(Tab.MARKET)}
      />

      {/* ================= SECTION 4: FRESH PRODUCTS CAROUSEL ================= */}
      <ProductCarousel 
        title="طازج ومقطوف ومخبوز اليوم"
        subtitle="خضار وفاكهة طازجة مع مخبوزات دافئة يومياً من المزارع للهايبر"
        icon={<Sparkles size={12} />}
        badgeText="وصلت المتجر اليوم طازجة"
        badgeColor="text-emerald-500 bg-emerald-500/10"
        products={freshProducts}
        cart={cart}
        addToCart={addToCart}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        onViewAll={() => {
          const cat = CATEGORIES.find(c => c.name === 'خضروات وفواكه');
          if (cat) onSelectCategory(cat);
        }}
      />

      {/* ================= SECTION 5: NEW ARRIVALS CAROUSEL ================= */}
      <ProductCarousel 
        title="وصل حديثاً للمتجر"
        subtitle="استكشف المنتجات والأصناف الجديدة المضافة حديثاً في الهايبر"
        icon={<Sparkles size={12} />}
        badgeText="منتجات جديدة ومتميزة"
        badgeColor="text-blue-500 bg-blue-500/10"
        products={newArrivals}
        cart={cart}
        addToCart={addToCart}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        onViewAll={() => setActiveTab(Tab.MARKET)}
      />

      {/* ================= SECTION 6: WEEKLY OFFERS CAROUSEL ================= */}
      <ProductCarousel 
        title="عروض ومستلزمات الأسبوع"
        subtitle="مستلزمات العائلة والبيت النظيف بأسعار تموينية ممتازة ومخفضة"
        icon={<Tag size={12} />}
        badgeText="مستلزمات الصيف والبيت النظيف"
        badgeColor="text-amber-500 bg-amber-500/10"
        products={weeklyOffers}
        cart={cart}
        addToCart={addToCart}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        onViewAll={() => {
          const cat = CATEGORIES.find(c => c.name === 'منظفات ورعاية');
          if (cat) onSelectCategory(cat);
        }}
      />

      {/* ================= VOICE SEARCH SIMULATOR POPUP ================= */}
      <Modal 
        isOpen={isVoiceActive} 
        onClose={() => setIsVoiceActive(false)} 
        title="البحث الصوتي الذكي"
        size="sm"
      >
        <div className="text-center space-y-6 py-2">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 text-red-500 mx-auto flex items-center justify-center animate-pulse">
            <Mic size={28} />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-cairo">تحدث الآن، وسنقوم بالبحث فوراً عن طلبك</p>
          </div>

          {/* Simulated Waveform Anim */}
          <div className="flex justify-center items-center gap-1 h-8 py-2">
            <div className="w-1 bg-red-500 rounded-full animate-[bounce_0.8s_infinite]" style={{ height: '70%', animationDelay: '0.1s' }} />
            <div className="w-1 bg-red-500 rounded-full animate-[bounce_0.8s_infinite]" style={{ height: '100%', animationDelay: '0.3s' }} />
            <div className="w-1 bg-red-500 rounded-full animate-[bounce_0.8s_infinite]" style={{ height: '40%', animationDelay: '0.5s' }} />
            <div className="w-1 bg-red-500 rounded-full animate-[bounce_0.8s_infinite]" style={{ height: '80%', animationDelay: '0.2s' }} />
            <div className="w-1 bg-red-500 rounded-full animate-[bounce_0.8s_infinite]" style={{ height: '50%', animationDelay: '0.4s' }} />
          </div>

          <div className="p-4 bg-slate-50 dark:bg-black/30 rounded-2xl border border-slate-100 dark:border-white/5 font-bold text-slate-800 dark:text-slate-200">
            {voiceQueryText}
          </div>

          <Button 
            onClick={() => setIsVoiceActive(false)}
            variant="secondary"
            fullWidth
            className="text-xs py-2 h-9 font-bold font-cairo"
          >
            إلغاء البحث الصوتي
          </Button>
        </div>
      </Modal>

      {/* ================= BARCODE SCANNER SIMULATOR POPUP ================= */}
      <Modal 
        isOpen={isBarcodeScannerActive} 
        onClose={() => setIsBarcodeScannerActive(false)} 
        title="قارئ الباركود الذكي"
        size="md"
      >
        {scannerStep === 'scanning' ? (
          <div className="space-y-6 py-4 text-center">
            {/* Camera screen simulation */}
            <div className="relative aspect-video w-full rounded-2xl bg-slate-900 overflow-hidden border border-slate-700/50 flex flex-col items-center justify-center">
              <Camera size={40} className="text-slate-500 animate-pulse" />
              
              {/* Simulated laser lines */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-[shimmer_2s_infinite]" />
              
              {/* Corner highlights */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#19C37D]" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#19C37D]" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#19C37D]" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#19C37D]" />

              <p className="absolute bottom-2 text-[10px] text-white/60 font-cairo">وجه كاميرا جهازك نحو الباركود</p>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-cairo">جاري مسح الباركود والاتصال بالمستودع الكلي لـ هايبر المصري...</p>
          </div>
        ) : (
          <div className="space-y-4 py-2 text-right">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex gap-4 items-center flex-row-reverse">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 flex-shrink-0">
                <Check size={24} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-500 font-cairo">تم الكشف عن المنتج بنجاح!</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-none font-mono">الكود التعريفي: 978020137962</p>
              </div>
            </div>

            {scannedProduct && (
              <div className="border border-slate-100 dark:border-white/5 rounded-2xl p-4 space-y-4 bg-slate-50 dark:bg-black/30">
                <div className="flex gap-4 flex-row-reverse items-center">
                  <img src={scannedProduct.image} alt={scannedProduct.name} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                  <div className="space-y-1 min-w-0">
                    <span className="text-[9px] font-bold text-[#19C37D] bg-[#19C37D]/10 px-2 py-0.5 rounded-full inline-block">{scannedProduct.category}</span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">{scannedProduct.name}</h4>
                    <p className="text-sm font-extrabold text-[#19C37D] font-mono">{formatPrice(scannedProduct.price)}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      addToCart(scannedProduct);
                      setIsBarcodeScannerActive(false);
                    }}
                    variant="primary"
                    className="flex-1 py-2 rounded-xl text-xs font-bold font-cairo"
                  >
                    أضف لطلبك فوراً
                  </Button>
                  <Button
                    onClick={() => setScannerStep('scanning')}
                    variant="secondary"
                    className="px-4 py-2 rounded-xl text-xs font-bold font-cairo"
                  >
                    مسح آخر
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
};
