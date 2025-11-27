import { 
  type User, 
  type InsertUser, 
  type Order,
  type InsertOrder,
  type ServiceWithMarkup,
  type CuratedService,
  type InsertCuratedService,
  type Setting,
  users,
  orders,
  curatedServices,
  settings
} from "@shared/schema";
import { db } from "./db";
import { eq, like, or, desc, count, sum } from "drizzle-orm";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { role?: string }): Promise<User>;
  updateUserBalance(id: string, amount: number, operation: 'add' | 'subtract'): Promise<User | undefined>;
  updateUserTotalSpent(id: string, amount: number): Promise<User | undefined>;
  updateUserDiscount(id: string, discount: number): Promise<User | undefined>;
  updateUserProfile(id: string, data: { username?: string; email?: string; phone?: string }): Promise<User | undefined>;
  updateUserPassword(id: string, newPassword: string): Promise<User | undefined>;
  validatePassword(user: User, password: string): Promise<boolean>;
  
  getAllUsers(): Promise<User[]>;
  searchUsers(query: string): Promise<User[]>;
  countUsers(): Promise<number>;
  
  getOrders(userId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(orderId: number, status: string, apiOrderId?: number, remains?: number): Promise<Order | undefined>;
  countOrders(): Promise<number>;
  getCompletedOrdersCount(userId: string): Promise<number>;
  
  getCuratedServices(): Promise<CuratedService[]>;
  addCuratedService(service: InsertCuratedService): Promise<CuratedService>;
  removeCuratedService(id: number): Promise<boolean>;
  getCuratedServiceByServiceId(serviceId: number): Promise<CuratedService | undefined>;
  
  cacheServices(services: ServiceWithMarkup[]): void;
  getCachedServices(): ServiceWithMarkup[];
  getServiceById(serviceId: number): ServiceWithMarkup | undefined;
  
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;
  getTotalRevenue(): Promise<number>;
  
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  private servicesCache: ServiceWithMarkup[] = [];
  private servicesCacheTime: number = 0;

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser & { role?: string }): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, SALT_ROUNDS);
    const [user] = await db.insert(users).values({
      username: insertUser.username,
      password: hashedPassword,
      email: insertUser.email,
      phone: insertUser.phone,
      role: insertUser.role || "user",
    }).returning();
    return user;
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async updateUserBalance(id: string, amount: number, operation: 'add' | 'subtract'): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const newBalance = operation === 'add' 
      ? user.balance + amount 
      : Math.max(0, user.balance - amount);
    
    const [updated] = await db.update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async updateUserTotalSpent(id: string, amount: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const newTotalSpent = user.totalSpent + amount;
    
    const [updated] = await db.update(users)
      .set({ totalSpent: newTotalSpent })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async updateUserDiscount(id: string, discount: number): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set({ discount })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async updateUserProfile(id: string, data: { username?: string; email?: string; phone?: string }): Promise<User | undefined> {
    const updateData: Partial<User> = {};
    if (data.username) updateData.username = data.username;
    if (data.email) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;

    const [updated] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async updateUserPassword(id: string, newPassword: string): Promise<User | undefined> {
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const [updated] = await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async searchUsers(query: string): Promise<User[]> {
    const searchPattern = `%${query}%`;
    return db.select().from(users).where(
      or(
        like(users.username, searchPattern),
        like(users.email, searchPattern),
        like(users.phone, searchPattern)
      )
    );
  }

  async countUsers(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(users);
    return result?.count || 0;
  }

  async getOrders(userId: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async countOrders(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(orders);
    return result?.count || 0;
  }

  async getCompletedOrdersCount(userId: string): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(orders)
      .where(eq(orders.userId, userId));
    return result?.count || 0;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(orderId: number, status: string, apiOrderId?: number, remains?: number): Promise<Order | undefined> {
    const updateData: Partial<Order> = { status };
    if (apiOrderId !== undefined) updateData.apiOrderId = apiOrderId;
    if (remains !== undefined) updateData.remains = remains;
    
    const [updated] = await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();
    return updated;
  }

  async getCuratedServices(): Promise<CuratedService[]> {
    return db.select().from(curatedServices).where(eq(curatedServices.active, true));
  }

  async addCuratedService(service: InsertCuratedService): Promise<CuratedService> {
    const [newService] = await db.insert(curatedServices).values(service).returning();
    return newService;
  }

  async removeCuratedService(id: number): Promise<boolean> {
    const result = await db.delete(curatedServices).where(eq(curatedServices.id, id));
    return true;
  }

  async getCuratedServiceByServiceId(serviceId: number): Promise<CuratedService | undefined> {
    const [service] = await db.select().from(curatedServices).where(eq(curatedServices.serviceId, serviceId));
    return service;
  }

  cacheServices(services: ServiceWithMarkup[]): void {
    this.servicesCache = services;
    this.servicesCacheTime = Date.now();
  }

  getCachedServices(): ServiceWithMarkup[] {
    if (Date.now() - this.servicesCacheTime > 5 * 60 * 1000) {
      return [];
    }
    return this.servicesCache;
  }

  getServiceById(serviceId: number): ServiceWithMarkup | undefined {
    return this.servicesCache.find(s => s.service === serviceId);
  }

  async getSetting(key: string): Promise<string | null> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting?.value || null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    const existing = await this.getSetting(key);
    if (existing !== null) {
      await db.update(settings).set({ value, updatedAt: new Date() }).where(eq(settings.key, key));
    } else {
      await db.insert(settings).values({ key, value });
    }
  }

  async getTotalRevenue(): Promise<number> {
    const result = await db.select({ total: sum(orders.charge) }).from(orders);
    return parseFloat(result[0]?.total || '0');
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    await db.delete(orders).where(eq(orders.userId, id));
    const result = await db.delete(users).where(eq(users.id, id));
    return true;
  }
}

export const storage = new DatabaseStorage();
