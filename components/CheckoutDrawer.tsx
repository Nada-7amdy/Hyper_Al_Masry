import React, { useState } from 'react';
import { X, MapPin, Phone, User, Home, Building, CreditCard, Banknote, ShieldCheck, AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, PaymentMethodType, CustomerAddressDetails, ActiveOrder } from '../types';
import { normalizeArabicNumerals, normalizeEgyptianPhone, EGY_PHONE_REGEX } from '../utils/phone';

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  cartTotal: number;
  onOrderSuccess: (order: ActiveOrder) => void;
}

const CAIRO_GIZA_DISTRICTS = [
  "القاهرة الجديدة (التجمع الخامس)",
  "الشيخ زايد",
  "المعادي",
  "الزمالك",
  "مصر الجديدة",
  "الدقي والمهندسين",
  "مدينة نصر",
  "السادس من أكتوبر"
];

export const CheckoutDrawer: React.FC<CheckoutDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  cartTotal,
  onOrderSuccess
}) => {
  // Load saved customer profile if any
  const savedProfile = (() => {
    try {
      const s = localStorage.getItem('almasri_customer_profile');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();

  const [customerName, setCustomerName] = useState(savedProfile?.name || '');
  const [customerPhone, setCustomerPhone] = useState(savedProfile?.phone || '');
  const [governorate, setGovernorate] = useState(savedProfile?.governorate || 'القاهرة');
  const [district, setDistrict] = useState(savedProfile?.district || 'القاهرة الجديدة (التجمع الخامس)');
  const [street, setStreet] = useState(savedProfile?.street || '');
  const [building, setBuilding] = useState(savedProfile?.building || '');
  const [floor, setFloor] = useState(savedProfile?.floor || '');
  const [apartment, setApartment] = useState(savedProfile?.apartment || '');
  const [landmark, setLandmark] = useState(savedProfile?.landmark || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CASH_ON_DELIVERY');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryFee = cartTotal >= 150 ? 0 : 15;
  const finalTotal = cartTotal + deliveryFee;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerName.trim() || customerName.trim().length < 3) {
      newErrors.customerName = 'الرجاء إدخال الاسم الكامل (٣ أحرف على الأقل)';
    }

    const cleanPhone = normalizeEgyptianPhone(customerPhone);
    if (!cleanPhone) {
      newErrors.customerPhone = 'رقم الموبايل إلزامي للتواصل أثناء التوصيل';
    } else if (!EGY_PHONE_REGEX.test(cleanPhone)) {
      newErrors.customerPhone = 'رقم الموبايل يجب أن يتكون من ١١ رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015';
    }

    if (!street.trim() || street.trim().length < 3) {
      newErrors.street = 'الرجاء كتابة اسم الشارع والموقع بالتفصيل';
    }

    if (!building.trim()) {
      newErrors.building = 'رقم العمارة مطلوب';
    }

    if (!floor.trim()) {
      newErrors.floor = 'رقم الدور مطلوب';
    }

    if (!apartment.trim()) {
      newErrors.apartment = 'رقم الشقة مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const normalizedPhone = normalizeEgyptianPhone(customerPhone);
    const normalizedBuilding = normalizeArabicNumerals(building.trim());
    const normalizedFloor = normalizeArabicNumerals(floor.trim());
    const normalizedApartment = normalizeArabicNumerals(apartment.trim());

    const fullAddress = `${governorate}، ${district}، ${street.trim()}، عمارة ${normalizedBuilding}، دور ${normalizedFloor}، شقة ${normalizedApartment}${landmark.trim() ? ` (علامة مميزة: ${landmark.trim()})` : ''}`;

    const addressDetails: CustomerAddressDetails = {
      governorate,
      district,
      street: street.trim(),
      building: normalizedBuilding,
      floor: normalizedFloor,
      apartment: normalizedApartment,
      landmark: landmark.trim() || undefined
    };

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}-EG`;
    const itemsCount = cart.reduce((acc, item) => acc + (item.isWeightBased ? 1 : item.quantity), 0);

    const newOrder: ActiveOrder = {
      orderId,
      customerName: customerName.trim(),
      customerPhone: normalizedPhone,
      itemsCount,
      total: finalTotal,
      subtotal: cartTotal,
      deliveryFee,
      address: fullAddress,
      addressDetails,
      paymentMethod,
      status: 'PREPARING',
      createdAt: new Date().toISOString(),
      isSimulatedDemo: true
    };

    // Save customer profile for future visits
    try {
      localStorage.setItem('almasri_customer_profile', JSON.stringify({
        name: customerName.trim(),
        phone: normalizedPhone,
        governorate,
        district,
        street: street.trim(),
        building: normalizedBuilding,
        floor: normalizedFloor,
        apartment: normalizedApartment,
        landmark: landmark.trim()
      }));
    } catch {
      // safe fallback
    }

    onOrderSuccess(newOrder);
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Drawer */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-lg bg-white dark:bg-[#0f1013] text-slate-800 dark:text-white h-full shadow-2xl z-10 flex flex-col text-right overflow-hidden border-l border-slate-200 dark:border-white/10"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-150 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-[#151619]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                تأكيد بيانات التوصيل والدفع
              </h3>
              <p className="text-[11px] text-slate-400">توصيل كونسيرج فاخر معقم ومبرّد</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Customer Personal Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <User size={15} />
              <span>بيانات المستلم والتواصل</span>
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="مثال: كريم عبد العزيز"
                className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white ${errors.customerName ? 'border-red-500' : 'border-slate-200 dark:border-white/10'}`}
              />
              {errors.customerName && <p className="text-[10px] text-red-500 mt-1">{errors.customerName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                رقم الموبايل المصري <span className="text-red-500">*</span>
              </label>
              <input 
                type="tel"
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value);
                  if (errors.customerPhone) {
                    setErrors(prev => ({ ...prev, customerPhone: '' }));
                  }
                }}
                onBlur={() => {
                  if (customerPhone.trim()) {
                    const normalized = normalizeEgyptianPhone(customerPhone);
                    if (normalized && EGY_PHONE_REGEX.test(normalized)) {
                      setCustomerPhone(normalized);
                    }
                  }
                }}
                placeholder="010XXXXXXXX / 011 / 012 / 015"
                className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs font-mono focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white ${errors.customerPhone ? 'border-red-500' : 'border-slate-200 dark:border-white/10'}`}
              />
              {errors.customerPhone && <p className="text-[10px] text-red-500 mt-1">{errors.customerPhone}</p>}
              <p className="text-[10px] text-slate-400 mt-1">يُستخدم لتواصل المندوب عند الوصول وتأكيد العنوان عبر الواتساب.</p>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-white/5" />

          {/* Detailed Delivery Address */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <MapPin size={15} />
              <span>عنوان التوصيل المفصل</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">المحافظة</label>
                <select 
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1a1b1e] border border-slate-200 dark:border-white/10 text-xs font-bold focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                >
                  <option value="القاهرة">القاهرة</option>
                  <option value="الجيزة">الجيزة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">الحي / المنطقة</label>
                <select 
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1a1b1e] border border-slate-200 dark:border-white/10 text-xs font-bold focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                >
                  {CAIRO_GIZA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                اسم الشارع والحي بالتفصيل <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="مثال: شارع التسعين الجنوبي، بجوار البنك الأهلي"
                className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white ${errors.street ? 'border-red-500' : 'border-slate-200 dark:border-white/10'}`}
              />
              {errors.street && <p className="text-[10px] text-red-500 mt-1">{errors.street}</p>}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  رقم العمارة <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="مثال: 45"
                  className={`w-full p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs text-center focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white ${errors.building ? 'border-red-500' : 'border-slate-200 dark:border-white/10'}`}
                />
                {errors.building && <p className="text-[9px] text-red-500 mt-0.5">{errors.building}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  رقم الدور <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="مثال: 3"
                  className={`w-full p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs text-center focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white ${errors.floor ? 'border-red-500' : 'border-slate-200 dark:border-white/10'}`}
                />
                {errors.floor && <p className="text-[9px] text-red-500 mt-0.5">{errors.floor}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  رقم الشقة <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  placeholder="مثال: 12"
                  className={`w-full p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs text-center focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white ${errors.apartment ? 'border-red-500' : 'border-slate-200 dark:border-white/10'}`}
                />
                {errors.apartment && <p className="text-[9px] text-red-500 mt-0.5">{errors.apartment}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                علامة مميزة أو تعليمات التوصيل (اختياري)
              </label>
              <input 
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="مثال: جرس الباب يمين المصعد، يرجى عدم رن الجرس بعد 10 م"
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-white/5" />

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CreditCard size={15} />
              <span>طريقة الدفع عند الاستلام</span>
            </h4>

            <div className="grid grid-cols-1 gap-2.5">
              <label 
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'CASH_ON_DELIVERY' 
                    ? 'bg-emerald-500/10 border-emerald-500 text-slate-900 dark:text-white shadow-sm' 
                    : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Banknote className="text-emerald-500" size={18} />
                  <div>
                    <p className="text-xs font-bold">الدفع نقداً عند الاستلام (كاش)</p>
                    <p className="text-[10px] text-slate-400">ادفع للمندوب مباشرة بعد استلام وتأكيد الأصناف</p>
                  </div>
                </div>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="CASH_ON_DELIVERY"
                  checked={paymentMethod === 'CASH_ON_DELIVERY'}
                  onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  className="accent-emerald-500 w-4 h-4"
                />
              </label>

              <label 
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'CARD_ON_DELIVERY' 
                    ? 'bg-emerald-500/10 border-emerald-500 text-slate-900 dark:text-white shadow-sm' 
                    : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="text-emerald-500" size={18} />
                  <div>
                    <p className="text-xs font-bold">الدفع بالفيزا / بطاقة بنكية مع المندوب</p>
                    <p className="text-[10px] text-slate-400">مندوبنا مزود بماكينة دفع إلكتروني POS لاسلكية</p>
                  </div>
                </div>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="CARD_ON_DELIVERY"
                  checked={paymentMethod === 'CARD_ON_DELIVERY'}
                  onChange={() => setPaymentMethod('CARD_ON_DELIVERY')}
                  className="accent-emerald-500 w-4 h-4"
                />
              </label>

              <div className="p-3 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01] flex items-center justify-between opacity-60">
                <div className="text-xs">
                  <span className="font-bold text-slate-500">إنستاباي / فودافون كاش / بطاقات أونلاين</span>
                  <p className="text-[10px] text-slate-400">قريباً مع التحديث القادم</p>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400">قريباً</span>
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-slate-50 dark:bg-white/[0.03] p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">قيمة المشتريات:</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{cartTotal.toLocaleString('ar-EG')} ج.م</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">رسوم التوصيل المبرد:</span>
              <span className="font-bold text-emerald-500">{deliveryFee === 0 ? 'مجاني بالكامل 🎉' : '١٥ ج.م'}</span>
            </div>
            <div className="h-px bg-slate-200 dark:bg-white/5 my-1" />
            <div className="flex justify-between text-base font-bold">
              <span className="text-slate-900 dark:text-white">الإجمالي المستحق:</span>
              <span className="font-mono text-emerald-500">{finalTotal.toLocaleString('ar-EG')} ج.م</span>
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
                <span>جاري تسجيل وحفظ طلبك...</span>
              </>
            ) : (
              <>
                <Check size={18} />
                <span>تأكيد الطلب وبدء التحضير فوراً ({finalTotal.toLocaleString('ar-EG')} ج.م)</span>
              </>
            )}
          </button>

        </form>
      </motion.div>
    </div>
  );
};
