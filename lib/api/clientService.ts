import { BaseApiService } from './baseApiService';
import type { Client } from '../data/mockDataService';

interface ClientQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

interface CreateClientRequest {
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    gender: 'Male' | 'Female' | 'Other';
  };
  contact: {
    address: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
    };
    phones: {
      home?: string;
      cell?: string;
      work?: string;
    };
    email?: string;
    company?: string;
  };
  medical: {
    familyMD?: string;
    referringMD?: string;
    csrName?: string;
  };
  insurance: Array<{
    type: '1st' | '2nd' | '3rd';
    policyHolder: string;
    company: string;
    groupNumber?: string;
    certificateNumber: string;
    coverage: {
      orthotics?: number;
      physiotherapy?: number;
      massage?: number;
      orthopedicShoes?: number;
      compressionStockings?: number;
      other?: number;
    };
  }>;
  defaultClinic: string;
}

interface UpdateClientRequest extends Partial<CreateClientRequest> {
  isActive?: boolean;
}

interface PaginatedClientResponse {
  clients: Client[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ClientStatsResponse {
  totalClients: number;
  activeClients: number;
  newThisMonth: number;
  withInsurance: number;
  averageAge: number;
  genderDistribution: Record<string, number>;
  topCities: Array<{ city: string; count: number }>;
}

export class ClientApiService extends BaseApiService {
  private static readonly ENDPOINT = '/clients';
  private static readonly CACHE_TTL = 300000; // 5 minutes

  /**
   * Get clients by clinic with frontend-compatible format
   * Uses caching for optimal performance
   */
  static async getClientsByClinic(
    clinicName: string, 
    options: ClientQueryOptions = {}
  ): Promise<PaginatedClientResponse> {
    const cacheKey = `clients_${clinicName}_${JSON.stringify(options)}`;
    const cached = this.getCached<PaginatedClientResponse>(cacheKey);
    if (cached) return cached;

    try {
      const query = this.buildQuery({
        page: options.page || 1,
        limit: options.limit || 20,
        search: options.search,
        status: options.status
      });

      const queryString = query ? `?${query}` : '';
      const endpoint = `${this.ENDPOINT}/clinic/${encodeURIComponent(clinicName)}/frontend-compatible${queryString}`;
      
      const response = await this.request<Client[]>(endpoint);
      
      if (response.success && response.data && response.pagination) {
        const paginatedResponse: PaginatedClientResponse = {
          clients: response.data,
          pagination: response.pagination
        };
        this.setCached(cacheKey, paginatedResponse, this.CACHE_TTL);
        return paginatedResponse;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      throw this.handleError(error, 'getClientsByClinic');
    }
  }

  /**
   * Get client by ID with frontend-compatible format
   */
  static async getClientById(clientId: string): Promise<Client> {
    const cacheKey = `client_${clientId}`;
    const cached = this.getCached<Client>(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = `${this.ENDPOINT}/${encodeURIComponent(clientId)}/frontend-compatible`;
      const response = await this.request<Client>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Client not found');
    } catch (error) {
      throw this.handleError(error, 'getClientById');
    }
  }

  /**
   * Create new client
   */
  static async createClient(clientData: CreateClientRequest): Promise<Client> {
    try {
      const response = await this.request<Client>(
        this.ENDPOINT,
        'POST',
        clientData
      );
      
      if (response.success && response.data) {
        // Clear related cache entries
        this.clearCache('clients_');
        return response.data;
      }
      
      throw new Error('Failed to create client');
    } catch (error) {
      throw this.handleError(error, 'createClient');
    }
  }

  /**
   * Update existing client
   */
  static async updateClient(clientId: string, updates: UpdateClientRequest): Promise<Client> {
    try {
      const response = await this.request<Client>(
        `${this.ENDPOINT}/${encodeURIComponent(clientId)}`,
        'PUT',
        updates
      );
      
      if (response.success && response.data) {
        // Clear related cache entries
        this.clearCache('clients_');
        this.clearCache(`client_${clientId}`);
        return response.data;
      }
      
      throw new Error('Failed to update client');
    } catch (error) {
      throw this.handleError(error, 'updateClient');
    }
  }

  /**
   * Search clients across system
   */
  static async searchClients(searchTerm: string, clinicName?: string, limit = 20): Promise<Client[]> {
    if (!searchTerm.trim()) {
      return [];
    }

    const cacheKey = `search_${searchTerm}_${clinicName || 'all'}_${limit}`;
    const cached = this.getCached<Client[]>(cacheKey);
    if (cached) return cached;

    try {
      const query = this.buildQuery({
        q: searchTerm.trim(),
        clinic: clinicName,
        limit
      });

      const endpoint = `${this.ENDPOINT}/search?${query}`;
      const response = await this.request<Client[]>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, 60000); // 1 minute cache for searches
        return response.data;
      }
      
      return [];
    } catch (error) {
      throw this.handleError(error, 'searchClients');
    }
  }

  /**
   * Get clients with insurance information
   */
  static async getClientsWithInsurance(clinicName: string): Promise<Client[]> {
    const cacheKey = `clients_insurance_${clinicName}`;
    const cached = this.getCached<Client[]>(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = `${this.ENDPOINT}/clinic/${encodeURIComponent(clinicName)}/insurance`;
      const response = await this.request<Client[]>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      return [];
    } catch (error) {
      throw this.handleError(error, 'getClientsWithInsurance');
    }
  }

  /**
   * Get client statistics for clinic
   */
  static async getClientStats(clinicName: string): Promise<ClientStatsResponse> {
    const cacheKey = `client_stats_${clinicName}`;
    const cached = this.getCached<ClientStatsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = `${this.ENDPOINT}/clinic/${encodeURIComponent(clinicName)}/stats`;
      const response = await this.request<ClientStatsResponse>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to fetch client statistics');
    } catch (error) {
      throw this.handleError(error, 'getClientStats');
    }
  }

  /**
   * Soft delete client
   */
  static async deleteClient(clientId: string): Promise<void> {
    try {
      const response = await this.request(
        `${this.ENDPOINT}/${encodeURIComponent(clientId)}`,
        'DELETE'
      );
      
      if (response.success) {
        // Clear related cache entries
        this.clearCache('clients_');
        this.clearCache(`client_${clientId}`);
        return;
      }
      
      throw new Error('Failed to delete client');
    } catch (error) {
      throw this.handleError(error, 'deleteClient');
    }
  }

  /**
   * Utility: Clear all client-related cache
   */
  static clearClientCache(): void {
    this.clearCache('clients_');
    this.clearCache('client_');
    this.clearCache('search_');
  }
}
