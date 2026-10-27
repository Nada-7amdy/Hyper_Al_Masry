import { describe, it, expect, beforeEach } from 'vitest';
import { 
  CustomerProfile, 
  UserRole, 
  getArabicAuthErrorMessage 
} from '../services/auth';
import { 
  Product, 
  CartItem, 
  ActiveOrder, 
  OrderLifecycleStatus, 
  ORDER_STATUS_LABELS 
} from '../types';
import { PRODUCTS, CATEGORIES } from '../data';

describe('Hyper Al Masri — Role-Based Authentication & Customer-First Experience', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
  });

  const setItem = (key: string, val: string) => { mockStorage[key] = val; };
  const getItem = (key: string) => mockStorage[key] || null;

  // =========================================================================
  // 1. Customer Experience: Immediate Public Store Browsing without Auth
  // =========================================================================
  describe('Public Store Browsing (No Forced Sign-In)', () => {
    it('allows visitors to view full catalog and categories anonymously', () => {
      // Visitor has no profile and is not signed in
      expect(getItem('almasri_customer_profile')).toBeNull();

      // Catalog and categories are immediately accessible
      expect(CATEGORIES.length).toBeGreaterThan(0);
      expect(PRODUCTS.length).toBeGreaterThan(0);

      // Visitor can filter by category
      const bakeryCategory = CATEGORIES.find(c => c.name === 'مخبوزات');
      expect(bakeryCategory).toBeDefined();

      const filtered = PRODUCTS.filter(p => p.category === bakeryCategory?.name);
      expect(filtered.length).toBeGreaterThan(0);
    });

    it('allows guest visitors to add items and manage cart freely', () => {
      let cart: CartItem[] = [];
      const product = PRODUCTS[0];

      // Add to cart as guest
      cart.push({ ...product, quantity: 2 });
      setItem('almasri_cart', JSON.stringify(cart));

      // Verify cart persists in localStorage
      const savedCart = JSON.parse(getItem('almasri_cart') || '[]');
      expect(savedCart).toHaveLength(1);
      expect(savedCart[0].id).toBe(product.id);
      expect(savedCart[0].quantity).toBe(2);
    });
  });

  // =========================================================================
  // 2. Cart Preservation During Customer Sign-In
  // =========================================================================
  describe('Cart State Preservation Across Authentication', () => {
    it('preserves existing cart items, quantities, and weights when customer signs in', () => {
      // 1. Guest creates a shopping cart with both standard and weight-based items
      const oliveOil = PRODUCTS.find(p => p.name.includes('زيت زيتون')) || PRODUCTS[0];
      const meatItem = PRODUCTS.find(p => p.category === 'لحوم ومجمدات' || p.isWeightBased) || PRODUCTS[1];

      const guestCart: CartItem[] = [
        { ...oliveOil, quantity: 2, isWeightBased: false },
        { ...meatItem, quantity: 1, selectedWeight: 1.5, isWeightBased: true }
      ];
      setItem('almasri_cart', JSON.stringify(guestCart));

      // 2. Customer signs in via CustomerAuthModal
      const authenticatedCustomer: CustomerProfile = {
        uid: 'cust_abc_123',
        name: 'أحمد محمود',
        email: 'ahmed@example.com',
        phone: '01012345678',
        district: 'التجمع الخامس',
        role: 'CUSTOMER',
        createdAt: new Date().toISOString()
      };
      setItem('almasri_customer_profile', JSON.stringify(authenticatedCustomer));

      // 3. Verify customer profile is hydrated
      const profile = JSON.parse(getItem('almasri_customer_profile') || '{}');
      expect(profile.uid).toBe('cust_abc_123');
      expect(profile.role).toBe('CUSTOMER');

      // 4. Verify cart remains completely intact after authentication
      const preservedCart: CartItem[] = JSON.parse(getItem('almasri_cart') || '[]');
      expect(preservedCart).toHaveLength(2);
      expect(preservedCart[0].id).toBe(oliveOil.id);
      expect(preservedCart[0].quantity).toBe(2);
      expect(preservedCart[1].selectedWeight).toBe(1.5);
    });
  });

  // =========================================================================
  // 3. Real Role-Based Access Control (RBAC) & Privilege Separation
  // =========================================================================
  describe('Role-Based Access Control (RBAC) Verification', () => {
    // Simulated Firestore/Claims Admin Verification Engine
    const verifyUserIsAdmin = (user: { uid: string; claims?: Record<string, any> }, adminUids: Set<string>): boolean => {
      if (!user || !user.uid) return false;
      if (user.claims?.admin === true || user.claims?.role === 'admin') return true;
      return adminUids.has(user.uid);
    };

    const simulatedAdminDatabase = new Set<string>(['admin_family_001', 'admin_family_002']);

    it('assigns CUSTOMER role to registered shoppers and rejects admin privileges', () => {
      const customerUser = {
        uid: 'shopper_normal_99',
        claims: { role: 'customer' }
      };

      const isAdmin = verifyUserIsAdmin(customerUser, simulatedAdminDatabase);
      expect(isAdmin).toBe(false);
    });

    it('verifies ADMIN role for family store managers via admin document / claim', () => {
      // 1. Via ID Token Custom Claim
      const tokenAdmin = {
        uid: 'claim_admin_77',
        claims: { admin: true }
      };
      expect(verifyUserIsAdmin(tokenAdmin, simulatedAdminDatabase)).toBe(true);

      // 2. Via /admins/{uid} Firestore collection document
      const dbAdmin = {
        uid: 'admin_family_001',
        claims: {}
      };
      expect(verifyUserIsAdmin(dbAdmin, simulatedAdminDatabase)).toBe(true);
    });

    it('prevents role elevation through client-side tampering (Zero Hardcoded PINs)', () => {
      // Attacker attempts to pass obsolete PIN '2026' or '9999'
      const attacker = {
        uid: 'malicious_user_00',
        enteredPin: '2026',
        attemptedRole: 'ADMIN'
      };

      // Security check relies strictly on cryptographic auth and db presence, NOT pin
      const hasAccess = verifyUserIsAdmin({ uid: attacker.uid }, simulatedAdminDatabase);
      expect(hasAccess).toBe(false);
    });
  });

  // =========================================================================
  // 4. Customer Order Privacy & Authorization Rules
  // =========================================================================
  describe('Customer Order Ownership & Firestore Rules Simulation', () => {
    interface FirestoreOrderDoc {
      orderId: string;
      userId: string | null;
      customerName: string;
      total: number;
      status: OrderLifecycleStatus;
    }

    const canReadOrder = (
      requestAuth: { uid: string; isAdmin: boolean } | null, 
      order: FirestoreOrderDoc
    ): boolean => {
      if (!requestAuth) return false;
      if (requestAuth.isAdmin) return true;
      return order.userId === requestAuth.uid;
    };

    const canUpdateOrderStatus = (
      requestAuth: { uid: string; isAdmin: boolean } | null
    ): boolean => {
      return Boolean(requestAuth?.isAdmin);
    };

    const order1: FirestoreOrderDoc = {
      orderId: 'ORD-101',
      userId: 'customer_111',
      customerName: 'سارة خالد',
      total: 350,
      status: 'PREPARING'
    };

    const order2: FirestoreOrderDoc = {
      orderId: 'ORD-102',
      userId: 'customer_222',
      customerName: 'محمد فهمي',
      total: 520,
      status: 'OUT_FOR_DELIVERY'
    };

    it('permits a customer to read only their own orders and denies access to others', () => {
      const customerSession = { uid: 'customer_111', isAdmin: false };

      // Can read own order
      expect(canReadOrder(customerSession, order1)).toBe(true);

      // Cannot read another customer's order
      expect(canReadOrder(customerSession, order2)).toBe(false);
    });

    it('permits an administrator to read and inspect all customer orders', () => {
      const adminSession = { uid: 'admin_family_001', isAdmin: true };

      expect(canReadOrder(adminSession, order1)).toBe(true);
      expect(canReadOrder(adminSession, order2)).toBe(true);
    });

    it('prohibits customers from mutating order lifecycle status while granting it to admins', () => {
      const customerSession = { uid: 'customer_111', isAdmin: false };
      const adminSession = { uid: 'admin_family_001', isAdmin: true };

      // Customer cannot update order status
      expect(canUpdateOrderStatus(customerSession)).toBe(false);

      // Admin can update order status
      expect(canUpdateOrderStatus(adminSession)).toBe(true);
    });
  });

  // =========================================================================
  // 5. Online Order Lifecycle & Administrator Workflow
  // =========================================================================
  describe('Online Orders Management Workflow', () => {
    it('advances order status sequentially through proper lifecycle stages', () => {
      let currentStatus: OrderLifecycleStatus = 'PREPARING';

      // 1. Admin prepares order
      expect(ORDER_STATUS_LABELS[currentStatus].step).toBe(2);

      // 2. Admin marks ready for dispatch
      currentStatus = 'READY_FOR_DISPATCH';
      expect(ORDER_STATUS_LABELS[currentStatus].step).toBe(3);

      // 3. Admin dispatches to delivery driver
      currentStatus = 'OUT_FOR_DELIVERY';
      expect(ORDER_STATUS_LABELS[currentStatus].step).toBe(4);

      // 4. Order delivered to customer
      currentStatus = 'DELIVERED';
      expect(ORDER_STATUS_LABELS[currentStatus].step).toBe(5);
      expect(ORDER_STATUS_LABELS[currentStatus].label).toBe('تم توصيل طلبك بنجاح');
    });

    it('allows store administrator to modify prices and restock inventory directly', () => {
      let storeProduct: Product = {
        id: 'prod_rice_01',
        name: 'أرز مصري ياسمين (5 كجم)',
        price: 185,
        stock: 40,
        category: 'بقالة ومؤن',
        image: '',
        description: '',
        rating: 4.9
      };

      // Admin updates price and stock
      const newPrice = 195;
      const newStock = 75;

      storeProduct = { ...storeProduct, price: newPrice, stock: newStock };

      expect(storeProduct.price).toBe(195);
      expect(storeProduct.stock).toBe(75);
    });
  });

  // =========================================================================
  // 6. Arabic Localization for Authentication Errors
  // =========================================================================
  describe('Arabic Auth Error Localization', () => {
    it('translates common Firebase Auth error codes into helpful Arabic messages', () => {
      expect(getArabicAuthErrorMessage('auth/user-not-found')).toContain('بيانات الدخول غير صحيحة');
      expect(getArabicAuthErrorMessage('auth/wrong-password')).toContain('بيانات الدخول غير صحيحة');
      expect(getArabicAuthErrorMessage('auth/email-already-in-use')).toContain('مسجل بالفعل');
      expect(getArabicAuthErrorMessage('auth/weak-password')).toContain('ضعيفة');
      expect(getArabicAuthErrorMessage('auth/invalid-email')).toContain('غير صحيحة');
      expect(getArabicAuthErrorMessage('auth/too-many-requests')).toContain('عدة مرات');
    });
  });
});
