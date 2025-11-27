import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "@neondatabase/serverless";
import { storage } from "./storage";
import { getAmazingSmmApi, createMockServices } from "./amazingSmm";
import { loginSchema, registerSchema, type User } from "@shared/schema";
import { z } from "zod";

const PROFIT_MARGIN = 0.15;

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
  try {
    const existingAdmin = await storage.getUserByEmail("mohmmed@yahoo");
    if (!existingAdmin) {
      await storage.createUser({
        username: "admin",
        email: "mohmmed@yahoo",
        password: "ZVwas511",
        role: "admin",
      });
      console.log("Admin user created: mohmmed@yahoo");
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
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
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
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
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
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

  app.get("/api/admin/services", requireAdmin, async (req: Request, res: Response) => {
    try {
      const curatedServices = await storage.getCuratedServices();
      res.json({ services: curatedServices, total: curatedServices.length });
    } catch (error) {
      console.error("Error fetching curated services:", error);
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.post("/api/admin/services", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { serviceId, platform, category } = req.body;

      if (!serviceId || !platform || !category) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = await storage.getCuratedServiceByServiceId(serviceId);
      if (existing) {
        return res.status(400).json({ error: "Service already added" });
      }

      let services = storage.getCachedServices();
      if (services.length === 0) {
        try {
          const api = getAmazingSmmApi();
          services = await api.getServices();
          storage.cacheServices(services);
        } catch {
          services = createMockServices();
          storage.cacheServices(services);
        }
      }

      const apiService = services.find((s) => s.service === serviceId);
      if (!apiService) {
        return res.status(404).json({ error: "Service not found in API" });
      }

      const curatedService = await storage.addCuratedService({
        serviceId,
        platform,
        category,
        serviceName: apiService.name,
        rate: apiService.rate,
        min: parseInt(String(apiService.min)),
        max: parseInt(String(apiService.max)),
      });

      res.json({ success: true, service: curatedService });
    } catch (error) {
      console.error("Error adding service:", error);
      res.status(500).json({ error: "Failed to add service" });
    }
  });

  app.delete("/api/admin/services/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeCuratedService(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing service:", error);
      res.status(500).json({ error: "Failed to remove service" });
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

  app.get("/api/admin/service-lookup/:serviceId", requireAdmin, async (req: Request, res: Response) => {
    try {
      const serviceId = parseInt(req.params.serviceId);
      
      let services = storage.getCachedServices();
      if (services.length === 0) {
        try {
          const api = getAmazingSmmApi();
          services = await api.getServices();
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
      let services = storage.getCachedServices();
      
      if (services.length === 0) {
        try {
          const api = getAmazingSmmApi();
          services = await api.getServices();
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
      let services = storage.getCachedServices();
      
      if (services.length === 0) {
        try {
          const api = getAmazingSmmApi();
          services = await api.getServices();
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
      let service = storage.getServiceById(serviceId);
      
      if (!service) {
        try {
          const api = getAmazingSmmApi();
          const services = await api.getServices();
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

      const charge = (quantity / 1000) * service.rateWithMarkup;

      const user = await storage.getUser(userId);
      if (!user || user.balance < charge) {
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

  app.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const orders = await storage.getOrders(userId);
      res.json({ orders, total: orders.length });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
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

      const charge = (quantity / 1000) * service.rateWithMarkup;
      
      res.json({
        serviceId,
        quantity,
        rate: service.rateWithMarkup,
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
      
      res.json({
        balance: user.balance,
        currency: "USD",
        totalSpent: user.totalSpent,
        discount: user.discount,
      });
    } catch (error) {
      console.error("Error fetching balance:", error);
      res.status(500).json({ error: "Failed to fetch balance" });
    }
  });

  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      let services = storage.getCachedServices();
      
      if (services.length === 0) {
        try {
          const api = getAmazingSmmApi();
          services = await api.getServices();
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
      const [usersCount, ordersCount] = await Promise.all([
        storage.countUsers(),
        storage.countOrders(),
      ]);

      let servicesCount = 0;
      let services = storage.getCachedServices();
      
      if (services.length === 0) {
        try {
          const api = getAmazingSmmApi();
          services = await api.getServices();
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

  return httpServer;
}
