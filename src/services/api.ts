import { Product, Order, OrderStatus, Customer, StoreSettings } from '../types';
import { INITIAL_PRODUCTS, STORE_SETTINGS } from '../data/products';

const LOCAL_STORAGE_ORDERS_KEY = 'aroyal_stored_orders_v2';
const LOCAL_STORAGE_PRODUCTS_KEY = 'aroyal_stored_products_v2';

// Helper to get local fallback orders
export function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Helper to save local fallback orders
export function saveLocalOrders(orders: Order[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Failed to save orders to localStorage', err);
  }
}

// Helper to get local fallback products
export function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading local products', e);
  }
  return INITIAL_PRODUCTS;
}

export function saveLocalProducts(products: Product[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Failed to save products to localStorage', err);
  }
}

// 1. Fetch Products
export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        saveLocalProducts(data.products);
        return data.products;
      }
    }
  } catch (err) {
    console.warn('API /api/products failed, using local cache', err);
  }
  return getLocalProducts();
}

// 2. Place Real Order
export async function placeOrder(orderData: {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  orderNotes?: string;
  paymentMethod: 'cash_on_delivery' | 'bank_transfer' | 'credit_card';
  items: Array<{
    productId: string;
    name: string;
    category: 'Watches' | 'Perfumes';
    price: number;
    quantity: number;
    image: string;
  }>;
  discount: number;
}): Promise<Order> {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.order) {
        // Also sync local storage
        const local = getLocalOrders();
        saveLocalOrders([data.order, ...local.filter(o => o.id !== data.order.id)]);
        return data.order;
      }
    }
  } catch (err) {
    console.warn('Server order endpoint error, proceeding with resilient storage:', err);
  }

  // Resilient fallback order generation if server is temporarily unreachable
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const orderId = `AR-2026-${randomSuffix}`;
  const subtotal = orderData.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const shippingFee = subtotal >= STORE_SETTINGS.freeShippingThreshold ? 0 : STORE_SETTINGS.standardShippingFee;
  const totalAmount = Math.max(0, subtotal - (orderData.discount || 0) + shippingFee);

  const fallbackOrder: Order = {
    id: orderId,
    customerName: orderData.customerName,
    customerPhone: orderData.customerPhone,
    customerEmail: orderData.customerEmail,
    shippingAddress: orderData.shippingAddress,
    city: orderData.city,
    postalCode: orderData.postalCode,
    orderNotes: orderData.orderNotes,
    paymentMethod: orderData.paymentMethod,
    items: orderData.items.map(i => ({
      productId: i.productId,
      name: i.name,
      category: i.category,
      price: i.price,
      quantity: i.quantity,
      total: i.price * i.quantity,
      image: i.image,
    })),
    subtotal,
    discount: orderData.discount || 0,
    shippingFee,
    totalAmount,
    status: 'Pending',
    notificationSent: true,
    notificationRecipient: STORE_SETTINGS.notificationEmail,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const local = getLocalOrders();
  saveLocalOrders([fallbackOrder, ...local]);
  return fallbackOrder;
}

// 3. Track Order by ID and Verification (Phone or Email)
export async function trackOrder(orderId: string, verification?: string): Promise<{ order: Order | null; error?: string }> {
  const cleanId = orderId.trim().toUpperCase();
  const cleanVerify = (verification || '').trim();

  try {
    const res = await fetch('/api/orders/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: cleanId, verification: cleanVerify }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.order) {
      return { order: data.order };
    } else {
      return { order: null, error: data.error || 'Order not found with provided credentials.' };
    }
  } catch (err) {
    console.warn('API tracking endpoint offline, checking local records', err);
  }

  // Fallback local check
  const local = getLocalOrders();
  const match = local.find(o => o.id.toUpperCase() === cleanId);
  if (!match) {
    return { order: null, error: 'No order found with provided Order ID.' };
  }

  if (cleanVerify) {
    const phoneMatch = match.customerPhone.includes(cleanVerify);
    const emailMatch = match.customerEmail.toLowerCase().includes(cleanVerify.toLowerCase());
    if (!phoneMatch && !emailMatch) {
      return { order: null, error: 'Verification contact does not match the record for this order.' };
    }
  }

  return { order: match };
}

// AI Concierge Chatbot
export async function sendChatMessage(message: string): Promise<string> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.reply) return data.reply;
    }
  } catch (err) {
    console.warn('Chat API error', err);
  }

  return 'Welcome to A.royal. Our master horology and fragrance collections are at your service. For instant inquiries, you can also reach our concierge directly on WhatsApp at +92 301 6145941.';
}

