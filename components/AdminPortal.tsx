import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { 
  verifyIsAdmin, 
  loginAdmin, 
  registerAdmin,
  resetAdminPassword,
  logoutUser, 
  getArabicAuthErrorMessage,
  TRUSTED_ADMIN_EMAILS
} from '../services/auth';
import { AdminDashboard } from './AdminDashboard';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  LogOut, 
  CheckCircle2, 
  Store,
  KeyRound,
  UserCheck,
  Sparkles
} from 'lucide-react';

interface AdminPortalProps {
  onBackToStore: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToStore }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Mode: 'login' (تسجيل دخول) | 'register' (تفعيل حساب أول مرة) | 'forgot' (استعادة كلمة المرور)
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Admin form states
  const [adminEmail, setAdminEmail] = useState('nada11eelmasry@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCheckingAuth(true);
      setCurrentUser(user);
      if (user) {
        const adminStatus = await verifyIsAdmin(user);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const trimmedEmail = adminEmail.trim().toLowerCase();

    if (!trimmedEmail) {
      setAuthError('يرجى إدخال البريد الإلكتروني للمسؤول.');
      return;
    }

    if (mode === 'forgot') {
      setActionLoading(true);
      try {
        await resetAdminPassword(trimmedEmail);
        setAuthSuccess(`تم إرسال رابط إعادة تعيين كلمة المرور إلى ${trimmedEmail} بنجاح. يرجى مراجعة بريدك الوارد.`);
      } catch (err: any) {
        console.warn("Reset password error:", err);
        if (err?.message === 'UNAUTHORIZED_NOT_ADMIN') {
          setAuthError('❌ هذا البريد الإلكتروني غير مصرح له بالوصول إلى لوحة الإدارة.');
        } else {
          setAuthError(getArabicAuthErrorMessage(err?.code || ''));
        }
      } finally {
        setActionLoading(false);
      }
      return;
    }

    if (!adminPassword) {
      setAuthError('يرجى إدخال كلمة المرور.');
      return;
    }

    if (mode === 'register') {
      if (adminPassword.length < 6) {
        setAuthError('كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام.');
        return;
      }
      if (adminPassword !== confirmPassword) {
        setAuthError('كلمتا المرور غير متطابقتين.');
        return;
      }

      setActionLoading(true);
      try {
        await registerAdmin(trimmedEmail, adminPassword, 'ندى المصري (المدير العام)');
        setAuthSuccess('تم تفعيل وتوثيق حساب الإدارة بنجاح! جاري فتح لوحة التحكم...');
      } catch (err: any) {
        console.warn("Register admin error:", err);
        if (err?.message === 'UNAUTHORIZED_NOT_ADMIN') {
          setAuthError('❌ هذا البريد الإلكتروني ليس ضمن قائمة مديري الإدارة العائلية المعتمدين.');
        } else if (err?.code === 'auth/email-already-in-use') {
          setAuthError('هذا الحساب مفعل ومسجل بالفعل في النظام! يمكنك تسجيل الدخول مباشرة بكلمة المرور أو استعادتها.');
          setMode('login');
        } else {
          setAuthError(getArabicAuthErrorMessage(err?.code || ''));
        }
      } finally {
        setActionLoading(false);
      }
      return;
    }

    // Default: Mode === 'login'
    setActionLoading(true);
    try {
      await loginAdmin(trimmedEmail, adminPassword);
    } catch (err: any) {
      console.warn("Admin portal login error:", err);
      if (err?.message === 'UNAUTHORIZED_NOT_ADMIN') {
        setAuthError('❌ تم رفض الدخول: هذا الحساب مسجل كعميل عادي ولا يمتلك صلاحيات الإدارة العائلية.');
      } else {
        const code = err?.code || '';
        setAuthError(getArabicAuthErrorMessage(code));
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminSignOut = async () => {
    await logoutUser();
    setIsAdmin(false);
    setCurrentUser(null);
  };

  // 1. Loading state
  if (checkingAuth) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center" dir="rtl">
        <Loader2 size={36} className="animate-spin text-emerald-500 mb-4" />
        <p className="font-cairo text-sm font-bold text-slate-700 dark:text-gray-300">
          جاري التحقق من أذونات الإدارة والتشفير...
        </p>
      </div>
    );
  }

  // 2. Authenticated Admin View: Render Full Admin Dashboard
  if (currentUser && isAdmin) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300" dir="rtl">
        {/* Top Verified Admin Security Ribbon */}
        <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-cairo">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400">جلسة إدارة عائلية موثقة ومعتمدة</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                المسؤول: {currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onBackToStore}
              className="flex-1 sm:flex-initial px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Store size={14} />
              <span>واجهة المتجر</span>
            </button>
            <button
              onClick={handleAdminSignOut}
              className="flex-1 sm:flex-initial px-4 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut size={14} />
              <span>تسجيل خروج الإدارة</span>
            </button>
          </div>
        </div>

        {/* Existing Admin Dashboard */}
        <AdminDashboard onBackToStore={onBackToStore} />
      </div>
    );
  }

  // 3. Unauthenticated or Non-Admin: Isolated Secure Admin Login Form
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-[#111113] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden font-cairo">
        {/* Top Gold/Emerald Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 text-emerald-400">
            <Shield size={28} />
          </div>
          <h2 className="text-2xl font-black text-white">بوابة الإدارة العائلية</h2>
          <p className="text-xs text-gray-400 mt-1">
            منطقة مخصصة وحصرية لإدارة هايبر المصري (HyperPOS & Management)
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-white/5 p-1 rounded-2xl mb-6 border border-white/5">
          <button
            type="button"
            onClick={() => { setMode('login'); setAuthError(''); setAuthSuccess(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Lock size={14} />
            <span>تسجيل الدخول</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setAuthError(''); setAuthSuccess(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>تفعيل حساب لأول مرة</span>
          </button>
        </div>

        {/* Success Alert */}
        {authSuccess && (
          <div className="p-3.5 mb-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5 text-emerald-400" />
            <span className="leading-relaxed">{authSuccess}</span>
          </div>
        )}

        {/* Error Alert */}
        {authError && (
          <div className="p-3.5 mb-5 rounded-2xl bg-red-950/30 border border-red-500/30 text-red-400 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{authError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAdminSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-300">
                البريد الإلكتروني للمسؤول
              </label>
              <button
                type="button"
                onClick={() => setAdminEmail('nada11eelmasry@gmail.com')}
                className="text-[10px] text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>إيميل الإدارة: nada11eelmasry@gmail.com</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="nada11eelmasry@gmail.com"
                required
                autoFocus
                className="w-full bg-[#18181b] border border-white/10 rounded-xl py-3 px-3.5 pr-10 text-xs text-white outline-none focus:border-emerald-500 transition-colors font-sans"
              />
              <Mail size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-500" />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-300">
                  {mode === 'register' ? 'تعيين كلمة المرور الجديدة' : 'كلمة المرور السرية'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setAuthError(''); setAuthSuccess(''); }}
                    className="text-[10px] text-gray-400 hover:text-emerald-400 cursor-pointer"
                  >
                    نسيت كلمة المرور؟
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder={mode === 'register' ? '6 أحرف أو أرقام على الأقل' : '••••••••••••'}
                  required
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl py-3 px-3.5 pr-10 text-xs text-white outline-none focus:border-emerald-500 transition-colors font-mono"
                />
                <Lock size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-500" />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                تأكيد كلمة المرور الجديدة
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد كتابة كلمة المرور"
                  required
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl py-3 px-3.5 pr-10 text-xs text-white outline-none focus:border-emerald-500 transition-colors font-mono"
                />
                <KeyRound size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-500" />
              </div>
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed bg-white/5 p-2.5 rounded-xl border border-white/5">
                💡 خاص بالمسؤول المعتمد: هذه الخطوة لمرة واحدة فقط لإنشاء كلمة المرور الخاصة بك وتفعيل وصولك المباشر للنظام.
              </p>
            </div>
          )}

          {mode === 'forgot' && (
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-[11px] text-gray-300 leading-relaxed">
              سيتم إرسال رابط آمن ومباشر إلى بريدك الإلكتروني لإعادة تعيين كلمة المرور الخاصة بك.
            </div>
          )}

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-60 text-black font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 mt-2"
          >
            {actionLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>جاري معالجة الطلب...</span>
              </>
            ) : mode === 'register' ? (
              <>
                <UserCheck size={16} />
                <span>تفعيل حساب الإدارة وتعيين كلمة المرور</span>
              </>
            ) : mode === 'forgot' ? (
              <>
                <Mail size={16} />
                <span>إرسال رابط إعادة التعيين</span>
              </>
            ) : (
              <>
                <Lock size={14} />
                <span>تسجيل الدخول للإدارة</span>
              </>
            )}
          </button>

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => { setMode('login'); setAuthError(''); setAuthSuccess(''); }}
              className="w-full py-2 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer text-center block"
            >
              العودة لتسجيل الدخول
            </button>
          )}
        </form>

        {/* Security Notice */}
        <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-gray-500 text-center space-y-3">
          <p className="leading-relaxed">
            🔒 الدخول مقصور على أفراد العائلة وإدارة المتجر المعتمدة. جميع محاولات الدخول مسجلة ومشفرة بنظام Firebase Authentication و Firestore Security Rules.
          </p>
          <button
            type="button"
            onClick={onBackToStore}
            className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowRight size={14} />
            <span>العودة لواجهة تسوق العملاء</span>
          </button>
        </div>
      </div>
    </div>
  );
};
