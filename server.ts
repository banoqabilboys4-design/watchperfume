import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { INITIAL_PRODUCTS, STORE_SETTINGS } from './src/data/products.ts';
import { Product, Order, OrderStatus, Customer } from './src/types.ts';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'store.json');

app.use(express.json());

// Target recipient for all A.royal store order notifications
const NOTIFICATION_RECIPIENT = process.env.NOTIFICATION_EMAIL || 'wahab.naseem6040@gmail.com';

// Initialize Supabase client if configured
let supabase: SupabaseClient | null = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Supabase] Connected to remote database:', supabaseUrl);
  } catch (err) {
    console.warn('[Supabase] Failed to initialize client:', err);
  }
} else {
  console.log('[Database] Running with persistent server store (Supabase credentials pending in .env).');
}

// Helper to safely execute Supabase operations
async function syncSupabase(operation: PromiseLike<any>) {
  try {
    await operation;
  } catch (err) {
    console.error('[Supabase Sync Error]', err);
  }
}

// Notification log item type
export interface NotificationLogEntry {
  id: string;
  orderId: string;
  recipient: string;
  subject: string;
  sentAt: string;
  status: 'delivered' | 'pending_configuration' | 'failed';
  provider: 'resend' | 'sendgrid' | 'smtp' | 'none';
  errorDetails?: string;
  preview: string;
}

// Persistent File-backed Database Store Interface
interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  adminPassword: string;
  settings: typeof STORE_SETTINGS;
  notificationLog: NotificationLogEntry[];
}

function ensureDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      orders: [],
      customers: [],
      adminPassword: process.env.ADMIN_PASSWORD || 'aroyal2026',
      settings: STORE_SETTINGS,
      notificationLog: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.products || parsed.products.length === 0) {
      parsed.products = INITIAL_PRODUCTS;
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    if (!parsed.orders) parsed.orders = [];
    if (!parsed.customers) parsed.customers = [];
    if (!parsed.notificationLog) parsed.notificationLog = [];
    return parsed;
  } catch (e) {
    console.error('Error reading db file, resetting to initial state', e);
    const fallbackDb: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      orders: [],
      customers: [],
      adminPassword: process.env.ADMIN_PASSWORD || 'aroyal2026',
      settings: STORE_SETTINGS,
      notificationLog: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(fallbackDb, null, 2), 'utf-8');
    return fallbackDb;
  }
}

function saveDb(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to DB file:', err);
  }
}

// Determine configured email provider
function getEmailProviderStatus() {
  const recipient = NOTIFICATION_RECIPIENT;
  const resendKey = process.env.RESEND_API_KEY;
  const sendgridKey = process.env.SENDGRID_API_KEY;
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (resendKey && !resendKey.includes('your_resend')) {
    return {
      provider: 'resend' as const,
      configured: true,
      recipient,
      from: process.env.EMAIL_FROM || 'A.royal Orders <onboarding@resend.dev>',
      missingKeys: [] as string[],
    };
  }

  if (sendgridKey && !sendgridKey.includes('your_sendgrid')) {
    return {
      provider: 'sendgrid' as const,
      configured: true,
      recipient,
      from: process.env.EMAIL_FROM || 'orders@aroyal.com',
      missingKeys: [] as string[],
    };
  }

  if (smtpHost && smtpUser && smtpPass) {
    return {
      provider: 'smtp' as const,
      configured: true,
      recipient,
      from: process.env.EMAIL_FROM || smtpUser,
      missingKeys: [] as string[],
    };
  }

  return {
    provider: 'none' as const,
    configured: false,
    recipient,
    from: 'unconfigured',
    missingKeys: [
      'RESEND_API_KEY (Recommended: get from resend.com)',
      'or SENDGRID_API_KEY (Alternative: get from sendgrid.com)',
      'or SMTP_HOST, SMTP_USER, SMTP_PASS (Direct SMTP / Gmail App Password)',
    ],
  };
}

