import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Star, Heart, Plus, Check, Bell, Award, 
  Sparkles, ShieldCheck, Mail, ArrowLeft, Vote, ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Category } from '../data';
import { CartItem } from '../types';
import { Button, Card, Chip, Input, ProductCard, CategoryCard, Modal, Loader, EmptyState } from './DesignSystem';
import { db } from '../services/firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface CategoryPageProps {
  category: Category;
  products: Product[];
  addToCart: (product: Product) => void;
  cart: CartItem[];
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  onBack: () => void;
  allCategories: Category[];
  onNavigateToCategory: (cat: Category) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  category,
  products,
  addToCart,
  cart,
  favorites,
  toggleFavorite,
  onBack,
  allCategories,
  onNavigateToCategory
}) => {
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default');
  const [onlyDeals, setOnlyDeals] = useState(false);
  
  // Coming Soon states
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [votes, setVotes] = useState<number>(() => {
    const saved = localStorage.getItem(`votes_${category.id}`);
    return saved ? parseInt(saved, 10) : Math.floor(Math.random() * 150) + 80;
  });
  const [hasVoted, setHasVoted] = useState<boolean>(() => {
    return localStorage.getItem(`voted_${category.id}`) === 'true';
  });

  // Reset states on category change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsSubscribed(false);
    setEmail('');
    setEmailError('');
  }, [category]);

  // Handle vote increment (DEF-06)
  const handleVote = async () => {
    if (hasVoted) return;
    const newVotes = votes + 1;
    setVotes(newVotes);
    setHasVoted(true);
    try {
      localStorage.setItem(`votes_${category.id}`, newVotes.toString());
      localStorage.setItem(`voted_${category.id}`, 'true');
    } catch {
      // safe fallback
    }

    try {
      if (db) {
        await setDoc(doc(db, 'categoryVotes', category.id), {
          categoryId: category.id,
          categoryName: category.name,
          votes: newVotes,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Firebase category vote fallback:', err);
    }
  };

  // Handle email subscribe (DEF-06)
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setEmailError('الرجاء إدخال البريد الإلكتروني');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('الرجاء إدخال بريد إلكتروني صالح');
      return;
    }
    setEmailError('');
    setIsSubscribed(true);

    const cleanEmail = email.trim().toLowerCase();
    try {
      localStorage.setItem(`sub_${category.id}`, cleanEmail);
    } catch {
      // safe fallback
    }

    try {
      if (db) {
        await addDoc(collection(db, 'categorySubscriptions'), {
          categoryId: category.id,
          categoryName: category.name,
          email: cleanEmail,
          timestamp: serverTimestamp()
        });
      }
    } catch (err) {
      console.warn('Firebase category subscription fallback:', err);
    }
  };

  // Filter and sort products
  const categoryProducts = products.filter(p => p.category === category.name);
  const filteredProducts = categoryProducts
    .filter(p => !onlyDeals || p.isDeal)
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // default
    });

  const formatPrice = (p: number) => {
    return p.toLocaleString('ar-EG') + ' ج.م';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-10 text-right pb-16"
      dir="rtl"
    >
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center justify-between flex-row border-b border-slate-100 dark:border-white/5 pb-4">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-all font-bold text-xs cursor-pointer active:scale-95 border border-slate-200/50 dark:border-white/5 focus-visible:ring-2 focus-visible:ring-[#19C37D] outline-none"
          aria-label="العودة للصفحة الرئيسية"
        >
          <ArrowRight size={16} />
          <span>العودة للرئيسية</span>
        </button>

        <div className="text-xs text-slate-400 dark:text-gray-500 font-medium">
          <span>الرئيسية</span>
          <span className="mx-2">/</span>
          <span>الأقسام</span>
          <span className="mx-2">/</span>
          <span className="text-[#19C37D] font-bold">{category.name}</span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-[2rem] overflow-hidden aspect-[16/6] md:aspect-[21/6] bg-slate-100 dark:bg-black/40 border border-slate-200/60 dark:border-white/5 flex items-center p-8 md:p-12">
        <div className="absolute inset-0">
          <img 
            src={category.image} 
            alt={category.name} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/55 to-transparent" />
        </div>

        <div className="relative z-10 max-w-xl space-y-4 text-white">
          <div className="flex items-center gap-3">
            <span className="text-4xl bg-white/10 backdrop-blur-md w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10">{category.icon}</span>
            <div>
              <h1 className="text-2xl sm:text-4xl font-serif font-extrabold">{category.name}</h1>
              {!category.isComingSoon && (
                <p className="text-[10px] font-mono font-bold tracking-wider text-[#19C37D] mt-1 bg-[#19C37D]/10 px-2 py-0.5 rounded-md inline-block">
                  {categoryProducts.length} صنف متاح فوراً
                </p>
              )}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
            {category.description}
          </p>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      {category.isComingSoon ? (
        /* COMING SOON LAYOUT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main interactive feedback column (Coming Soon Card) */}
          <div className="lg:col-span-8 bg-white dark:bg-[#121315] border border-slate-200/60 dark:border-white/5 rounded-3xl p-8 space-y-8 shadow-sm">
            <div className="space-y-4 text-center max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#19C37D]/10 flex items-center justify-center mx-auto border border-[#19C37D]/20">
                <Sparkles size={28} className="text-[#19C37D] animate-pulse" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-white">قسم {category.name} قادم قريباً جداً!</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                نقوم حالياً بتجهيز شبكة الموردين الأفضل لنوفر لكم خيارات فاخرة وبأسعار منافسة للغاية تليق بعائلتكم الكريمة. ساهم في تسريع التدشين عبر التصويت!
              </p>
            </div>

            {/* Voting Component */}
            <div className="bg-slate-50 dark:bg-white/2 rounded-2xl p-6 border border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 text-center sm:text-right">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">هل تود تسريع توفير هذا القسم؟</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">صوّت الآن لتجعل هذا القسم على رأس أولوياتنا للتجهيز.</p>
              </div>

              <button
                onClick={handleVote}
                disabled={hasVoted}
                className={`px-6 py-3.5 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all shadow-sm cursor-pointer ${
                  hasVoted 
                    ? 'bg-[#19C37D]/10 text-[#19C37D] border border-[#19C37D]/20 cursor-default' 
                    : 'bg-[#19C37D] hover:bg-[#19C37D]/95 text-black hover:-translate-y-0.5 active:scale-95'
                }`}
              >
                <Vote size={15} />
                <span>{hasVoted ? 'شكراً لتصويتك!' : 'صوّت لتوفير القسم'}</span>
                <span className="h-5 w-px bg-current/20"></span>
                <span className="font-mono font-black">{votes.toLocaleString('ar-EG')} صوت</span>
              </button>
            </div>

            {/* Email Notification signup */}
            <div className="bg-gradient-to-br from-[#111613] to-[#0a0d0b] dark:from-[#0d120e] dark:to-[#070908] rounded-3xl p-8 text-white relative overflow-hidden border border-[#19C37D]/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#19C37D]/5 blur-3xl rounded-full pointer-events-none"></div>
              
              <div className="space-y-6 relative z-10 max-w-lg">
                <div className="flex items-center gap-2">
                  <Bell className="text-[#19C37D]" size={20} />
                  <span className="text-xs font-bold text-[#19C37D] uppercase tracking-wider">الإشعارات الفورية</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-serif font-bold text-white">كن أول من يعلم عند الافتتاح</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    سجل بريدك الإلكتروني لنرسل لك كوبون خصم بقيمة ٥٠ ج.م ودعوة تسوق خاصة فور تفعيل القسم بالكامل.
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {!isSubscribed ? (
                    <motion.form 
                      key="subscribe-form"
                      onSubmit={handleSubscribe} 
                      className="space-y-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <input
                            type="email"
                            placeholder="أدخل بريدك الإلكتروني..."
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (emailError) setEmailError('');
                            }}
                            className={`w-full bg-white/5 border rounded-xl py-3 pr-10 pl-4 text-xs focus:outline-none focus:border-[#19C37D] transition-all text-white placeholder-slate-500 text-right ${
                              emailError ? 'border-red-500/50' : 'border-white/10'
                            }`}
                            dir="ltr"
                          />
                          <Mail size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        </div>
                        <button
                          type="submit"
                          className="px-6 py-3 rounded-xl bg-[#19C37D] text-black font-bold text-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                        >
                          أرسل التنبيه الذكي
                        </button>
                      </div>
                      {emailError && (
                        <p className="text-[10px] text-red-400 font-bold">{emailError}</p>
                      )}
                    </motion.form>
                  ) : (
                    <motion.div 
                      key="subscribe-success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-5 rounded-2xl bg-[#19C37D]/10 border border-[#19C37D]/20 text-right space-y-2"
                    >
                      <p className="text-sm font-bold text-[#19C37D] flex items-center gap-2 justify-end">
                        <span>تم تفعيل تنبيه الافتتاح بنجاح! 🎉</span>
                        <Check size={16} />
                      </p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        لقد تم قيد بريدك الإلكتروني (<span className="font-mono">{email}</span>) في قائمة كبار الزوار. سنرسل لك الإشعار مع كوبون الخصم فور إطلاق القسم.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>

          {/* Right sidebar column: suggest other active categories */}
          <div className="lg:col-span-4 bg-slate-50 dark:bg-white/2 border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">أقسام بديلة جاهزة للتسوق</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">اختر قسماً مفعلاً بالكامل لتلبية احتياجاتك الفورية من متجرنا.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {allCategories.filter(c => !c.isComingSoon && c.id !== category.id).slice(0, 4).map((otherCat) => (
                <button
                  key={otherCat.id}
                  onClick={() => onNavigateToCategory(otherCat)}
                  className="w-full p-3 rounded-2xl bg-white dark:bg-[#151618] border border-slate-200/50 dark:border-white/5 hover:border-[#19C37D]/35 hover:shadow-md transition-all flex items-center justify-between text-right flex-row-reverse group cursor-pointer focus-visible:ring-2 focus-visible:ring-[#19C37D] outline-none"
                  aria-label={`تصفح قسم ${otherCat.name}`}
                >
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <span className="text-2xl bg-slate-50 dark:bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center">{otherCat.icon}</span>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-[#19C37D] transition-colors">{otherCat.name}</h4>
                      <p className="text-[9px] text-slate-450 dark:text-gray-500 font-mono">{otherCat.productCount} صنف متاح</p>
                    </div>
                  </div>
                  <ArrowLeft size={13} className="text-slate-400 group-hover:text-[#19C37D] group-hover:-translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* ACTIVE CATEGORY PRODUCTS GRID */
        <div className="space-y-8">
          
          {/* Controls & Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-white/2 border border-slate-200/50 dark:border-white/5 p-4 rounded-2xl">
            <div className="flex items-center gap-3 flex-row-reverse w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-bold">ترتيب حسب:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold py-2 pr-8 pl-3 focus:outline-none focus:border-[#19C37D] text-slate-800 dark:text-slate-200 cursor-pointer"
                style={{ direction: 'rtl' }}
              >
                <option value="default">الترتيب التلقائي</option>
                <option value="price-asc">السعر: من الأقل للأعلى</option>
                <option value="price-desc">السعر: من الأعلى للأقل</option>
                <option value="rating">التقييم: الأعلى أولاً</option>
              </select>
            </div>

            <div className="flex items-center gap-3 flex-row-reverse w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={() => setOnlyDeals(!onlyDeals)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  onlyDeals 
                    ? 'bg-red-500/10 border-red-500/30 text-red-500' 
                    : 'bg-white dark:bg-[#161616] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-350 hover:border-red-500/30 hover:text-red-500'
                }`}
              >
                ٪ عروض وخصومات فقط
              </button>

              <div className="text-xs text-slate-400 dark:text-gray-500 font-bold">
                عرض <span className="text-[#19C37D] font-mono font-black">{filteredProducts.length}</span> من أصل <span className="font-mono">{categoryProducts.length}</span> منتج
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((p) => (
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
          ) : (
            <div className="text-center py-20 bg-slate-50 dark:bg-white/2 rounded-3xl border border-slate-200/50 dark:border-white/5 space-y-4 max-w-lg mx-auto">
              <p className="text-sm font-bold text-slate-500 dark:text-gray-400">عفواً، لا توجد عروض نشطة حالياً في هذا القسم.</p>
              <button
                onClick={() => setOnlyDeals(false)}
                className="px-4 py-2 bg-[#19C37D] text-black font-bold text-xs rounded-xl"
              >
                شاهد كافة منتجات القسم
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
