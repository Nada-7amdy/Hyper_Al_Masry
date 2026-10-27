import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { verifyIsAdmin, loginAdmin, logoutUser, getArabicAuthErrorMessage } from '../services/auth';
import { AdminDashboard } from './AdminDashboard';
import { Shield, Lock, Mail, ArrowRight, Loader2, AlertCircle, LogOut, CheckCircle2, Store } from 'lucide-react';

interface AdminPortalProps {
  onBackToStore: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToStore }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Admin login form states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [authError, setAuthError] = useState('');

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

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!adminEmail.trim() || !adminPassword) {
      setAuthError('يرجى إدخال البريد الإلكتروني وكلمة المرور للإدارة.');
      return;
    }

    setLoginLoading(true);
    try {
      await loginAdmin(adminEmail, adminPassword);
      // onAuthStateChanged will handle updating state
    } catch (err: any) {
      console.warn("Admin portal login error:", err);
      if (err?.message === 'UNAUTHORIZED_NOT_ADMIN') {
        setAuthError('❌ تم رفض الدخول: هذا الحساب مسجل كعميل عادي ولا يمتلك صلاحيات الإدارة العائلية.');
      } else {
        const code = err?.code || '';
        setAuthError(getArabicAuthErrorMessage(code));
      }
    } finally {
      setLoginLoading(false);
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

        {/* Error Alert */}
        {authError && (
          <div className="p-3.5 mb-5 rounded-2xl bg-red-950/30 border border-red-500/30 text-red-400 text-xs font-medium flex items-start gap-2.5">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{authError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              البريد الإلكتروني للمسؤول
            </label>
            <div className="relative">
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@hyperalmasri.app"
                required
                autoFocus
                className="w-full bg-[#18181b] border border-white/10 rounded-xl py-3 px-3.5 pr-10 text-xs text-white outline-none focus:border-emerald-500 transition-colors font-sans"
              />
              <Mail size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              كلمة المرور السرية
            </label>
            <div className="relative">
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-[#18181b] border border-white/10 rounded-xl py-3 px-3.5 pr-10 text-xs text-white outline-none focus:border-emerald-500 transition-colors font-mono"
              />
              <Lock size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-60 text-black font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            {loginLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>جاري التحقق من هوية المسؤول...</span>
              </>
            ) : (
              <>
                <Lock size={14} />
                <span>تسجيل الدخول للإدارة</span>
              </>
            )}
          </button>
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
