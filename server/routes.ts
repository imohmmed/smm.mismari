import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getAmazingSmmApi, createMockServices } from "./amazingSmm";
import { insertOrderSchema, type ServiceWithMarkup, type Order } from "@shared/schema";
import { z } from "zod";

const PROFIT_MARGIN = 0.15;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Get all services with 15% markup applied
  app.get("/api/services", async (req: Request, res: Response) => {
    try {
      // Check cache first
      let services = storage.getCachedServices();
      
      if (services.length === 0) {
        // Try to fetch from API
        try {
          const api = getAmazingSmmApi();
          services = await api.getServices();
          if (services.length > 0) {
            storage.cacheServices(services);
          }
        } catch (error) {
          // API key not set or API error - use mock data
          console.log('Using mock services (API not configured)');
          services = createMockServices();
          storage.cacheServices(services);
        }
      }

      // Extract unique categories and platforms
      const categories = Array.from(new Set(services.map(s => s.category)));
      const platforms = Array.from(new Set(services.map(s => s.platform).filter(Boolean)));

      res.json({
        services,
        categories,
        platforms,
        total: services.length,
      });
    } catch (error) {
      console.error('Error fetching services:', error);
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  });

  // Get services filtered by platform
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

      const filtered = platform === 'all' 
        ? services 
        : services.filter(s => s.platform === platform);

      const categories = Array.from(new Set(filtered.map(s => s.category)));

      res.json({
        services: filtered,
        categories,
        total: filtered.length,
      });
    } catch (error) {
      console.error('Error fetching services by platform:', error);
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  });

  // Get single service by ID
  app.get("/api/service/:id", async (req: Request, res: Response) => {
    try {
      const serviceId = parseInt(req.params.id);
      let service = storage.getServiceById(serviceId);
      
      if (!service) {
        // Refresh cache
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
        return res.status(404).json({ error: 'Service not found' });
      }

      res.json(service);
    } catch (error) {
      console.error('Error fetching service:', error);
      res.status(500).json({ error: 'Failed to fetch service' });
    }
  });

  // Create a new order
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      // Get service to calculate price
      const service = storage.getServiceById(orderData.serviceId);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      // Validate quantity
      const minQty = parseInt(service.min);
      const maxQty = parseInt(service.max);
      if (orderData.quantity < minQty || orderData.quantity > maxQty) {
        return res.status(400).json({ 
          error: `Quantity must be between ${minQty} and ${maxQty}` 
        });
      }

      // Calculate charge with markup
      const charge = (orderData.quantity / 1000) * service.rateWithMarkup;

      try {
        // Try to create order via API
        const api = getAmazingSmmApi();
        const result = await api.createOrder(orderData.serviceId, orderData.link, orderData.quantity);
        
        if ('error' in result) {
          return res.status(400).json({ error: result.error });
        }

        const order: Order = {
          orderId: result.order,
          serviceId: orderData.serviceId,
          serviceName: service.name,
          link: orderData.link,
          quantity: orderData.quantity,
          charge,
          status: 'Pending',
        };

        // Store order (using a default user for now)
        await storage.addOrder('default', order);

        res.json({ 
          success: true, 
          order,
          message: 'Order created successfully' 
        });
      } catch {
        // API not configured - create mock order
        const mockOrderId = Math.floor(Math.random() * 1000000) + 100000;
        
        const order: Order = {
          orderId: mockOrderId,
          serviceId: orderData.serviceId,
          serviceName: service.name,
          link: orderData.link,
          quantity: orderData.quantity,
          charge,
          status: 'Pending',
        };

        await storage.addOrder('default', order);

        res.json({ 
          success: true, 
          order,
          message: 'Order created (demo mode)' 
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  // Get all orders
  app.get("/api/orders", async (req: Request, res: Response) => {
    try {
      const orders = await storage.getOrders('default');
      res.json({ orders, total: orders.length });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  // Get order status
  app.get("/api/orders/:id/status", async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      
      try {
        const api = getAmazingSmmApi();
        const status = await api.getOrderStatus(orderId);
        res.json(status);
      } catch {
        // Return mock status
        res.json({
          status: 'In progress',
          charge: '0.0150',
          start_count: '1000',
          remains: '500',
        });
      }
    } catch (error) {
      console.error('Error fetching order status:', error);
      res.status(500).json({ error: 'Failed to fetch order status' });
    }
  });

  // Calculate order price
  app.post("/api/calculate", async (req: Request, res: Response) => {
    try {
      const { serviceId, quantity } = req.body;
      
      const service = storage.getServiceById(serviceId);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      const charge = (quantity / 1000) * service.rateWithMarkup;
      
      res.json({
        serviceId,
        quantity,
        rate: service.rateWithMarkup,
        charge: charge.toFixed(4),
        currency: 'USD',
      });
    } catch (error) {
      console.error('Error calculating price:', error);
      res.status(500).json({ error: 'Failed to calculate price' });
    }
  });

  // Get user balance (mock)
  app.get("/api/balance", async (req: Request, res: Response) => {
    try {
      // Return mock balance for now
      res.json({
        balance: 0,
        currency: 'USD',
        totalSpent: 0,
        discount: 0,
      });
    } catch (error) {
      console.error('Error fetching balance:', error);
      res.status(500).json({ error: 'Failed to fetch balance' });
    }
  });

  // Get categories
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

      const categories = Array.from(new Set(services.map(s => s.category)));
      res.json({ categories });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  return httpServer;
}
