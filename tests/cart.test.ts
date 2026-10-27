import { describe, it, expect } from 'vitest';
import { CartItem } from '../types';

describe('Cart Calculations & Weight Mechanics', () => {
  const calculateCartTotal = (cart: CartItem[]): number => {
    return cart.reduce((acc, item) => {
      const multiplier = item.isWeightBased ? (item.selectedWeight ?? 1) : item.quantity;
      return acc + (item.price * multiplier);
    }, 0);
  };

  const calculateDeliveryFee = (cartTotal: number): number => {
    return cartTotal >= 150 ? 0 : 15;
  };

  const calculateFinalTotal = (cart: CartItem[]): number => {
    const total = calculateCartTotal(cart);
    return total + calculateDeliveryFee(total);
  };

  it('calculates total correctly for standard piece-based products', () => {
    const cart: CartItem[] = [
      {
        id: 'p1',
        name: 'زيت زيتون',
        price: 195,
        category: 'بقالة ومؤن',
        image: '',
        description: '',
        rating: 4.9,
        stock: 50,
        quantity: 2,
        isWeightBased: false
      },
      {
        id: 'p2',
        name: 'عسل سدر',
        price: 320,
        category: 'عطارة',
        image: '',
        description: '',
        rating: 5.0,
        stock: 30,
        quantity: 1,
        isWeightBased: false
      }
    ];

    const total = calculateCartTotal(cart);
    expect(total).toBe(195 * 2 + 320 * 1); // 390 + 320 = 710
  });

  it('calculates total accurately for weight-based products with fractional weights', () => {
    const cart: CartItem[] = [
      {
        id: 'w1',
        name: 'لحم موزة بقري بلدي',
        price: 395,
        category: 'لحوم ومجمدات',
        image: '',
        description: '',
        rating: 4.9,
        stock: 40,
        quantity: 1,
        selectedWeight: 1.5,
        isWeightBased: true
      },
      {
        id: 'w2',
        name: 'فراولة بلدي',
        price: 45,
        category: 'خضروات وفواكه',
        image: '',
        description: '',
        rating: 4.8,
        stock: 100,
        quantity: 1,
        selectedWeight: 0.75,
        isWeightBased: true
      }
    ];

    const total = calculateCartTotal(cart);
    expect(total).toBeCloseTo((395 * 1.5) + (45 * 0.75), 2); // 592.5 + 33.75 = 626.25
  });

  it('handles mixed carts with both piece and weight items', () => {
    const cart: CartItem[] = [
      {
        id: 'p1',
        name: 'شاي فاخر',
        price: 50,
        category: 'مشروبات',
        image: '',
        description: '',
        rating: 4.5,
        stock: 20,
        quantity: 2,
        isWeightBased: false
      },
      {
        id: 'w1',
        name: 'تفاح أحمر',
        price: 80,
        category: 'خضروات وفواكه',
        image: '',
        description: '',
        rating: 4.7,
        stock: 35,
        quantity: 1,
        selectedWeight: 1.25,
        isWeightBased: true
      }
    ];

    const subtotal = calculateCartTotal(cart);
    // 50 * 2 = 100, 80 * 1.25 = 100, total = 200
    expect(subtotal).toBe(200);
    expect(calculateDeliveryFee(subtotal)).toBe(0); // >= 150 EGP free delivery
    expect(calculateFinalTotal(cart)).toBe(200);
  });

  it('charges 15 EGP delivery fee when order subtotal is below 150 EGP', () => {
    const cart: CartItem[] = [
      {
        id: 'small_item',
        name: 'نعناع بلدي',
        price: 25,
        category: 'خضروات وفواكه',
        image: '',
        description: '',
        rating: 4.5,
        stock: 50,
        quantity: 2,
        isWeightBased: false
      }
    ];

    const subtotal = calculateCartTotal(cart); // 50
    expect(subtotal).toBe(50);
    expect(calculateDeliveryFee(subtotal)).toBe(15);
    expect(calculateFinalTotal(cart)).toBe(65);
  });

  it('provides 100% free delivery when order subtotal is exactly or greater than 150 EGP', () => {
    expect(calculateDeliveryFee(150)).toBe(0);
    expect(calculateDeliveryFee(150.01)).toBe(0);
    expect(calculateDeliveryFee(149.99)).toBe(15);
  });

  it('adjusts weight using 0.25 kg increments', () => {
    let currentWeight = 1.0;
    const step = 0.25;

    // Increment
    currentWeight = +(currentWeight + step).toFixed(2);
    expect(currentWeight).toBe(1.25);

    // Decrement
    currentWeight = +(currentWeight - step).toFixed(2);
    expect(currentWeight).toBe(1.0);

    // Decrement to minimum valid weight
    currentWeight = +(currentWeight - step).toFixed(2);
    expect(currentWeight).toBe(0.75);
  });
});
