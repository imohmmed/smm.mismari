import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "@neondatabase/serverless";
import { storage } from "./storage";
import { getAmazingSmmApi, createMockServices } from "./amazingSmm";
import { loginSchema, registerSchema, type User } from "@shared/schema";
import { z } from "zod";

// Helper to get profit margin from database (default 15%)
async function getProfitMargin(): Promise<number> {
  const margin = await storage.getSetting("profit_margin");
  return parseFloat(margin || "15");
}

declare module "express-session" {
  interface SessionData {
    userId: string;
    role: string;
  }
}

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId || req.session.role !== "admin") {
    return res.status(403).json({ error: "Forbidden - Admin access required" });
  }
  next();
};

async function seedAdminUser() {
  const ADMIN_EMAIL = "it.mohmmed@yahoo.com";
  const ADMIN_PASSWORD = "ZVwas1515";
  const ADMIN_USERNAME = "Mohmmed";
  const ADMIN_PHONE = "+9647766699669";

  try {
    const existingAdmin = await storage.getUserByEmail(ADMIN_EMAIL);
    if (!existingAdmin) {
      await storage.createUser({
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        phone: ADMIN_PHONE,
        role: "admin",
      });
      console.log("[seed] Default admin account created: " + ADMIN_EMAIL);
    } else if (existingAdmin.role !== "admin") {
      await storage.updateUserRole(existingAdmin.id, "admin");
      console.log("[seed] Updated existing user to admin role");
    }
  } catch (error) {
    console.error("[seed] Error seeding admin user:", error);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  const isProduction = process.env.NODE_ENV === "production";
  
  // Trust proxy for Replit's reverse proxy in production
  if (isProduction) {
    app.set("trust proxy", 1);
  }
  
  const PgSession = connectPgSimple(session);
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  app.use(
    session({
      store: new PgSession({
        pool: pool as any,
        tableName: "sessions",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "smm-panel-secret-key-2024",
      resave: false,
      saveUninitialized: false,
      proxy: isProduction,
      cookie: {
        secure: isProduction,
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: isProduction ? "none" : "lax",
      },
    })
  );

  await seedAdminUser();

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const data = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const existingUsername = await storage.getUserByUsername(data.username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }

      const user = await storage.createUser(data);
      
      req.session.userId = user.id;
      req.session.role = user.role;
      
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Session save failed" });
        }
        res.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            balance: user.balance,
            role: user.role,
          },
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Check username availability
  app.get("/api/auth/check-username/:username", async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      
      if (!username || username.length < 3) {
        return res.json({ available: false, message: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" });
      }

      const existingUser = await storage.getUserByUsername(username);
      
      if (existingUser) {
        return res.json({ available: false, message: "اسم المستخدم مستخدم بالفعل" });
      }

      res.json({ available: true, message: "اسم المستخدم متاح" });
    } catch (error) {
      console.error("Username check error:", error);
      res.status(500).json({ available: false, message: "حدث خطأ" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const validPassword = await storage.validatePassword(user, data.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      req.session.userId = user.id;
      req.session.role = user.role;

      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Session save failed" });
        }
        res.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            balance: user.balance,
            role: user.role,
          },
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // Update user profile with password confirmation
  app.post("/api/auth/update-profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const { password, username, email, phone } = req.body;
      
      if (!password) {
        return res.status(400).json({ error: "كلمة المرور مطلوبة" });
      }

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }

      // Verify password
      const isValidPassword = await storage.validatePassword(user, password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "كلمة المرور غير صحيحة" });
      }

      // Check if new username is taken (if changing)
      if (username && username !== user.username) {
        const existingUsername = await storage.getUserByUsername(username);
        if (existingUsername) {
          return res.status(400).json({ error: "اسم المستخدم مستخدم بالفعل" });
        }
      }

      // Check if new email is taken (if changing)
      if (email && email !== user.email) {
        const existingEmail = await storage.getUserByEmail(email);
        if (existingEmail) {
          return res.status(400).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
        }
      }

      // Update user profile
      const updatedUser = await storage.updateUserProfile(req.session.userId!, {
        username: username || user.username,
        email: email || user.email,
        phone: phone !== undefined ? phone : user.phone,
      });

      res.json({
        success: true,
        user: {
          id: updatedUser?.id,
          username: updatedUser?.username,
          email: updatedUser?.email,
          phone: updatedUser?.phone,
          balance: updatedUser?.balance,
          role: updatedUser?.role,
        },
        message: "تم تحديث البيانات بنجاح",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "فشل تحديث البيانات" });
    }
  });

  // Change password
  app.post("/api/auth/change-password", requireAuth, async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "جميع الحقول مطلوبة" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" });
      }

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }

      // Verify current password
      const isValidPassword = await storage.validatePassword(user, currentPassword);
      if (!isValidPassword) {
        return res.status(401).json({ error: "كلمة المرور الحالية غير صحيحة" });
      }

      // Update password
      await storage.updateUserPassword(req.session.userId!, newPassword);

      res.json({
        success: true,
        message: "تم تغيير كلمة المرور بنجاح",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ error: "فشل تغيير كلمة المرور" });
    }
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        balance: user.balance,
        role: user.role,
        discount: user.discount,
        totalSpent: user.totalSpent,
      },
    });
  });

  app.get("/api/admin/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { search } = req.query;
      let users: User[];
      
      if (search && typeof search === "string") {
        users = await storage.searchUsers(search);
      } else {
        users = await storage.getAllUsers();
      }

      res.json({
        users: users.map((u) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          phone: u.phone,
          balance: u.balance,
          totalSpent: u.totalSpent,
          discount: u.discount,
          role: u.role,
          createdAt: u.createdAt,
        })),
        total: users.length,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/users/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const orders = await storage.getOrders(user.id);

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          balance: user.balance,
          totalSpent: user.totalSpent,
          discount: user.discount,
          role: user.role,
          createdAt: user.createdAt,
        },
        orders,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/admin/users/:id/balance", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { amount, operation } = req.body;
      
      if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }
      
      if (!["add", "subtract"].includes(operation)) {
        return res.status(400).json({ error: "Invalid operation" });
      }

      const user = await storage.updateUserBalance(req.params.id, amount, operation);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          balance: user.balance,
        },
      });
    } catch (error) {
      console.error("Error updating balance:", error);
      res.status(500).json({ error: "Failed to update balance" });
    }
  });

  app.post("/api/admin/users/:id/role", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { role } = req.body;
      
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      const user = await storage.updateUserRole(req.params.id, role);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ error: "Failed to update role" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      
      if (userId === req.session.userId) {
        return res.status(400).json({ error: "Cannot delete yourself" });
      }

      const success = await storage.deleteUser(userId);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.post("/api/admin/users/:id/discount", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { discount } = req.body;
      
      if (typeof discount !== "number" || discount < 0 || discount > 100) {
        return res.status(400).json({ error: "Invalid discount (0-100)" });
      }

      const user = await storage.updateUserDiscount(req.params.id, discount);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          discount: user.discount,
        },
      });
    } catch (error) {
      console.error("Error updating discount:", error);
      res.status(500).json({ error: "Failed to update discount" });
    }
  });

  app.get("/api/admin/orders", requireAdmin, async (req: Request, res: Response) => {
    try {
      const orders = await storage.getAllOrders();
      res.json({ orders, total: orders.length });
    } catch (error) {
      console.error("Error fetching all orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/admin/stats", requireAdmin, async (req: Request, res: Response) => {
    try {
      const [usersCount, ordersCount] = await Promise.all([
        storage.countUsers(),
        storage.countOrders(),
      ]);

      const users = await storage.getAllUsers();
      const totalBalance = users.reduce((acc, u) => acc + (u.balance || 0), 0);
      const totalSpending = users.reduce((acc, u) => acc + (u.totalSpent || 0), 0);

      const profitMargin = parseFloat(await storage.getSetting("profit_margin") || "15");
      const accumulatedProfit = parseFloat(await storage.getSetting("accumulated_profit") || "0");

      res.json({
        users: usersCount,
        orders: ordersCount,
        totalBalance,
        totalSpending,
        accumulatedProfit,
        profitMargin,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/settings/profit-margin", requireAdmin, async (req: Request, res: Response) => {
    try {
      const margin = await storage.getSetting("profit_margin");
      res.json({ profitMargin: parseFloat(margin || "15") });
    } catch (error) {
      console.error("Error fetching profit margin:", error);
      res.status(500).json({ error: "Failed to fetch profit margin" });
    }
  });

  app.post("/api/admin/settings/profit-margin", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { profitMargin } = req.body;
      
      if (typeof profitMargin !== "number" || profitMargin < 0 || profitMargin > 100) {
        return res.status(400).json({ error: "Invalid profit margin (0-100)" });
      }

      await storage.setSetting("profit_margin", profitMargin.toString());
      // Clear the services cache to force refresh with new profit margin
      storage.clearServicesCache();
      res.json({ success: true, profitMargin });
    } catch (error) {
      console.error("Error updating profit margin:", error);
      res.status(500).json({ error: "Failed to update profit margin" });
    }
  });

  app.get("/api/admin/service-lookup/:serviceId", requireAdmin, async (req: Request, res: Response) => {
    try {
      const serviceId = parseInt(req.params.serviceId);
      const profitMargin = await getProfitMargin();
      
      let services = storage.getCachedServices();
      if (services.length === 0) {
        try {
          const api = getAmazingSmmApi();
          services = await api.getServices(profitMargin);
          storage.cacheServices(services);
        } catch {
          services = createMockServices();
          storage.cacheServices(services);
        }
      }

      const service = services.find((s) => s.service === serviceId);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }

      res.json({
        service: {
          id: service.service,
          name: service.name,
          rate: service.rate,
          rateWithMarkup: service.rateWithMarkup,
          min: service.min,
          max: service.max,
          category: service.category,
          platform: service.platform,
        },
      });
    } catch (error) {
      console.error("Error looking up service:", error);
      res.status(500).json({ error: "Failed to lookup service" });
    }
  });

  app.get("/api/services", async (req: Request, res: Response) => {
    try {
      const profitMargin = await getProfitMargin();
      let services = storage.getCachedServices();
      
      if (services.length === 0) {
        try {
          const api = getAmazingSmmApi();
          services = await api.getServices(profitMargin);
          if (services.length > 0) {
            storage.cacheServices(services);
          }
        } catch (error) {
          console.log("Using mock services (API not configured)");
          services = createMockServices();
          storage.cacheServices(services);
        }
      }

      const categories = Array.from(new Set(services.map((s) => s.category)));
      const platforms = Array.from(new Set(services.map((s) => s.platform).filter(Boolean)));

      res.json({
        services,
        categories,
        platforms,
        total: services.length,
      });
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.get("/api/services/:platform", async (req: Request, res: Response) => {
    try {
      const { platform } = req.params;
      const profitMargin = await getProfitMargin();
      let services = storage.getCachedServices();
      
      if (services.length === 0) {
        try {
          const api = getAmazingSmmApi();
          services = await api.getServices(profitMargin);
          storage.cacheServices(services);
        } catch {
          services = createMockServices();
          storage.cacheServices(services);
        }
      }

      const filtered = platform === "all"
        ? services
        : services.filter((s) => s.platform === platform);

      const categories = Array.from(new Set(filtered.map((s) => s.category)));

      res.json({
        services: filtered,
        categories,
        total: filtered.length,
      });
    } catch (error) {
      console.error("Error fetching services by platform:", error);
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.get("/api/service/:id", async (req: Request, res: Response) => {
    try {
      const serviceId = parseInt(req.params.id);
      const profitMargin = await getProfitMargin();
      let service = storage.getServiceById(serviceId);
      
      if (!service) {
        try {
          const api = getAmazingSmmApi();
          const services = await api.getServices(profitMargin);
          storage.cacheServices(services);
          service = storage.getServiceById(serviceId);
        } catch {
          const services = createMockServices();
          storage.cacheServices(services);
          service = storage.getServiceById(serviceId);
        }
      }

      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }

      res.json(service);
    } catch (error) {
      console.error("Error fetching service:", error);
      res.status(500).json({ error: "Failed to fetch service" });
    }
  });

  app.post("/api/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      const { serviceId, link, quantity } = req.body;
      const userId = req.session.userId!;
      
      const service = storage.getServiceById(serviceId);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }

      const minQty = parseInt(String(service.min));
      const maxQty = parseInt(String(service.max));
      if (quantity < minQty || quantity > maxQty) {
        return res.status(400).json({ 
          error: `Quantity must be between ${minQty} and ${maxQty}` 
        });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }

      // Calculate charge with user discount applied
      // For single-quantity services (like Discord boosts where max=1), rate is the full price
      // For regular services, rate is per 1000 units
      const maxQtyNum = parseInt(String(service.max));
      const isSingleQuantityService = maxQtyNum === 1;
      const baseCharge = isSingleQuantityService 
        ? quantity * service.rateWithMarkup 
        : (quantity / 1000) * service.rateWithMarkup;
      const userDiscount = user.discount || 0;
      const discountAmount = (baseCharge * userDiscount) / 100;
      const charge = baseCharge - discountAmount;

      if (user.balance < charge) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      await storage.updateUserBalance(userId, charge, "subtract");

      let apiOrderId: number | undefined;
      try {
        const api = getAmazingSmmApi();
        const result = await api.createOrder(serviceId, link, quantity);
        
        if ("error" in result) {
          await storage.updateUserBalance(userId, charge, "add");
          return res.status(400).json({ error: result.error });
        }
        apiOrderId = result.order;
      } catch {
        console.log("API not configured, creating local order");
      }

      const order = await storage.createOrder({
        userId,
        serviceId,
        serviceName: service.name,
        link,
        quantity,
        charge,
      });

      // Update total spent for user
      await storage.updateUserTotalSpent(userId, charge);

      // Calculate and add profit to accumulated profits
      const profitMargin = parseFloat(await storage.getSetting("profit_margin") || "15");
      const orderProfit = (charge * profitMargin) / 100;
      const currentAccumulatedProfit = parseFloat(await storage.getSetting("accumulated_profit") || "0");
      await storage.setSetting("accumulated_profit", (currentAccumulatedProfit + orderProfit).toString());

      if (apiOrderId) {
        await storage.updateOrderStatus(order.id, "Pending", apiOrderId);
      }

      res.json({ 
        success: true, 
        order,
        message: "Order created successfully" 
      });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Helper function to map API status to our internal status
  function mapApiStatus(apiStatus: string): string {
    const statusMap: Record<string, string> = {
      'Pending': 'Pending',
      'Processing': 'Processing',
      'In progress': 'In progress',
      'Completed': 'Completed',
      'Partial': 'Partial',
      'Canceled': 'Cancelled',
      'Cancelled': 'Cancelled',
      'Refunded': 'Refunded',
    };
    return statusMap[apiStatus] || apiStatus;
  }
  
  // Helper to safely parse numbers, returns undefined for invalid values
  function safeParseInt(value: string | undefined | null): number | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = parseInt(value);
    return isFinite(parsed) ? parsed : undefined;
  }

  app.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      let userOrders = await storage.getOrders(userId);
      
      // Sync status for orders with apiOrderId that are not in terminal states
      const ordersToSync = userOrders.filter(
        o => o.apiOrderId && !['Completed', 'Cancelled', 'Partial', 'Refunded'].includes(o.status)
      );
      
      // Sync up to 5 orders at a time to avoid overwhelming the API
      const ordersToSyncLimited = ordersToSync.slice(0, 5);
      
      if (ordersToSyncLimited.length > 0) {
        try {
          const api = getAmazingSmmApi();
          
          // Fetch status for each order individually (more reliable than bulk)
          const syncPromises = ordersToSyncLimited.map(async (order) => {
            try {
              const apiStatus = await api.getOrderStatus(order.apiOrderId!);
              if (apiStatus && apiStatus.status) {
                const newStatus = mapApiStatus(apiStatus.status);
                const startCount = safeParseInt(apiStatus.start_count);
                const remains = safeParseInt(apiStatus.remains);
                
                // Only update if there's a meaningful change
                const statusChanged = newStatus !== order.status;
                const remainsChanged = remains !== undefined && remains !== order.remains;
                const startCountChanged = startCount !== undefined && startCount !== order.startCount;
                
                if (statusChanged || remainsChanged || startCountChanged) {
                  await storage.updateOrderStatus(order.id, newStatus, undefined, startCount, remains);
                }
              }
            } catch (orderSyncError) {
              console.error(`Error syncing order ${order.apiOrderId}:`, orderSyncError);
              // Continue with other orders
            }
          });
          
          await Promise.all(syncPromises);
          
          // Refetch orders after sync
          userOrders = await storage.getOrders(userId);
        } catch (syncError) {
          console.error("Error syncing order statuses:", syncError);
          // Continue with existing orders if sync fails
        }
      }
      
      res.json({ orders: userOrders, total: userOrders.length });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Manual sync endpoint for a single order
  app.post("/api/orders/:id/sync", requireAuth, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      const userOrders = await storage.getOrders(userId);
      const order = userOrders.find(o => o.id === orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      if (!order.apiOrderId) {
        return res.status(400).json({ error: "Order has no API ID" });
      }
      
      const api = getAmazingSmmApi();
      const apiStatus = await api.getOrderStatus(order.apiOrderId);
      
      if (apiStatus && apiStatus.status) {
        const newStatus = mapApiStatus(apiStatus.status);
        const startCount = safeParseInt(apiStatus.start_count);
        const remains = safeParseInt(apiStatus.remains);
        
        const updated = await storage.updateOrderStatus(order.id, newStatus, undefined, startCount, remains);
        res.json({ success: true, order: updated, apiStatus });
      } else {
        res.json({ success: false, error: "Could not fetch status from API" });
      }
    } catch (error) {
      console.error("Error syncing order status:", error);
      res.status(500).json({ error: "Failed to sync order status" });
    }
  });

  app.get("/api/orders/:id/status", async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      
      try {
        const api = getAmazingSmmApi();
        const status = await api.getOrderStatus(orderId);
        res.json(status);
      } catch {
        res.json({
          status: "In progress",
          charge: "0.0150",
          start_count: "1000",
          remains: "500",
        });
      }
    } catch (error) {
      console.error("Error fetching order status:", error);
      res.status(500).json({ error: "Failed to fetch order status" });
    }
  });

  app.post("/api/calculate", async (req: Request, res: Response) => {
    try {
      const { serviceId, quantity } = req.body;
      
      const service = storage.getServiceById(serviceId);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }

      let rate = service.rateWithMarkup;
      let discount = 0;
      
      // Apply user discount if logged in
      if (req.session.userId) {
        const user = await storage.getUser(req.session.userId);
        if (user && user.discount > 0) {
          discount = user.discount;
          rate = rate * (1 - discount / 100);
        }
      }

      // For single-quantity services (like Discord boosts where max=1), rate is the full price
      // For regular services, rate is per 1000 units
      const maxQty = parseInt(String(service.max));
      const isSingleQuantityService = maxQty === 1;
      const charge = isSingleQuantityService 
        ? quantity * rate 
        : (quantity / 1000) * rate;
      
      res.json({
        serviceId,
        quantity,
        rate: rate,
        originalRate: service.rateWithMarkup,
        discount,
        charge: charge.toFixed(4),
        currency: "USD",
      });
    } catch (error) {
      console.error("Error calculating price:", error);
      res.status(500).json({ error: "Failed to calculate price" });
    }
  });

  app.get("/api/balance", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Get completed orders count
      const ordersCompleted = await storage.getCompletedOrdersCount(req.session.userId!);
      
      res.json({
        balance: user.balance,
        currency: "USD",
        totalSpent: user.totalSpent,
        discount: user.discount,
        ordersCompleted,
      });
    } catch (error) {
      console.error("Error fetching balance:", error);
      res.status(500).json({ error: "Failed to fetch balance" });
    }
  });

  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const profitMargin = await getProfitMargin();
      let services = storage.getCachedServices();
      
      if (services.length === 0) {
        try {
          const api = getAmazingSmmApi();
          services = await api.getServices(profitMargin);
          storage.cacheServices(services);
        } catch {
          services = createMockServices();
          storage.cacheServices(services);
        }
      }

      const categories = Array.from(new Set(services.map((s) => s.category)));
      res.json({ categories });
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const profitMargin = await getProfitMargin();
      const [usersCount, ordersCount] = await Promise.all([
        storage.countUsers(),
        storage.countOrders(),
      ]);

      let servicesCount = 0;
      let services = storage.getCachedServices();
      
      if (services.length === 0) {
        try {
          const api = getAmazingSmmApi();
          services = await api.getServices(profitMargin);
          if (services.length > 0) {
            storage.cacheServices(services);
          }
        } catch {
          services = createMockServices();
          storage.cacheServices(services);
        }
      }
      
      servicesCount = services.length;

      res.json({
        users: usersCount,
        orders: ordersCount,
        services: servicesCount,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // ========== Subscriptions Routes ==========
  
  // Get all subscriptions (admin)
  app.get("/api/admin/subscriptions", requireAdmin, async (req: Request, res: Response) => {
    try {
      const allSubscriptions = await storage.getAllSubscriptions();
      res.json({ subscriptions: allSubscriptions });
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
  });

  // Get active subscriptions (public)
  app.get("/api/subscriptions", async (req: Request, res: Response) => {
    try {
      const activeSubscriptions = await storage.getActiveSubscriptions();
      res.json({ subscriptions: activeSubscriptions });
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
  });

  // Get single subscription
  app.get("/api/subscriptions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const subscription = await storage.getSubscription(id);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      res.json({ subscription });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });

  // Create subscription (admin)
  app.post("/api/admin/subscriptions", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { name, description, imageUrl, deliveryTime, price } = req.body;
      
      if (!name || !description || !deliveryTime || price === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const subscription = await storage.createSubscription({
        name,
        description,
        imageUrl: imageUrl || null,
        deliveryTime,
        price: parseFloat(price),
      });

      res.json({ success: true, subscription });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ error: "Failed to create subscription" });
    }
  });

  // Update subscription (admin)
  app.patch("/api/admin/subscriptions/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description, imageUrl, deliveryTime, price } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
      if (deliveryTime !== undefined) updateData.deliveryTime = deliveryTime;
      if (price !== undefined) updateData.price = parseFloat(price);

      const subscription = await storage.updateSubscription(id, updateData);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }

      res.json({ success: true, subscription });
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ error: "Failed to update subscription" });
    }
  });

  // Toggle subscription status (admin)
  app.patch("/api/admin/subscriptions/:id/toggle", requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const subscription = await storage.toggleSubscriptionStatus(id);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      res.json({ success: true, subscription });
    } catch (error) {
      console.error("Error toggling subscription:", error);
      res.status(500).json({ error: "Failed to toggle subscription" });
    }
  });

  // Delete subscription (admin)
  app.delete("/api/admin/subscriptions/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSubscription(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting subscription:", error);
      res.status(500).json({ error: "Failed to delete subscription" });
    }
  });

  return httpServer;
}