// Format email HTML & Plain Text
function generateOrderEmailContent(order: Order) {
  const subject = `[A.ROYAL ORDER] ${order.id} - ${order.customerName} (PKR ${order.totalAmount.toLocaleString()})`;

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #ede8e1;">
          <strong style="color: #1a1a1a; font-size: 14px;">${item.name}</strong><br/>
          <span style="color: #8b7650; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${item.category}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #ede8e1; text-align: center; color: #555;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #ede8e1; text-align: right; color: #555;">
          PKR ${item.price.toLocaleString()}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #ede8e1; text-align: right; font-weight: bold; color: #1a1a1a;">
          PKR ${item.total.toLocaleString()}
        </td>
      </tr>
    `
    )
    .join('');

  const itemsText = order.items
    .map(
      (item) =>
        `- ${item.name} (${item.category}) | Qty: ${item.quantity} | Unit Price: PKR ${item.price.toLocaleString()} | Total: PKR ${item.total.toLocaleString()}`
    )
    .join('\n');

  const textBody = `
======================================================
              A.ROYAL LUXURY E-COMMERCE
             OFFICIAL ORDER NOTIFICATION
======================================================

ORDER DETAILS:
------------------------------------------------------
Order ID: ${order.id}
Order Date & Time: ${new Date(order.createdAt).toLocaleString()}
Current Status: ${order.status}
Payment Method: ${order.paymentMethod.replace(/_/g, ' ').toUpperCase()}

CUSTOMER INFORMATION:
------------------------------------------------------
Full Name: ${order.customerName}
Email: ${order.customerEmail}
Phone Number: ${order.customerPhone}
Delivery Address: ${order.shippingAddress}
City: ${order.city}
Postal Code: ${order.postalCode}
${order.orderNotes ? `Order Notes: ${order.orderNotes}\n` : ''}

ORDERED PRODUCTS:
------------------------------------------------------
${itemsText}

FINANCIAL BREAKDOWN:
------------------------------------------------------
Subtotal: PKR ${order.subtotal.toLocaleString()}
Discount: PKR ${order.discount.toLocaleString()}
Shipping: ${order.shippingFee === 0 ? 'Complimentary' : `PKR ${order.shippingFee.toLocaleString()}`}
TOTAL AMOUNT: PKR ${order.totalAmount.toLocaleString()}

Destination Recipient: ${NOTIFICATION_RECIPIENT}
Generated by A.royal Horology & Haute Parfumerie Core Engine.
======================================================
`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #faf9f6; font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f1f1f; line-height: 1.6;">
  <div style="max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #e3ded6; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <!-- Luxury Header -->
    <div style="background-color: #121212; padding: 32px 24px; text-align: center; border-bottom: 2px solid #8b7650;">
      <h1 style="margin: 0; color: #f5f0e8; font-family: Georgia, serif; font-size: 26px; letter-spacing: 3px; font-weight: normal;">
        A. R O Y A L
      </h1>
      <p style="margin: 6px 0 0 0; color: #bca882; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">
        Luxury Watches &amp; Signature Perfumes
      </p>
    </div>

    <!-- Order Alert Banner -->
    <div style="background-color: #f7f4ee; padding: 16px 24px; border-bottom: 1px solid #e5dfd5; text-align: center;">
      <span style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #8b7650;">
        New Customer Order Notification
      </span>
      <h2 style="margin: 4px 0 0; font-size: 22px; color: #1a1a1a; font-family: Georgia, serif;">
        Order #${order.id}
      </h2>
      <p style="margin: 4px 0 0; font-size: 12px; color: #666;">
        Placed on ${new Date(order.createdAt).toLocaleString()} &bull; Status: <strong style="color: #166534;">${order.status}</strong>
      </p>
    </div>

    <!-- Body Container -->
    <div style="padding: 24px;">

      <!-- Customer Summary -->
      <div style="margin-bottom: 24px; background: #faf9f7; padding: 16px; border: 1px solid #eae5dc; border-radius: 2px;">
        <h3 style="margin: 0 0 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #8b7650; border-bottom: 1px solid #ede8e1; padding-bottom: 6px;">
          Customer &amp; Delivery Information
        </h3>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; color: #777; width: 130px;">Customer Name:</td>
            <td style="padding: 4px 0; font-weight: bold; color: #111;">${order.customerName}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #777;">Phone Number:</td>
            <td style="padding: 4px 0; font-weight: bold; color: #111;">${order.customerPhone}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #777;">Email Address:</td>
            <td style="padding: 4px 0; color: #111;">${order.customerEmail}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #777;">Delivery Address:</td>
            <td style="padding: 4px 0; color: #111;">${order.shippingAddress}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #777;">City / Postal:</td>
            <td style="padding: 4px 0; color: #111;">${order.city}, ${order.postalCode}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #777;">Payment Method:</td>
            <td style="padding: 4px 0; font-weight: bold; color: #8b7650;">${order.paymentMethod.replace(/_/g, ' ').toUpperCase()}</td>
          </tr>
          ${order.orderNotes ? `
          <tr>
            <td style="padding: 4px 0; color: #777;">Customer Notes:</td>
            <td style="padding: 4px 0; color: #333; font-style: italic;">${order.orderNotes}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      <!-- Items Table -->
      <div style="margin-bottom: 24px;">
        <h3 style="margin: 0 0 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #8b7650; border-bottom: 1px solid #ede8e1; padding-bottom: 6px;">
          Ordered Items
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background-color: #f5f2ec; color: #555; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">
              <th style="padding: 10px 12px; text-align: left;">Product</th>
              <th style="padding: 10px 12px; text-align: center;">Qty</th>
              <th style="padding: 10px 12px; text-align: right;">Price</th>
              <th style="padding: 10px 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <!-- Financial Summary -->
      <div style="background-color: #f7f5f0; padding: 16px; border: 1px solid #e7e2d8; margin-bottom: 24px;">
        <table style="width: 100%; font-size: 13px;">
          <tr>
            <td style="padding: 4px 0; color: #666;">Subtotal:</td>
            <td style="padding: 4px 0; text-align: right; color: #333;">PKR ${order.subtotal.toLocaleString()}</td>
          </tr>
          ${order.discount > 0 ? `
          <tr>
            <td style="padding: 4px 0; color: #166534;">Discount Applied:</td>
            <td style="padding: 4px 0; text-align: right; color: #166534; font-weight: bold;">- PKR ${order.discount.toLocaleString()}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 4px 0; color: #666;">Nationwide Delivery:</td>
            <td style="padding: 4px 0; text-align: right; color: #333;">${order.shippingFee === 0 ? 'Complimentary (Insured)' : `PKR ${order.shippingFee.toLocaleString()}`}</td>
          </tr>
          <tr style="border-top: 1px solid #ded8cc;">
            <td style="padding: 10px 0 4px; font-size: 16px; font-weight: bold; color: #1a1a1a;">TOTAL AMOUNT:</td>
            <td style="padding: 10px 0 4px; text-align: right; font-size: 18px; font-weight: bold; color: #8b7650; font-family: Georgia, serif;">
              PKR ${order.totalAmount.toLocaleString()}
            </td>
          </tr>
        </table>
      </div>

      <p style="font-size: 12px; color: #777; text-align: center; margin: 0;">
        This real-time notification was dispatched to <strong>${NOTIFICATION_RECIPIENT}</strong>.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #121212; padding: 16px; text-align: center; color: #999; font-size: 11px;">
      &copy; 2026 A.royal Horology &amp; Haute Parfumerie. All rights reserved.<br/>
      Destination Address: ${NOTIFICATION_RECIPIENT}
    </div>
  </div>
</body>
</html>
`;

  return { subject, textBody, htmlBody };
}

// Send real order email notification
async function dispatchOrderNotification(order: Order, db: DatabaseSchema): Promise<NotificationLogEntry> {
  const emailStatus = getEmailProviderStatus();
  const recipient = NOTIFICATION_RECIPIENT;
  const { subject, textBody, htmlBody } = generateOrderEmailContent(order);

  console.log(`\n================== [A.ROYAL ORDER NOTIFICATION] ==================`);
  console.log(`Target Recipient: ${recipient}`);
  console.log(`Email Provider: ${emailStatus.provider.toUpperCase()} (Configured: ${emailStatus.configured})`);
  console.log(textBody);
  console.log(`==================================================================\n`);

  let deliveryStatus: 'delivered' | 'pending_configuration' | 'failed' = 'pending_configuration';
  let errorDetails: string | undefined = undefined;

  // 1. If Resend is configured
  if (emailStatus.provider === 'resend') {
    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: emailStatus.from,
          to: [recipient],
          subject,
          html: htmlBody,
          text: textBody,
        }),
      });

      if (resendRes.ok) {
        deliveryStatus = 'delivered';
        console.log(`[Resend Email] Successfully dispatched to ${recipient}`);
      } else {
        const errorData = await resendRes.text();
        deliveryStatus = 'failed';
        errorDetails = `Resend API returned status ${resendRes.status}: ${errorData}`;
        console.error('[Resend Email Error]', errorDetails);
      }
    } catch (err: any) {
      deliveryStatus = 'failed';
      errorDetails = err.message || 'Network error while calling Resend API';
      console.error('[Resend Email Exception]', err);
    }
  }
  // 2. If SendGrid is configured
  else if (emailStatus.provider === 'sendgrid') {
    try {
      const sendgridRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: recipient }] }],
          from: { email: emailStatus.from },
          subject,
          content: [
            { type: 'text/plain', value: textBody },
            { type: 'text/html', value: htmlBody },
          ],
        }),
      });

      if (sendgridRes.ok || sendgridRes.status === 202) {
        deliveryStatus = 'delivered';
        console.log(`[SendGrid Email] Successfully dispatched to ${recipient}`);
      } else {
        const errorData = await sendgridRes.text();
        deliveryStatus = 'failed';
        errorDetails = `SendGrid API returned status ${sendgridRes.status}: ${errorData}`;
        console.error('[SendGrid Email Error]', errorDetails);
      }
    } catch (err: any) {
      deliveryStatus = 'failed';
      errorDetails = err.message || 'Network error while calling SendGrid API';
      console.error('[SendGrid Email Exception]', err);
    }
  }
  // 3. If SMTP / Nodemailer is configured
  else if (emailStatus.provider === 'smtp') {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: emailStatus.from,
        to: recipient,
        subject,
        text: textBody,
        html: htmlBody,
      });

      deliveryStatus = 'delivered';
      console.log(`[SMTP Email] Successfully dispatched to ${recipient}`);
    } catch (err: any) {
      deliveryStatus = 'failed';
      errorDetails = err.message || 'Failed to deliver via SMTP';
      console.error('[SMTP Email Exception]', err);
    }
  }
  // 4. Missing configuration: Do NOT pretend email was delivered!
  else {
    deliveryStatus = 'pending_configuration';
    errorDetails = `Email credentials missing in environment variables. To send real emails to ${recipient}, please configure RESEND_API_KEY (from https://resend.com) or SENDGRID_API_KEY in .env.`;
    console.warn(`[A.ROYAL NOTICE] ${errorDetails}`);
  }

  // Record in audit log
  const logEntry: NotificationLogEntry = {
    id: 'notif-' + Date.now(),
    orderId: order.id,
    recipient,
    subject,
    sentAt: new Date().toISOString(),
    status: deliveryStatus,
    provider: emailStatus.provider,
    errorDetails,
    preview: `Order ${order.id} for ${order.customerName} totaling PKR ${order.totalAmount.toLocaleString()}`,
  };

  db.notificationLog.unshift(logEntry);
  if (db.notificationLog.length > 50) db.notificationLog.pop();
  saveDb(db);

  return logEntry;
}

