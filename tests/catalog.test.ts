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

  it('correctly reflects family price overrides and custom products via getActiveCatalogProducts', async () => {
    // Ensure mock localStorage exists in test environment
    const storageMap: Record<string, string> = {};
    if (typeof globalThis.localStorage === 'undefined') {
      (globalThis as any).localStorage = {
        getItem: (k: string) => storageMap[k] || null,
        setItem: (k: string, v: string) => { storageMap[k] = v; },
        removeItem: (k: string) => { delete storageMap[k]; },
        clear: () => { Object.keys(storageMap).forEach(k => delete storageMap[k]); }
      };
    }

    const { getActiveCatalogProducts } = await import('../data');
    
    // Test base catalog
    const baseCatalog = getActiveCatalogProducts();
    expect(baseCatalog.length).toBeGreaterThanOrEqual(10);

    // Simulate family editing a price
    const targetProduct = PRODUCTS[0];
    const newPrice = targetProduct.price + 25;
    localStorage.setItem('almasri_price_overrides', JSON.stringify({
      [targetProduct.id]: { price: newPrice, stock: 99 }
    }));

    const updatedCatalog = getActiveCatalogProducts();
    const updatedItem = updatedCatalog.find(p => p.id === targetProduct.id);
    expect(updatedItem?.price).toBe(newPrice);
    expect(updatedItem?.stock).toBe(99);

    // Simulate family adding a new custom product
    const customItem = {
      id: 'custom_baba_honey',
      name: 'عسل سدر جبلي فاخر خاص بالمتجر',
      price: 320,
      category: 'بقالة ومؤن',
      stock: 30,
      rating: 5,
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&q=80',
      description: 'عسل أصلي مجمع طبيعياً'
    };
    localStorage.setItem('almasri_custom_products', JSON.stringify([customItem]));

    const catalogWithCustom = getActiveCatalogProducts();
    expect(catalogWithCustom.some(p => p.id === 'custom_baba_honey')).toBe(true);
    expect(catalogWithCustom[0].name).toBe('عسل سدر جبلي فاخر خاص بالمتجر');

    // Clean up test state
    localStorage.removeItem('almasri_price_overrides');
    localStorage.removeItem('almasri_custom_products');
  });
});
