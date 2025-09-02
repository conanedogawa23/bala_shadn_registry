import { BaseApiService } from './baseApiService';

// Product Enums matching backend
export enum ProductCategory {
  PHYSIOTHERAPY = 'physiotherapy',
  CONSULTATION = 'consultation',
  ASSESSMENT = 'assessment',
  THERAPY = 'therapy',
  REHABILITATION = 'rehabilitation',
  WELLNESS = 'wellness'
}

export enum ProductStatus {
  ACTIVE = 'active',
  DISCONTINUED = 'discontinued'
}

// Product Interfaces
export interface ProductUsage {
  totalAppointments: number;
  uniqueClients: number;
  firstUsed: string;
  lastUsed: string;
}

export interface Product {
  _id: string;
  productKey: number;
  name: string;
  description: string;
  category: ProductCategory;
  type: string;
  duration: number;
  price: number;
  currency?: string;
  status: ProductStatus;
  isActive: boolean;
  clinics?: string[];
  applicableClinics?: string[];
  usage?: ProductUsage;
  popularityScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  category?: ProductCategory;
  status?: ProductStatus;
  clinicName?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductResponse {
  success: boolean;
  data: Product;
  message?: string;
}

export interface ProductAnalyticsData {
  _id: ProductCategory;
  totalProducts: number;
  activeProducts: number;
  totalAppointments: number;
  avgPrice: number;
}

export interface ProductAnalyticsResponse {
  success: boolean;
  data: ProductAnalyticsData[];
}

/**
 * ProductService - Data-driven product management API service
 * Extends BaseApiService for consistent error handling and caching
 */
export class ProductService extends BaseApiService {
  private static readonly ENDPOINT = '/products';
  private static readonly CACHE_TTL = 300000; // 5 minutes

  /**
   * Get all products with comprehensive filtering and pagination
   * Optimized for performance with caching and efficient queries
   */
  static async getProducts(query: ProductQuery = {}): Promise<ProductsResponse> {
    const queryString = this.buildQuery(query);
    const cacheKey = `products_${queryString}`;
    const cached = this.getCached<ProductsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = queryString ? `${this.ENDPOINT}?${queryString}` : this.ENDPOINT;
      const response = await this.request<ProductsResponse>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response, this.CACHE_TTL);
        return response;
      }
      
