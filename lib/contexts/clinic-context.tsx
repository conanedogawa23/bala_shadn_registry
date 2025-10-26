'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Clinic, ClinicContextType, ClinicStats } from '@/lib/types/clinic';
import { ClinicApiService, FullClinicData } from '@/lib/api/clinicService';
import { generateLink } from '@/lib/route-utils';

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const useClinic = (): ClinicContextType => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};

interface ClinicProviderProps {
  children: ReactNode;
}

export const ClinicProvider: React.FC<ClinicProviderProps> = ({ children }) => {
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [availableClinics, setAvailableClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastInitializedPath, setLastInitializedPath] = useState<string>('');
  const router = useRouter();
  const pathname = usePathname();

  // Utility functions to work with clinic data
  const clinicToSlug = (clinicDisplayName: string): string => {
    // Find the clinic by displayName and return its API-provided slug (name field)
    const clinic = availableClinics.find(c => c.displayName === clinicDisplayName);
    return clinic ? clinic.name : clinicDisplayName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const slugToClinic = (slug: string): Clinic | undefined => {
    // Use the slug provided by the API (clinic.name is already the proper slug)
    return availableClinics.find(clinic => clinic.name === slug);
  };

  const getActiveClinic = (): Clinic | undefined => {
    return availableClinics.find(clinic => clinic.status === 'active') || availableClinics[0];
  };

  const getClinicByName = (name: string): Clinic | undefined => {
    return availableClinics.find(clinic => 
      clinic.name === name || 
      clinic.displayName === name
    );
  };

  const getClinicById = (id: number): Clinic | undefined => {
    return availableClinics.find(clinic => clinic.id === id);
  };

  // Fetch clinics from API
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await ClinicApiService.getFullClinics();
        
        // DEBUG: Log raw API response
        console.log('=== CLINIC API DEBUG ===');
        console.log('📡 Raw API Response:', response);
        console.log('Total clinics from API:', response.clinics?.length);
        
        // Log each clinic's location data
        response.clinics?.forEach((clinic: FullClinicData, index: number) => {
          console.log(`Clinic ${index + 1} (${clinic.displayName}):`, {
            id: clinic.id,
            name: clinic.name,
            displayName: clinic.displayName,
            city: clinic.city,
            province: clinic.province,
            address: clinic.address,
            postalCode: clinic.postalCode,
            status: clinic.status
          });
        });
        
        const clinicsData: Clinic[] = response.clinics.map((clinic: FullClinicData) => {
          // Ensure name is properly set - use API name or derive from displayName
          const clinicName = clinic.name || clinic.displayName.toLowerCase().replace(/\s+/g, '');
          
          return {
            id: clinic.id,
            name: clinicName,
            displayName: clinic.displayName,
            backendName: clinic.backendName,
            address: clinic.address,
            city: clinic.city,
            province: clinic.province,
            postalCode: clinic.postalCode,
            status: clinic.status,
            lastActivity: clinic.lastActivity,
            totalAppointments: clinic.totalAppointments,
            clientCount: clinic.clientCount,
            description: clinic.description
          };
        });
        
        // DEBUG: Log transformed data
        console.log('✅ Transformed clinics data:', clinicsData);
        console.log('📋 Clinic names available:', clinicsData.map(c => ({ name: c.name, displayName: c.displayName })));
        
        setAvailableClinics(clinicsData);
      } catch (err) {
        console.error('Failed to fetch clinics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load clinics');
        // Set empty array as fallback
        setAvailableClinics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  // Initialize clinic from URL or default to active clinic
  useEffect(() => {
    // Wait for clinics to be loaded before initializing
    if (loading || availableClinics.length === 0) {
      console.log('⏳ Waiting for clinics to load...', { loading, availableClinicsCount: availableClinics.length });
      return;
    }

    // Prevent multiple initializations for the same pathname
    if (lastInitializedPath === pathname) {
      console.log('🚫 Already initialized for this pathname:', pathname);
      return;
    }

    const pathSegments = pathname.split('/');
    
    // Check if URL has clinic parameter (e.g., /clinic/bodyblissphysio/dashboard)
    if (pathSegments[1] === 'clinic' && pathSegments[2]) {
      const clinicSlug = pathSegments[2];
      const clinic = slugToClinic(clinicSlug);
      
      console.log('🔍 Clinic lookup debug:', {
        clinicSlug,
        foundClinic: !!clinic,
        clinicDisplayName: clinic?.displayName,
        availableClinicsCount: availableClinics.length,
        availableClinicNames: availableClinics.map(c => c.name)
      });
      
      if (clinic) {
        setSelectedClinic(clinic);
        setLastInitializedPath(pathname);
      } else {
        // Don't redirect immediately - log the issue instead
        console.warn('⚠️ Clinic not found:', clinicSlug, 'Available:', availableClinics.map(c => c.name));
        
        // TEMPORARILY DISABLE REDIRECT - Let pages handle "Clinic Not Found" 
        console.log('❌ Clinic not found but NOT redirecting - letting page handle the error');
        
        // TODO: Re-enable redirect logic after debugging
        // if (availableClinics.length > 0) {
        //   const activeClinic = getActiveClinic();
        //   if (activeClinic) {
        //     console.log('🔄 Redirecting to active clinic:', activeClinic.displayName, '→', activeClinic.name);
        //     const activeSlug = activeClinic.name;
        //     router.replace(`/clinic/${activeSlug}${pathSegments.slice(3).join('/')}`);
        //     setSelectedClinic(activeClinic);
        //     setLastInitializedPath(pathname);
        //   }
        // }
      }
    } else {
      // No clinic in URL, set default active clinic
      const activeClinic = getActiveClinic();
      if (activeClinic) {
        setSelectedClinic(activeClinic);
        setLastInitializedPath(pathname);
      }
    }
  }, [pathname, router, loading, availableClinics, lastInitializedPath]);

  const handleSetSelectedClinic = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    
    // Update URL with new clinic
    const clinicSlug = clinicToSlug(clinic.displayName);
    const pathSegments = pathname.split('/');
    
    if (pathSegments[1] === 'clinic') {
      // Replace clinic in existing clinic URL
      const remainingPath = pathSegments.slice(3).join('/');
      router.push(generateLink('clinic', remainingPath, clinicSlug));
    } else {
      // Redirect to clinic-specific homepage
      router.push(generateLink('clinic', '', clinicSlug));
    }
  };

  const switchClinic = (clinicId: number) => {
    const clinic = getClinicById(clinicId);
    if (clinic) {
      handleSetSelectedClinic(clinic);
    }
  };

  const isClinicActive = (clinicName: string): boolean => {
    const clinic = getClinicByName(clinicName);
    return clinic?.status === 'active';
  };

  const getClinicStats = (clinicName: string): ClinicStats | null => {
    const clinic = getClinicByName(clinicName);
    if (!clinic) return null;

    return {
      totalClients: clinic.clientCount || 0,
      totalAppointments: clinic.totalAppointments || 0,
      recentAppointments: clinic.status === 'active' ? 12 : 0, // Based on our DB analysis
      lastActivity: clinic.lastActivity,
      firstActivity: clinic.status === 'active' ? '2010-04-01' : undefined
    };
  };

  const contextValue: ClinicContextType = {
    selectedClinic,
    availableClinics,
    setSelectedClinic: handleSetSelectedClinic,
    isClinicActive,
    getClinicStats,
    switchClinic,
    loading,
    error
  };

  return (
    <ClinicContext.Provider value={contextValue}>
      {children}
    </ClinicContext.Provider>
  );
}; 