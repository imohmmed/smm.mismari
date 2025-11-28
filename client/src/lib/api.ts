import { apiRequest } from './queryClient';

// Helper to make API requests with JSON response
async function apiRequestJson<T>(method: string, url: string, data?: unknown): Promise<T> {
  const res = await apiRequest(method, url, data);
  return res.json();
}

// Service types matching backend
export interface Service {
  service: number;
  name: string;
  type: string;
  rate: string;
  min: string;
  max: string;
  category: string;
  refill?: boolean;
  cancel?: boolean;
  dripfeed?: boolean;
  rateWithMarkup: number;
  platform?: string;
}

export interface ServicesResponse {
  services: Service[];
  categories: string[];
  platforms: string[];
  total: number;
}

export interface Order {
  id: number;
  orderId?: number;
  apiOrderId?: number;
  serviceId: number;
  serviceName: string;
  link: string;
  quantity: number;
  charge: number;
  status: 'Pending' | 'In progress' | 'Completed' | 'Partial' | 'Canceled' | 'Refunded' | 'Processing';
  startCount?: number;
  remains?: number;
  currency?: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
}

export interface CreateOrderRequest {
  serviceId: number;
  link: string;
  quantity: number;
}

export interface CreateOrderResponse {
  success: boolean;
  order: Order;
  message: string;
}

export interface BalanceResponse {
  balance: number;
  currency: string;
  totalSpent: number;
  discount: number;
  ordersCompleted: number;
}

export interface CalculateResponse {
  serviceId: number;
  quantity: number;
  rate: number;
  charge: string;
  currency: string;
}

// API functions
export async function fetchServices(platform?: string): Promise<ServicesResponse> {
  const url = platform && platform !== 'all' 
    ? `/api/services/${platform}` 
    : '/api/services';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch services');
  return response.json();
}

export async function fetchService(serviceId: number): Promise<Service> {
  const response = await fetch(`/api/service/${serviceId}`);
  if (!response.ok) throw new Error('Failed to fetch service');
  return response.json();
}

export async function fetchOrders(): Promise<OrdersResponse> {
  const response = await fetch('/api/orders');
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
}

export async function createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
  return apiRequestJson<CreateOrderResponse>('POST', '/api/orders', orderData);
}

export async function fetchBalance(): Promise<BalanceResponse> {
  const response = await fetch('/api/balance');
  if (!response.ok) throw new Error('Failed to fetch balance');
  return response.json();
}

export async function calculatePrice(serviceId: number, quantity: number): Promise<CalculateResponse> {
  return apiRequestJson<CalculateResponse>('POST', '/api/calculate', { serviceId, quantity });
}

export async function fetchOrderStatus(orderId: number): Promise<any> {
  const response = await fetch(`/api/orders/${orderId}/status`);
  if (!response.ok) throw new Error('Failed to fetch order status');
  return response.json();
}

export async function fetchCategories(): Promise<{ categories: string[] }> {
  const response = await fetch('/api/categories');
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
}

// Map API status to UI status
export function mapOrderStatus(status: string): 'pending' | 'inProgress' | 'completed' | 'cancelled' | 'partial' {
  switch (status) {
    case 'Pending':
    case 'Processing':
      return 'pending';
    case 'In progress':
      return 'inProgress';
    case 'Completed':
      return 'completed';
    case 'Canceled':
    case 'Refunded':
      return 'cancelled';
    case 'Partial':
      return 'partial';
    default:
      return 'pending';
  }
}
