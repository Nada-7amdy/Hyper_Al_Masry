import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  User,
  getIdTokenResult,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export type UserRole = 'GUEST' | 'CUSTOMER' | 'ADMIN';

export interface CustomerProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  district?: string;
  address?: string;
  role: UserRole;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  role: UserRole;
  isAdmin: boolean;
  profile: CustomerProfile | null;
  loading: boolean;
}

/**
 * Translates Firebase Auth error codes into friendly Arabic messages
 */
export const getArabicAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'صيغة البريد الإلكتروني غير صحيحة، يرجى التأكد من كتابته بشكل سليم.';
    case 'auth/user-disabled':
      return 'تم تعطيل هذا الحساب مؤقتاً، يرجى التواصل مع إدارة المتجر.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'بيانات الدخول غير صحيحة، يرجى التأكد من البريد الإلكتروني وكلمة المرور.';
    case 'auth/email-already-in-use':
      return 'هذا البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول بدلاً من إنشاء حساب جديد.';
    case 'auth/weak-password':
      return 'كلمة المرور ضعيفة، يجب أن تحتوي على 6 أحرف أو أرقام على الأقل.';
    case 'auth/too-many-requests':
      return 'تمت محاولة تسجيل الدخول عدة مرات بشكل غير صحيح، يرجى الانتظار قليلاً والمحاولة مجدداً.';
    case 'auth/network-request-failed':
      return 'تعذر الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت.';
    default:
      return 'حدث خطأ أثناء المصادقة، يرجى المحاولة مرة أخرى.';
  }
};

export const TRUSTED_ADMIN_EMAILS = [
  'nada11eelmasry@gmail.com'
];

/**
 * Checks whether a user is an authorized administrator.
 * Security verification checks:
 * 1. Verified owner / family admin emails (TRUSTED_ADMIN_EMAILS)
 * 2. Firebase Auth Custom Claims (token.admin == true or token.role == 'admin')
 * 3. Firestore collection `/admins/{uid}` document existence
 */
export const verifyIsAdmin = async (user: User | null): Promise<boolean> => {
  if (!user) return false;

  // 1. Check verified master admin / owner emails
  if (user.email && TRUSTED_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return true;
  }

  // 2. Check custom claims on ID token
  try {
    const tokenResult = await getIdTokenResult(user, true);
    if (tokenResult.claims.admin === true || tokenResult.claims.role === 'admin') {
      return true;
    }
  } catch (err) {
    console.warn("Could not check custom claims:", err);
  }

  // 2. Check Firestore /admins/{uid} collection
  try {
    const adminDoc = await getDoc(doc(db, "admins", user.uid));
    if (adminDoc.exists()) {
      return true;
    }
  } catch (err) {
    console.warn("Could not check Firestore /admins collection:", err);
  }

  return false;
};

/**
 * Register a new customer
 */
