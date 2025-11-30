/**
 * Clinic Data - All clinic data now comes from MongoDB via API
 * This file contains only type re-exports and compatibility stubs
 * 
 * IMPORTANT: Do not add hardcoded clinic data here.
 * Use the clinic-context.tsx to get clinic data from the API.
 */

import { Clinic } from '@/lib/types/clinic';

// Empty array - clinic data comes from API
export const realClinicsData: Clinic[] = [];

/**
 * @deprecated Use clinic context instead - data comes from API
 */
export const getRetainedClinics = (): Clinic[] => [];

/**
 * @deprecated Use clinic context instead - data comes from API
 */
export const getAccessibleClinics = (): Clinic[] => [];

/**
 * @deprecated Use clinic.backendName from API response
 */
export const getRealDataClinicName = (clinic: Clinic): string => {
  return clinic.backendName || clinic.name;
};

/**
 * Get clinic type based on name
 */
export const getClinicType = (clinic: Clinic): 'physiotherapy' | 'orthopedic' | 'wellness' | 'general' => {
  const name = clinic.name.toLowerCase();
  const displayName = clinic.displayName?.toLowerCase() || '';
  
  if (name.includes('physio') || displayName.includes('physio')) {
    return 'physiotherapy';
  } else if (name.includes('orthopedic') || name.includes('orthotic') || displayName.includes('orthopedic')) {
    return 'orthopedic';
  } else if (name.includes('bliss') || name.includes('wellness') || displayName.includes('wellness')) {
    return 'wellness';
  } else {
    return 'general';
  }
};

/**
 * @deprecated Use clinic context instead - data comes from API
 */
export const getActiveClinic = (): Clinic | undefined => undefined;

/**
 * @deprecated Use clinic context instead - data comes from API
 */
export const getActiveClinics = (): Clinic[] => [];

/**
 * @deprecated Use clinic context instead - data comes from API
 */
export const getClinicsByStatus = (_status: Clinic['status']): Clinic[] => [];

/**
 * @deprecated Use clinic context instead - data comes from API
 */
export const getClinicByName = (_name: string): Clinic | undefined => undefined;

/**
 * @deprecated Use clinic context instead - data comes from API
 */
export const getClinicById = (_id: number): Clinic | undefined => undefined;

/**
 * @deprecated No longer needed - use clinic.name directly
 */
export const clinicToSlug = (clinicName: string): string => clinicName;

/**
 * @deprecated Use clinic context instead - data comes from API
 */
export const slugToClinic = (_slug: string): Clinic | undefined => undefined;

/**
 * @deprecated Use clinic context instead - data comes from API
 */
export const findClinicBySlug = (_slug: string): Clinic | undefined => undefined;
