export type ProductCategory = 'Watches' | 'Perfumes';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  salePrice?: number;
  image: string;
  images: string[];
  shortDescription: string;
  description: string;
  stock: number;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  isActive?: boolean;
  specifications: Record<string, string>;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  category: ProductCategory;
  price: number;
  quantity: number;
  total: number;
  image: string;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Pending';

export interface Order {
  id: string; // AR-2026-XXXXX
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  orderNotes?: string;
  paymentMethod: 'cash_on_delivery' | 'bank_transfer' | 'credit_card';
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  notificationSent: boolean;
  notificationRecipient: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  totalOrders: number;
  totalSpent: number;
  createdAt?: string;
}

export interface Review {
  id: string;
  author: string;
  location: string;
  productName: string;
  category: ProductCategory;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface StoreSettings {
  storeName: string;
  notificationEmail: string;
  currency: string;
  currencySymbol: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  bankDetails: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
  };
}
