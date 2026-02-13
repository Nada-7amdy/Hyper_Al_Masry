export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
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
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderStatus {
  step: 1 | 2 | 3 | 4;
  label: string;
  timestamp: string;
  driverLocation?: { lat: number; lng: number };
}