import React, { useState, useEffect, memo } from 'react';
import { MapPin, Navigation, Phone, CheckCircle, Clock, Star, Send, Sparkles, Check, MessageSquare, ThumbsUp } from 'lucide-react';
import { OrderStatus } from '../types';

const QUICK_TAGS = [
  "سريع جداً ⚡",
  "منتجات طازجة 🥬",
  "تغليف فاخر 🎁",
  "مندوب محترم 🤝",
  "دقة في الميزان ⚖️",
  "أسعار ممتازة 🏷️"
];

export const TrackingMap = memo(() => {
  const [status, setStatus] = useState<OrderStatus>({
    step: 1,
    label: "Processing Order",
    timestamp: "Now",
    driverLocation: { lat: 30.0444, lng: 31.2357 } // Cairo Coordinates
  });

  // Feedback State
  const [deliveryRating, setDeliveryRating] = useState<number>(5);
  const [deliveryHover, setDeliveryHover] = useState<number>(0);
  const [productRating, setProductRating] = useState<number>(5);
  const [productHover, setProductHover] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(["سريع جداً ⚡", "منتجات طازجة 🥬"]);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Simulated WebSocket Connection for live tracking steps
  useEffect(() => {
    const steps: Partial<OrderStatus>[] = [
      { step: 2, label: "Quality Check Passed", timestamp: "2 mins ago" },
      { step: 3, label: "Driver Assigned: Mohamed Ali", timestamp: "5 mins ago" },
      { step: 4, label: "Arriving in 10 minutes", timestamp: "Live" }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setStatus(prev => ({ ...prev, ...steps[currentStep] }));
        currentStep++;
      }
    }, 3000); // Fast forward simulation

    return () => clearInterval(interval);
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API or Firestore submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      try {
        localStorage.setItem('almasri_last_feedback', JSON.stringify({
          orderId: "ORD-8821",
          deliveryRating,
          productRating,
          tags: selectedTags,
          comment,
          submittedAt: new Date().toISOString()
        }));
      } catch {
        // Safe storage fallback
      }
    }, 700);
  };

  const goldText = "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300";

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Upper Grid: Order Steps + Radar Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[560px]">
        {/* Status Panel */}
        <div className="lg:col-span-1 bg-white dark:bg-[#0d0d0d] rounded-[2rem] border border-slate-200 dark:border-white/10 p-8 flex flex-col justify-between shadow-md dark:shadow-none">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-3xl font-serif text-slate-800 dark:text-white">طلب رقم #8821</h2>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
                مباشر
              </span>
            </div>
            <p className="text-slate-500 dark:text-gray-500 text-xs uppercase tracking-widest mb-8">توصيل كونسيرج فاخر</p>

            <div className="space-y-8 relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-slate-100 dark:bg-white/5"></div>
              
              {[1, 2, 3, 4].map((s) => {
                const isActive = status.step >= s;
                const isCurrent = status.step === s;
                
                return (
                  <div key={s} className={`relative flex gap-4 ${isActive ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-10 h-10 rounded-full border flex-shrink-0 flex items-center justify-center z-10 bg-white dark:bg-[#0d0d0d] transition-all duration-500 ${
                      isActive ? 'border-emerald-500 text-emerald-500 dark:border-emerald-400 dark:text-emerald-400' : 'border-slate-200 dark:border-white/10 text-slate-400 dark:text-gray-500'
                    }`}>
                      {s === 4 ? <Navigation size={18} /> : <CheckCircle size={18} />}
                    </div>
                    <div className="pt-2 text-right">
                      <h4 className={`font-bold text-sm ${isCurrent ? goldText : 'text-slate-700 dark:text-gray-300'}`}>
                        {s === 1 ? 'تم تأكيد وتجهيز الطلب' : s === 2 ? 'فحص الجودة والمطابقة' : s === 3 ? 'خارج للتوصيل مع المندوب' : 'قريب جداً من موقعك'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-1 font-mono">
                        {isCurrent ? status.label : 'مكتمل بنجاح'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-white/10 mt-8">
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-150 dark:border-transparent">
              <div className="w-12 h-12 rounded-full bg-slate-200 bg-[url('https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100')] bg-cover flex-shrink-0"></div>
              <div className="text-right flex-1">
                <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-widest">مندوب التوصيل الخاص بك</p>
                <p className="font-bold text-slate-800 dark:text-white">محمد علي</p>
              </div>
              <a 
                href="tel:01000000000" 
                aria-label="اتصال بالمندوب"
                className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center hover:scale-110 transition-transform shadow-md cursor-pointer"
              >
                <Phone size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Map Simulation */}
        <div className="lg:col-span-2 bg-slate-100 dark:bg-[#111] rounded-[2rem] border border-slate-200 dark:border-white/5 relative overflow-hidden group shadow-md dark:shadow-none min-h-[400px]">
          <div className="absolute inset-0 opacity-40 bg-[url('https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/12/2412/1654.png')] dark:bg-[url('https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/12/2412/1654.png')] bg-cover grayscale hover:grayscale-0 transition-all duration-1000"></div>
          
          {/* Radar Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-emerald-500/20 rounded-full animate-ping"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-[#10B981] rounded-full shadow-[0_0_20px_#10B981]"></div>
          </div>

          {/* Simulated Live Route */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path d="M 200 500 Q 400 300 600 250" stroke="#10B981" strokeWidth="2" fill="none" strokeDasharray="10 5" className="animate-[dash_20s_linear_infinite]" />
          </svg>

          <div className="absolute top-8 right-8 bg-white/95 dark:bg-black/80 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-3">
            <Clock size={16} className="text-emerald-500 dark:text-emerald-400" />
            <span className="font-mono text-sm text-slate-800 dark:text-white">الوصول المتوقع: 08:22 مساءً</span>
          </div>

          <div className="absolute bottom-6 left-6 right-6 md:right-auto bg-white/95 dark:bg-[#0c0d10]/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg text-right">
            <div className="flex items-center gap-3 justify-end">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">شاحنة تبريد معقمة</p>
                <p className="text-[10px] text-slate-500 dark:text-gray-400">درجة حرارة الصندوق: ٤ درجات مئوية</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sprint 1: Post-Purchase Feedback Module */}
      <div className="bg-white dark:bg-[#0d0d0d] rounded-[2rem] border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-md dark:shadow-none text-right">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 justify-end md:justify-start flex-row-reverse">
              <Sparkles size={18} className="text-emerald-500" />
              <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-900 dark:text-white">
                تقييم الطلب وتجربة التوصيل
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              رأيك يصنع الفرق — ساعدنا على تقديم أعلى معايير الجودة والخدمة الفاخرة دائماً.
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/10">
            طلب #8821
          </span>
        </div>

        {isSubmitted ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Check size={32} />
            </div>
            <div className="space-y-2 max-w-md">
              <h4 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
                شكراً جزيلاً لتقييمك الراقي!
              </h4>
              <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
                تم تسجيل ملاحظاتك بنجاح ومشاركتها مع فريق الجودة والمندوب محمد علي. نسعد دائماً بخدمتكم في هايبر المصري.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="text-xs font-bold text-emerald-500 hover:text-emerald-400 underline cursor-pointer"
              >
                تعديل التقييم
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitFeedback} className="mt-8 space-y-8">
            {/* Dual Star Rating Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rating 1: Delivery Experience */}
              <div className="bg-slate-50 dark:bg-white/[0.02] p-5 rounded-2xl border border-slate-150 dark:border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-emerald-500 dark:text-emerald-400">
                    {deliveryRating} / 5 نجوم
                  </span>
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    🛵 تقييم التوصيل وسرعة المندوب
                  </label>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-gray-500">
                  سرعة وصول الطلب، الالتزام بالوقت، ولباقة التعامل.
                </p>
                <div className="flex items-center gap-2 justify-end pt-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = (deliveryHover || deliveryRating) >= star;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setDeliveryRating(star)}
                        onMouseEnter={() => setDeliveryHover(star)}
                        onMouseLeave={() => setDeliveryHover(0)}
                        className="p-1 text-slate-300 dark:text-gray-700 hover:scale-125 transition-transform cursor-pointer"
                        aria-label={`تقييم التوصيل ${star} من 5`}
                      >
                        <Star
                          size={24}
                          className={filled ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "text-slate-300 dark:text-gray-700"}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating 2: Product Quality & Freshness */}
              <div className="bg-slate-50 dark:bg-white/[0.02] p-5 rounded-2xl border border-slate-150 dark:border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-emerald-500 dark:text-emerald-400">
                    {productRating} / 5 نجوم
                  </span>
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    🥬 جودة المنتجات وطزاجة الأصناف
                  </label>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-gray-500">
                  طزاجة الخضار واللحوم، دقة التقطيع، وعناية التغليف المبرد.
                </p>
                <div className="flex items-center gap-2 justify-end pt-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = (productHover || productRating) >= star;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setProductRating(star)}
                        onMouseEnter={() => setProductHover(star)}
                        onMouseLeave={() => setProductHover(0)}
                        className="p-1 text-slate-300 dark:text-gray-700 hover:scale-125 transition-transform cursor-pointer"
                        aria-label={`تقييم المنتجات ${star} من 5`}
                      >
                        <Star
                          size={24}
                          className={filled ? "fill-emerald-400 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "text-slate-300 dark:text-gray-700"}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Feedback Tags */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                وسوم سريعة تميزت بها تجربتك:
              </label>
              <div className="flex flex-wrap gap-2 justify-end">
                {QUICK_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-sm"
                          : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/10 hover:border-emerald-500/30"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Freeform Comment Textarea */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono">{comment.length}/300</span>
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 flex-row-reverse">
                  <MessageSquare size={14} className="text-emerald-500" />
                  <span>شاركنا برأيك أو أي اقتراح إضافي (اختياري)</span>
                </label>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 300))}
                rows={3}
                placeholder="أخبرنا عن تجربتك مع المنتجات أو التوصيل، يسعدنا سماع رأيك دائماً..."
                className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors text-right resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-sm rounded-xl hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري إرسال التقييم...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>إرسال التقييم</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
});

TrackingMap.displayName = "TrackingMap";
