/**
 * Server-side Data Fetchers for Next.js Server Components
 * 
 * These functions encapsulate data fetching logic for use in Server Components:
 * - Reusable across multiple pages
 * - Type-safe return values
 * - Built-in caching strategies
 * - Error handling
 */

import { ServerApiClient } from './api-client';

// ============================================================================
// Type Definitions
// ============================================================================

export interface Client {
  id: string;
  clientId?: number;
  firstName: string;
  lastName: string;
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth: string;
  gender?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  // Enrichment data from backend
  nextAppointment?: {
    date: string;
    subject: string;
    formattedDate: string;
  } | null;
  totalOrders?: number;
  [key: string]: string | number | object | null | undefined;
}

export interface Order {
  id: string;
  orderId?: number;
  clientId: number | string;
  clinicName: string;
  orderDate: string;
  status: string;
  items: any[];
  totalAmount: number;
  [key: string]: any;
}

export interface PaymentAmounts {
  totalPaymentAmount: number;
  totalPaid: number;
  totalOwed: number;
  [key: string]: number;
}

export interface Payment {
  id: string;
  _id: string;
  paymentId?: string;
  paymentNumber?: string;
  clientId: number | string;
  clientName?: string;
  orderId?: number | string;
  amounts: PaymentAmounts;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  clinicName: string;
  [key: string]: any;
}

export interface Appointment {
  id: string;
  appointmentId?: number;
  clientId: number | string;
  clinicName: string;
  appointmentDate: string;
  status: string;
  [key: string]: any;
}

export interface Clinic {
  id: string;
  name: string;
  displayName: string;
  backendName?: string;
  [key: string]: any;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface FetchOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  revalidate?: number | false;
  tags?: string[];
}

// ============================================================================
// Client Data Fetchers
// ============================================================================

/**
 * Fetch clients for a specific clinic
 * @param clinicName - Backend clinic name (e.g., 'bodyblissphysio')
 * @param options - Query options (pagination, search, etc.)
 */
export async function fetchClientsByClinic(
  clinicName: string,
  options: FetchOptions = {}
): Promise<PaginatedResponse<Client>> {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    revalidate = 300, // 5 minutes default cache
    tags = ['clients', `clinic-${clinicName}`]
  } = options;

  const query = ServerApiClient.buildQuery({
    page,
    limit,
    search,
    status
  });

  const queryString = query ? `?${query}` : '';
  const endpoint = `/clients/clinic/${encodeURIComponent(clinicName)}/frontend-compatible${queryString}`;

  const response = await ServerApiClient.get<Client[]>(endpoint, {
    revalidate,
    tags
  });

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch clients');
  }

  return {
    data: response.data,
    pagination: response.pagination || {
      page,
      limit,
      total: 0,
      pages: 0,
      hasNext: false,
      hasPrev: false
    }
  };
}

/**
 * Fetch a single client by ID
 */
export async function fetchClientById(
  clientId: string,
  options: { revalidate?: number | false; tags?: string[] } = {}
): Promise<Client> {
  const {
    revalidate = 300,
    tags = ['clients', `client-${clientId}`]
  } = options;

  const endpoint = `/clients/${encodeURIComponent(clientId)}/frontend-compatible`;

  const response = await ServerApiClient.get<Client>(endpoint, {
    revalidate,
    tags
  });

  if (!response.success || !response.data) {
    throw new Error('Client not found');
  }

  return response.data;
}

/**
 * Fetch client statistics for a clinic
 */
export async function fetchClientStats(
  clinicName: string,
  options: { revalidate?: number | false; tags?: string[] } = {}
): Promise<any> {
  const {
    revalidate = 600, // 10 minutes for stats
    tags = ['client-stats', `clinic-${clinicName}`]
  } = options;

  const endpoint = `/clients/clinic/${encodeURIComponent(clinicName)}/stats`;

  const response = await ServerApiClient.get(endpoint, {
    revalidate,
    tags
  });

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch client statistics');
  }

  return response.data;
}

// ============================================================================
// Order Data Fetchers
// ============================================================================

/**
 * Fetch orders for a specific clinic
 */
export async function fetchOrdersByClinic(
  clinicName: string,
  options: FetchOptions = {}
): Promise<PaginatedResponse<Order>> {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    revalidate = 180, // 3 minutes for orders
    tags = ['orders', `clinic-${clinicName}`]
  } = options;

  const query = ServerApiClient.buildQuery({
    page,
    limit,
    search,
    status
  });

  const queryString = query ? `?${query}` : '';
  const endpoint = `/orders/clinic/${encodeURIComponent(clinicName)}${queryString}`;

  const response = await ServerApiClient.get<Order[]>(endpoint, {
    revalidate,
    tags
  });

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch orders');
  }

  return {
    data: response.data,
    pagination: response.pagination || {
      page,
      limit,
      total: 0,
      pages: 0,
      hasNext: false,
      hasPrev: false
    }
  };
}

