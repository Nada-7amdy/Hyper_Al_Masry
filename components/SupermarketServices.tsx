import React, { useState } from 'react';
import { 
  Truck, Store, ShieldCheck, MessageSquare, 
  HelpCircle, ChevronDown, Gift, Award, Coins, ArrowRightLeft 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types for Services and FAQs
interface ServiceItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

export const SupermarketServices: React.FC = () => {
  // Accordion state
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(0);
  
  // Loyalty calculator spend state
  const [spendValue, setSpendValue] = useState<number>(1500);

  // Services data
  const services: ServiceItem[] = [
    {
      icon: <Truck size={24} className="text-[#19C37D]" />,
      title: "توصيل سريع مبرّد",
      description: "نصلك خلال 45 دقيقة بسيارات مخصصة مجهزة بنظام تبريد ذكي يحافظ على نضارة الخضار وجودة المجمدات واللحوم.",
      badge: "فائق السرعة"
    },
    {
      icon: <Store size={24} className="text-[#19C37D]" />,
      title: "استلام فوري من الفرع",
      description: "اطلب جميع احتياجاتك من السوبرماركت واستلمها مغلفة وجاهزة من الفرع الأقرب إليك مباشرةً لتوفير وقتك الثمين.",
      badge: "جاهز بـ 15 دقيقة"
    },
    {
      icon: <ShieldCheck size={24} className="text-[#19C37D]" />,
      title: "ضمان نضارة وجودة 100%",
      description: "نلتزم بأعلى معايير سلامة الأغذية. في حال لم تكن راضياً عن جودة أو نضارة أي منتج، نستبدله لك فوراً بدون أي رسوم.",
      badge: "أمان كامل"
    },
    {
      icon: <MessageSquare size={24} className="text-[#19C37D]" />,
      title: "دعم مخصص على مدار الساعة",
      description: "فريق المساعد الذكي وخدمة العملاء متواجد لمساعدتك وحل أي مشكلة تخص طلبك أو حسابك عبر الدردشة والمكالمات في أي وقت.",
      badge: "24/7 متصل"
    }
  ];

  // FAQs data
  const faqs: FAQItem[] = [
    {
      question: "ما هي مناطق التوصيل المتاحة في هايبر المصري؟",
      answer: "نغطي حالياً كافة مناطق القاهرة الكبرى والجيزة بما فيها التجمع، الرحاب، الشيخ زايد، أكتوبر، وسط البلد، والمعادي. نعمل جاهدين على توسيع شبكتنا لتشمل الإسكندرية والمحافظات الأخرى قريباً جداً."
    },
    {
      question: "كيف يتم ضمان جودة الأغذية الطازجة والمجمدات أثناء التوصيل؟",
      answer: "سلامتكم هي أولويتنا القصوى. نقوم بفرز الخضار واللحوم في بيئة معقمة ومبردة قبل التعبئة. يتم شحن طلبك في صناديق حرارية مخصصة داخل سيارات مبردة بالكامل، لضمان الحفاظ على سلسلة التبريد من مستودعاتنا حتى عتبة بابك."
    },
    {
      question: "كيف يمكنني تجميع واستخدام نقاط برنامج الولاء؟",
      answer: "عند تفعيل برنامج الولاء الذكي المجاني، تكسب نقطة واحدة مقابل كل 10 جنيهات تنفقها في التسوق. يتم قيد النقاط في رصيدك فور توصيل الطلب. يمكنك تجميع هذه النقاط واستبدالها بخصومات فورية عند الدفع، أو الحصول على قسائم شراء مجانية."
    },
    {
      question: "هل يمكنني إلغاء الطلب أو تعديل المنتجات بعد التأكيد؟",
      answer: "نعم بكل تأكيد! طالما لم يخرج طلبك مع سائق التوصيل (الخطوة 3 في التتبع)، يمكنك تعديله بسهولة من خلال التحدث مباشرة مع مساعدك الذكي عبر الدردشة، أو التواصل مع فريق دعم العملاء لتعديل المنتجات أو تغيير موعد الاستلام."
    },
    {
      question: "هل يتطلب الدفع بطاقة ائتمانية فقط؟",
      answer: "نوفر لك خيارات مرنة متعددة ومريحة للغاية: يمكنك الدفع نقداً عند الاستلام (COD)، أو الدفع ببطاقتك الائتمانية عبر بوابة الدفع الآمنة، أو استخدام ماكينة الدفع بالبطاقة التي يحملها مندوب التوصيل عند باب منزلك."
    }
  ];

  // Loyalty calculations
  const earnedPoints = Math.floor(spendValue / 10);
  const cashbackValue = Math.floor(spendValue * 0.05); // 5% cashback equivalency

  return (
    <div className="space-y-16 py-4 text-right">
      
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto space-y-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#19C37D]/10 text-[#19C37D] border border-[#19C37D]/20"
        >
          <Award size={13} />
          <span>خدمات هايبر المصري المميزة</span>
        </motion.div>
        <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-slate-850 dark:text-white leading-tight">
          جودة الخدمة التي تليق بعائلتكم
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
          نسعى لتقديم تجربة تسوق متكاملة تجمع بين السرعة الفائقة والأمان المطلق، لنبني معكم جسوراً من الثقة والراحة تدوم طويلاً.
        </p>
      </div>

      {/* 2. SERVICES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative bg-white dark:bg-[#0f1012] border border-slate-200/60 dark:border-white/5 p-6 rounded-3xl shadow-xs dark:shadow-none hover:shadow-xl hover:border-[#19C37D]/30 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-row-reverse">
                <div className="w-12 h-12 rounded-2xl bg-[#19C37D]/10 flex items-center justify-center">
                  {service.icon}
                </div>
                {service.badge && (
                  <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-bold border border-slate-200/40 dark:border-white/5">
                    {service.badge}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{service.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{service.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. DUAL SECTION: LOYALTY & FAQ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4 items-stretch">
        
        {/* RIGHT COLUMN: FAQ ACCORDION (8/12) */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 flex-row-reverse mb-2">
              <HelpCircle className="text-[#19C37D]" size={20} />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">الأسئلة الشائعة والاستفسارات</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              كل ما تود معرفته عن خدمات التوصيل، طرق الدفع والضمانات لتسوق سهل ومريح.
            </p>
          </div>

          <div className="space-y-4 flex-1">
            {faqs.map((faq, index) => {
              const isOpen = openFAQIndex === index;
              return (
                <div 
                  key={index}
                  className="border border-slate-200/50 dark:border-white/5 bg-white dark:bg-[#0c0d0f] rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFAQIndex(isOpen ? null : index)}
                    className="w-full p-4 flex justify-between items-center text-right flex-row-reverse gap-4 font-bold text-slate-800 dark:text-slate-200 hover:text-[#19C37D] transition-colors"
                  >
                    <span className="text-xs sm:text-sm">{faq.question}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-slate-400 hover:text-[#19C37D]"
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 pt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/2">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* LEFT COLUMN: LOYALTY CALCULATOR (5/12) */}
        <div className="lg:col-span-5">
          <div className="h-full bg-gradient-to-b from-[#111613] to-[#0a0d0b] dark:from-[#0d120e] dark:to-[#070908] border border-[#19C37D]/10 dark:border-[#19C37D]/5 rounded-3xl p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-xl">
            
            {/* Ambient Green background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#19C37D]/10 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between flex-row-reverse">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#19C37D]/15 text-[#19C37D]">
                  <Coins size={12} />
                  <span>برنامج الملوك والنقاط</span>
                </div>
                <Gift className="text-[#19C37D]" size={20} />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-serif font-bold text-white">برنامج الولاء الرقمي</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  احسب نقاطك ومكافآتك الآن! كل عملية تسوق عائلي تعود عليك بالتوفير الحقيقي المستدام.
                </p>
              </div>

              {/* Slider Input */}
              <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="flex justify-between items-baseline flex-row-reverse text-xs">
                  <span className="text-slate-450">مشترياتك الشهرية المتوقعة</span>
                  <span className="text-[#19C37D] font-mono font-bold text-base">
                    {spendValue.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
                
                <input 
                  type="range" 
                  min="300" 
                  max="10000" 
                  step="100"
                  value={spendValue}
                  onChange={(e) => setSpendValue(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#19C37D]"
                  style={{ direction: 'rtl' }}
                />
                
                <div className="flex justify-between text-[10px] text-slate-500 font-mono flex-row-reverse">
                  <span>٣٠٠ ج.م</span>
                  <span>١٠,٠٠٠ ج.م</span>
                </div>
              </div>

              {/* Stats Output */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/3 p-4 rounded-2xl border border-white/2 text-center">
                  <span className="text-[10px] text-slate-400 block mb-1">النقاط المكتسبة</span>
                  <span className="text-xl font-bold font-mono text-white block">+{earnedPoints.toLocaleString('ar-EG')}</span>
                  <span className="text-[9px] text-slate-500">نقطة رصيد مضافة</span>
                </div>
                
                <div className="bg-[#19C37D]/5 p-4 rounded-2xl border border-[#19C37D]/10 text-center">
                  <span className="text-[10px] text-[#19C37D] block mb-1">توفير كاش باك مباشر</span>
                  <span className="text-xl font-bold font-mono text-[#19C37D] block">{cashbackValue.toLocaleString('ar-EG')} ج.م</span>
                  <span className="text-[9px] text-slate-450">قسيمة شراء فورية</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-5 mt-6 relative z-10 flex flex-col gap-3">
              <div className="flex justify-between items-center flex-row-reverse text-xs text-slate-400">
                <span>الاشتراك بالبرنامج:</span>
                <span className="text-[#19C37D] font-bold">مجاني بالكامل للأبد</span>
              </div>
              <button 
                onClick={() => {
                  alert("مرحباً بك! تم تفعيل اشتراكك في برنامج الولاء تلقائياً برقم هاتفك المسجل.");
                }}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#19C37D] text-black hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>فعّل حساب الولاء المجاني الآن</span>
                <ArrowRightLeft size={12} />
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
