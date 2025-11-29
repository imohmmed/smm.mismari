import { type Service, type ServiceWithMarkup } from "@shared/schema";

const API_URL = "https://amazingsmm.com/api/v2";

// Platform detection based on service name/category
function detectPlatform(name: string, category: string): string {
  const text = (name + ' ' + category).toLowerCase();
  
  if (text.includes('instagram') || text.includes('انستجرام') || text.includes('انستا')) return 'instagram';
  if (text.includes('youtube') || text.includes('يوتيوب')) return 'youtube';
  if (text.includes('facebook') || text.includes('فيسبوك') || text.includes('فيس بوك')) return 'facebook';
  if (text.includes('tiktok') || text.includes('تيك توك') || text.includes('تيكتوك')) return 'tiktok';
  if (text.includes('twitter') || text.includes('تويتر') || text.includes(' x ')) return 'twitter';
  if (text.includes('telegram') || text.includes('تليجرام') || text.includes('تيليجرام')) return 'telegram';
  if (text.includes('snapchat') || text.includes('سناب') || text.includes('سناب شات')) return 'snapchat';
  if (text.includes('discord') || text.includes('ديسكورد')) return 'discord';
  if (text.includes('linkedin') || text.includes('لينكد')) return 'linkedin';
  if (text.includes('spotify') || text.includes('سبوتيفاي')) return 'spotify';
  if (text.includes('twitch') || text.includes('تويتش')) return 'twitch';
  if (text.includes('google') || text.includes('جوجل')) return 'google';
  
  return 'other';
}

// Apply dynamic profit margin to rate
function applyMarkup(rate: string, profitMargin: number): number {
  const baseRate = parseFloat(rate);
  return baseRate * (1 + profitMargin / 100);
}