// --- API ROUTES ---

// Health & System status
app.get('/api/system/status', (_req: Request, res: Response) => {
  const db = ensureDb();
  const emailStatus = getEmailProviderStatus();

  res.json({
    status: 'online',
    appName: 'A.royal',
    version: '1.0.0',
    database: supabase ? 'supabase_cloud' : 'server_persistent_json',
    supabaseConnected: !!supabase,
    totalProducts: db.products.length,
    totalOrders: db.orders.length,
    notificationTarget: NOTIFICATION_RECIPIENT,
    emailConfig: emailStatus,
  });
});

// GET /api/system/email-status
app.get('/api/system/email-status', (_req: Request, res: Response) => {
  const emailStatus = getEmailProviderStatus();
  const db = ensureDb();
  res.json({
    success: true,
    emailStatus,
    targetRecipient: NOTIFICATION_RECIPIENT,
    recentAuditLogs: db.notificationLog.slice(0, 10),
  });
});

// GET /api/products
app.get('/api/products', async (_req: Request, res: Response) => {
  const db = ensureDb();

  // If Supabase is connected, query remote products table
  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const mappedProducts: Product[] = data.map((row: any) => ({
          id: row.id,
          name: row.name,
          category: row.category,
          price: Number(row.price),
          salePrice: row.sale_price !== null && row.sale_price !== undefined ? Number(row.sale_price) : undefined,
          image: row.image || (Array.isArray(row.images) && row.images[0]) || '',
          images: Array.isArray(row.images) && row.images.length > 0 ? row.images : [row.image || ''],
          shortDescription: row.short_description || '',
          description: row.description || '',
          stock: Number(row.stock),
          featured: !!row.featured,
          bestSeller: !!row.best_seller,
          newArrival: !!row.new_arrival,
          isActive: row.is_active !== undefined ? !!row.is_active : true,
          specifications: row.specifications || {},
          rating: row.rating ? Number(row.rating) : 5.0,
          reviewCount: row.review_count || 1,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));

        db.products = mappedProducts;
        saveDb(db);
        return res.json({ success: true, products: mappedProducts, source: 'supabase' });
      }
    } catch (err) {
      console.warn('[Supabase Products Sync Warning]', err);
    }
  }

  res.json({ success: true, products: db.products, source: 'database' });
});

