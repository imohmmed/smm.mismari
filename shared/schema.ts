import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  phone: text("phone"),
  balance: real("balance").default(0).notNull(),
  totalSpent: real("total_spent").default(0).notNull(),
  discount: integer("discount").default(0).notNull(),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  phone: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  serviceId: integer("service_id").notNull(),
  serviceName: text("service_name").notNull(),
  link: text("link").notNull(),
  quantity: integer("quantity").notNull(),
  charge: real("charge").notNull(),
  status: text("status").default("Pending").notNull(),
  apiOrderId: integer("api_order_id"),
  startCount: integer("start_count"),
  remains: integer("remains"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  serviceId: true,
  serviceName: true,
  link: true,
  quantity: true,
  charge: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export const curatedServices = pgTable("curated_services", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull().unique(),
  platform: text("platform").notNull(),
  category: text("category").notNull(),
  serviceName: text("service_name").notNull(),
  rate: text("rate").notNull(),
  min: integer("min").notNull(),
  max: integer("max").notNull(),
  active: boolean("active").default(true).notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const insertCuratedServiceSchema = createInsertSchema(curatedServices).pick({
  serviceId: true,
  platform: true,
  category: true,
  serviceName: true,
  rate: true,
  min: true,
  max: true,
});

export type InsertCuratedService = z.infer<typeof insertCuratedServiceSchema>;
export type CuratedService = typeof curatedServices.$inferSelect;

export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export const serviceSchema = z.object({
  service: z.number(),
  name: z.string(),
  type: z.string(),
  rate: z.string(),
  min: z.union([z.string(), z.number()]),
  max: z.union([z.string(), z.number()]),
  category: z.string(),
  refill: z.boolean().optional(),
  cancel: z.boolean().optional(),
  dripfeed: z.boolean().optional(),
});

export type Service = z.infer<typeof serviceSchema>;

export const serviceWithMarkupSchema = serviceSchema.extend({
  rateWithMarkup: z.number(),
  platform: z.string().optional(),
});

export type ServiceWithMarkup = z.infer<typeof serviceWithMarkupSchema>;

export const orderStatusSchema = z.object({
  charge: z.string(),
  start_count: z.string(),
  status: z.string(),
  remains: z.string(),
  currency: z.string().optional(),
});

export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