      throw new Error('Failed to fetch products');
    } catch (error) {
      throw this.handleError(error, 'getProducts');
    }
  }

  /**
   * Get product by ID or ProductKey
   * Supports both MongoDB ObjectId and ProductKey lookup
   */
  static async getProductById(id: string | number): Promise<ProductResponse> {
    const cacheKey = `product_${id}`;
    const cached = this.getCached<ProductResponse>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.request<ProductResponse>(`${this.ENDPOINT}/${id}`);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response, this.CACHE_TTL);
        return response;
      }
      
      throw new Error('Failed to fetch product');
    } catch (error) {
      throw this.handleError(error, 'getProductById');
    }
  }

  /**
   * Get products by clinic
   * Clinic-specific product catalog for booking systems
   */
  static async getProductsByClinic(clinicName: string, status: ProductStatus = ProductStatus.ACTIVE): Promise<ProductsResponse> {
    const cacheKey = `products_clinic_${clinicName}_${status}`;
    const cached = this.getCached<ProductsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const queryString = this.buildQuery({ status });
      const endpoint = queryString 
        ? `${this.ENDPOINT}/clinic/${encodeURIComponent(clinicName)}?${queryString}`
        : `${this.ENDPOINT}/clinic/${encodeURIComponent(clinicName)}`;
      
      const response = await this.request<ProductsResponse>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response, this.CACHE_TTL);
        return response;
      }
      
      throw new Error('Failed to fetch clinic products');
    } catch (error) {
      throw this.handleError(error, 'getProductsByClinic');
    }
  }

  /**
   * Get products by category
   * Organized product listing by treatment type
   */
  static async getProductsByCategory(category: ProductCategory): Promise<ProductsResponse> {
    const cacheKey = `products_category_${category}`;
    const cached = this.getCached<ProductsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.request<ProductsResponse>(`${this.ENDPOINT}/category/${category}`);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response, this.CACHE_TTL);
        return response;
      }
      
      throw new Error('Failed to fetch category products');
    } catch (error) {
      throw this.handleError(error, 'getProductsByCategory');
    }
  }

  /**
   * Get popular products by usage statistics
   * Data-driven product recommendations
   */
  static async getPopularProducts(limit: number = 10): Promise<ProductsResponse> {
    const cacheKey = `products_popular_${limit}`;
    const cached = this.getCached<ProductsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const queryString = this.buildQuery({ limit });
      const endpoint = `${this.ENDPOINT}/popular?${queryString}`;
      const response = await this.request<ProductsResponse>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response, this.CACHE_TTL);
        return response;
      }
      
      throw new Error('Failed to fetch popular products');
    } catch (error) {
      throw this.handleError(error, 'getPopularProducts');
    }
  }

  /**
   * Search products by name or description
   * Optimized text search functionality
   */
  static async searchProducts(searchTerm: string): Promise<ProductsResponse> {
    if (!searchTerm.trim()) {
      return {
        success: true,
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      };
    }

    const cacheKey = `products_search_${searchTerm}`;
    const cached = this.getCached<ProductsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const queryString = this.buildQuery({ q: searchTerm });
      const response = await this.request<ProductsResponse>(`${this.ENDPOINT}/search?${queryString}`);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response, 60000); // 1 minute cache for searches
        return response;
      }
      
      throw new Error('Failed to search products');
    } catch (error) {
      throw this.handleError(error, 'searchProducts');
    }
  }

  /**
   * Get product analytics by category
   * Business intelligence data for reporting
   */
  static async getProductAnalytics(): Promise<ProductAnalyticsResponse> {
    const cacheKey = 'products_analytics';
    const cached = this.getCached<ProductAnalyticsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.request<ProductAnalyticsResponse>(`${this.ENDPOINT}/analytics`);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response, this.CACHE_TTL);
        return response;
      }
      
      throw new Error('Failed to fetch product analytics');
    } catch (error) {
      throw this.handleError(error, 'getProductAnalytics');
    }
  }

  /**
   * Create new product
   * Administrative function for product management
   */
  static async createProduct(productData: Partial<Product>): Promise<ProductResponse> {
    try {
      const response = await this.request<ProductResponse>(
        this.ENDPOINT,
        'POST',
        productData
      );
      
      if (response.success && response.data) {
        // Clear related caches
        this.clearCache('products_');
        return response;
      }
      
      throw new Error('Failed to create product');
    } catch (error) {
      throw this.handleError(error, 'createProduct');
    }
  }

  /**
   * Update existing product
   * Administrative function for product management
   */
  static async updateProduct(id: string | number, updateData: Partial<Product>): Promise<ProductResponse> {
    try {
      const response = await this.request<ProductResponse>(
        `${this.ENDPOINT}/${id}`,
        'PUT',
        updateData
      );
      
      if (response.success && response.data) {
        // Clear related caches
        this.clearCache('products_');
        this.clearCache(`product_${id}`);
        return response;
      }
      
      throw new Error('Failed to update product');
    } catch (error) {
      throw this.handleError(error, 'updateProduct');
    }
  }

  /**
   * Deactivate product (soft delete)
   * Administrative function maintaining data integrity
   */
  static async deactivateProduct(id: string | number): Promise<ProductResponse> {
    try {
      const response = await this.request<ProductResponse>(
        `${this.ENDPOINT}/${id}`,
        'DELETE'
      );
      
      if (response.success && response.data) {
        // Clear related caches
        this.clearCache('products_');
        this.clearCache(`product_${id}`);
        return response;
      }
      
      throw new Error('Failed to deactivate product');
    } catch (error) {
      throw this.handleError(error, 'deactivateProduct');
    }
  }

  /**
   * Clear product-related caches
   * Utility for cache management
   */
  static clearProductCache(): void {
    this.clearCache('products_');
    this.clearCache('product_');
  }
}
