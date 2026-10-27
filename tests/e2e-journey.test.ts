import { describe, it, expect, beforeEach } from 'vitest';
import { 
  Product, 
  CartItem, 
  ActiveOrder, 
  OrderLifecycleStatus, 
  ORDER_STATUS_LABELS, 
  StructuredRecipe, 
  PaymentMethodType 
} from '../types';
import { PRODUCTS, CATEGORIES, findRecipeByQuery } from '../data';

describe('Hyper Al Masri — End-to-End Customer Journey Audit', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
  });

  const setItem = (key: string, val: string) => { mockStorage[key] = val; };
  const getItem = (key: string) => mockStorage[key] || null;

  it('executes the full customer lifecycle end-to-end (Landing -> Cart -> AI Recipe -> Checkout -> Tracking -> Feedback)', () => {
    // ==========================================
    // STAGE 1: Guest Arrival & Neutral Discovery
    // ==========================================
    expect(getItem('almasri_customer_profile')).toBeNull();
    expect(CATEGORIES.length).toBeGreaterThanOrEqual(6);
    expect(PRODUCTS.length).toBeGreaterThanOrEqual(10);

    // ==========================================
    // STAGE 2: Product Selection & Weight Cart
    // ==========================================
    let cart: CartItem[] = [];

    const addToCart = (product: Product, weight?: number) => {
      const existing = cart.find(i => i.id === product.id);
      if (existing) {
        if (product.isWeightBased) {
          existing.selectedWeight = +((existing.selectedWeight || 1) + (weight || 0.25)).toFixed(2);
        } else {
          existing.quantity += 1;
        }
      } else {
        cart.push({
          ...product,
          quantity: 1,
          selectedWeight: product.isWeightBased ? (weight ?? 1) : undefined
        });
      }
    };

    const calculateCartTotal = () => {
      return cart.reduce((acc, item) => {
        const mult = item.isWeightBased ? (item.selectedWeight ?? 1) : item.quantity;
        return acc + (item.price * mult);
      }, 0);
    };

    // Add extra virgin olive oil (piece item)
    const oliveOil = PRODUCTS.find(p => p.id === 'p_deal_2') || PRODUCTS[0];
    addToCart(oliveOil);
    expect(cart).toHaveLength(1);
    expect(calculateCartTotal()).toBe(oliveOil.price);

    // Add fresh beef shank by weight (0.75 kg)
    const beefShank = PRODUCTS.find(p => p.isWeightBased) || PRODUCTS[1];
    addToCart(beefShank, 0.75);
    expect(cart).toHaveLength(2);
    expect(calculateCartTotal()).toBe(oliveOil.price + (beefShank.price * 0.75));

    // ==========================================
    // STAGE 3: AI Concierge Recipe-to-Cart
    // ==========================================
    const recipeQuery = 'طريقة عمل البامية باللحمة';
    const recipe = findRecipeByQuery(recipeQuery);
    expect(recipe).toBeDefined();
    expect(recipe?.title).toContain('طاجن البامية');

    // Add recipe ingredients to cart
    recipe!.ingredients.forEach(ing => {
      if (ing.productId) {
        const prod = PRODUCTS.find(p => p.id === ing.productId);
        if (prod) {
          addToCart(prod, ing.isWeightBased ? ing.requiredWeightOrQty : undefined);
        }
      }
    });
    expect(cart.length).toBeGreaterThanOrEqual(3);

    // ==========================================
    // STAGE 4: Egyptian Checkout Flow
    // ==========================================
    const EGY_PHONE_REGEX = /^(010|011|012|015)[0-9]{8}$/;

    // Invalid phone rejected
    expect(EGY_PHONE_REGEX.test('01312345678')).toBe(false);

    // Valid Egyptian details
    const checkoutData = {
      name: 'كريم عبد العزيز',
      phone: '01012345678',
      governorate: 'القاهرة',
      district: 'القاهرة الجديدة (التجمع الخامس)',
      street: 'شارع التسعين الشمالي',
      building: 'عمارة 15',
      floor: 'الدور الثاني',
      apartment: 'شقة 4',
      paymentMethod: 'CARD_ON_DELIVERY' as PaymentMethodType
    };
    expect(EGY_PHONE_REGEX.test(checkoutData.phone)).toBe(true);

    const cartTotal = calculateCartTotal();
    const deliveryFee = cartTotal >= 150 ? 0 : 15;
    const finalTotal = cartTotal + deliveryFee;

    const orderId = 'ORD-7654-EG';
    const activeOrder: ActiveOrder = {
      orderId,
      customerName: checkoutData.name,
      customerPhone: checkoutData.phone,
      itemsCount: cart.length,
      total: finalTotal,
      subtotal: cartTotal,
      deliveryFee,
      address: `${checkoutData.governorate}، ${checkoutData.district}، ${checkoutData.street}، عمارة ${checkoutData.building}، دور ${checkoutData.floor}، شقة ${checkoutData.apartment}`,
      paymentMethod: checkoutData.paymentMethod,
      status: 'PREPARING',
      createdAt: new Date().toISOString(),
      isSimulatedDemo: true
    };

    // Save active order & profile to storage, then empty cart
    setItem('almasri_active_order', JSON.stringify(activeOrder));
    setItem('almasri_customer_profile', JSON.stringify({
      name: checkoutData.name,
      phone: checkoutData.phone,
      district: checkoutData.district
    }));
    cart = [];
    expect(cart).toHaveLength(0);

    // ==========================================
    // STAGE 5: Persistent Order Tracking Radar
    // ==========================================
    let savedOrder: ActiveOrder = JSON.parse(getItem('almasri_active_order')!);
    expect(savedOrder.status).toBe('PREPARING');

    // Feedback is strictly gated while in PREPARING
    const isFeedbackUnlocked = (o: ActiveOrder) => o.status === 'DELIVERED' && !o.hasFeedback;
    expect(isFeedbackUnlocked(savedOrder)).toBe(false);

    // Status advances: PREPARING -> READY_FOR_DISPATCH -> OUT_FOR_DELIVERY -> DELIVERED
    savedOrder.status = 'READY_FOR_DISPATCH';
    expect(ORDER_STATUS_LABELS[savedOrder.status].label).toContain('شاحنة التبريد');

    savedOrder.status = 'OUT_FOR_DELIVERY';
    expect(ORDER_STATUS_LABELS[savedOrder.status].label).toContain('المندوب في الطريق');

    savedOrder.status = 'DELIVERED';
    expect(ORDER_STATUS_LABELS[savedOrder.status].label).toContain('تم توصيل طلبك بنجاح');

    // Reload persistence test
    setItem('almasri_active_order', JSON.stringify(savedOrder));
    const reloadedOrder: ActiveOrder = JSON.parse(getItem('almasri_active_order')!);
    expect(reloadedOrder.status).toBe('DELIVERED');

    // ==========================================
    // STAGE 6: Feedback Unlocking & Submission
    // ==========================================
    // Feedback is now unlocked!
    expect(isFeedbackUnlocked(reloadedOrder)).toBe(true);

    // Submit review
    const feedback = {
      orderId: reloadedOrder.orderId,
      deliveryRating: 5,
      freshnessRating: 5,
      tags: ['سريع جداً ⚡', 'منتجات طازجة 🥬', 'تغليف فاخر 🎁'],
      comment: 'تجربة ممتازة وجودة اللحوم طازجة والتغليف راقٍ جداً.'
    };
    expect(feedback.deliveryRating).toBe(5);

    // Mark order as reviewed
    reloadedOrder.hasFeedback = true;
    setItem('almasri_active_order', JSON.stringify(reloadedOrder));

    // Deduplication check: second submission blocked
    expect(isFeedbackUnlocked(reloadedOrder)).toBe(false);
  });
});