/**
 * Fetch a single order by ID
 */
export async function fetchOrderById(
  orderId: string,
  options: { revalidate?: number | false; tags?: string[] } = {}
): Promise<Order> {
  const {
    revalidate = 180,
    tags = ['orders', `order-${orderId}`]
  } = options;

  const endpoint = `/orders/${encodeURIComponent(orderId)}`;

  const response = await ServerApiClient.get<Order>(endpoint, {
    revalidate,
    tags
  });

  if (!response.success || !response.data) {
    throw new Error('Order not found');
  }

  return response.data;
}

// ============================================================================
// Payment Data Fetchers
// ============================================================================

/**
 * Fetch payments for a specific clinic
 */
export async function fetchPaymentsByClinic(
  clinicName: string,
  options: FetchOptions = {}
): Promise<PaginatedResponse<Payment>> {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    revalidate = 180, // 3 minutes for payments
    tags = ['payments', `clinic-${clinicName}`]
  } = options;

  const query = ServerApiClient.buildQuery({
    page,
    limit,
    search,
    status
  });

  const queryString = query ? `?${query}` : '';
  const endpoint = `/payments/clinic/${encodeURIComponent(clinicName)}${queryString}`;

  const response = await ServerApiClient.get<Payment[]>(endpoint, {
    revalidate,
    tags
  });

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch payments');
  }

  return {
    data: response.data,
    pagination: response.pagination || {
      page,
      limit,
      total: 0,
      pages: 0,
      hasNext: false,
      hasPrev: false
    }
  };
}

/**
 * Fetch a single payment by ID
 */
export async function fetchPaymentById(
  paymentId: string,
  options: { revalidate?: number | false; tags?: string[] } = {}
): Promise<Payment> {
  const {
    revalidate = 180,
    tags = ['payments', `payment-${paymentId}`]
  } = options;

  const endpoint = `/payments/${encodeURIComponent(paymentId)}`;

  const response = await ServerApiClient.get<Payment>(endpoint, {
    revalidate,
    tags
  });

  if (!response.success || !response.data) {
    throw new Error('Payment not found');
  }

  return response.data;
}

// ============================================================================
// Appointment Data Fetchers
// ============================================================================

/**
 * Fetch appointments for a specific clinic
 */
export async function fetchAppointmentsByClinic(
  clinicName: string,
  options: FetchOptions = {}
): Promise<PaginatedResponse<Appointment>> {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    revalidate = 60, // 1 minute for appointments (more dynamic)
    tags = ['appointments', `clinic-${clinicName}`]
  } = options;

  const query = ServerApiClient.buildQuery({
    page,
    limit,
    search,
    status
  });

  const queryString = query ? `?${query}` : '';
  const endpoint = `/appointments/clinic/${encodeURIComponent(clinicName)}${queryString}`;

  const response = await ServerApiClient.get<Appointment[]>(endpoint, {
    revalidate,
    tags
  });

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch appointments');
  }

  return {
    data: response.data,
    pagination: response.pagination || {
      page,
      limit,
      total: 0,
      pages: 0,
      hasNext: false,
      hasPrev: false
    }
  };
}

// ============================================================================
// Clinic Data Fetchers
// ============================================================================

/**
 * Fetch all available clinics
 */
export async function fetchClinics(
  options: { revalidate?: number | false; tags?: string[] } = {}
): Promise<Clinic[]> {
  const {
    revalidate = 3600, // 1 hour for clinic list (rarely changes)
    tags = ['clinics']
  } = options;

  const endpoint = '/clinics/frontend-compatible';

  const response = await ServerApiClient.get<any>(endpoint, {
    revalidate,
    tags
  });

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch clinics');
  }

  // The frontend-compatible endpoint returns { clinics: [...] }
  const clinics = response.data.clinics || response.data;
  
  return Array.isArray(clinics) ? clinics : [clinics];
}

/**
 * Fetch a single clinic by name
 */
export async function fetchClinicByName(
  clinicName: string,
  options: { revalidate?: number | false; tags?: string[] } = {}
): Promise<Clinic> {
  const {
    revalidate = 3600,
    tags = ['clinics', `clinic-${clinicName}`]
  } = options;

  const endpoint = `/clinics/find/${encodeURIComponent(clinicName)}`;

  const response = await ServerApiClient.get<Clinic>(endpoint, {
    revalidate,
    tags
  });

  if (!response.success || !response.data) {
    throw new Error('Clinic not found');
  }

  return response.data;
}

