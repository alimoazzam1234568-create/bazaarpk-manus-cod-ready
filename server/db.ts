import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, products, orders, orderItems, users, coupons } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
export async function getDb() { if (!_db && process.env.DATABASE_URL) { try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; } } return _db; }

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  const values: InsertUser = { openId: user.openId }; const updateSet: Record<string, unknown> = {};
  (['name', 'email', 'loginMethod'] as const).forEach((field) => { if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; } });
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date(); if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}
export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return result[0]; }
export async function listCatalogProducts() { const db = await getDb(); if (!db) return []; return db.select().from(products).where(eq(products.status, 'active')).orderBy(desc(products.createdAt)); }
export type CheckoutOrderInput = {
  userId: number;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  couponCode?: string;
  items: Array<{ productSlug: string; quantity: number; size?: string; color?: string }>;
};

export async function createPersistedOrder(input: CheckoutOrderInput) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  if (!input.items.length || input.items.length > 30) throw new Error("Your cart is empty or contains too many line items.");

  return db.transaction(async (tx) => {
    const slugs = [...new Set(input.items.map((item) => item.productSlug))];
    const rows = await tx.select().from(products).where(inArray(products.slug, slugs));
    const bySlug = new Map(rows.map((product) => [product.slug, product]));
    if (bySlug.size !== slugs.length) throw new Error("One or more products are no longer available.");

    let subtotal = 0;
    const orderLines = input.items.map((item) => {
      const product = bySlug.get(item.productSlug)!;
      if (product.status !== "active") throw new Error(`${product.name} is not available for purchase.`);
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) throw new Error("Each item quantity must be between 1 and 20.");
      if (product.stock < item.quantity) throw new Error(`${product.name} does not have enough stock. Available: ${product.stock}.`);
      subtotal += product.price * item.quantity;
      return { product, quantity: item.quantity, size: item.size, color: item.color };
    });

    const delivery = subtotal === 0 || subtotal >= 3000 ? 0 : 199;
    let discount = 0;
    let couponCode: string | undefined;
    if (input.couponCode?.trim()) {
      couponCode = input.couponCode.trim().toUpperCase();
      const [coupon] = await tx.select().from(coupons).where(and(eq(coupons.code, couponCode), eq(coupons.active, 1))).limit(1);
      if (!coupon) throw new Error("This coupon is invalid or expired.");
      discount = coupon.kind === "percent" ? Math.round(subtotal * coupon.value / 100) : Math.min(subtotal, coupon.value);
    }

    for (const line of orderLines) {
      const updateResult = await tx.update(products)
        .set({ stock: sql`${products.stock} - ${line.quantity}` })
        .where(and(eq(products.id, line.product.id), gte(products.stock, line.quantity), eq(products.status, "active")));
      if (Number(updateResult[0].affectedRows ?? 0) !== 1) throw new Error(`${line.product.name} just sold out. Please refresh your cart.`);
    }

    const orderNumber = `BPK-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
    const total = Math.max(0, subtotal + delivery - discount);
    const orderResult = await tx.insert(orders).values({
      orderNumber,
      userId: input.userId,
      customerName: input.customerName.trim(),
      phone: input.phone.trim(),
      address: input.address.trim(),
      city: input.city.trim(),
      postalCode: input.postalCode.trim(),
      paymentMethod: "cod",
      status: "pending",
      subtotal,
      delivery,
      discount,
      total,
      couponCode,
    });
    const orderId = Number(orderResult[0].insertId);
    await tx.insert(orderItems).values(orderLines.map((line) => ({
      orderId,
      productId: line.product.id,
      productName: line.product.name,
      unitPrice: line.product.price,
      quantity: line.quantity,
      size: line.size,
      color: line.color,
    })));
    return { orderId, orderNumber, subtotal, delivery, discount, total };
  });
}

export async function listCustomerOrders(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function listRecentOrders() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(50);
}

export async function updateOrderStatus(orderId: number, status: "confirmed" | "processing" | "shipped" | "delivered" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.transaction(async (tx) => {
    const [current] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!current) throw new Error("Order not found.");
    if (current.status === "cancelled") {
      if (status !== "cancelled") throw new Error("A cancelled order cannot be reopened. Create a new order instead.");
      return;
    }
    if (status === "cancelled") {
      const result = await tx.update(orders).set({ status }).where(and(eq(orders.id, orderId), sql`${orders.status} <> 'cancelled'`));
      if (Number(result[0].affectedRows ?? 0) === 1) {
        const lines = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
        for (const line of lines) {
          if (line.productId) {
            await tx.update(products).set({ stock: sql`${products.stock} + ${line.quantity}` }).where(eq(products.id, line.productId));
          }
        }
      }
      return;
    }
    await tx.update(orders).set({ status }).where(eq(orders.id, orderId));
  });
  return { success: true };
}

export async function getAdminMetrics() { const db = await getDb(); if (!db) return { sales: 0, orders: 0, customers: 0 }; const [sales] = await db.select({ total: sql<number>`coalesce(sum(${orders.total}), 0)` }).from(orders).where(sql`${orders.status} <> 'cancelled'`); const [orderCount] = await db.select({ total: sql<number>`count(*)` }).from(orders).where(sql`${orders.status} <> 'cancelled'`); const [customerCount] = await db.select({ total: sql<number>`count(*)` }).from(users); return { sales: Number(sales?.total ?? 0), orders: Number(orderCount?.total ?? 0), customers: Number(customerCount?.total ?? 0) }; }