export class AmazingSmmApi {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request(action: string, params: Record<string, string | number> = {}) {
    const body = new URLSearchParams({
      key: this.apiKey,
      action,
      ...Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ),
    });

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Get all services from Amazing SMM with dynamic profit margin
  async getServices(profitMargin: number = 15): Promise<ServiceWithMarkup[]> {
    try {
      const data = await this.request('services');
      
      if (!Array.isArray(data)) {
        console.error('Unexpected API response:', data);
        return [];
      }

      return data.map((service: Service) => ({
        ...service,
        rateWithMarkup: applyMarkup(service.rate, profitMargin),
        platform: detectPlatform(service.name, service.category),
      }));
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  }

  // Get balance
  async getBalance(): Promise<{ balance: string; currency: string } | null> {
    try {
      const data = await this.request('balance');
      return data;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return null;
    }
  }

  // Create a new order (supports both regular and custom comments)
  async createOrder(serviceId: number, link: string, quantity: number, comments?: string): Promise<{ order: number } | { error: string }> {
    try {
      const params: Record<string, string | number> = {
        service: serviceId,
        link,
      };
      
      // For custom comments, send comments instead of quantity
      if (comments) {
        params.comments = comments;
      } else {
        params.quantity = quantity;
      }
      
      const data = await this.request('add', params);
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      return { error: 'Failed to create order' };
    }
  }

  // Get order status
  async getOrderStatus(orderId: number): Promise<any> {
    try {
      const data = await this.request('status', { order: orderId });
      return data;
    } catch (error) {
      console.error('Error fetching order status:', error);
      return null;
    }
  }

  // Get multiple order statuses
  async getMultipleOrderStatus(orderIds: number[]): Promise<any> {
    try {
      const data = await this.request('status', { orders: orderIds.join(',') });
      return data;
    } catch (error) {
      console.error('Error fetching multiple order statuses:', error);
      return null;
    }
  }

  // Refill an order (if supported)
  async refillOrder(orderId: number): Promise<{ refill: number } | { error: string }> {
    try {
      const data = await this.request('refill', { order: orderId });
      return data;
    } catch (error) {
      console.error('Error refilling order:', error);
      return { error: 'Failed to refill order' };
    }
  }

  // Cancel an order (if supported)
  async cancelOrder(orderId: number): Promise<any> {
    try {
      const data = await this.request('cancel', { order: orderId });
      return data;
    } catch (error) {
      console.error('Error canceling order:', error);
      return { error: 'Failed to cancel order' };
    }
  }
}

// Singleton instance - will be initialized with API key from environment
let apiInstance: AmazingSmmApi | null = null;

export function getAmazingSmmApi(): AmazingSmmApi {
  if (!apiInstance) {
    const apiKey = process.env.AMAZING_SMM_API_KEY;
    if (!apiKey) {
      throw new Error('AMAZING_SMM_API_KEY environment variable is not set');
    }
    apiInstance = new AmazingSmmApi(apiKey);
  }
  return apiInstance;
}

// For testing without API key
export function createMockServices(): ServiceWithMarkup[] {
  return [
    {
      service: 18193,
      name: 'مشاهدات فيديو انستجرام - السرعة: 100 الف',
      type: 'Default',
      rate: '0.0015',
      min: '100',
      max: '10000000',
      category: 'Instagram Views',
      refill: true,
      cancel: true,
      rateWithMarkup: 0.0015 * 1.15,
      platform: 'instagram',
    },
    {
      service: 18194,
      name: 'لايكات انستجرام - حقيقي - السرعة: 50 الف',
      type: 'Default',
      rate: '0.002',
      min: '50',
      max: '500000',
      category: 'Instagram Likes',
      refill: true,
      cancel: false,
      rateWithMarkup: 0.002 * 1.15,
      platform: 'instagram',
    },
    {
      service: 18195,
      name: 'متابعين انستجرام - عرب حقيقي',
      type: 'Default',
      rate: '0.005',
      min: '100',
      max: '100000',
      category: 'Instagram Followers',
      refill: true,
      cancel: false,
      rateWithMarkup: 0.005 * 1.15,
      platform: 'instagram',
    },
    {
      service: 18196,
      name: 'مشاهدات تيك توك - السرعة: 1 مليون',
      type: 'Default',
      rate: '0.001',
      min: '100',
      max: '50000000',
      category: 'TikTok Views',
      refill: false,
      cancel: true,
      rateWithMarkup: 0.001 * 1.15,
      platform: 'tiktok',
    },
    {
      service: 18197,
      name: 'لايكات تيك توك - السرعة: 100 الف',
      type: 'Default',
      rate: '0.0018',
      min: '50',
      max: '1000000',
      category: 'TikTok Likes',
      refill: false,
      cancel: false,
      rateWithMarkup: 0.0018 * 1.15,
      platform: 'tiktok',
    },
    {
      service: 18198,
      name: 'مشاهدات يوتيوب - السرعة: 10 الف',
      type: 'Default',
      rate: '0.008',
      min: '500',
      max: '1000000',
      category: 'YouTube Views',
      refill: true,
      cancel: true,
      rateWithMarkup: 0.008 * 1.15,
      platform: 'youtube',
    },
    {
      service: 18199,
      name: 'مشتركين يوتيوب - حقيقي',
      type: 'Default',
      rate: '0.02',
      min: '100',
      max: '50000',
      category: 'YouTube Subscribers',
      refill: true,
      cancel: false,
      rateWithMarkup: 0.02 * 1.15,
      platform: 'youtube',
    },
    {
      service: 18200,
      name: 'لايكات فيسبوك - السرعة: 10 الف',
      type: 'Default',
      rate: '0.003',
      min: '50',
      max: '100000',
      category: 'Facebook Likes',
      refill: true,
      cancel: false,
      rateWithMarkup: 0.003 * 1.15,
      platform: 'facebook',
    },
    {
      service: 18201,
      name: 'متابعين تويتر X - حقيقي',
      type: 'Default',
      rate: '0.006',
      min: '100',
      max: '50000',
      category: 'Twitter Followers',
      refill: true,
      cancel: false,
      rateWithMarkup: 0.006 * 1.15,
      platform: 'twitter',
    },
    {
      service: 18202,
      name: 'اعضاء تليجرام - حقيقي',
      type: 'Default',
      rate: '0.004',
      min: '100',
      max: '100000',
      category: 'Telegram Members',
      refill: false,
      cancel: false,
      rateWithMarkup: 0.004 * 1.15,
      platform: 'telegram',
    },
  ];
}