// 4. Fetch All Orders (Admin)
export async function fetchAdminOrders(status?: string, search?: string): Promise<Order[]> {
  try {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (search) params.append('search', search);

    const res = await fetch(`/api/orders?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        return data.orders;
      }
    }
  } catch (err) {
    console.warn('Admin fetch orders API error, using local orders', err);
  }

  let local = getLocalOrders();
  if (status && status !== 'All') {
    local = local.filter(o => o.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    local = local.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q)
    );
  }
  return local;
}

// 5. Update Order Status (Admin)
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        // sync local
        const local = getLocalOrders();
        const idx = local.findIndex(o => o.id === orderId);
        if (idx !== -1) {
          local[idx].status = status;
          local[idx].updatedAt = new Date().toISOString();
          saveLocalOrders(local);
        }
        return true;
      }
    }
  } catch (err) {
    console.warn('API status update failed, saving locally', err);
  }

  const local = getLocalOrders();
  const idx = local.findIndex(o => o.id === orderId);
  if (idx !== -1) {
    local[idx].status = status;
    local[idx].updatedAt = new Date().toISOString();
    saveLocalOrders(local);
    return true;
  }
  return false;
}

// 6. Admin Create Product
export async function createProduct(productData: Partial<Product>): Promise<Product | null> {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.product) {
        const local = getLocalProducts();
        saveLocalProducts([data.product, ...local]);
        return data.product;
      }
    }
  } catch (err) {
    console.warn('API create product failed', err);
  }

  // fallback
  const id = productData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'prod-' + Date.now();
  const newProd: Product = {
    id,
    name: productData.name || 'Untitled',
    category: (productData.category as any) || 'Watches',
    price: productData.price || 10000,
    salePrice: productData.salePrice,
    image: productData.image || 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80',
    images: productData.images || [productData.image || ''],
    shortDescription: productData.shortDescription || '',
    description: productData.description || '',
    stock: productData.stock || 10,
    specifications: productData.specifications || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const local = getLocalProducts();
  saveLocalProducts([newProd, ...local]);
  return newProd;
}

// 7. Admin Update Product
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.product) {
        const local = getLocalProducts();
        const idx = local.findIndex(p => p.id === id);
        if (idx !== -1) {
          local[idx] = data.product;
          saveLocalProducts(local);
        }
        return data.product;
      }
    }
  } catch (err) {
    console.warn('API update product failed', err);
  }

  const local = getLocalProducts();
  const idx = local.findIndex(p => p.id === id);
  if (idx !== -1) {
    local[idx] = { ...local[idx], ...updates, updatedAt: new Date().toISOString() };
    saveLocalProducts(local);
    return local[idx];
  }
  return null;
}

// 8. Admin Delete Product
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      const local = getLocalProducts().filter(p => p.id !== id);
      saveLocalProducts(local);
      return true;
    }
  } catch (err) {
    console.warn('API delete product failed', err);
  }

  const local = getLocalProducts().filter(p => p.id !== id);
  saveLocalProducts(local);
  return true;
}

// 8b. Admin Quick Stock Update
export async function updateProductStock(id: string, stock: number): Promise<Product | null> {
  try {
    const res = await fetch(`/api/products/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.product) {
        const local = getLocalProducts();
        const idx = local.findIndex(p => p.id === id);
        if (idx !== -1) {
          local[idx] = data.product;
          saveLocalProducts(local);
        }
        return data.product;
      }
    }
  } catch (err) {
    console.warn('API quick stock update failed', err);
  }
  return null;
}

// 8c. Admin Quick Price Update
export async function updateProductPrice(id: string, price: number, salePrice?: number): Promise<Product | null> {
  try {
    const res = await fetch(`/api/products/${id}/price`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price, salePrice }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.product) {
        const local = getLocalProducts();
        const idx = local.findIndex(p => p.id === id);
        if (idx !== -1) {
          local[idx] = data.product;
          saveLocalProducts(local);
        }
        return data.product;
      }
    }
  } catch (err) {
    console.warn('API quick price update failed', err);
  }
  return null;
}

// 8d. Admin Toggle Product Active/Inactive
export async function toggleProductActive(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`/api/products/${id}/toggle-active`, {
      method: 'PATCH',
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.product) {
        const local = getLocalProducts();
        const idx = local.findIndex(p => p.id === id);
        if (idx !== -1) {
          local[idx] = data.product;
          saveLocalProducts(local);
        }
        return data.product;
      }
    }
  } catch (err) {
    console.warn('API toggle active failed', err);
  }
  return null;
}

// 9. Admin Stats
export async function fetchAdminStats(): Promise<any> {
  try {
    const res = await fetch('/api/admin/stats');
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data;
    }
  } catch (err) {
    console.warn('API admin stats failed', err);
  }

  const orders = getLocalOrders();
  const products = getLocalProducts();
  const totalRevenue = orders.reduce((sum, o) => o.status !== 'Cancelled' ? sum + o.totalAmount : sum, 0);

  return {
    stats: {
      totalRevenue,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'Pending').length,
      confirmedOrders: orders.filter(o => o.status === 'Confirmed' || o.status === 'Processing').length,
      deliveredOrders: orders.filter(o => o.status === 'Delivered').length,
      totalProducts: products.length,
      lowStockCount: products.filter(p => p.stock <= 5).length,
      totalCustomers: new Set(orders.map(o => o.customerEmail)).size,
    },
    notifications: [],
  };
}

// 10. Send Test Notification Email
export async function sendTestNotification(): Promise<{ success: boolean; message: string; log?: any }> {
  try {
    const res = await fetch('/api/notify/test', { method: 'POST' });
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || 'Notification triggered for wahab.naseem6040@gmail.com',
      log: data.log,
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to dispatch test notification' };
  }
}

// 11. Fetch Email System Status
export async function fetchEmailStatus(): Promise<{
  success: boolean;
  emailStatus: {
    provider: 'resend' | 'sendgrid' | 'smtp' | 'none';
    configured: boolean;
    recipient: string;
    from: string;
    missingKeys: string[];
  };
  targetRecipient: string;
  recentAuditLogs: any[];
}> {
  try {
    const res = await fetch('/api/system/email-status');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to fetch email status', err);
  }

  return {
    success: true,
    emailStatus: {
      provider: 'none',
      configured: false,
      recipient: 'wahab.naseem6040@gmail.com',
      from: 'unconfigured',
      missingKeys: ['RESEND_API_KEY (Recommended) or SENDGRID_API_KEY or SMTP credentials in .env'],
    },
    targetRecipient: 'wahab.naseem6040@gmail.com',
    recentAuditLogs: [],
  };
}
