import { describe, it, expect } from 'vitest';
import { PRODUCTS, CATEGORIES } from '../data';

describe('Catalog Integrity & Product Schema', () => {
  it('contains products and categories in the database', () => {
    expect(PRODUCTS.length).toBeGreaterThan(0);
    expect(CATEGORIES.length).toBeGreaterThan(0);
  });

  it('ensures all categories have valid IDs, Arabic names, and icons', () => {
    const categoryIds = new Set<string>();

    CATEGORIES.forEach(category => {
      expect(category.id).toBeTruthy();
      expect(category.id.startsWith('cat_')).toBe(true);
      expect(category.name.trim().length).toBeGreaterThan(0);
      expect(category.icon.trim().length).toBeGreaterThan(0);
      expect(categoryIds.has(category.id)).toBe(false); // unique IDs
      categoryIds.add(category.id);
    });
  });

  it('ensures all products have valid fields and positive pricing', () => {
    const validCategoryNames = new Set(CATEGORIES.map(c => c.name));
    const productIds = new Set<string>();

    PRODUCTS.forEach(product => {
      expect(product.id).toBeTruthy();
      expect(productIds.has(product.id)).toBe(false); // unique IDs
      productIds.add(product.id);

      expect(product.name.trim().length).toBeGreaterThan(0);
      expect(product.price).toBeGreaterThan(0);
      expect(product.rating).toBeGreaterThanOrEqual(1);
      expect(product.rating).toBeLessThanOrEqual(5);
      expect(product.stock).toBeGreaterThanOrEqual(0);

      // Verify category linkage
      expect(validCategoryNames.has(product.category)).toBe(true);
    });
  });

  it('correctly flags weight-based products in produce and butchery', () => {
    const weightBasedProducts = PRODUCTS.filter(p => p.isWeightBased);
    expect(weightBasedProducts.length).toBeGreaterThan(0);

    weightBasedProducts.forEach(product => {
      // Weight-based items are typically in butchery or produce
      expect(['لحوم ومجمدات', 'خضروات وفواكه', 'بقالة ومؤن']).toContain(product.category);
    });
  });

  it('ensures discount calculations are mathematically consistent for deal items', () => {
    const dealProducts = PRODUCTS.filter(p => p.isDeal && p.oldPrice);

    dealProducts.forEach(product => {
      expect(product.oldPrice).toBeDefined();
      expect(product.oldPrice!).toBeGreaterThan(product.price);
    });
  });
});
