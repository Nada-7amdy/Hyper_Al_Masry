export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  recipe?: StructuredRecipe;
}

export enum Tab {
  EXTERIOR = 'exterior',
  PACKAGING = 'packaging',
  UNIFORM = 'uniform',
  ATELIER = 'atelier',
  MARKET = 'market',
  TRACKING = 'tracking',
  ADMIN = 'admin'
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  rating: number;
  stock: number;
  oldPrice?: number;
  discount?: string;
  reviews?: number;
  stockStatus?: 'high' | 'low' | 'out';
  deliveryEstimate?: string;
  badge?: string;
  isDeal?: boolean;
  isBestSeller?: boolean;
  isRecommended?: boolean;
  isFresh?: boolean;
  isSeasonal?: boolean;
  isWeightBased?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedWeight?: number;
}

export type OrderLifecycleStatus = 
  | 'PLACED' 
  | 'CONFIRMED' 
  | 'PREPARING' 
  | 'READY_FOR_DISPATCH' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'CANCELLED';

export const ORDER_STATUS_LABELS: Record<OrderLifecycleStatus, { label: string; description: string; step: number }> = {
  PLACED: { label: 'تم استلام طلبك', description: 'تم تسجيل طلبك بنجاح في نظام المتجر', step: 1 },
  CONFIRMED: { label: 'تم تأكيد طلبك', description: 'تمت مراجعة الأصناف وتجهيز فاتورة الشراء', step: 1 },
  PREPARING: { label: 'جاري تجهيز وتعبئة طلبك', description: 'يتم الآن انتقاء المنتجات الطازجة بدقة وفحص جودتها', step: 2 },
  READY_FOR_DISPATCH: { label: 'طلبك جاهز في شاحنة التبريد', description: 'تم تغليف الطلب ونقله إلى شاحنة التبريد (٤ درجات مئوية)', step: 3 },
  OUT_FOR_DELIVERY: { label: 'المندوب في الطريق إليك', description: 'مندوب هايبر المصري في طريقه لعنوانك الآن', step: 4 },
  DELIVERED: { label: 'تم توصيل طلبك بنجاح', description: 'نتمنى لك تجربة ممتعة وصحة وعافية!', step: 5 },
  CANCELLED: { label: 'تم إلغاء الطلب', description: 'تم إلغاء هذا الطلب بناءً على طلبك أو لتعذر التوصيل', step: 0 }
};

export interface OrderStatus {
  step: 1 | 2 | 3 | 4 | 5;
  status: OrderLifecycleStatus;
  label: string;
  description?: string;
  timestamp: string;
  driverLocation?: { lat: number; lng: number };
}

export type PaymentMethodType = 'CASH_ON_DELIVERY' | 'CARD_ON_DELIVERY';

export interface CustomerAddressDetails {
  governorate: string; // e.g. "القاهرة"
  district: string;    // e.g. "التجمع الخامس"
  street: string;      // e.g. "شارع التسعين الشمالي"
  building: string;    // e.g. "عمارة 45"
  floor: string;       // e.g. "الدور الثالث"
  apartment: string;   // e.g. "شقة 12"
  landmark?: string;   // e.g. "بجوار مول كايرو فيستيفال"
}

export interface ActiveOrder {
  orderId: string;
  customerName?: string;
  customerPhone?: string;
  items?: CartItem[];
  itemsCount: number;
  total: number;
  subtotal?: number;
  deliveryFee?: number;
  address: string;
  addressDetails?: CustomerAddressDetails;
  paymentMethod?: PaymentMethodType;
  status: OrderLifecycleStatus;
  createdAt: string;
  deliveredAt?: string;
  hasFeedback?: boolean;
  isSimulatedDemo?: boolean;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  productId?: string;
  productName?: string;
  price?: number;
  isWeightBased?: boolean;
  requiredWeightOrQty?: number;
  isAvailable: boolean;
}

export interface StructuredRecipe {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  servings: string;
  ingredients: RecipeIngredient[];
}