// POST /api/products (Admin Create Product)
app.post('/api/products', (req: Request, res: Response) => {
  const db = ensureDb();
  const {
    name,
    category,
    price,
    salePrice,
    image,
    images,
    description,
    shortDescription,
    stock,
    featured,
    bestSeller,
    newArrival,
    isActive,
    specifications,
  } = req.body;

  if (!name || !category || price === undefined || price === null || price === '') {
    return res.status(400).json({ error: 'Product name, category, and price are required.' });
  }

  if (category !== 'Watches' && category !== 'Perfumes') {
    return res.status(400).json({ error: 'Category must be either Watches or Perfumes.' });
  }

  const cleanImages: string[] = Array.isArray(images) && images.length > 0
    ? images.map((img: string) => String(img).trim()).filter(Boolean)
    : (image ? [String(image).trim()] : []);

  const defaultImage = cleanImages[0] || (category === 'Watches'
    ? 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80'
    : 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80');

  const finalImages = cleanImages.length > 0 ? cleanImages : [defaultImage];

  const id = req.body.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
  const now = new Date().toISOString();

  const newProduct: Product = {
    id,
    name: name.trim(),
    category,
    price: Number(price),
    salePrice: salePrice !== undefined && salePrice !== null && salePrice !== '' ? Number(salePrice) : undefined,
    image: defaultImage,
    images: finalImages,
    shortDescription: shortDescription ? shortDescription.trim() : (description ? description.slice(0, 100).trim() : ''),
    description: description ? description.trim() : '',
    stock: stock !== undefined ? Math.max(0, Number(stock)) : 10,
    featured: !!featured,
    bestSeller: !!bestSeller,
    newArrival: !!newArrival,
    isActive: isActive !== undefined ? !!isActive : true,
    specifications: specifications && typeof specifications === 'object' ? specifications : {},
    rating: 5.0,
    reviewCount: 1,
    createdAt: now,
    updatedAt: now,
  };

  db.products.unshift(newProduct);
  saveDb(db);

  if (supabase) {
    syncSupabase(supabase.from('products').insert([{
      id: newProduct.id,
      name: newProduct.name,
      category: newProduct.category,
      price: newProduct.price,
      sale_price: newProduct.salePrice || null,
      image: newProduct.image,
      images: newProduct.images,
      short_description: newProduct.shortDescription,
      description: newProduct.description,
      stock: newProduct.stock,
      featured: newProduct.featured,
      best_seller: newProduct.bestSeller,
      new_arrival: newProduct.newArrival,
      is_active: newProduct.isActive !== false,
      specifications: newProduct.specifications,
      rating: newProduct.rating,
      review_count: newProduct.reviewCount,
      created_at: newProduct.createdAt,
      updated_at: newProduct.updatedAt,
    }]));
  }

  console.log(`[Admin Product Created] ${newProduct.name} (${newProduct.category}) - PKR ${newProduct.price}`);
  res.status(201).json({ success: true, product: newProduct });
});

// PUT /api/products/:id (Admin Update Product)
app.put('/api/products/:id', (req: Request, res: Response) => {
  const db = ensureDb();
  const { id } = req.params;
  const index = db.products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const existing = db.products[index];
  const now = new Date().toISOString();

  // Process images
  let finalImages = existing.images || [existing.image];
  if (Array.isArray(req.body.images)) {
    const cleaned = req.body.images.map((img: string) => String(img).trim()).filter(Boolean);
    if (cleaned.length > 0) {
      finalImages = cleaned;
    }
  }

  const primaryImage = req.body.image
    ? String(req.body.image).trim()
    : (finalImages[0] || existing.image);

  if (!finalImages.includes(primaryImage)) {
    finalImages.unshift(primaryImage);
  }

  const updated: Product = {
    ...existing,
    name: req.body.name ? req.body.name.trim() : existing.name,
    category: req.body.category || existing.category,
    price: req.body.price !== undefined && req.body.price !== null && req.body.price !== '' ? Number(req.body.price) : existing.price,
    salePrice: req.body.salePrice !== undefined ? (req.body.salePrice ? Number(req.body.salePrice) : undefined) : existing.salePrice,
    stock: req.body.stock !== undefined ? Math.max(0, Number(req.body.stock)) : existing.stock,
    image: primaryImage,
    images: finalImages,
    shortDescription: req.body.shortDescription !== undefined ? req.body.shortDescription : existing.shortDescription,
    description: req.body.description !== undefined ? req.body.description : existing.description,
    featured: req.body.featured !== undefined ? !!req.body.featured : existing.featured,
    bestSeller: req.body.bestSeller !== undefined ? !!req.body.bestSeller : existing.bestSeller,
    newArrival: req.body.newArrival !== undefined ? !!req.body.newArrival : existing.newArrival,
    isActive: req.body.isActive !== undefined ? !!req.body.isActive : (existing.isActive !== undefined ? existing.isActive : true),
    specifications: req.body.specifications !== undefined ? req.body.specifications : existing.specifications,
    updatedAt: now,
  };

  db.products[index] = updated;
  saveDb(db);

  if (supabase) {
    syncSupabase(supabase.from('products').update({
      name: updated.name,
      category: updated.category,
      price: updated.price,
      sale_price: updated.salePrice || null,
      image: updated.image,
      images: updated.images,
      short_description: updated.shortDescription,
      description: updated.description,
      stock: updated.stock,
      featured: updated.featured,
      best_seller: updated.bestSeller,
      new_arrival: updated.newArrival,
      is_active: updated.isActive !== false,
      specifications: updated.specifications,
      updated_at: updated.updatedAt,
    }).eq('id', id));
  }

  console.log(`[Admin Product Updated] ${updated.id} - ${updated.name}`);
  res.json({ success: true, product: updated });
});

// PATCH /api/products/:id/stock (Quick Stock Update)
app.patch('/api/products/:id/stock', (req: Request, res: Response) => {
  const db = ensureDb();
  const { id } = req.params;
  const { stock, delta } = req.body;

  const product = db.products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  if (stock !== undefined) {
    product.stock = Math.max(0, Number(stock));
  } else if (delta !== undefined) {
    product.stock = Math.max(0, product.stock + Number(delta));
  } else {
    return res.status(400).json({ error: 'Provide stock quantity or delta increment.' });
  }

  product.updatedAt = new Date().toISOString();
  saveDb(db);

  if (supabase) {
    syncSupabase(supabase.from('products').update({ stock: product.stock, updated_at: product.updatedAt }).eq('id', id));
  }

  res.json({ success: true, product });
});

// PATCH /api/products/:id/price (Quick Price Update)
app.patch('/api/products/:id/price', (req: Request, res: Response) => {
  const db = ensureDb();
  const { id } = req.params;
  const { price, salePrice } = req.body;

  const product = db.products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  if (price !== undefined) {
    product.price = Number(price);
  }
  if (salePrice !== undefined) {
    product.salePrice = salePrice ? Number(salePrice) : undefined;
  }

  product.updatedAt = new Date().toISOString();
  saveDb(db);

  if (supabase) {
    syncSupabase(supabase.from('products').update({
      price: product.price,
      sale_price: product.salePrice || null,
      updated_at: product.updatedAt,
    }).eq('id', id));
  }

  res.json({ success: true, product });
});

// PATCH /api/products/:id/toggle-active (Quick Enable/Disable Product)
app.patch('/api/products/:id/toggle-active', (req: Request, res: Response) => {
  const db = ensureDb();
  const { id } = req.params;

  const product = db.products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  product.isActive = product.isActive === false ? true : false;
  product.updatedAt = new Date().toISOString();
  saveDb(db);

  if (supabase) {
    syncSupabase(supabase.from('products').update({
      is_active: product.isActive,
      updated_at: product.updatedAt,
    }).eq('id', id));
  }

  res.json({ success: true, product });
});

// DELETE /api/products/:id (Admin Delete Product)
app.delete('/api/products/:id', (req: Request, res: Response) => {
  const db = ensureDb();
  const { id } = req.params;
  const initialLength = db.products.length;
  const productToDelete = db.products.find(p => p.id === id);

  db.products = db.products.filter(p => p.id !== id);

  if (db.products.length === initialLength) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  saveDb(db);

  if (supabase) {
    syncSupabase(supabase.from('products').delete().eq('id', id));
  }

  console.log(`[Admin Product Deleted] ${id} - ${productToDelete?.name || ''}`);
  res.json({ success: true, message: `Product "${productToDelete?.name || id}" permanently removed.` });
});

// GET /api/orders (Admin list)
app.get('/api/orders', (req: Request, res: Response) => {
  const db = ensureDb();
  const { status, search } = req.query;
  let result = [...db.orders];

  if (status && status !== 'All') {
    result = result.filter(o => o.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    result = result.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.city.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, orders: result });
});

// GET /api/orders/:id (Customer Order Tracking)
app.get('/api/orders/:id', (req: Request, res: Response) => {
  const db = ensureDb();
  const idQuery = req.params.id.trim().toUpperCase();
  const order = db.orders.find(o => o.id.toUpperCase() === idQuery);

  if (!order) {
    return res.status(404).json({ error: 'Order not found with provided tracking ID.' });
  }

  res.json({ success: true, order });
});

// POST /api/orders/track (Customer Order Tracking with Order ID + Phone/Email verification)
app.post('/api/orders/track', (req: Request, res: Response) => {
  const db = ensureDb();
  const { orderId, verification } = req.body;

  if (!orderId || typeof orderId !== 'string') {
    return res.status(400).json({ error: 'Please provide a valid Order ID.' });
  }

  const cleanId = orderId.trim().toUpperCase();
  const cleanVerify = (verification || '').trim().toLowerCase();

  const order = db.orders.find(o => o.id.toUpperCase() === cleanId);

  if (!order) {
    return res.status(404).json({ error: `No order found with ID: ${cleanId}. Please verify your order number.` });
  }

  if (cleanVerify) {
    const phoneDigits = cleanVerify.replace(/[^0-9]/g, '');
    const orderPhoneDigits = order.customerPhone.replace(/[^0-9]/g, '');
    const phoneMatch =
      (phoneDigits.length >= 7 && orderPhoneDigits.slice(-7) === phoneDigits.slice(-7)) ||
      orderPhoneDigits.includes(phoneDigits) ||
      phoneDigits.includes(orderPhoneDigits);
    const emailMatch = order.customerEmail.toLowerCase() === cleanVerify;

    if (!phoneMatch && !emailMatch) {
      return res.status(403).json({
        error: 'The verification phone or email does not match the contact details for this Order ID.',
      });
    }
  }

  res.json({ success: true, order });
});

// POST /api/orders (Customer Checkout)
app.post('/api/orders', async (req: Request, res: Response) => {
  const db = ensureDb();
  const {
    customerName,
    customerPhone,
    customerEmail,
    shippingAddress,
    city,
    postalCode,
    orderNotes,
    paymentMethod,
    items,
    discount,
  } = req.body;

  if (!customerName || !customerPhone || !customerEmail || !shippingAddress || !city || !postalCode) {
    return res.status(400).json({ error: 'Please provide all required shipping and contact details.' });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one product.' });
  }

  // Validate stock and availability for each ordered item
  for (const item of items) {
    const prodId = item.productId || item.id;
    const prod = db.products.find((p) => p.id === prodId);
    if (!prod) {
      return res.status(400).json({ error: `Product "${item.name}" was not found in catalog.` });
    }
    if (prod.isActive === false) {
      return res.status(400).json({ error: `Sorry, "${prod.name}" is currently unavailable for purchase.` });
    }
    if (prod.stock <= 0) {
      return res.status(400).json({ error: `Sorry, "${prod.name}" is out of stock.` });
    }
    if (Number(item.quantity) > prod.stock) {
      return res.status(400).json({
        error: `Sorry, only ${prod.stock} unit${prod.stock === 1 ? '' : 's'} of "${prod.name}" available in stock.`,
      });
    }
  }

  // Calculate totals
  const subtotal = items.reduce((acc: number, item: any) => acc + (Number(item.price) * Number(item.quantity)), 0);
  const discountAmount = Number(discount) || 0;
  const shippingFee = subtotal >= db.settings.freeShippingThreshold ? 0 : db.settings.standardShippingFee;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  // Generate unique Order ID e.g. AR-2026-78429
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const orderId = `AR-2026-${randomSuffix}`;

  const newOrder: Order = {
    id: orderId,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    customerEmail: customerEmail.trim().toLowerCase(),
    shippingAddress: shippingAddress.trim(),
    city: city.trim(),
    postalCode: postalCode.trim(),
    orderNotes: orderNotes ? orderNotes.trim() : '',
    paymentMethod: paymentMethod || 'cash_on_delivery',
    items: items.map((i: any) => ({
      productId: i.productId || i.id,
      name: i.name,
      category: i.category,
      price: Number(i.price),
      quantity: Number(i.quantity),
      total: Number(i.price) * Number(i.quantity),
      image: i.image,
    })),
    subtotal,
    discount: discountAmount,
    shippingFee,
    totalAmount,
    status: 'Order Placed',
    notificationSent: true,
    notificationRecipient: NOTIFICATION_RECIPIENT,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Update product stock and sync to Supabase
  for (const orderedItem of newOrder.items) {
    const prod = db.products.find(p => p.id === orderedItem.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - orderedItem.quantity);
      prod.updatedAt = new Date().toISOString();
      if (supabase) {
        syncSupabase(supabase.from('products').update({ stock: prod.stock, updated_at: prod.updatedAt }).eq('id', prod.id));
      }
    }
  }

  // Update or insert customer record
  const existingCustIndex = db.customers.findIndex(c => c.email.toLowerCase() === newOrder.customerEmail);
  if (existingCustIndex !== -1) {
    db.customers[existingCustIndex].totalOrders += 1;
    db.customers[existingCustIndex].totalSpent += totalAmount;
    db.customers[existingCustIndex].phone = newOrder.customerPhone;
    db.customers[existingCustIndex].address = newOrder.shippingAddress;
    db.customers[existingCustIndex].city = newOrder.city;
  } else {
    db.customers.push({
      fullName: newOrder.customerName,
      email: newOrder.customerEmail,
      phone: newOrder.customerPhone,
      address: newOrder.shippingAddress,
      city: newOrder.city,
      postalCode: newOrder.postalCode,
      totalOrders: 1,
      totalSpent: totalAmount,
      createdAt: new Date().toISOString(),
    });
  }

  // Store order permanently in persistent database
  db.orders.unshift(newOrder);
  saveDb(db);

  // Sync to Supabase if configured
  if (supabase) {
    try {
      await supabase.from('orders').insert([{
        id: newOrder.id,
        customer_name: newOrder.customerName,
        customer_email: newOrder.customerEmail,
        customer_phone: newOrder.customerPhone,
        shipping_address: newOrder.shippingAddress,
        city: newOrder.city,
        postal_code: newOrder.postalCode,
        order_notes: newOrder.orderNotes,
        subtotal: newOrder.subtotal,
        discount: newOrder.discount,
        shipping_fee: newOrder.shippingFee,
        total_amount: newOrder.totalAmount,
        payment_method: newOrder.paymentMethod,
        status: newOrder.status,
        notification_sent: true,
        notification_recipient: NOTIFICATION_RECIPIENT,
        created_at: newOrder.createdAt,
      }]);

      const orderItemsRows = newOrder.items.map(it => ({
        order_id: newOrder.id,
        product_id: it.productId,
        product_name: it.name,
        category: it.category,
        unit_price: it.price,
        quantity: it.quantity,
        total_price: it.total,
        product_image: it.image,
      }));
      await supabase.from('order_items').insert(orderItemsRows);
    } catch (sbErr) {
      console.error('[Supabase Sync Error]', sbErr);
    }
  }

  // Dispatch Email Notification to wahab.naseem6040@gmail.com
  const notifLog = await dispatchOrderNotification(newOrder, db);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully! Details saved to database.',
    order: newOrder,
    notification: notifLog,
  });
});

