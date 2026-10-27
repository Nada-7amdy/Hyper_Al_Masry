import React, { useState, useEffect, memo } from 'react';
import { 
  MapPin, Navigation, Phone, CheckCircle, Clock, Star, Send, 
  Sparkles, Check, MessageSquare, ThumbsUp, ShoppingBag, ShieldCheck, 
  AlertCircle, ChevronLeft, Truck, RefreshCw, Info
} from 'lucide-react';
import { OrderStatus, ActiveOrder, OrderLifecycleStatus, ORDER_STATUS_LABELS } from '../types';
import { db } from '../services/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export type { ActiveOrder };

const QUICK_TAGS = [
  "سريع جداً ⚡",
  "منتجات طازجة 🥬",
  "تغليف فاخر 🎁",
  "مندوب محترم 🤝",
  "دقة في الميزان ⚖️",
  "أسعار ممتازة 🏷️"
];

interface TrackingMapProps {
  activeOrder?: ActiveOrder | null;
  onOrderUpdate?: (order: ActiveOrder) => void;
}

export const TrackingMap = memo(({ activeOrder: propOrder, onOrderUpdate }: TrackingMapProps) => {
  const [activeOrder, setActiveOrder] = useState<ActiveOrder>(() => {
    if (propOrder) return propOrder;
    try {
      const saved = localStorage.getItem('almasri_active_order');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      orderId: "ORD-8821-EG",
      customerName: "عميل هايبر المصري",
      customerPhone: "01000000000",
      itemsCount: 3,
      total: 560,
      subtotal: 560,
      deliveryFee: 0,
      address: "شارع التسعين الشمالي، التجمع الخامس، القاهرة",
      paymentMethod: "CASH_ON_DELIVERY",
      status: "PREPARING",
      createdAt: new Date().toISOString(),
      isSimulatedDemo: true
    };
  });

  // Feedback State
  const [deliveryRating, setDeliveryRating] = useState<number>(5);
  const [deliveryHover, setDeliveryHover] = useState<number>(0);
  const [productRating, setProductRating] = useState<number>(5);
  const [productHover, setProductHover] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(["سريع جداً ⚡", "منتجات طازجة 🥬"]);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(() => {
    return !!activeOrder.hasFeedback;
  });

  // Sync prop changes
  useEffect(() => {
    if (propOrder) {
      setActiveOrder(propOrder);
      if (propOrder.hasFeedback) {
        setIsSubmitted(true);
      }
    }
  }, [propOrder]);

  // Persist order updates
  const saveOrderState = (updated: ActiveOrder) => {
    setActiveOrder(updated);
    try {
      localStorage.setItem('almasri_active_order', JSON.stringify(updated));
    } catch {
      // safe fallback
    }
    if (onOrderUpdate) {
      onOrderUpdate(updated);
    }
  };

  // Step progression in simulation
  const advanceSimulationStep = async () => {
    const cycle: OrderLifecycleStatus[] = ['CONFIRMED', 'PREPARING', 'READY_FOR_DISPATCH', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIndex = cycle.indexOf(activeOrder.status);
    const nextStatus = currentIndex >= 0 && currentIndex < cycle.length - 1 ? cycle[currentIndex + 1] : 'DELIVERED';

    const updated: ActiveOrder = {
      ...activeOrder,
      status: nextStatus,
      deliveredAt: nextStatus === 'DELIVERED' ? new Date().toISOString() : activeOrder.deliveredAt
    };

    saveOrderState(updated);

    // Sync status update to Firestore orders collection if exists
    try {
      if (db && activeOrder.orderId) {
        await addDoc(collection(db, "orderEvents"), {
          orderId: activeOrder.orderId,
          status: nextStatus,
          timestamp: serverTimestamp()
        });
      }
    } catch (err) {
      console.warn("Firestore order status event sync fallback:", err);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeOrder.status !== 'DELIVERED') return; // Enforce delivery before feedback
    if (activeOrder.hasFeedback) return; // Prevent duplicate submission

    setIsSubmitting(true);
    
    const feedbackPayload = {
      orderId: activeOrder.orderId,
      deliveryRating,
      productRating,
      tags: selectedTags,
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    };

    // 1. Sync to live Firestore collection
    try {
      if (db) {
        await addDoc(collection(db, "orderFeedback"), feedbackPayload);
      }
    } catch (err) {
      console.warn("Firestore feedback sync unavailable, saved locally:", err);
    }

    // 2. Safe local storage persistence and mark order as reviewed
    const updatedOrder: ActiveOrder = {
      ...activeOrder,
      hasFeedback: true
    };
    saveOrderState(updatedOrder);

    try {
      localStorage.setItem(`feedback_${activeOrder.orderId}`, JSON.stringify(feedbackPayload));
    } catch {
      // Safe storage fallback
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 400);
  };

  const currentStepInfo = ORDER_STATUS_LABELS[activeOrder.status] || ORDER_STATUS_LABELS.PREPARING;
  const isDelivered = activeOrder.status === 'DELIVERED';
  const goldText = "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300";

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-right" dir="rtl">
      
      {/* Honest Simulation Notice Banner (Issue 7) */}
      <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <Info size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span>محاكاة تجريبية حية للمسار (Interactive Demo Tracking)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-mono">
                نسخة استعراضية
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-gray-400">
              يتم هنا استعراض دورة الشحن المبرّد لحظة بلحظة. الحالة محفوظة تلقائياً ولا تتأثر بإعادة تحميل الصفحة.
            </p>
          </div>
        </div>

        {!isDelivered && (
          <button
            onClick={advanceSimulationStep}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-500/15 cursor-pointer whitespace-nowrap"
          >
            <RefreshCw size={14} className="animate-spin-slow" />
            <span>⚡ تقدم خطوة في المحاكاة للمعاينة</span>
          </button>
        )}
      </div>

      {/* Upper Grid: Order Steps + Radar Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[560px]">
        {/* Status Panel */}
        <div className="lg:col-span-1 bg-white dark:bg-[#0d0d0d] rounded-[2rem] border border-slate-200 dark:border-white/10 p-8 flex flex-col justify-between shadow-md dark:shadow-none">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl sm:text-3xl font-serif text-slate-800 dark:text-white font-bold">
                طلب #{activeOrder.orderId}
              </h2>
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${isDelivered ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'}`}>
                {isDelivered ? 'تم التسليم' : 'مباشر الآن'}
              </span>
            </div>
            
            <p className="text-slate-500 dark:text-gray-500 text-xs uppercase tracking-widest mb-4">
              توصيل كونسيرج فاخر مبرّد
            </p>

            {/* Order Brief Box */}
            <div className="bg-slate-50 dark:bg-white/[0.03] p-4 rounded-2xl border border-slate-150 dark:border-white/5 mb-6 space-y-2">
              {activeOrder.customerName && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">اسم العميل:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{activeOrder.customerName}</span>
                </div>
              )}
              {activeOrder.customerPhone && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">رقم التواصل:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeOrder.customerPhone}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">عنوان التوصيل:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-[200px]" title={activeOrder.address}>
                  {activeOrder.address}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">طريقة الدفع:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {activeOrder.paymentMethod === 'CARD_ON_DELIVERY' ? 'فيزا مع المندوب (POS)' : 'كاش عند الاستلام'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-100 dark:border-white/5 pt-1.5">
                <span className="text-slate-400">إجمالي الحساب:</span>
                <span className="font-mono font-bold text-emerald-500">{activeOrder.total.toLocaleString('ar-EG')} ج.م</span>
              </div>
            </div>

            {/* Complete Arabic Status Progression Steps */}
            <div className="space-y-6 relative">
              <div className="absolute right-[19px] top-2 bottom-2 w-[2px] bg-slate-100 dark:bg-white/5"></div>
              
              {[
                { statusKey: 'CONFIRMED' as OrderLifecycleStatus, title: 'تم تأكيد طلبك', desc: 'تمت مراجعة الأصناف وحجز المنتجات من المخزون', stepNum: 1 },
                { statusKey: 'PREPARING' as OrderLifecycleStatus, title: 'جاري تجهيز وتعبئة طلبك', desc: 'يتم الآن انتقاء المنتجات الطازجة بدقة وفحص جودتها', stepNum: 2 },
                { statusKey: 'READY_FOR_DISPATCH' as OrderLifecycleStatus, title: 'طلبك جاهز في شاحنة التبريد', desc: 'تم نقل الشحنة لشاحنة التبريد (٤ درجات مئوية)', stepNum: 3 },
                { statusKey: 'OUT_FOR_DELIVERY' as OrderLifecycleStatus, title: 'المندوب في الطريق إليك', desc: 'مندوب هايبر المصري يقترب من موقعك الآن', stepNum: 4 },
                { statusKey: 'DELIVERED' as OrderLifecycleStatus, title: 'تم توصيل طلبك بنجاح', desc: 'نتمنى لك تجربة ممتعة وصحة وعافية!', stepNum: 5 }
              ].map((stepItem) => {
                const stepOrder = ['CONFIRMED', 'PREPARING', 'READY_FOR_DISPATCH', 'OUT_FOR_DELIVERY', 'DELIVERED'];
                const currentIdx = stepOrder.indexOf(activeOrder.status);
                const stepIdx = stepOrder.indexOf(stepItem.statusKey);

                const isCompleted = currentIdx >= stepIdx;
                const isCurrent = activeOrder.status === stepItem.statusKey;
                
                return (
                  <div key={stepItem.statusKey} className={`relative flex gap-4 ${isCompleted ? 'opacity-100' : 'opacity-35'}`}>
                    <div className={`w-10 h-10 rounded-full border flex-shrink-0 flex items-center justify-center z-10 bg-white dark:bg-[#0d0d0d] transition-all duration-500 ${
                      isCompleted ? 'border-emerald-500 text-emerald-500 dark:border-emerald-400 dark:text-emerald-400' : 'border-slate-200 dark:border-white/10 text-slate-400 dark:text-gray-500'
                    }`}>
                      {isCompleted ? <CheckCircle size={18} /> : <span className="text-xs font-mono font-bold">{stepItem.stepNum}</span>}
                    </div>
                    <div className="pt-1 text-right flex-1">
                      <h4 className={`font-bold text-sm ${isCurrent ? goldText : 'text-slate-700 dark:text-gray-300'}`}>
                        {stepItem.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-0.5 leading-relaxed">
                        {isCurrent ? currentStepInfo.description : stepItem.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Driver Card */}
          <div className="pt-6 border-t border-slate-200 dark:border-white/10 mt-6">
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-150 dark:border-transparent">
              <div className="w-12 h-12 rounded-full bg-slate-200 bg-[url('https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100')] bg-cover flex-shrink-0"></div>
              <div className="text-right flex-1">
                <p className="text-xs text-slate-500 dark:text-gray-400">مندوب التوصيل المعتمد</p>
                <p className="font-bold text-slate-800 dark:text-white">محمد علي</p>
                <span className="text-[10px] text-emerald-500 font-bold">شاحنة تبريد معقمة 🚚</span>
              </div>
              <a 
                href="tel:01023456789" 
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
            <span className="font-mono text-sm text-slate-800 dark:text-white">
              {isDelivered ? 'تم استلام الشحنة بنجاح' : 'الوصول المتوقع: خلال ٣٥ دقيقة'}
            </span>
          </div>

          <div className="absolute bottom-6 left-6 right-6 md:right-auto bg-white/95 dark:bg-[#0c0d10]/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg text-right">
            <div className="flex items-center gap-3 justify-end">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">شاحنة تبريد معقمة</p>
                <p className="text-[10px] text-slate-500 dark:text-gray-400">درجة حرارة الصندوق: ٤ درجات مئوية (حفظ النعمة)</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Post-Purchase Feedback Module (Gated strictly to DELIVERED orders - Issue 1) */}
      <div className="bg-white dark:bg-[#0d0d0d] rounded-[2rem] border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-md dark:shadow-none text-right">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-row">
              <Sparkles size={18} className="text-emerald-500" />
              <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-900 dark:text-white">
                تقييم الطلب وجودة الخدمة
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              رأيك يصنع الفرق — ساعدنا على تقديم أعلى معايير الجودة والخدمة الفاخرة دائماً.
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/10">
            طلب #{activeOrder.orderId}
          </span>
        </div>

        {/* Feedback Gating Logic */}
        {!isDelivered ? (
          /* Undelivered State Banner */
          <div className="my-8 p-8 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-3">
            <Clock className="w-10 h-10 text-amber-500 mx-auto animate-pulse" />
            <h4 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
              سيُتاح لك تقييم تجربتك بعد استلام طلبك بنجاح 🌟
            </h4>
            <p className="text-xs text-slate-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              طلبك حالياً قيد التحضير والشحن المبرد (<span className="text-emerald-600 dark:text-emerald-400 font-bold">{currentStepInfo.label}</span>). سيتم فتح استمارة التقييم تلقائياً فور تأكيد تسليم الشحنة لضمان دقة رأيك في المنتجات والمندوب.
            </p>
          </div>
        ) : isSubmitted ? (
          /* Already Submitted Confirmation */
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
          </div>
        ) : (
          /* Active Rating Form when Delivered */
          <form onSubmit={handleSubmitFeedback} className="mt-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rating 1: Delivery Experience */}
              <div className="bg-slate-50 dark:bg-white/[0.02] p-5 rounded-2xl border border-slate-150 dark:border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    🛵 تقييم التوصيل وسرعة المندوب
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-500 dark:text-emerald-400">
                    {deliveryRating} / 5 نجوم
                  </span>
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
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    🥬 جودة المنتجات وطزاجة الأصناف
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-500 dark:text-emerald-400">
                    {productRating} / 5 نجوم
                  </span>
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
              <div className="flex flex-wrap gap-2 justify-start">
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

            {/* Freeform Comment Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                ملاحظات إضافية أو كلمة شكر للمندوب:
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                placeholder="شاركنا رأيك في سرعة التوصيل أو أي تفاصيل ترغب بتحسينها في المرات القادمة..."
                rows={3}
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none leading-relaxed"
              />
              <div className="text-left text-[10px] text-slate-400 font-mono">
                {comment.length} / 1000 حرف
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>جاري تسجيل تقييمك...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>إرسال التقييم الرسمي وتأكيد الجودة</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

    </div>
  );
});

TrackingMap.displayName = 'TrackingMap';
