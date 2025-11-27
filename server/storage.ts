import { type User, type InsertUser, type Order, type ServiceWithMarkup } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: string, balance: number): Promise<User | undefined>;
  
  // Order operations
  getOrders(userId: string): Promise<Order[]>;
  addOrder(userId: string, order: Order): Promise<Order>;
  updateOrderStatus(orderId: number, status: Order['status'], remains?: number): Promise<Order | undefined>;
  
  // Service cache
  cacheServices(services: ServiceWithMarkup[]): void;
  getCachedServices(): ServiceWithMarkup[];
  getServiceById(serviceId: number): ServiceWithMarkup | undefined;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private orders: Map<string, Order[]>;
  private servicesCache: ServiceWithMarkup[];
  private servicesCacheTime: number;

  constructor() {
    this.users = new Map();
    this.orders = new Map();
    this.servicesCache = [];
    this.servicesCacheTime = 0;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email ?? null,
      phone: insertUser.phone ?? null,
      balance: 0,
      totalSpent: 0,
      discount: 0,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(id: string, balance: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      user.balance = balance;
      this.users.set(id, user);
      return user;
    }
    return undefined;
  }

  async getOrders(userId: string): Promise<Order[]> {
    return this.orders.get(userId) || [];
  }

  async addOrder(userId: string, order: Order): Promise<Order> {
    const userOrders = this.orders.get(userId) || [];
    userOrders.unshift(order);
    this.orders.set(userId, userOrders);
    return order;
  }

  async updateOrderStatus(orderId: number, status: Order['status'], remains?: number): Promise<Order | undefined> {
    const entries = Array.from(this.orders.entries());
    for (const [userId, userOrders] of entries) {
      const orderIndex = userOrders.findIndex((o: Order) => o.orderId === orderId);
      if (orderIndex !== -1) {
        userOrders[orderIndex].status = status;
        if (remains !== undefined) {
          userOrders[orderIndex].remains = remains;
        }
        this.orders.set(userId, userOrders);
        return userOrders[orderIndex];
      }
    }
    return undefined;
  }

  cacheServices(services: ServiceWithMarkup[]): void {
    this.servicesCache = services;
    this.servicesCacheTime = Date.now();
  }

  getCachedServices(): ServiceWithMarkup[] {
    // Cache for 5 minutes
    if (Date.now() - this.servicesCacheTime > 5 * 60 * 1000) {
      return [];
    }
    return this.servicesCache;
  }

  getServiceById(serviceId: number): ServiceWithMarkup | undefined {
    return this.servicesCache.find(s => s.service === serviceId);
  }
}

export const storage = new MemStorage();
