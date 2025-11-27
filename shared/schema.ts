import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  phone: text("phone"),
  balance: real("balance").default(0),
  totalSpent: real("total_spent").default(0),
  discount: integer("discount").default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  phone: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Service schema (data from Amazing SMM API)
export const serviceSchema = z.object({
  service: z.number(),
  name: z.string(),
  type: z.string(),
  rate: z.string(),
  min: z.string(),
  max: z.string(),
  category: z.string(),
  refill: z.boolean().optional(),
  cancel: z.boolean().optional(),
  dripfeed: z.boolean().optional(),
});

export type Service = z.infer<typeof serviceSchema>;

// Service with markup applied
export const serviceWithMarkupSchema = serviceSchema.extend({
  rateWithMarkup: z.number(),
  platform: z.string().optional(),
});

export type ServiceWithMarkup = z.infer<typeof serviceWithMarkupSchema>;

// Order schema
export const orderSchema = z.object({
  orderId: z.number(),
  serviceId: z.number(),
  serviceName: z.string(),
  link: z.string(),
  quantity: z.number(),
  charge: z.number(),
  status: z.enum(['Pending', 'In progress', 'Completed', 'Partial', 'Canceled', 'Refunded', 'Processing']),
  startCount: z.number().optional(),
  remains: z.number().optional(),
  currency: z.string().optional(),
});

export type Order = z.infer<typeof orderSchema>;

// Insert order schema for creating new orders
export const insertOrderSchema = z.object({
  serviceId: z.number(),
  link: z.string().url(),
  quantity: z.number().min(1),
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Order status response from API
export const orderStatusSchema = z.object({
  charge: z.string(),
  start_count: z.string(),
  status: z.string(),
  remains: z.string(),
  currency: z.string().optional(),
});

export type OrderStatus = z.infer<typeof orderStatusSchema>;
