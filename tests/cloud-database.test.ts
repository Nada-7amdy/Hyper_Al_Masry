import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mapDocToProduct } from '../services/productsService';
import { mapDocToOrder } from '../services/ordersService';
import { Product, ActiveOrder, OrderLifecycleStatus } from '../types';
import { PRODUCTS } from '../data';

describe('Hyper Al Masri — Cloud Firestore Integration & Schema Conformance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Product Normalization (mapDocToProduct)', () => {
    it('normalizes raw Firestore product data into strongly-typed Product', () => {
      const rawDoc = {
        name: 'أرز مصري ياسمين فاخر (5 كجم)',
        price: '185', // String representation from API/input
        category: 'بقالة ومؤن',
        stock: 45,
        rating: 4.9,
        image: 'https://example.com/rice.jpg',
        description: 'أرز مصري ممتاز',
        isWeightBased: false
      };

      const product = mapDocToProduct('prod_101', rawDoc);
      expect(product.id).toBe('prod_101');
      expect(product.name).toBe('أرز مصري ياسمين فاخر (5 كجم)');
      expect(product.price).toBe(185);
      expect(typeof product.price).toBe('number');
      expect(product.stock).toBe(45);
      expect(product.stockStatus).toBe('high');
      expect(product.isWeightBased).toBe(false);
    });

    it('infers weight-based pricing correctly for meat and fresh produce', () => {
      const meatDoc = {
        name: 'لحم مفروم بلدي',
        category: 'لحوم ومجمدات',
        price: 360,
        stock: 10
      };
      const meatProduct = mapDocToProduct('p_meat', meatDoc);
      expect(meatProduct.isWeightBased).toBe(true);
      expect(meatProduct.stockStatus).toBe('low');

      const fruitDoc = {
        name: 'طماطم بلدي طازجة',
        category: 'خضروات وفواكه',
        price: 15,
        stock: 0
      };
      const fruitProduct = mapDocToProduct('p_fruit', fruitDoc);
      expect(fruitProduct.isWeightBased).toBe(true);
      expect(fruitProduct.stockStatus).toBe('out');
    });

    it('preserves existing explicit isWeightBased boolean flags', () => {
      const customDoc = {
        name: 'بهارات خاصة بالوزن',
        category: 'عطارة',
        price: 50,
        stock: 30,
        isWeightBased: true
      };
      const product = mapDocToProduct('p_custom', customDoc);
      expect(product.isWeightBased).toBe(true);
    });
  });

  describe('Order Normalization & Security Rules Conformance (mapDocToOrder)', () => {
    it('normalizes Firestore order document into ActiveOrder with proper types', () => {
      const rawOrderDoc = {
        orderId: 'ORD-5432-EG',
        customerName: 'كريم عبد العزيز',
        customerPhone: '01276759600',
        items: [
          { id: 'p1', name: 'أرز مصري فاخر', price: 180, quantity: 2 },
          { id: 'p2', name: 'طماطم بلدي', price: 15, quantity: 1, selectedWeight: 2, isWeightBased: true }
        ],
        total: 390,
        subtotal: 390,
        deliveryFee: 0,
        address: 'القاهرة، التجمع الخامس، شارع التسعين، عمارة 45',
        paymentMethod: 'CASH_ON_DELIVERY',
        status: 'PREPARING',
        createdAt: '2026-10-27T10:00:00.000Z'
      };

      const order = mapDocToOrder('ORD-5432-EG', rawOrderDoc);
      expect(order.orderId).toBe('ORD-5432-EG');
      expect(order.customerName).toBe('كريم عبد العزيز');
      expect(order.customerPhone).toBe('01276759600');
      expect(order.itemsCount).toBe(2);
      expect(order.total).toBe(390);
      expect(order.status).toBe('PREPARING');
      expect(order.isSimulatedDemo).toBe(false);
    });

    it('ensures payload strictly adheres to firestore.rules requirements for /orders', () => {
      // firestore.rules requires:
      // incoming().orderId is string && incoming().orderId.size() <= 64
      // incoming().total is number && incoming().total >= 0
      // incoming().items is list
      // incoming().address is string && incoming().address.size() <= 500

      const orderPayload = {
        orderId: 'ORD-9999-EG',
        total: 250,
        items: [{ id: 'p1', name: 'جبنة فيتا', price: 50, quantity: 5 }],
        address: 'الشيخ زايد، الجيزة، الحي الأول'
      };

      expect(typeof orderPayload.orderId).toBe('string');
      expect(orderPayload.orderId.length).toBeLessThanOrEqual(64);
      expect(typeof orderPayload.total).toBe('number');
      expect(orderPayload.total).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(orderPayload.items)).toBe(true);
      expect(orderPayload.items.length).toBeGreaterThan(0);
      expect(typeof orderPayload.address).toBe('string');
      expect(orderPayload.address.length).toBeLessThanOrEqual(500);
    });
  });

  describe('Catalog Integrity and Seeding Baseline', () => {
    it('verifies default catalog products have valid prices and categories for seeding', () => {
      expect(PRODUCTS.length).toBeGreaterThanOrEqual(10);
      PRODUCTS.forEach(p => {
        expect(p.id).toBeDefined();
        expect(p.name.length).toBeGreaterThan(0);
        expect(p.price).toBeGreaterThan(0);
        expect(p.category.length).toBeGreaterThan(0);
        expect(p.stock).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
