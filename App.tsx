import React, { useState, useRef, useEffect } from 'react';
import { Store, ShoppingBag, Shirt, Award, MapPin, Sparkles, Bot, PenTool, LayoutGrid, Truck, Activity, X, CreditCard, ShoppingCart, Sun, Moon } from 'lucide-react';
import { Tab, Product, CartItem } from './types';
import { Concierge } from './components/Concierge';
import { DesignAtelier } from './components/DesignAtelier';
import { Marketplace } from './components/Marketplace';
import { TrackingMap } from './components/TrackingMap';
import { AdminDashboard } from './components/AdminDashboard';

const App = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.EXTERIOR);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('almasri_theme') as 'light' | 'dark') || 'dark';
  });

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

  // Cart Logic (Redux Simulation)
  const addToCart = (product: Product) => {
    setCart(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
            return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
        }
        return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
      setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

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
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#080808] dark:text-white font-sans overflow-hidden relative selection:bg-emerald-500 selection:text-black transition-colors duration-300">
      
      {/* Ambient Lighting Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/5 dark:bg-teal-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Cart Drawer (Overlay) */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-white dark:bg-[#111] border-l border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-[0_0_100px_rgba(0,0,0,0.8)] transform transition-transform duration-500 z-[100] ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full flex flex-col p-8">
              <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-serif text-slate-800 dark:text-white">Your Collection</h2>
                  <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 opacity-50">
                          <ShoppingBag size={48} className="mb-4" />
                          <p>Your vault is empty.</p>
                      </div>
                  ) : (
                      cart.map(item => (
                          <div key={item.id} className="flex gap-4 bg-slate-50 dark:bg-[#0d0d0d] p-4 rounded-xl border border-slate-200 dark:border-white/5">
                              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                              <div className="flex-1 text-right">
                                  <h4 className="font-serif font-bold text-sm">{item.name}</h4>
                                  <p className="text-xs text-emerald-400 mt-1">{item.price.toLocaleString()} EGP</p>
                                  <div className="flex justify-between items-center mt-3">
                                      <span className="text-xs text-gray-500">العدد: {item.quantity}</span>
                                      <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-400 hover:text-red-300">حذف</button>
                                  </div>
                              </div>
                          </div>
                      ))
                  )}
              </div>

              <div className="border-t border-slate-200 dark:border-white/10 pt-6 mt-4 space-y-4">
                  <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                      <span className="text-slate-750 dark:text-slate-350">{cartTotal.toLocaleString()} EGP</span>
                  </div>
                  <div className="flex justify-between text-xl font-serif font-bold">
                      <span className={goldText}>Total</span>
                      <span className={goldText}>{cartTotal.toLocaleString()} EGP</span>
                  </div>
                  <button onClick={() => { setIsCartOpen(false); setActiveTab(Tab.TRACKING); }} className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${goldGradient} text-black hover:opacity-90 active:scale-95 transition-all`}>
                      <CreditCard size={16} /> إتمام الشراء
                  </button>
              </div>
          </div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0f0f0f]/80 text-slate-800 dark:text-white backdrop-blur-xl sticky top-0 z-50 transition-colors duration-300">
         <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab(Tab.EXTERIOR)}>
            <div className="w-10 h-10 rounded-full p-[1px]" style={{ background: 'linear-gradient(to bottom, #10B981, #059669)' }}>
              <div className="w-full h-full rounded-full bg-slate-100 dark:bg-[#1c1c1c] flex items-center justify-center">
                <span className={`font-serif text-[10px] ${goldText} font-bold`}>Hم</span>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">هايبر المصري</h1>
              <p className={`text-[9px] uppercase tracking-[0.3em] font-bold ${goldText}`}>Hyper Al Masri</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
            <nav className="hidden lg:flex gap-6 text-[10px] uppercase tracking-[0.25em] font-bold">
                {[Tab.EXTERIOR, Tab.PACKAGING].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`transition-all relative py-2 ${activeTab === tab ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-300'}`}
                >
                    {tab === Tab.EXTERIOR ? 'الرئيسية' : 'الجودة'}
                </button>
                ))}
            </nav>

            <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden lg:block"></div>

            {/* Application Feature Tabs */}
            <nav className="flex gap-4 text-[10px] uppercase tracking-[0.25em] font-bold">
                <button onClick={() => setActiveTab(Tab.MARKET)} className={`flex flex-col items-center gap-1 group transition-colors ${activeTab === Tab.MARKET ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-300'}`}>
                    <ShoppingBag size={18} className="group-hover:text-emerald-500 transition-colors" />
                    <span className="hidden md:block">السوق</span>
                </button>
                <button onClick={() => setActiveTab(Tab.TRACKING)} className={`flex flex-col items-center gap-1 group transition-colors ${activeTab === Tab.TRACKING ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-300'}`}>
                    <Truck size={18} className="group-hover:text-emerald-500 transition-colors" />
                    <span className="hidden md:block">تتبع</span>
                </button>
                <button onClick={() => setActiveTab(Tab.ATELIER)} className={`flex flex-col items-center gap-1 group transition-colors ${activeTab === Tab.ATELIER ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-300'}`}>
                    <Bot size={18} className="group-hover:text-emerald-500 transition-colors" />
                    <span className="hidden md:block">مساعدك</span>
                </button>
                 <button onClick={() => setActiveTab(Tab.ADMIN)} className={`flex flex-col items-center gap-1 group transition-colors ${activeTab === Tab.ADMIN ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-300'}`}>
                    <Activity size={18} className="group-hover:text-emerald-500 transition-colors" />
                    <span className="hidden md:block">إدارة</span>
                </button>
            </nav>

            <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block"></div>

            {/* Premium Theme Switcher Accent Button */}
            <button 
                onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all text-slate-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-[#111]/30 ml-1"
                title={theme === 'light' ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع المضيء'}
            >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Cart Trigger */}
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-[#111]/30 transition-colors">
                <ShoppingCart size={18} className="text-emerald-600 dark:text-emerald-400" />
                {cart.length > 0 && (
                    <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[8px] font-bold text-white">{cart.length}</div>
                )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10 min-h-[85vh]">
        
        {/* VIEW: SHOWCASE (Landing) */}
        {activeTab === Tab.EXTERIOR && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 text-right md:text-right">
               {/* Note: In flex-row, justify-between pushes items apart. We reverse order visually for RTL feel if needed, or keep branding left/text right */}
              
              <div className="flex-1 order-2 md:order-1 text-right">
                 <p className="text-slate-600 dark:text-gray-400 text-sm max-w-sm leading-relaxed italic border-r-2 border-emerald-500/30 pr-4 ml-auto">
                    "الجودة اللي تستاهلها بيتك، بأسعار على قد الإيد. هايبر المصري بيجمع بين أصالة الريف ونظام المدينة."
                 </p>
              </div>

              <div className="space-y-2 order-1 md:order-2 text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className={`text-[10px] uppercase tracking-[0.4em] font-bold ${goldText}`}>خيرات بلدنا</span>
                  <Sparkles size={14} className="text-emerald-400" />
                </div>
                <h2 className="text-5xl font-serif text-slate-800 dark:text-white">هايبر المصري</h2>
                <div className="flex gap-3 justify-end mt-2 text-slate-500 dark:text-gray-400 text-sm font-bold">
                    <span>خضروات وفواكه</span>
                    <span className="text-emerald-400">•</span>
                    <span>مجمدات ولحوم</span>
                    <span className="text-emerald-400">•</span>
                    <span>بقالة وعطارة</span>
                </div>
              </div>
            </div>

            {/* 3D TILT CARD */}
            <div 
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative aspect-video rounded-[3rem] overflow-hidden bg-[#111] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] cursor-crosshair transition-transform duration-200 ease-out"
              style={{
                perspective: '1500px',
                transform: `rotateX(${mousePos.y * -10}deg) rotateY(${mousePos.x * 10}deg)`,
                transformStyle: 'preserve-3d'
              }}
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: 'translateZ(60px)' }}>
                <div className="mb-8 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                   <LogoComponent size="lg" interactive={true} />
                </div>
                <div className="text-center space-y-4">
                  <h3 
                    className={`text-7xl md:text-9xl font-serif font-bold tracking-tighter filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] ${goldText}`}
                    style={{ textShadow: '0 10px 20px rgba(0,0,0,0.4)' }}
                  >
                    هايبر المصري
                  </h3>
                  <div className={`h-[2px] w-48 mx-auto ${goldGradient} shadow-lg shadow-emerald-500/20`}></div>
                  <p className="text-white/40 text-xl tracking-[0.2em] uppercase font-light translate-z-10 font-sans">
                    بقالة • مجمدات • عطارة
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_5s_infinite] skew-x-12"></div>
            </div>
            
            <div className="flex justify-center mt-12">
                 <button onClick={() => setActiveTab(Tab.MARKET)} className={`px-12 py-5 rounded-full font-bold tracking-wider flex items-center gap-4 ${goldGradient} text-black shadow-[0_0_50px_rgba(16,185,129,0.4)] hover:scale-105 transition-transform`}>
                     تسوق الآن <ShoppingBag />
                 </button>
            </div>
          </div>
        )}

        {/* VIEW: MARKETPLACE */}
        {activeTab === Tab.MARKET && <Marketplace cart={cart} addToCart={addToCart} />}

        {/* VIEW: TRACKING */}
        {activeTab === Tab.TRACKING && <TrackingMap />}

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

        {/* VIEW: AI ATELIER */}
        {activeTab === Tab.ATELIER && (
          <div className="space-y-12 animate-in fade-in duration-700">
             <div className="flex flex-col lg:flex-row gap-8 justify-between lg:items-end border-b border-slate-200 dark:border-white/5 pb-8">
               <div className="space-y-2">
                 <div className="flex items-center gap-2">
                   <Bot size={14} className="text-emerald-500 dark:text-emerald-400" />
                   <span className={`text-[10px] uppercase tracking-[0.4em] font-bold ${goldText}`}>ذكاء اصطناعي</span>
                 </div>
                 <h2 className="text-4xl font-serif text-slate-800 dark:text-white">المساعد الذكي</h2>
               </div>
               <div className="flex gap-4">
                 <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/5 text-slate-700 dark:text-gray-400">
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                   <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-gray-400">Gemini 3.0 Pro</span>
                 </div>
               </div>
             </div>
             
             <div className="grid grid-cols-1 gap-16">
               <section>
                 <div className="flex items-center gap-4 mb-6">
                   <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1a1a1a] flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                     <Bot size={16} />
                   </div>
                   <h3 className="text-lg font-serif tracking-wide text-slate-800 dark:text-gray-200">خدمة العملاء الآلية</h3>
                 </div>
                 <Concierge />
               </section>
               <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
               <section>
                 <div className="flex items-center gap-4 mb-6">
                   <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1a1a1a] flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                     <PenTool size={16} />
                   </div>
                   <h3 className="text-lg font-serif tracking-wide text-slate-800 dark:text-gray-200">تصميم وتخيل</h3>
                 </div>
                 <DesignAtelier />
               </section>
             </div>
          </div>
        )}

      </main>

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