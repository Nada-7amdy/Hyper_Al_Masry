/**
 * Hyper Al Masri - Cloud Firestore Orders Service
 * Manages customer order creation, real-time admin order dispatch monitoring,
 * and live order status tracking.
 */
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { ActiveOrder, OrderLifecycleStatus } from '../types';

const ORDERS_COLLECTION = 'orders';
const LOCAL_ORDERS_CACHE_KEY = 'almasri_customer_orders_history';

/**
 * Normalizes a Firestore order document into a clean ActiveOrder object
 */
export const mapDocToOrder = (docId: string, data: any): ActiveOrder & { docId: string } => {
  return {
    docId,
    orderId: data.orderId || docId,
    customerName: data.customerName || 'عميل هايبر المصري',
    customerPhone: data.customerPhone || '',
    itemsCount: typeof data.itemsCount === 'number' ? data.itemsCount : (Array.isArray(data.items) ? data.items.length : 1),
    total: typeof data.total === 'number' ? data.total : 0,
    subtotal: data.subtotal,
    deliveryFee: data.deliveryFee,
    address: data.address || '',
    addressDetails: data.addressDetails,
    paymentMethod: data.paymentMethod || 'CASH_ON_DELIVERY',
    status: (data.status as OrderLifecycleStatus) || 'PREPARING',
    createdAt: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
    deliveredAt: data.deliveredAt,
    hasFeedback: Boolean(data.hasFeedback),
    isSimulatedDemo: Boolean(data.isSimulatedDemo)
  };
};

/**
 * Creates and stores a new customer order in Firestore /orders/{orderId}.
 * Strictly complies with firestore.rules requirements:
 * - incoming().orderId is string <= 64
 * - incoming().total is number >= 0
 * - incoming().items is list
 * - incoming().address is string <= 500
 */
export const createLiveOrder = async (
  order: ActiveOrder & { items?: any[] }, 
  userId?: string | null
): Promise<{ success: boolean; orderId: string; error?: string }> => {
  const cleanOrderId = order.orderId.slice(0, 64);
  const cleanAddress = (order.address || '').slice(0, 500);
  const cleanTotal = Math.max(0, Number(order.total) || 0);

  // Guarantee items is a non-empty list for Firestore security rules
  const cleanItems = Array.isArray(order.items) && order.items.length > 0 
    ? order.items.map(i => ({
        id: String(i.id || 'item'),
        name: String(i.name || 'منتج'),
        price: Number(i.price) || 0,
        quantity: Number(i.quantity) || 1,
        selectedWeight: i.selectedWeight !== undefined ? Number(i.selectedWeight) : undefined,
        isWeightBased: Boolean(i.isWeightBased)
      }))
    : [{ id: 'general_order', name: 'طلب مشتريات هايبر المصري', price: cleanTotal, quantity: order.itemsCount || 1 }];

  const payload: any = {
    orderId: cleanOrderId,
    customerName: (order.customerName || 'عميل هايبر المصري').trim().slice(0, 150),
    customerPhone: (order.customerPhone || '').trim().slice(0, 30),
    items: cleanItems,
    itemsCount: order.itemsCount || cleanItems.length,
    total: cleanTotal,
    subtotal: order.subtotal || cleanTotal,
    deliveryFee: order.deliveryFee || 0,
    address: cleanAddress,
    addressDetails: order.addressDetails || null,
    paymentMethod: order.paymentMethod || 'CASH_ON_DELIVERY',
    status: 'PREPARING',
    createdAt: order.createdAt || new Date().toISOString(),
    timestamp: serverTimestamp(),
    userId: userId || null,
    isSimulatedDemo: false
  };

  // 1. Save to local storage immediately
  try {
    const existingStr = localStorage.getItem(LOCAL_ORDERS_CACHE_KEY);
    const existing: ActiveOrder[] = existingStr ? JSON.parse(existingStr) : [];
    existing.unshift({ ...order, orderId: cleanOrderId });
    localStorage.setItem(LOCAL_ORDERS_CACHE_KEY, JSON.stringify(existing.slice(0, 50)));
    localStorage.setItem('almasri_active_order', JSON.stringify({ ...order, orderId: cleanOrderId }));
  } catch (err) {
    console.warn("Could not cache order locally:", err);
  }

  // 2. Persist in Cloud Firestore
  try {
    const orderDocRef = doc(db, ORDERS_COLLECTION, cleanOrderId);
    await setDoc(orderDocRef, payload);
    console.log(`Order ${cleanOrderId} successfully registered in Firestore.`);
    return { success: true, orderId: cleanOrderId };
  } catch (err: any) {
    console.warn(`Firestore save failed for order ${cleanOrderId}, saved locally:`, err);
    return { success: true, orderId: cleanOrderId, error: err.message };
  }
};

/**
 * Subscribes to all orders in Firestore for the Admin Dashboard.
 * Delivers real-time updates whenever a new order is placed or updated.
 */
export const subscribeToAdminOrders = (
  onUpdate: (orders: (ActiveOrder & { docId: string })[]) => void,
  onError?: (err: Error) => void
): (() => void) => {
  try {
    const ordersQuery = query(collection(db, ORDERS_COLLECTION));
    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const liveOrders = snapshot.docs.map(d => mapDocToOrder(d.id, d.data()));
        // Sort newest first
        liveOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(liveOrders);
      },
      (error) => {
        console.warn("Firestore onSnapshot error on /orders:", error);
        if (onError) onError(error);
        // Fallback to local storage cache
        try {
          const cached = JSON.parse(localStorage.getItem(LOCAL_ORDERS_CACHE_KEY) || '[]');
          onUpdate(cached.map((o: any) => ({ ...o, docId: o.orderId })));
        } catch {
          onUpdate([]);
        }
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.warn("Failed to subscribe to admin orders:", err);
    if (onError) onError(err);
    return () => {};
  }
};

/**
 * Updates an order status in Firestore (e.g. from 'PREPARING' to 'OUT_FOR_DELIVERY' or 'DELIVERED')
 */
export const updateLiveOrderStatus = async (
  orderId: string, 
  status: OrderLifecycleStatus
): Promise<boolean> => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const updates: any = {
      status,
      updatedAt: serverTimestamp()
    };
    if (status === 'DELIVERED') {
      updates.deliveredAt = new Date().toISOString();
    }
    await updateDoc(docRef, updates);

    // Also update local storage if active order matches
    try {
      const activeStr = localStorage.getItem('almasri_active_order');
      if (activeStr) {
        const active = JSON.parse(activeStr);
        if (active.orderId === orderId) {
          active.status = status;
          localStorage.setItem('almasri_active_order', JSON.stringify(active));
        }
      }
    } catch {
      // safe fallback
    }

    return true;
  } catch (err) {
    console.warn(`Failed to update order ${orderId} in Firestore:`, err);
    return false;
  }
};

/**
 * Subscribes to a single customer's order for live tracking in TrackingMap
 */
export const subscribeToCustomerOrderLive = (
  orderId: string,
  onUpdate: (order: ActiveOrder | null) => void
): (() => void) => {
  if (!orderId) return () => {};

  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const order = mapDocToOrder(docSnap.id, docSnap.data());
          onUpdate(order);
        } else {
          onUpdate(null);
        }
      },
      (error) => {
        console.warn(`Firestore onSnapshot error on order ${orderId}:`, error);
      }
    );
    return unsubscribe;
  } catch {
    return () => {};
  }
};
