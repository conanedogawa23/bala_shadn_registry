import { useState, useEffect, useCallback } from 'react';
import { 
  ProductService, 
  Product, 
  ProductQuery, 
  ProductCategory, 
  ProductStatus,
  ProductAnalyticsData 
} from '../api/productService';

interface UseProductsOptions {
  query?: ProductQuery;
  autoFetch?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for fetching and managing products with comprehensive filtering
 * Follows established patterns with loading states and error handling
 */
export function useProducts({
  query = {},
  autoFetch = true
}: UseProductsOptions = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseProductsReturn['pagination']>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ProductService.getProducts(query);
      setProducts(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      setProducts([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(query)]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [fetchProducts, autoFetch]);

  return {
    products,
    loading,
    error,
    pagination,
    refetch: fetchProducts,
    clearError
  };
}

interface UseProductOptions {
  id: string | number;
  autoFetch?: boolean;
}

interface UseProductReturn {
  product: Product | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for fetching a single product by ID or ProductKey
 * Optimized with caching and error handling
 */
export function useProduct({
  id,
  autoFetch = true
}: UseProductOptions): UseProductReturn {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await ProductService.getProductById(id);
      setProduct(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch && id) {
      fetchProduct();
    }
  }, [fetchProduct, autoFetch, id]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct,
    clearError
  };
}

interface UseProductsByClinicOptions {
  clinicName: string;
  status?: ProductStatus;
  autoFetch?: boolean;
}

interface UseProductsByClinicReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for fetching products available for a specific clinic
 * Clinic-specific product catalog management
 */
export function useProductsByClinic({
  clinicName,
  status = ProductStatus.ACTIVE,
  autoFetch = true
}: UseProductsByClinicOptions): UseProductsByClinicReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!clinicName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await ProductService.getProductsByClinic(clinicName, status);
      setProducts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clinic products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [clinicName, status]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch && clinicName) {
      fetchProducts();
    }
  }, [fetchProducts, autoFetch, clinicName]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    clearError
  };
}

interface UseProductSearchOptions {
  searchTerm: string;
  debounceMs?: number;
  autoFetch?: boolean;
}

interface UseProductSearchReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  search: (term: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for searching products with debouncing
 * Optimized search functionality with performance considerations
 */
export function useProductSearch({
  searchTerm,
  debounceMs = 300,
  autoFetch = true
}: UseProductSearchOptions): UseProductSearchReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  const searchProducts = useCallback(async (term: string = debouncedTerm) => {
    if (!term.trim()) {
      setProducts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ProductService.searchProducts(term);
      setProducts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedTerm]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch && debouncedTerm) {
      searchProducts();
    }
  }, [searchProducts, autoFetch, debouncedTerm]);

  return {
    products,
    loading,
    error,
    search: searchProducts,
    clearError
  };
}

interface UseProductAnalyticsReturn {
  analytics: ProductAnalyticsData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for fetching product analytics data
 * Business intelligence for product performance tracking
 */
export function useProductAnalytics(): UseProductAnalyticsReturn {
  const [analytics, setAnalytics] = useState<ProductAnalyticsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ProductService.getProductAnalytics();
      setAnalytics(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product analytics');
      setAnalytics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
    clearError
  };
}

interface UseProductMutationReturn {
  createProduct: (productData: Partial<Product>) => Promise<Product>;
  updateProduct: (id: string | number, updateData: Partial<Product>) => Promise<Product>;
  deactivateProduct: (id: string | number) => Promise<Product>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for product mutations (create, update, deactivate)
 * Administrative functions with loading and error states
 */
export function useProductMutation(): UseProductMutationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduct = useCallback(async (productData: Partial<Product>): Promise<Product> => {
    setLoading(true);
    setError(null);

    try {
      const response = await ProductService.createProduct(productData);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id: string | number, updateData: Partial<Product>): Promise<Product> => {
    setLoading(true);
    setError(null);

    try {
      const response = await ProductService.updateProduct(id, updateData);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deactivateProduct = useCallback(async (id: string | number): Promise<Product> => {
    setLoading(true);
    setError(null);

    try {
      const response = await ProductService.deactivateProduct(id);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deactivate product';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createProduct,
    updateProduct,
    deactivateProduct,
    loading,
    error,
    clearError
  };
}
