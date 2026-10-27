import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, Phone, Check, AlertCircle, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { registerCustomer, loginCustomer, getArabicAuthErrorMessage, CustomerProfile } from '../services/auth';
import { normalizeArabicNumerals, normalizeEgyptianPhone, EGY_PHONE_REGEX } from '../utils/phone';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: CustomerProfile) => void;
  initialMode?: 'login' | 'register';
  contextTitle?: string;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  contextTitle
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const resetForm = () => {
    setErrorMsg('');
    setLoginPassword('');
    setRegPassword('');
    setRegConfirmPassword('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg('يرجى ملء البريد الإلكتروني وكلمة المرور.');
      return;
    }

    setLoading(true);
    try {
      const profile = await loginCustomer(loginEmail, loginPassword);
      resetForm();
      onSuccess(profile);
      onClose();
    } catch (err: any) {
      console.warn("Customer login error:", err);
      const code = err?.code || '';
      setErrorMsg(getArabicAuthErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regName.trim()) {
      setErrorMsg('يرجى إدخال اسمك الكريم.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('كلمة المرور يجب أن تحتوي على 6 خانات على الأقل.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('كلمتا المرور غير متطابقتين.');
      return;
    }
    const normalizedPhone = normalizeEgyptianPhone(regPhone);
    if (regPhone && !EGY_PHONE_REGEX.test(normalizedPhone)) {
      setErrorMsg('يرجى إدخال رقم هاتف محمول مصري صحيح (11 رقماً يبدأ بـ 010 أو 011 أو 012 أو 015).');
      return;
    }

    setLoading(true);
    try {
      const profile = await registerCustomer(regEmail, regPassword, regName, normalizedPhone);
      resetForm();
      onSuccess(profile);
      onClose();
    } catch (err: any) {
      console.warn("Customer register error:", err);
      const code = err?.code || '';
      setErrorMsg(getArabicAuthErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/10 rounded-3xl max-w-md w-full p-6 text-right shadow-2xl relative overflow-hidden"
          dir="rtl"
        >
          {/* Top Emerald Gradient Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

          {/* Close button */}
          <button 
            onClick={() => { resetForm(); onClose(); }}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-cairo">
                {contextTitle || 'هايبر المصري — تجربة التسوق العائلية'}
              </span>
            </div>
            <h3 className="font-cairo font-black text-xl text-slate-900 dark:text-white">
              {mode === 'login' ? 'تسجيل الدخول إلى حسابك' : 'إنشاء حساب عميل جديد'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 font-cairo">
              {mode === 'login' 
                ? 'مرحباً بعودتك! سجّل دخولك لمتابعة طلباتك وعناوينك بسهولة.'
                : 'انضم إلينا لتجربة تسوق استثنائية، وحفظ سلتك وعناوين التوصيل.'}
            </p>
          </div>

          {/* Tabs switch */}
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl mb-5 text-xs font-bold font-cairo">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'login' 
                  ? 'bg-white dark:bg-[#1f1f23] text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(''); }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'register' 
                  ? 'bg-white dark:bg-[#1f1f23] text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              حساب جديد
            </button>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2"
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 font-cairo">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="example@mail.com"
                    required
                    className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-3 pr-10 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-colors"
                  />
                  <Mail size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 dark:text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-3 pr-10 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                  <Lock size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 dark:text-gray-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>جاري التحقق والدخول...</span>
                  </>
                ) : (
                  <>
                    <span>تسجيل الدخول الآن</span>
                    <ArrowLeft size={16} />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMsg(''); }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                >
                  عميل جديد؟ اضغط هنا لإنشاء حساب في دقيقة
                </button>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 font-cairo">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  الاسم الكامل
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="محمد أحمد المصري"
                    required
                    className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-3 pr-10 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-colors"
                  />
                  <UserIcon size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 dark:text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@domain.com"
                    required
                    className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-3 pr-10 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-colors"
                  />
                  <Mail size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 dark:text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  رقم الموبايل المصري للتوصيل (اختياري)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(normalizeArabicNumerals(e.target.value).replace(/[^0-9]/g, ''))}
                    maxLength={11}
                    placeholder="01012345678"
                    className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-3 pr-10 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                  <Phone size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 dark:text-gray-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="٦ خانات فأكثر"
                    required
                    className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                    تأكيد كلمة المرور
                  </label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="تأكيد الكلمة"
                    required
                    className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>جاري إنشاء الحساب...</span>
                  </>
                ) : (
                  <>
                    <span>إنشاء الحساب والبدء</span>
                    <Check size={16} />
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(''); }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                >
                  لديك حساب بالفعل؟ تسجيل الدخول
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