// PATCH /api/orders/:id/status (Admin)
app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const db = ensureDb();
  const { id } = req.params;
  const { status } = req.body as { status: OrderStatus };

  const validStatuses: OrderStatus[] = ['Order Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Pending'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const order = db.orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();
  saveDb(db);

  if (supabase) {
    syncSupabase(supabase.from('orders').update({ status, updated_at: order.updatedAt }).eq('id', id));
  }

  res.json({ success: true, order });
});

// POST /api/admin/login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const db = ensureDb();
  const { password } = req.body;
  const expectedPassword = process.env.ADMIN_PASSWORD || db.adminPassword || 'aroyal2026';

  if (password === expectedPassword) {
    return res.json({
      success: true,
      token: 'aroyal-admin-' + Buffer.from(Date.now().toString()).toString('base64'),
      user: {
        email: 'admin@aroyal.com',
        role: 'super_admin',
        name: 'A.royal Executive Director',
      },
    });
  }

  return res.status(401).json({ error: 'Invalid admin authorization password.' });
});

// GET /api/admin/stats
app.get('/api/admin/stats', (_req: Request, res: Response) => {
  const db = ensureDb();
  const orders = db.orders;
  const totalRevenue = orders.reduce((sum, o) => o.status !== 'Cancelled' ? sum + o.totalAmount : sum, 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Order Placed').length;
  const confirmedOrders = orders.filter(o => o.status === 'Confirmed' || o.status === 'Processing').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

  const lowStockProducts = db.products.filter(p => p.stock <= 5);
  const emailStatus = getEmailProviderStatus();

  res.json({
    success: true,
    stats: {
      totalRevenue,
      totalOrders: orders.length,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      totalProducts: db.products.length,
      lowStockCount: lowStockProducts.length,
      totalCustomers: db.customers.length,
    },
    emailConfig: emailStatus,
    notifications: db.notificationLog.slice(0, 15),
  });
});

// POST /api/notify/test
app.post('/api/notify/test', async (_req: Request, res: Response) => {
  const db = ensureDb();
  const sampleOrder: Order = {
    id: `AR-2026-TEST`,
    customerName: 'A.royal System Test',
    customerPhone: '+92 300 1234567',
    customerEmail: 'test@example.com',
    shippingAddress: 'Suite 401, Royal Tower, Main Boulevard',
    city: 'Lahore',
    postalCode: '54000',
    paymentMethod: 'cash_on_delivery',
    items: [{
      productId: 'royal-chronograph',
      name: 'Royal Chronograph',
      category: 'Watches',
      price: 24999,
      quantity: 1,
      total: 24999,
      image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80',
    }],
    subtotal: 24999,
    discount: 0,
    shippingFee: 0,
    totalAmount: 24999,
    status: 'Confirmed',
    notificationSent: true,
    notificationRecipient: NOTIFICATION_RECIPIENT,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const log = await dispatchOrderNotification(sampleOrder, db);
  res.json({ success: true, message: 'Test notification triggered', log });
});

// Setup Vite middlewares in development or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[A.ROYAL Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[A.ROYAL Notification Target] ${NOTIFICATION_RECIPIENT}`);
  });
}

startServer();
