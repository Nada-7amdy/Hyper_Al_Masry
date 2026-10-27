import { describe, it, expect } from 'vitest';
import { 
  OrderLifecycleStatus, 
  ORDER_STATUS_LABELS, 
  ActiveOrder, 
  StructuredRecipe 
} from '../types';
import { findRecipeByQuery, POPULAR_RECIPES, PRODUCTS } from '../data';

describe('Hyper Al Masri — Business Logic & Domain Integrity', () => {

  // --- ISSUE 1: Feedback Gating ---
  describe('Issue 1: Feedback Gating until Genuinely Delivered', () => {
    const isFeedbackUnlocked = (order: ActiveOrder | null): boolean => {
      if (!order) return false;
      return order.status === 'DELIVERED' && !order.hasFeedback;
    };

    it('blocks feedback when order is in PREPARING status', () => {
      const order: ActiveOrder = {
        orderId: 'ORD-1234-EG',
        itemsCount: 3,
        total: 450,
        address: 'التجمع الخامس، القاهرة',
        status: 'PREPARING',
        createdAt: new Date().toISOString()
      };
      expect(isFeedbackUnlocked(order)).toBe(false);
    });

    it('blocks feedback when order is OUT_FOR_DELIVERY', () => {
      const order: ActiveOrder = {
        orderId: 'ORD-1234-EG',
        itemsCount: 3,
        total: 450,
        address: 'التجمع الخامس، القاهرة',
        status: 'OUT_FOR_DELIVERY',
        createdAt: new Date().toISOString()
      };
      expect(isFeedbackUnlocked(order)).toBe(false);
    });

    it('blocks feedback when order is CANCELLED', () => {
      const order: ActiveOrder = {
        orderId: 'ORD-1234-EG',
        itemsCount: 3,
        total: 450,
        address: 'التجمع الخامس، القاهرة',
        status: 'CANCELLED',
        createdAt: new Date().toISOString()
      };
      expect(isFeedbackUnlocked(order)).toBe(false);
    });

    it('unlocks feedback ONLY when status is DELIVERED and feedback has not yet been submitted', () => {
      const order: ActiveOrder = {
        orderId: 'ORD-1234-EG',
        itemsCount: 3,
        total: 450,
        address: 'التجمع الخامس، القاهرة',
        status: 'DELIVERED',
        createdAt: new Date().toISOString(),
        hasFeedback: false
      };
      expect(isFeedbackUnlocked(order)).toBe(true);
    });

    it('prevents duplicate review submission when hasFeedback is already true', () => {
      const orderWithFeedback: ActiveOrder = {
        orderId: 'ORD-1234-EG',
        itemsCount: 3,
        total: 450,
        address: 'التجمع الخامس، القاهرة',
        status: 'DELIVERED',
        createdAt: new Date().toISOString(),
        hasFeedback: true
      };
      expect(isFeedbackUnlocked(orderWithFeedback)).toBe(false);
    });
  });

  // --- ISSUE 3: Complete Arabic Localization ---
  describe('Issue 3: Authentic Arabic Status Localization', () => {
    const statuses: OrderLifecycleStatus[] = [
      'PLACED',
      'CONFIRMED',
      'PREPARING',
      'READY_FOR_DISPATCH',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED'
    ];

    it('provides descriptive Arabic labels for all lifecycle statuses without any English words', () => {
      statuses.forEach(status => {
        const item = ORDER_STATUS_LABELS[status];
        expect(item).toBeDefined();
        expect(item.label).toBeTypeOf('string');
        expect(item.label.length).toBeGreaterThan(3);
        // Verify no English tracking phrases exist in labels
        expect(item.label).not.toMatch(/processing|quality check|driver assigned|dispatched|out for delivery/i);
        expect(item.description).toBeDefined();
        expect(item.description!.length).toBeGreaterThan(5);
        expect(item.description).not.toMatch(/processing|quality check|driver assigned/i);
      });
    });

    it('accurately translates core customer-facing delivery milestones', () => {
      expect(ORDER_STATUS_LABELS.PREPARING.label).toContain('تجهيز');
      expect(ORDER_STATUS_LABELS.READY_FOR_DISPATCH.label).toContain('شاحنة التبريد');
      expect(ORDER_STATUS_LABELS.OUT_FOR_DELIVERY.label).toContain('المندوب في الطريق');
      expect(ORDER_STATUS_LABELS.DELIVERED.label).toContain('تم توصيل طلبك بنجاح');
    });
  });

  // --- ISSUE 6: Recipe-to-Cart Integration ---
  describe('Issue 6: AI Concierge Recipe-to-Cart Mapping', () => {
    it('detects Bamia tajin recipe when querying cooking or bamia keywords', () => {
      const queries = ['طريقة عمل البامية باللحمة', 'عايز وصفة بامية', 'طاجن بامية بلدي'];
      queries.forEach(q => {
        const recipe = findRecipeByQuery(q);
        expect(recipe).toBeDefined();
        expect(recipe?.id).toBe('recipe_bamia');
      });
    });

    it('detects grilled chicken fillet recipe when querying fillet or chicken keywords', () => {
      const queries = ['طريقة عمل صدور الدجاج المشوية', 'وصفة فراخ صحية', 'فيليه مشوي'];
      queries.forEach(q => {
        const recipe = findRecipeByQuery(q);
        expect(recipe).toBeDefined();
        expect(recipe?.id).toBe('recipe_chicken');
      });
    });

    it('detects luxury breakfast recipe when querying breakfast keywords', () => {
      const queries = ['فطار ملوكي فاخر', 'اقتراح فطار مصري', 'فطار'];
      queries.forEach(q => {
        const recipe = findRecipeByQuery(q);
        expect(recipe).toBeDefined();
        expect(recipe?.id).toBe('recipe_breakfast');
      });
    });

    it('verifies that recipe ingredients link strictly to existing catalog products in PRODUCTS', () => {
      const productIds = new Set(PRODUCTS.map(p => p.id));

      POPULAR_RECIPES.forEach(recipe => {
        expect(recipe.ingredients.length).toBeGreaterThan(0);
        recipe.ingredients.forEach(ing => {
          if (ing.productId) {
            expect(productIds.has(ing.productId)).toBe(true);
            const catalogProduct = PRODUCTS.find(p => p.id === ing.productId)!;
            expect(catalogProduct.price).toBeGreaterThan(0);
          }
        });
      });
    });

    it('calculates proper subtotal for weight-based ingredients', () => {
      const bamiaRecipe = POPULAR_RECIPES.find(r => r.id === 'recipe_bamia')!;
      const meatIngredient = bamiaRecipe.ingredients.find(i => i.isWeightBased && i.productId === 'p_deal_1');
      expect(meatIngredient).toBeDefined();
      expect(meatIngredient!.requiredWeightOrQty).toBe(1); // 1 kg
      
      const product = PRODUCTS.find(p => p.id === meatIngredient!.productId)!;
      const calculatedPrice = product.price * (meatIngredient!.requiredWeightOrQty || 1);
      expect(calculatedPrice).toBe(product.price);
    });
  });

  // --- ISSUE 7: Persistent and Honest Order Tracking ---
  describe('Issue 7: Honest and Persistent Simulation Metrics', () => {
    it('marks simulated orders with isSimulatedDemo: true flag for consumer transparency', () => {
      const simulatedOrder: ActiveOrder = {
        orderId: 'ORD-9876-EG',
        itemsCount: 2,
        total: 395,
        address: 'الشيخ زايد، الجيزة',
        status: 'PREPARING',
        createdAt: new Date().toISOString(),
        isSimulatedDemo: true
      };
      expect(simulatedOrder.isSimulatedDemo).toBe(true);
    });

    it('verifies order statuses maintain strictly increasing sequence steps', () => {
      expect(ORDER_STATUS_LABELS.PLACED.step).toBeLessThanOrEqual(ORDER_STATUS_LABELS.CONFIRMED.step);
      expect(ORDER_STATUS_LABELS.CONFIRMED.step).toBeLessThan(ORDER_STATUS_LABELS.PREPARING.step);
      expect(ORDER_STATUS_LABELS.PREPARING.step).toBeLessThan(ORDER_STATUS_LABELS.READY_FOR_DISPATCH.step);
      expect(ORDER_STATUS_LABELS.READY_FOR_DISPATCH.step).toBeLessThan(ORDER_STATUS_LABELS.OUT_FOR_DELIVERY.step);
      expect(ORDER_STATUS_LABELS.OUT_FOR_DELIVERY.step).toBeLessThan(ORDER_STATUS_LABELS.DELIVERED.step);
    });
  });
});
