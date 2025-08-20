'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Clinic, ClinicContextType, ClinicStats } from '@/lib/types/clinic';
import { 
  realClinicsData, 
  getActiveClinic, 
  getClinicByName, 
  getClinicById,
  clinicToSlug,
  slugToClinic 
} from '@/lib/data/clinics';
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
  const [availableClinics] = useState<Clinic[]>(realClinicsData);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize clinic from URL or default to active clinic
  useEffect(() => {
    const pathSegments = pathname.split('/');
    
    // Check if URL has clinic parameter (e.g., /clinic/bodybliss-physio/dashboard)
    if (pathSegments[1] === 'clinic' && pathSegments[2]) {
      const clinicSlug = pathSegments[2];
      const clinic = slugToClinic(clinicSlug);
      
      if (clinic) {
        setSelectedClinic(clinic);
      } else {
        // Invalid clinic slug, redirect to active clinic
        const activeClinic = getActiveClinic();
        const activeSlug = clinicToSlug(activeClinic.displayName);
        router.replace(`/clinic/${activeSlug}${pathSegments.slice(3).join('/')}`);
        setSelectedClinic(activeClinic);
      }
    } else {
      // No clinic in URL, set default active clinic
      const activeClinic = getActiveClinic();
      setSelectedClinic(activeClinic);
    }
  }, [pathname, router]);

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
    switchClinic
  };

  return (
    <ClinicContext.Provider value={contextValue}>
      {children}
    </ClinicContext.Provider>
  );
}; 