export const registerCustomer = async (
  email: string, 
  pass: string, 
  name: string, 
  phone?: string
): Promise<CustomerProfile> => {
  const trimmedEmail = email.trim();
  const trimmedName = name.trim();

  const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
  const user = userCredential.user;

  // Update display name on Firebase Auth profile
  if (trimmedName) {
    try {
      await updateProfile(user, { displayName: trimmedName });
    } catch {
      // Profile update non-blocking
    }
  }

  const profile: CustomerProfile = {
    uid: user.uid,
    name: trimmedName || 'عميل هايبر المصري',
    email: user.email || trimmedEmail,
    phone: phone?.trim() || '',
    role: 'CUSTOMER',
    createdAt: new Date().toISOString()
  };

  // Persist customer profile in Firestore /users/{uid}
  try {
    await setDoc(doc(db, "users", user.uid), {
      ...profile,
      serverCreatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn("Could not save profile to Firestore, preserved locally:", err);
  }

  // Cache in localStorage for offline availability
  try {
    localStorage.setItem('almasri_customer_profile', JSON.stringify(profile));
  } catch (e) {
    console.warn("localStorage write failed:", e);
  }

  return profile;
};

/**
 * Sign in an existing customer
 */
export const loginCustomer = async (email: string, pass: string): Promise<CustomerProfile> => {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  const user = userCredential.user;

  // Retrieve existing profile from Firestore or construct from user data
  let profile: CustomerProfile = {
    uid: user.uid,
    name: user.displayName || 'عميل هايبر المصري',
    email: user.email || email.trim(),
    role: 'CUSTOMER'
  };

  try {
    const docSnap = await getDoc(doc(db, "users", user.uid));
    if (docSnap.exists()) {
      const data = docSnap.data();
      profile = {
        uid: user.uid,
        name: data.name || user.displayName || 'عميل هايبر المصري',
        email: data.email || user.email || email.trim(),
        phone: data.phone || '',
        district: data.district || '',
        address: data.address || '',
        role: 'CUSTOMER'
      };
    }
  } catch (err) {
    console.warn("Could not fetch remote customer profile:", err);
  }

  try {
    localStorage.setItem('almasri_customer_profile', JSON.stringify(profile));
  } catch (e) {
    console.warn("localStorage write failed:", e);
  }

  return profile;
};

/**
 * Sign in an administrator via private portal
 * Validates that the authenticated user genuinely possesses the ADMIN role
 */
export const loginAdmin = async (email: string, pass: string): Promise<CustomerProfile> => {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  const user = userCredential.user;

  const isAdmin = await verifyIsAdmin(user);
  if (!isAdmin) {
    // Immediately terminate the session if not an administrator
    await signOut(auth);
    throw new Error("UNAUTHORIZED_NOT_ADMIN");
  }

  const adminProfile: CustomerProfile = {
    uid: user.uid,
    name: user.displayName || 'مسؤول الإدارة العائلية',
    email: user.email || email.trim(),
    role: 'ADMIN'
  };

  return adminProfile;
};

/**
 * Register/Activate an authorized administrator for the first time
 */
export const registerAdmin = async (
  email: string, 
  pass: string, 
  name?: string
): Promise<CustomerProfile> => {
  const trimmedEmail = email.trim().toLowerCase();
  
  // Guard: Only trusted admin emails can register as admin
  if (!TRUSTED_ADMIN_EMAILS.includes(trimmedEmail)) {
    throw new Error("UNAUTHORIZED_NOT_ADMIN");
  }

  const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
  const user = userCredential.user;

  const adminName = name?.trim() || 'ندى المصري (المدير العام)';
  try {
    await updateProfile(user, { displayName: adminName });
  } catch (err) {
    console.warn("Could not update admin displayName:", err);
  }

  // Also write to /admins/{uid} in Firestore
  try {
    await setDoc(doc(db, "admins", user.uid), {
      uid: user.uid,
      email: trimmedEmail,
      name: adminName,
      role: 'ADMIN',
      createdAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn("Could not write to /admins collection:", err);
  }

  const adminProfile: CustomerProfile = {
    uid: user.uid,
    name: adminName,
    email: trimmedEmail,
    role: 'ADMIN'
  };

  try {
    localStorage.setItem('almasri_customer_profile', JSON.stringify(adminProfile));
  } catch (e) {
    console.warn("localStorage write failed:", e);
  }

  return adminProfile;
};

/**
 * Send password reset email to authorized admin
 */
export const resetAdminPassword = async (email: string): Promise<void> => {
  const trimmedEmail = email.trim().toLowerCase();
  if (!TRUSTED_ADMIN_EMAILS.includes(trimmedEmail)) {
    throw new Error("UNAUTHORIZED_NOT_ADMIN");
  }
  await sendPasswordResetEmail(auth, trimmedEmail);
};

/**
 * Sign out current user (Customer or Admin)
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn("Firebase sign out error:", err);
  }
  try {
    localStorage.removeItem('almasri_customer_profile');
  } catch (e) {
    console.warn("localStorage remove failed:", e);
  }
};
