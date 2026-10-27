/**
 * Hyper Al Masri - Cloud Firestore Products Service
 * Provides real-time synchronization, automatic seeding, price adjustments,
 * and resilient offline fallback for catalog products.
 */
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  onSnapshot, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Product } from '../types';
import { PRODUCTS, getActiveCatalogProducts } from '../data';

const PRODUCTS_COLLECTION = 'products';
const LOCAL_STORAGE_CACHE_KEY = 'almasri_firestore_products_cache';

/**
 * Normalizes a Firestore document snapshot into a type-safe Product
 */
export const mapDocToProduct = (id: string, data: any): Product => {
  return {
    id: id || data.id,
    name: data.name || '',
    category: data.category || 'بقالة ومؤن',
    price: typeof data.price === 'number' ? data.price : Number(data.price) || 0,
    image: data.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
    description: data.description || '',
    rating: typeof data.rating === 'number' ? data.rating : 4.9,
    stock: typeof data.stock === 'number' ? data.stock : 50,
    oldPrice: data.oldPrice,
    discount: data.discount,
    reviews: data.reviews,
    stockStatus: data.stockStatus || (data.stock <= 0 ? 'out' : data.stock < 15 ? 'low' : 'high'),
    deliveryEstimate: data.deliveryEstimate,
    badge: data.badge,
    isDeal: data.isDeal,
    isBestSeller: data.isBestSeller,
    isRecommended: data.isRecommended,
    isFresh: data.isFresh,
    isSeasonal: data.isSeasonal,
    isWeightBased: data.isWeightBased !== undefined ? Boolean(data.isWeightBased) : (
      data.category === 'خضروات وفواكه' || data.category === 'لحوم ومجمدات' || (data.name && (data.name.includes('كجم') || data.name.includes('جم')))
    )
  };
};

/**
 * Seeds default products from catalog to Firestore if the collection is empty.
 * Uses Firestore Batched Writes for high efficiency and atomicity.
 */
export const seedInitialProductsIfEmpty = async (): Promise<boolean> => {
  try {
    const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (!snapshot.empty) {
      return false; // Already populated
    }

    console.log("Seeding initial products into Firestore /products...");
    const batch = writeBatch(db);

    PRODUCTS.forEach((prod) => {
      const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
      batch.set(docRef, {
        ...prod,
        serverCreatedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
    console.log(`Successfully seeded ${PRODUCTS.length} products to Firestore.`);
    return true;
  } catch (err) {
    console.warn("Could not seed products to Firestore (may require admin permissions or offline):", err);
    return false;
  }
};

/**
 * Fetches all products once from Firestore with offline fallback
 */
export const fetchProductsFromFirestore = async (): Promise<Product[]> => {
  try {
    const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (snapshot.empty) {
      // Trigger background seeding if empty
      seedInitialProductsIfEmpty().catch(() => {});
      return getActiveCatalogProducts();
    }

    const products = snapshot.docs.map(d => mapDocToProduct(d.id, d.data()));
    
    // Save to local cache
    try {
      localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(products));
    } catch {
      // safe fallback
    }

    return products;
  } catch (err) {
    console.warn("fetchProductsFromFirestore failed, falling back to local catalog:", err);
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch {
      // fallback
    }
    return getActiveCatalogProducts();
  }
};

/**
 * Subscribes to real-time updates from Firestore /products collection.
 * Calls `onUpdate` immediately whenever any price, stock, or product changes.
 */
export const subscribeToLiveProducts = (
  onUpdate: (products: Product[]) => void,
  onError?: (err: Error) => void
): (() => void) => {
  // First immediately provide initial local state so UI never hangs
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    if (cached) {
      onUpdate(JSON.parse(cached));
    } else {
      onUpdate(getActiveCatalogProducts());
    }
  } catch {
    onUpdate(getActiveCatalogProducts());
  }

  // Subscribe to real-time Firestore changes
  try {
    const unsubscribe = onSnapshot(
      collection(db, PRODUCTS_COLLECTION),
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is empty, seed products
          seedInitialProductsIfEmpty().catch(() => {});
          onUpdate(getActiveCatalogProducts());
          return;
        }

        const liveProducts = snapshot.docs.map(d => mapDocToProduct(d.id, d.data()));
        
        // Cache to local storage
        try {
          localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(liveProducts));
        } catch {
          // safe fallback
        }

        onUpdate(liveProducts);
      },
      (error) => {
        console.warn("Firestore onSnapshot error on /products, using local catalog:", error);
        if (onError) onError(error);
        onUpdate(getActiveCatalogProducts());
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.warn("Failed to attach Firestore listener, falling back:", err);
    if (onError) onError(err);
    return () => {};
  }
};

/**
 * Updates a product's price and stock in Firestore
 */
export const updateProductInFirestore = async (
  productId: string, 
  updates: { price?: number; stock?: number }
): Promise<boolean> => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    console.warn(`Firestore update failed for product ${productId}:`, err);
    return false;
  }
};

/**
 * Adds a new product to Firestore /products collection
 */
export const createProductInFirestore = async (
  product: Omit<Product, 'id'> & { id?: string }
): Promise<Product> => {
  const customId = product.id || `prod_${Date.now()}`;
  const docRef = doc(db, PRODUCTS_COLLECTION, customId);
  
  const payload = {
    ...product,
    id: customId,
    createdAt: new Date().toISOString(),
    serverCreatedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    await setDoc(docRef, payload);
    return { ...product, id: customId };
  } catch (err) {
    console.warn("Firestore createProduct failed, returning local object:", err);
    return { ...product, id: customId };
  }
};
