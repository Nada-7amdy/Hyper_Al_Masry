import React, { useState, useRef, useEffect } from 'react';
import { Store, ShoppingBag, Shirt, Award, MapPin, Sparkles, Bot, PenTool, LayoutGrid, Truck, Activity, X, CreditCard, ShoppingCart, Sun, Moon, Star, Plus, ShieldCheck, Check, ChevronRight, Layers, Bell, User, Settings } from 'lucide-react';
import { Tab, Product, CartItem, ActiveOrder } from './types';
import { db } from './services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Concierge } from './components/Concierge';
import { SupermarketServices } from './components/SupermarketServices';
import { Marketplace } from './components/Marketplace';
import { TrackingMap } from './components/TrackingMap';
import { AdminDashboard } from './components/AdminDashboard';
import { HomeRedesign } from './components/HomeRedesign';
import { CategoryPage } from './components/CategoryPage';
import { CATEGORIES, Category, PRODUCTS } from './data';
import { motion, AnimatePresence } from 'motion/react';

const heroProducts: Product[] = [
  {
    id: "h_olive_oil",
    name: "زيت زيتون بكر ممتاز",
    price: 195,
    category: "بقالة ومؤن",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80",
    rating: 4.9,
    description: "عصرة أولى على البارد من مزارعنا الخاصة، غني بالنكهة وخالي من الإضافات.",
    stock: 50
  },
  {
    id: "h_strawberries",
    name: "فراولة بلدي طازجة",
    price: 45,
    category: "خضروات وفواكه",
    image: "https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=500&q=80",
    rating: 4.8,
    description: "فراولة حمراء ناضجة طازجة مقطوفة بعناية لتقدم لكم طعم الصيف الحقيقي.",
    stock: 120
  },
  {
    id: "h_honey",
    name: "عسل سدر جبلي",
    price: 320,
    category: "عطارة",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&q=80",
    rating: 5.0,
    description: "عسل طبيعي نقي 100% مستخلص من زهور السدر الجبلية لتعزيز المناعة والصحة.",
    stock: 30
  }
];

