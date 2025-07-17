/**
 * Route utility functions for consistent link generation and route handling
 */
import { slugToClinic } from '@/lib/data/clinics';
import { Clinic } from '@/lib/types/clinic';

/**
 * Route types
 */
export type RouteType = 'global' | 'clinic';

/**
 * Route parameter types
 */
export interface RouteParams {
  clinic?: string;
  id?: string;
  [key: string]: string | string[] | undefined;
}

/**
 * Default clinic slug used for redirects when no clinic is specified
 */
export const DEFAULT_CLINIC = 'bodybliss-physio';

/**
 * Global routes that should not be redirected to clinic-specific routes
 */
export const GLOBAL_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/contact',
  '/activity',
  '/notifications',
  '/profile',
  '/clinics'
];

/**
 * Clinic-specific routes that should be redirected if accessed directly
 */
export const CLINIC_ROUTES = [
  '/clients',
  '/orders',
  '/payments',
  '/reports'
];

/**
 * Generate a consistent link based on route type
 * 
 * @param type - The type of route ('global' or 'clinic')
 * @param path - The path to generate a link for (should not start with a slash if clinic-specific)
 * @param clinicSlug - The clinic slug (required for clinic-specific routes)
 * @returns The generated link
 */
export function generateLink(type: RouteType, path: string, clinicSlug?: string): string {
  // Remove leading slash if present for consistency
  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
  
  if (type === 'global') {
    return `/${normalizedPath}`;
  } else {
    // For clinic routes, ensure we have a clinic slug
    if (!clinicSlug) {
      clinicSlug = DEFAULT_CLINIC;
    }
    return `/clinic/${clinicSlug}/${normalizedPath}`;
  }
}

/**
 * Check if a route is a global route
 * 
 * @param path - The path to check
 * @returns True if the path is a global route
 */
export function isGlobalRoute(path: string): boolean {
  return GLOBAL_ROUTES.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
}

/**
 * Check if a route is a clinic route that should be redirected
 * 
 * @param path - The path to check
 * @returns True if the path is a clinic route that should be redirected
 */
export function isClinicRoute(path: string): boolean {
  return CLINIC_ROUTES.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
}

/**
 * Get the clinic-specific version of a path
 * 
 * @param path - The path to convert
 * @param clinicSlug - The clinic slug
 * @returns The clinic-specific version of the path
 */
export function getClinicPath(path: string, clinicSlug: string = DEFAULT_CLINIC): string {
  return `/clinic/${clinicSlug}${path}`;
}

/**
 * Extract the clinic parameter from route params
 * 
 * @param params - The route parameters
 * @returns The clinic slug or null if not found
 */
export function getClinicParam(params: RouteParams): string | null {
  if (!params.clinic) {
    return null;
  }
  
  return Array.isArray(params.clinic) ? params.clinic[0] : params.clinic;
}

/**
 * Validate a clinic parameter
 * 
 * @param clinicSlug - The clinic slug to validate
 * @returns True if the clinic slug is valid
 */
export function validateClinicParam(clinicSlug: string | null | undefined): boolean {
  if (!clinicSlug) {
    return false;
  }
  
  const clinic = slugToClinic(clinicSlug);
  return !!clinic;
}

/**
 * Error types for route parameter validation
 */
export enum RouteErrorType {
  INVALID_CLINIC = 'invalid_clinic',
  INVALID_ID = 'invalid_id',
  MISSING_PARAM = 'missing_param',
  NOT_FOUND = 'not_found',
  UNAUTHORIZED = 'unauthorized'
}

/**
 * Route error class for handling routing errors
 */
export class RouteError extends Error {
  type: RouteErrorType;
  redirectPath?: string;
  
  constructor(message: string, type: RouteErrorType, redirectPath?: string) {
    super(message);
    this.name = 'RouteError';
    this.type = type;
    this.redirectPath = redirectPath;
  }
}

/**
 * Validate clinic parameter and throw a RouteError if invalid
 * 
 * @param clinicSlug - The clinic slug to validate
 * @throws RouteError if the clinic slug is invalid
 */
export function validateClinicOrThrow(clinicSlug: string | null | undefined): void {
  if (!clinicSlug) {
    throw new RouteError(
      'Missing clinic parameter', 
      RouteErrorType.MISSING_PARAM, 
      `/${DEFAULT_CLINIC}`
    );
  }
  
  const clinic = slugToClinic(clinicSlug);
  if (!clinic) {
    throw new RouteError(
      `Invalid clinic: ${clinicSlug}`, 
      RouteErrorType.INVALID_CLINIC, 
      `/${DEFAULT_CLINIC}`
    );
  }
}

/**
 * Get a clinic object from a clinic slug
 * 
 * @param clinicSlug - The clinic slug
 * @returns The clinic object or null if not found
 */
export function getClinicFromParam(clinicSlug: string | null | undefined): Clinic | null {
  if (!clinicSlug) {
    return null;
  }
  
  return slugToClinic(clinicSlug) || null;
}

/**
 * Extract and validate an ID parameter
 * 
 * @param params - The route parameters
 * @param paramName - The name of the ID parameter (default: 'id')
 * @returns The ID as a string, or null if invalid
 */
export function getIdParam(params: RouteParams, paramName: string = 'id'): string | null {
  const idParam = params[paramName];
  
  if (!idParam) {
    return null;
  }
  
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  
  // Basic validation - ensure it's not empty
  if (!id || id.trim() === '') {
    return null;
  }
  
  return id;
}

/**
 * Create a breadcrumb trail for a clinic route
 * 
 * @param clinicSlug - The clinic slug
 * @param path - The current path (without the clinic prefix)
 * @returns An array of breadcrumb items
 */
export interface BreadcrumbItem {
  label: string;
  href: string;
}

export function createBreadcrumbs(clinicSlug: string, path: string): BreadcrumbItem[] {
  const clinic = slugToClinic(clinicSlug);
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Home',
      href: '/'
    },
    {
      label: clinic?.displayName || 'Clinic',
      href: `/clinic/${clinicSlug}`
    }
  ];
  
  // Split the path and build breadcrumbs
  const pathParts = path.split('/').filter(Boolean);
  let currentPath = '';
  
  for (let i = 0; i < pathParts.length; i++) {
    currentPath += `/${pathParts[i]}`;
    
    // Skip adding breadcrumb for dynamic segments like [id]
    if (pathParts[i].startsWith('[') && pathParts[i].endsWith(']')) {
      continue;
    }
    
    breadcrumbs.push({
      label: pathParts[i].charAt(0).toUpperCase() + pathParts[i].slice(1),
      href: `/clinic/${clinicSlug}${currentPath}`
    });
  }
  
  return breadcrumbs;
}