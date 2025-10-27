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
    birthday?: {
      day: string;
      month: string;
      year: string;
    };
    gender: 'Male' | 'Female' | 'Other';
  };
  contact: {
    address: {
      street: string;
      apartment?: string;
      city: string;
      province: string;
      postalCode: string | {
        first3: string;
        last3: string;
        full?: string;
      };
    };
    phones: {
      home?: string | {
        countryCode: string;
        areaCode: string;
        number: string;
        full?: string;
      };
      cell?: string | {
        countryCode: string;
        areaCode: string;
        number: string;
        full?: string;
      };
      work?: string | {
        countryCode: string;
        areaCode: string;
        number: string;
        extension?: string;
        full?: string;
      };
    };
    email?: string;
    company?: string;
    companyOther?: string;
  };
  medical: {
    familyMD?: string;
    referringMD?: string;
    csrName?: string;
  };
  insurance: Array<{
    type: '1st' | '2nd' | '3rd';
    dpa?: boolean;
    policyHolder: string;
    cob?: string;
    policyHolderName?: string;
    birthday?: {
      day: string;
      month: string;
      year: string;
    };
    company: string;
    companyAddress?: string;
    city?: string;
    province?: string;
    postalCode?: {
      first3: string;
      last3: string;
    };
    groupNumber?: string;
    certificateNumber: string;
    coverage: {
      numberOfOrthotics?: string;
      totalAmountPerOrthotic?: number;
      totalAmountPerYear?: number;
      frequency?: string;
      numOrthoticsPerYear?: string;
      orthopedicShoes?: number;
      compressionStockings?: number;
      physiotherapy?: number;
      massage?: number;
      other?: number;
    };
  }>;
  defaultClinic: string;
  clientId?: string;
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

// Add proper phone type definition
interface PhoneStructure {
  countryCode: string;
  areaCode: string;
  number: string;
  extension?: string;
  full?: string;
}

// Add transformed client data type
interface TransformedClientData extends Omit<CreateClientRequest, 'contact'> {
  contact: {
    address: {
      street: string;
      apartment?: string;
      city: string;
      province: string;
      postalCode: string; // Keep as string to match backend validation
    };
    phones: {
      home?: PhoneStructure;
      cell?: PhoneStructure;
      work?: PhoneStructure & { extension?: string };
    };
    email?: string;
    company?: string;
    companyOther?: string;
  };
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
      
      if (response.success && response.data !== undefined) {
        // Handle empty results gracefully - provide default pagination if missing
        const pagination = response.pagination || {
          page: options.page || 1,
          limit: options.limit || 20,
          total: 0,
          pages: 0,
          hasNext: false,
          hasPrev: false
        };
        
        const paginatedResponse: PaginatedClientResponse = {
          clients: Array.isArray(response.data) ? response.data : [],
          pagination: pagination
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
   * Transform frontend data to backend-compatible format
   */
  private static transformClientData(clientData: CreateClientRequest | UpdateClientRequest): TransformedClientData {
    const transformedData = { ...clientData } as any;

    // Safely transform dateOfBirth to birthday format if provided
    if (clientData.personalInfo?.dateOfBirth && !clientData.personalInfo?.birthday) {
      const date = new Date(clientData.personalInfo.dateOfBirth);
      if (!isNaN(date.getTime())) {
        transformedData.personalInfo = {
          ...transformedData.personalInfo,
          birthday: {
            day: date.getDate().toString().padStart(2, '0'),
            month: (date.getMonth() + 1).toString().padStart(2, '0'),
            year: date.getFullYear().toString()
          }
        };
      }
    }

    // Keep postal code as string - backend expects string format
    if (clientData.contact?.address?.postalCode && typeof clientData.contact.address.postalCode === 'string') {
      // Just normalize the format to ensure proper spacing
      const postalCode = clientData.contact.address.postalCode.replace(/\s+/g, '').toUpperCase();
      if (postalCode.length === 6) {
        transformedData.contact = {
          ...transformedData.contact,
          address: {
            ...transformedData.contact.address,
            postalCode: `${postalCode.substring(0, 3)} ${postalCode.substring(3, 6)}`
          }
        };
      }
    }

    // Transform phone numbers from string to object format
    const transformPhone = (phone: string | PhoneStructure): PhoneStructure => {
      if (typeof phone === 'string') {
        // Parse phone number - assuming format like "(416) 123-4567" or "4161234567"
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
          return {
            countryCode: '1',
            areaCode: cleaned.substring(0, 3),
            number: `${cleaned.substring(3, 6)}-${cleaned.substring(6)}`,
            full: `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`
          };
        } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
          return {
            countryCode: '1',
            areaCode: cleaned.substring(1, 4),
            number: `${cleaned.substring(4, 7)}-${cleaned.substring(7)}`,
            full: `(${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7)}`
          };
        }
        // If can't parse, return as is with basic structure
        return {
          countryCode: '1',
          areaCode: '',
          number: phone,
          full: phone
        };
      }
      return phone; // Already in correct format
    };

    // Safely transform phone numbers
    if (clientData.contact?.phones) {
      transformedData.contact = {
        ...transformedData.contact,
        phones: {
          ...transformedData.contact.phones
        }
      };

      if (clientData.contact.phones.home) {
        transformedData.contact.phones.home = transformPhone(clientData.contact.phones.home);
      }
      if (clientData.contact.phones.cell) {
        transformedData.contact.phones.cell = transformPhone(clientData.contact.phones.cell);
      }
      if (clientData.contact.phones.work) {
        transformedData.contact.phones.work = transformPhone(clientData.contact.phones.work);
      }
    }

    return transformedData as TransformedClientData;
  }

  /**
   * Create new client
   */
  static async createClient(clientData: CreateClientRequest): Promise<Client> {
    try {
      const transformedData = this.transformClientData(clientData);
      
      const response = await this.request<Client>(
        this.ENDPOINT,
        'POST',
        transformedData
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
      const transformedData = this.transformClientData(updates);
      
      const response = await this.request<Client>(
        `${this.ENDPOINT}/${encodeURIComponent(clientId)}`,
        'PUT',
        transformedData
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