const App = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.EXTERIOR);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 'n1', text: '🎁 عروض اليوم بدأت الآن! وفر حتى ٣٠٪ على الخضروات الطازجة.', time: 'منذ ١٠ دقائق', unread: true },
    { id: 'n2', text: '🥩 تم تحديث أسعار قطعيات اللحوم البلدية الفاخرة اليوم.', time: 'منذ ساعة', unread: true },
    { id: 'n3', text: '🚚 طلبك الأخير قيد الشحن وسيكون عندك خلال ٤٥ دقيقة.', time: 'منذ ساعتين', unread: false }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(() => {
    try {
      const saved = localStorage.getItem('almasri_selected_category');
      if (saved) {
        const parsed = JSON.parse(saved);
        return CATEGORIES.find(c => c.id === parsed.id) || null;
      }
    } catch {
      return null;
    }
    return null;
  });

  const handleSelectCategory = (cat: Category | null) => {
    setSelectedCategory(cat);
    if (cat) {
      localStorage.setItem('almasri_selected_category', JSON.stringify(cat));
    } else {
      localStorage.removeItem('almasri_selected_category');
    }
  };

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Cart State with LocalStorage Hydration (Task 2)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('almasri_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active Order State with LocalStorage Hydration (DEF-05)
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(() => {
    try {
      const saved = localStorage.getItem('almasri_active_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Cart LocalStorage Sync
  useEffect(() => {
    try {
      if (cart.length > 0) {
        localStorage.setItem('almasri_cart', JSON.stringify(cart));
      } else {
        localStorage.removeItem('almasri_cart');
      }
    } catch {
      // Safe storage fallback
    }
  }, [cart]);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('almasri_theme') as 'light' | 'dark') || 'dark';
  });

  // Wishlist/Favorites State (Shopify/Amazon UX)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('almasri_favorites') || '[]');
    } catch {
      return [];
    }
  });

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const updated = prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId];
      localStorage.setItem('almasri_favorites', JSON.stringify(updated));
      return updated;
    });
    const isNowFav = !favorites.includes(productId);
    showToast(isNowFav ? "تم حفظ المنتج في المفضلة! ❤️" : "تمت إزالة المنتج من المفضلة.", 'info');
  };

  // Custom Toasts State (Stripe UX)
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' }[]>([]);
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
    localStorage.setItem('almasri_theme', theme);
  }, [theme]);

  // Mint Neon Gradient Classes for fresh, economical high contrast
  const goldGradient = "bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-500";
  const goldText = "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400";

  // Cart Logic with Dual Support for Pieces & Kilograms
  const addToCart = (product: Product, weight?: number) => {
    setCart(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
            if (product.isWeightBased) {
                const addWeight = weight ?? 0.25;
                const newWeight = +((existing.selectedWeight ?? 1) + addWeight).toFixed(2);
                return prev.map(item => item.id === product.id ? { ...item, selectedWeight: newWeight } : item);
            }
            return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
        }
        return [...prev, { 
          ...product, 
          quantity: 1,
          selectedWeight: product.isWeightBased ? (weight ?? 1) : undefined
        }];
    });
    showToast(`تمت إضافة ${product.name} إلى السلة! 🛒`, 'success');
  };

  const removeFromCart = (id: string) => {
      setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id: string, delta: number) => {
      setCart(prev => prev.map(item => {
          if (item.id === id) {
              if (item.isWeightBased) {
                  const step = 0.25;
                  const currentWeight = item.selectedWeight ?? 1;
                  const newWeight = +(currentWeight + (delta * step)).toFixed(2);
                  return newWeight > 0 ? { ...item, selectedWeight: newWeight } : item;
              }
              const newQty = item.quantity + delta;
              return newQty > 0 ? { ...item, quantity: newQty } : item;
          }
          return item;
      }));
  };

  // Accurate Cart Total considering Weight multipliers
  const cartTotal = cart.reduce((acc, item) => {
    const multiplier = item.isWeightBased ? (item.selectedWeight ?? 1) : item.quantity;
    return acc + (item.price * multiplier);
  }, 0);

  // Dynamic End-to-End Checkout Flow (DEF-05)
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    let deliveryAddress = "شارع التسعين، التجمع الخامس، القاهرة";
    try {
      const savedAddr = localStorage.getItem('almasri_selected_address');
      if (savedAddr) {
        const parsed = JSON.parse(savedAddr);
        if (parsed.fullAddress || parsed.name) {
          deliveryAddress = parsed.fullAddress || `${parsed.name}، ${parsed.city || 'القاهرة'}`;
        }
      }
    } catch {
      // safe fallback
    }

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}-EG`;
    const finalTotal = cartTotal + (cartTotal >= 150 ? 0 : 15);
    const totalItems = cart.reduce((acc, item) => acc + (item.isWeightBased ? 1 : item.quantity), 0);

    const newOrder: ActiveOrder = {
      orderId,
      itemsCount: totalItems,
      total: finalTotal,
      address: deliveryAddress,
      createdAt: new Date().toISOString()
    };

    setActiveOrder(newOrder);
    try {
      localStorage.setItem('almasri_active_order', JSON.stringify(newOrder));
    } catch (e) {
      console.warn('localStorage save failed:', e);
    }

    // Sync to Firestore orders collection with safe fallback
    try {
      if (db) {
        await addDoc(collection(db, 'orders'), {
          orderId: newOrder.orderId,
          itemsCount: newOrder.itemsCount,
          total: newOrder.total,
          address: newOrder.address,
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            selectedWeight: item.selectedWeight ?? null,
            isWeightBased: !!item.isWeightBased
          })),
          subtotal: cartTotal,
          deliveryFee: cartTotal >= 150 ? 0 : 15,
          status: 'PREPARING',
          timestamp: serverTimestamp()
        });
      }
    } catch (err) {
      console.warn('Firebase order sync fallback:', err);
    }

    // Reset cart
    setCart([]);
    try {
      localStorage.removeItem('almasri_cart');
    } catch {
      // safe fallback
    }

    setIsCartOpen(false);
    setActiveTab(Tab.TRACKING);
    showToast(`تم تأكيد طلبك (${orderId}) بنجاح! جاري تحضير طلبك...`, 'success');
  };

  // 3D Tilt Logic
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const LogoComponent = ({ size = "md", interactive = false }: { size?: "sm" | "md" | "lg", interactive?: boolean }) => {
    const scale = size === "sm" ? "scale-50" : size === "lg" ? "scale-125" : "scale-100";
    
    // Parallax movement for inner elements
    const innerStyle = interactive ? {
      transform: `translateX(${mousePos.x * 20}px) translateY(${mousePos.y * 20}px)`,
      transition: 'transform 0.1s ease-out'
    } : {};

    return (
      <div className={`flex flex-col items-center ${scale} transition-transform duration-500`}>
        {/* Outer Ring with Real Gold Gradient */}
        <div 
          className="w-32 h-32 rounded-full p-[3px] shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          style={{ background: 'linear-gradient(135deg, #10B981 0%, #34D399 45%, #059669 50%, #6EE7B7 55%, #047857 100%)' }}
        >
          <div className="w-full h-full rounded-full bg-[#121212] flex items-center justify-center relative overflow-hidden">
             {/* Decorative inner lines */}
             <div className="absolute inset-2 rounded-full border border-emerald-500/20"></div>
             
             {/* Intertwined Monogram with Parallax */}
             <div className="relative font-serif flex items-center justify-center" style={innerStyle}>
                <span className={`text-5xl font-bold opacity-90 ${goldText}`}>H</span>
                <span className={`text-4xl absolute left-1/2 top-1/2 -translate-x-1/4 -translate-y-1/4 drop-shadow-md ${goldText}`}>م</span>
             </div>

             {/* Dynamic Light Reflection */}
             <div 
                className="absolute inset-0 opacity-30 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
                style={{ transform: `translateX(${mousePos.x * 100}%) translateY(${mousePos.y * 100}%)`, transition: 'transform 0.2s ease-out' }}
             ></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-800 dark:bg-[#0A0B0D] dark:text-white font-sans overflow-hidden relative selection:bg-[#19C37D]/20 selection:text-[#19C37D] transition-colors duration-300">
      
      {/* Ambient Lighting Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/5 dark:bg-teal-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Toast Notification Container */}
      <div className="fixed bottom-20 lg:bottom-6 left-6 z-[200] flex flex-col gap-3 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-xl flex items-center justify-between text-right flex-row-reverse border-l-4 border-l-[#19C37D]"
            >
              <div className="flex items-center gap-3 flex-row-reverse">
                <span className="text-base">
                  {toast.type === 'success' ? '✅' : 'ℹ️'}
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{toast.message}</p>
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Cart Drawer (Overlay) */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-white dark:bg-[#111] border-l border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-[0_0_100px_rgba(0,0,0,0.8)] transform transition-transform duration-500 z-[100] ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full flex flex-col p-6 text-right">
              <div className="flex justify-between items-center mb-6 flex-row-reverse">
                  <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShoppingCart size={20} className="text-[#19C37D]" />
                    <span>سلة التسوق الذكية</span>
                  </h2>
                  <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-gray-500 space-y-4">
                          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-300">
                            <ShoppingBag size={28} />
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-slate-800 dark:text-slate-200 text-center">سلتك فارغة تماماً</p>
                            <p className="text-xs text-slate-400 text-center">تصفح أقسام السوبر ماركت وأضف منتجاتك لتظهر هنا</p>
                          </div>
                          <button 
                            onClick={() => { setIsCartOpen(false); setActiveTab(Tab.EXTERIOR); }}
                            className="px-4 py-2 bg-[#19C37D]/10 text-[#19C37D] font-bold text-xs rounded-xl hover:bg-[#19C37D] hover:text-black transition-all mx-auto block"
                          >
                            ابدأ التسوق الآن
                          </button>
                      </div>
                  ) : (
                      cart.map(item => {
                        const isWeight = !!item.isWeightBased;
                        const weight = item.selectedWeight ?? 1;
                        const itemSubtotal = isWeight ? (weight * item.price) : (item.quantity * item.price);

                        return (
                          <div key={item.id} className="flex gap-4 bg-slate-50 dark:bg-white/2 p-4 rounded-2xl border border-slate-200/50 dark:border-white/5 flex-row-reverse items-center justify-between">
                              <div className="flex gap-3 flex-row-reverse items-center min-w-0">
                                <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl flex-shrink-0" />
                                <div className="space-y-1 min-w-0 text-right">
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 truncate">{item.name}</h4>
                                    <p className="text-xs font-extrabold text-[#19C37D] font-mono">{itemSubtotal.toLocaleString('ar-EG')} ج.م</p>
                                    {isWeight && (
                                      <p className="text-[10px] text-slate-400 dark:text-gray-500 font-mono">
                                        ({weight} كجم × {item.price.toLocaleString('ar-EG')} ج.م)
                                      </p>
                                    )}
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-1.5 bg-slate-100/50 dark:bg-black/30 p-1 rounded-lg border border-slate-200/20">
                                  <button 
                                    onClick={() => updateCartQuantity(item.id, 1)} 
                                    className="w-6 h-6 rounded bg-white hover:bg-[#19C37D]/20 text-slate-800 dark:bg-white/5 dark:text-slate-200 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                                    title={isWeight ? "زيادة ربع كيلو" : "زيادة قطعة"}
                                  >
                                    +
                                  </button>
                                  <span className="text-xs font-extrabold px-1 text-center font-mono min-w-6">
                                    {isWeight ? `${weight} كجم` : item.quantity}
                                  </span>
                                  <button 
                                    onClick={() => {
                                      if (isWeight) {
                                        if (weight > 0.25) {
                                          updateCartQuantity(item.id, -1);
                                        } else {
                                          removeFromCart(item.id);
                                        }
                                      } else {
                                        if (item.quantity > 1) {
                                          updateCartQuantity(item.id, -1);
                                        } else {
                                          removeFromCart(item.id);
                                        }
                                      }
                                    }} 
                                    className="w-6 h-6 rounded bg-white hover:bg-red-500/20 text-slate-800 dark:bg-white/5 dark:text-slate-200 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                                    title={isWeight ? "إنقاص ربع كيلو" : "إنقاص قطعة"}
                                  >
                                    -
                                  </button>
                                </div>
                                <button 
                                  onClick={() => removeFromCart(item.id)} 
                                  className="text-[10px] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                >
                                  حذف الصنف
                                </button>
                              </div>
                          </div>
                        );
                      })
                  )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-slate-100 dark:border-white/5 pt-5 mt-4 space-y-4">
                    <div className="flex justify-between text-xs flex-row-reverse">
                        <span className="text-slate-400">حساب المشتريات</span>
                        <span className="text-slate-700 dark:text-slate-300 font-mono font-bold">{cartTotal.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                    <div className="flex justify-between text-xs flex-row-reverse">
                        <span className="text-slate-400">توصيل سريع مبرّد</span>
                        <span className="text-emerald-500 font-bold">{cartTotal >= 150 ? 'مجاني بالكامل' : '١٥ ج.م'}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold flex-row-reverse border-t border-slate-100 dark:border-white/5 pt-3">
                        <span className="text-slate-800 dark:text-white">إجمالي الطلب</span>
                        <span className="text-[#19C37D] font-mono">{ (cartTotal + (cartTotal >= 150 ? 0 : 15)).toLocaleString('ar-EG') } ج.م</span>
                    </div>
                    
                    <button 
                      onClick={handleCheckout} 
                      className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-[#19C37D] text-black hover:opacity-90 active:scale-95 transition-all shadow-[0_4px_15px_rgba(25,195,125,0.2)] cursor-pointer"
                    >
                        <CreditCard size={15} /> 
                        <span>تأكيد وشراء الطلب فوراً</span>
                    </button>
                </div>
              )}
          </div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0f0f0f]/80 text-slate-800 dark:text-white backdrop-blur-xl sticky top-0 z-50 transition-colors duration-300">
         <div className="max-w-7xl mx-auto px-6 py-4.5 sm:py-5 flex justify-between items-center">
          <button 
            onClick={() => { 
              setActiveTab(Tab.EXTERIOR); 
              handleSelectCategory(null); 
            }}
            className="group/logo flex items-center gap-3 rounded-2xl transition-all duration-350 relative select-none cursor-pointer hover:bg-emerald-500/[0.015] active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 text-right whitespace-nowrap"
            aria-label="هايبر المصري - الصفحة الرئيسية"
          >
            {/* Soft Green Glow Behind the Logo on Hover */}
            <div className="absolute inset-[-4px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/[0.03] to-emerald-500/0 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-350 blur-md rounded-2xl"></div>
            
            {/* 1. Unified Icon Symbol: Highly Polished Monogram H² in golden-mint circle */}
            <div className="relative flex items-center justify-center z-10 flex-shrink-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full p-[1.5px] shadow-[0_4px_12px_rgba(16,185,129,0.12)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)] bg-gradient-to-tr from-[#059669] via-[#10B981] to-[#34D399] transition-all duration-350 group-hover/logo:scale-[1.05] group-hover/logo:shadow-[0_0_24px_rgba(25,195,125,0.4)]">
                <div className="w-full h-full rounded-full bg-slate-50 dark:bg-[#0f0f10] flex items-center justify-center relative overflow-hidden transition-colors duration-300">
                  {/* Subtle luxurious line inside */}
                  <div className="absolute inset-[2px] rounded-full border border-emerald-500/10 dark:border-emerald-500/22"></div>
                  
                  {/* Monogram Letters */}
                  <div className="relative flex items-center justify-center mt-[-1px] transition-transform duration-350 group-hover/logo:scale-105">
                    <span className="font-sans text-xl sm:text-[22px] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 via-teal-300 to-emerald-500 select-none tracking-tighter">
                      H
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-amber-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)] select-none ml-0.5 mt-[-10px] font-mono">
                      2
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Unified Premium Wordmarks lockup with connected line spacing */}
            <div className="flex flex-col justify-center text-right select-none z-10 border-r border-slate-200/50 dark:border-white/10 pr-4 mr-1">
              {/* Arabic Wordmark (Custom typographic styling, high contrast, elegant weights) */}
              <div className="flex items-baseline justify-end gap-1.5 mb-0.5">
                <span className="font-cairo text-sm sm:text-[15px] font-medium text-slate-500 dark:text-slate-400 tracking-tight leading-none">هايبر</span>
                <span className="font-cairo text-base sm:text-[19px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">المصري</span>
              </div>
              
              {/* English Wordmark (Refined Geometric Typography with Outfit font) */}
              <div className="text-[7.5px] sm:text-[9.5px] uppercase tracking-[0.24em] font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] via-teal-400 to-[#059669] opacity-85 transition-all duration-300 group-hover/logo:opacity-100 group-hover/logo:tracking-[0.26em] leading-none">
                HYPER AL MASRI
              </div>
            </div>
          </button>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Actions: Notifications, Theme Switcher, Settings, User Profile, Cart */}
            
            {/* 1. Notifications bell with dropdown */}
            <div className="relative">
              <button 
                id="header-notifications-btn"
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                  setIsSettingsOpen(false);
                }}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-center relative cursor-pointer ${
                  isNotificationsOpen 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 animate-none' 
                    : 'bg-slate-50 dark:bg-[#111]/30 border-slate-200 dark:border-transparent hover:border-emerald-500/25 text-slate-600 dark:text-gray-400 hover:text-emerald-500'
                }`}
                title="التنبيهات والرسائل"
              >
                <Bell size={18} />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0f0f0f] animate-ping"></span>
                )}
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0f0f0f]"></span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute left-0 mt-2.5 w-80 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden text-right"
                    >
                      <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between flex-row-reverse">
                        <span className="font-cairo text-sm font-black text-slate-900 dark:text-white">التنبيهات الواردة</span>
                        <button 
                          onClick={() => {
                            setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                            showToast("تم تحديد جميع الإشعارات كمقروءة ✅", "info");
                          }}
                          className="text-[10px] text-emerald-500 hover:underline font-bold"
                        >
                          تحديد كالمقروء الكل
                        </button>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                        {notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => {
                              setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
                              setIsNotificationsOpen(false);
                            }}
                            className={`p-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-right relative ${n.unread ? 'bg-emerald-500/[0.015]' : ''}`}
                          >
                            {n.unread && <span className="absolute right-2 top-4 w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                            <p className={`text-xs text-slate-700 dark:text-slate-300 pr-3.5 leading-relaxed ${n.unread ? 'font-bold' : ''}`}>{n.text}</p>
                            <span className="text-[9px] text-slate-400 block pr-3.5 mt-1">{n.time}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* 2. Premium Theme Switcher Accent Button */}
            <button 
                id="header-theme-toggle"
                onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} 
                className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-[#111]/30 transition-all text-slate-600 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 flex items-center justify-center cursor-pointer"
                title={theme === 'light' ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع المضيء'}
            >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* 3. Global Settings with Dropdown */}
            <div className="relative">
              <button 
                id="header-settings-btn"
                onClick={() => {
                  setIsSettingsOpen(!isSettingsOpen);
                  setIsNotificationsOpen(false);
                  setIsProfileOpen(false);
                }}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                  isSettingsOpen 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                    : 'bg-slate-50 dark:bg-[#111]/30 border-slate-200 dark:border-transparent hover:border-emerald-500/25 text-slate-600 dark:text-gray-400 hover:text-emerald-500'
                }`}
                title="إعدادات التطبيق"
              >
                <Settings size={18} />
              </button>

              <AnimatePresence>
                {isSettingsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsSettingsOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute left-0 mt-2.5 w-72 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 p-4 text-right"
                    >
                      <h4 className="font-cairo text-sm font-black text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-100 dark:border-white/5">تخصيص الإعدادات</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between flex-row-reverse text-xs">
                          <span className="font-medium text-slate-600 dark:text-slate-400">عملة العرض</span>
                          <span className="font-bold text-slate-900 dark:text-white px-2 py-1 rounded bg-slate-100 dark:bg-white/5">ج.م (جنيه مصري)</span>
                        </div>
                        <div className="flex items-center justify-between flex-row-reverse text-xs">
                          <span className="font-medium text-slate-600 dark:text-slate-400">لغة الواجهة</span>
                          <span className="font-bold text-slate-900 dark:text-white px-2 py-1 rounded bg-slate-100 dark:bg-white/5">العربية (RTL)</span>
                        </div>
                        <div className="flex items-center justify-between flex-row-reverse text-xs">
                          <span className="font-medium text-slate-600 dark:text-slate-400">سعر الشحن الافتراضي</span>
                          <span className="font-bold text-[#19C37D] dark:text-emerald-400">توصيل مجاني 🎉</span>
                        </div>
                        <button 
                          onClick={() => {
                            setIsSettingsOpen(false);
                            setActiveTab(Tab.ADMIN);
                          }}
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                        >
                          فتح لوحة الإدارة ⚙️
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* 4. User Profile dropdown */}
            <div className="relative">
              <button 
                id="header-profile-btn"
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                  setIsSettingsOpen(false);
                }}
                className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all cursor-pointer overflow-hidden p-0.5 ${
                  isProfileOpen 
                    ? 'border-emerald-500 bg-emerald-500/10' 
                    : 'border-slate-200 dark:border-white/10 hover:border-emerald-500/30'
                }`}
                title="حسابك الشخصي"
              >
                <div className="w-full h-full rounded-[10px] bg-emerald-500 text-black font-black text-xs flex items-center justify-center font-cairo">
                  ن م
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute left-0 mt-2.5 w-80 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden text-right"
                    >
                      <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/5 text-right border-b border-slate-100 dark:border-white/5">
                        <p className="text-xs text-slate-400 dark:text-gray-500 leading-none">مرحباً بك، عميلنا المميز</p>
                        <h4 className="font-cairo text-sm font-black text-slate-900 dark:text-white mt-1">ندى المصري</h4>
                        <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 dark:bg-emerald-500/20 px-2.5 py-0.5 rounded-full inline-block mt-2">
                          🌟 العضوية الذهبية - ١,٢٥٠ نقطة
                        </span>
                      </div>
                      <div className="p-2 space-y-1">
                        <button 
                          onClick={() => { setIsProfileOpen(false); setActiveTab(Tab.TRACKING); }}
                          className="w-full text-right py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 flex-row-reverse"
                        >
                          <Truck size={14} className="text-emerald-500" />
                          <span>تتبع طلبي الحالي</span>
                        </button>
                        <button 
                          onClick={() => { setIsProfileOpen(false); setActiveTab(Tab.ATELIER); }}
                          className="w-full text-right py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 flex-row-reverse"
                        >
                          <Bot size={14} className="text-emerald-500" />
                          <span>المساعد الذكي الرقمي</span>
                        </button>
                        <button 
                          onClick={() => { setIsProfileOpen(false); setActiveTab(Tab.PACKAGING); }}
                          className="w-full text-right py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 flex-row-reverse"
                        >
                          <ShieldCheck size={14} className="text-emerald-500" />
                          <span>فحص جودة التعبئة والتغليف 🍏</span>
                        </button>
                        <div className="h-px bg-slate-100 dark:bg-white/5 my-1"></div>
                        <div className="px-3 py-2 text-[10px] text-slate-400 dark:text-gray-500 font-medium">
                          بريدك الإلكتروني: nada11eelmasry@gmail.com
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10 min-h-[85vh]">
        
        {/* VIEW: SHOWCASE (Landing) */}
        {activeTab === Tab.EXTERIOR && (
          selectedCategory ? (
            <CategoryPage 
              category={selectedCategory}
              products={PRODUCTS}
              addToCart={addToCart}
              cart={cart}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onBack={() => handleSelectCategory(null)}
              allCategories={CATEGORIES}
              onNavigateToCategory={(cat) => handleSelectCategory(cat)}
            />
          ) : (
            <HomeRedesign 
              cart={cart}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              setActiveTab={setActiveTab}
              setIsCartOpen={setIsCartOpen}
              cartTotal={cartTotal}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              showToast={showToast}
            />
          )
        )}

        {/* VIEW: MARKETPLACE */}
        {activeTab === Tab.MARKET && (
          <Marketplace 
            cart={cart} 
            addToCart={addToCart} 
            favorites={favorites} 
            toggleFavorite={toggleFavorite} 
          />
        )}

        {/* VIEW: TRACKING */}
        {activeTab === Tab.TRACKING && <TrackingMap activeOrder={activeOrder} />}

        {/* VIEW: ADMIN */}
        {activeTab === Tab.ADMIN && <AdminDashboard />}

        {/* VIEW: PACKAGING */}
        {activeTab === Tab.PACKAGING && (
          <div className="space-y-12 animate-in fade-in duration-700">
             <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 dark:border-white/5 pb-8">
              <div className="space-y-2">
                <span className={`text-[10px] uppercase tracking-[0.4em] font-bold ${goldText}`}>تغليف يحفظ النعمة</span>
                <h2 className="text-4xl font-serif text-slate-800 dark:text-white">فنون التغليف</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               {/* Premium Bag */}
               <div className="group relative aspect-square rounded-[3rem] bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center p-12 overflow-hidden shadow-sm dark:shadow-none">
                  <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500"></div>
                  <div className="w-64 h-80 bg-slate-50 dark:bg-[#121212] shadow-xl dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)] rounded-t-lg border border-slate-200 dark:border-white/5 relative transform group-hover:-translate-y-4 transition-transform duration-700">
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-12">
                        <div className="w-1.5 h-16 bg-slate-300 dark:bg-[#333] rounded-full group-hover:bg-emerald-500 transition-colors"></div>
                        <div className="w-1.5 h-16 bg-slate-300 dark:bg-[#333] rounded-full group-hover:bg-emerald-500 transition-colors"></div>
                     </div>
                     <div className="h-full w-full flex flex-col items-center justify-center p-8">
                        <LogoComponent size="md" />
                        <h4 className={`text-2xl font-serif mt-6 ${goldText} font-bold`}>هايبر المصري</h4>
                     </div>
                  </div>
                  <div className="mt-8 text-sm font-bold tracking-widest text-slate-500 dark:text-gray-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">شنط صديقة للبيئة وقوية</div>
               </div>
            </div>
          </div>
        )}

        {/* VIEW: SERVICES & ASSISTANT */}
        {activeTab === Tab.ATELIER && (
          <div className="space-y-12 animate-in fade-in duration-700">
             <div className="flex flex-col lg:flex-row gap-8 justify-between lg:items-end border-b border-slate-200 dark:border-white/5 pb-8">
               <div className="space-y-2">
                 <div className="flex items-center gap-2">
                   <Bot size={14} className="text-emerald-500 dark:text-emerald-400" />
                   <span className={`text-[10px] uppercase tracking-[0.4em] font-bold ${goldText}`}>ذكاء اصطناعي وخدمات رقمية</span>
                 </div>
                 <h2 className="text-4xl font-serif text-slate-800 dark:text-white">المركز الرقمي والخدمات</h2>
               </div>
               <div className="flex gap-4">
                 <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/5 text-slate-700 dark:text-gray-400">
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                   <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-gray-400">متصل بالخدمة الذكية</span>
                 </div>
               </div>
             </div>
             
             <div className="grid grid-cols-1 gap-16">
               <section>
                 <div className="flex items-center gap-4 mb-6">
                   <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1a1a1a] flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                     <Bot size={16} />
                   </div>
                   <h3 className="text-lg font-serif tracking-wide text-slate-800 dark:text-gray-200">مساعدك الذكي دائمًا في الخدمة</h3>
                 </div>
                 <Concierge />
               </section>
               <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
               <section>
                 <SupermarketServices />
               </section>
             </div>
          </div>
        )}

      </main>

      {/* Sticky Bottom Navigation (Primary core navigation - beautiful floating dock on desktop, standard bottom-bar on mobile) */}
      <div className="fixed bottom-0 sm:bottom-5 left-0 sm:left-1/2 sm:-translate-x-1/2 right-0 sm:right-auto sm:w-[540px] bg-white/95 dark:bg-[#0c0d10]/95 backdrop-blur-xl border-t sm:border border-slate-200/60 dark:border-white/10 py-2.5 px-6 sm:px-8 sm:rounded-2xl z-[80] flex items-center justify-between shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300">
        <button 
          id="nav-home-btn"
          onClick={() => { setActiveTab(Tab.EXTERIOR); handleSelectCategory(null); }}
          className={`flex flex-col items-center gap-1 flex-1 transition-all duration-200 hover:scale-105 active:scale-95 ${activeTab === Tab.EXTERIOR ? 'text-[#19C37D]' : 'text-slate-400 dark:text-gray-500 hover:text-[#19C37D]'}`}
        >
          <Store size={20} className={activeTab === Tab.EXTERIOR ? "scale-110 transition-transform text-[#19C37D]" : ""} />
          <span className="text-[9px] font-extrabold font-cairo">الرئيسية</span>
        </button>

        <button 
          id="nav-market-btn"
          onClick={() => setActiveTab(Tab.MARKET)}
          className={`flex flex-col items-center gap-1 flex-1 transition-all duration-200 hover:scale-105 active:scale-95 ${activeTab === Tab.MARKET ? 'text-[#19C37D]' : 'text-slate-400 dark:text-gray-500 hover:text-[#19C37D]'}`}
        >
          <ShoppingBag size={20} className={activeTab === Tab.MARKET ? "scale-110 transition-transform text-[#19C37D]" : ""} />
          <span className="text-[9px] font-extrabold font-cairo">السوق</span>
        </button>

        {/* Floating Core Cart Button */}
        <button 
          id="nav-cart-btn"
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center relative flex-1 -top-4 cursor-pointer hover:scale-105 transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#19C37D] to-[#10B981] flex items-center justify-center text-black shadow-lg shadow-[#19C37D]/30 border-4 border-white dark:border-[#0f0f12] active:scale-90 transition-all">
            <ShoppingCart size={18} />
          </div>
          {cart.length > 0 && (
            <div className="absolute top-1 right-1/2 translate-x-4 bg-red-500 text-white text-[8px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white dark:border-[#0a0b0d]">
              {cart.length}
            </div>
          )}
          <span className="text-[9px] font-extrabold text-slate-500 dark:text-gray-400 mt-1 font-cairo">السلة</span>
        </button>

        <button 
          id="nav-tracking-btn"
          onClick={() => setActiveTab(Tab.TRACKING)}
          className={`flex flex-col items-center gap-1 flex-1 transition-all duration-200 hover:scale-105 active:scale-95 ${activeTab === Tab.TRACKING ? 'text-[#19C37D]' : 'text-slate-400 dark:text-gray-500 hover:text-[#19C37D]'}`}
        >
          <Truck size={20} className={activeTab === Tab.TRACKING ? "scale-110 transition-transform text-[#19C37D]" : ""} />
          <span className="text-[9px] font-extrabold font-cairo">تتبع</span>
        </button>

        <button 
          id="nav-support-btn"
          onClick={() => setActiveTab(Tab.ATELIER)}
          className={`flex flex-col items-center gap-1 flex-1 transition-all duration-200 hover:scale-105 active:scale-95 ${activeTab === Tab.ATELIER ? 'text-[#19C37D]' : 'text-slate-400 dark:text-gray-500 hover:text-[#19C37D]'}`}
        >
          <Bot size={20} className={activeTab === Tab.ATELIER ? "scale-110 transition-transform text-[#19C37D]" : ""} />
          <span className="text-[9px] font-extrabold font-cairo">مساعدك</span>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-12deg); }
          50% { transform: translateX(150%) skewX(-12deg); }
          100% { transform: translateX(150%) skewX(-12deg); }
        }
        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }
      `}} />

    </div>
  );
};

export default App;