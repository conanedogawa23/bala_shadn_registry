// Real clinic data based on MongoDB database
import { Clinic } from '@/lib/types/clinic';

export const realClinicsData: Clinic[] = [
  // Active Retained Clinics (from MongoDB isRetainedClinic: true)
  {
    id: 9,
    name: 'bodyblissphysio',
    displayName: 'BodyBliss Physiotherapy',
    address: '1929 Leslie Street',
    city: 'Toronto',
    province: 'Ontario',
    postalCode: 'M3B 2M3',
    status: 'active',
    lastActivity: '2025-06-28',
    totalAppointments: 66528,
    clientCount: 4586,
    description: 'Primary active physiotherapy clinic providing comprehensive rehabilitation services'
  },
  
  {
    id: 20,
    name: 'My Cloud',
    displayName: 'Active Force Health Care Inc.',
    address: '203-3459 Sheppard Ave .East',
    city: 'Toronto',
    province: 'Ontario',
    postalCode: 'M1T 3K5',
    status: 'active',
    lastActivity: '2023-10-28',
    totalAppointments: 1425,
    clientCount: 547,
    description: 'Cloud-based healthcare services (active retained clinic)'
  },
  
  {
    id: 14,
    name: 'Physio Bliss',
    displayName: 'Physio Bliss',
    address: '6033 Shawson Dr',
    city: 'Mississauga',
    province: 'Ontario',
    postalCode: 'L5T 1H8',
    status: 'active',
    lastActivity: '2018-11-14',
    totalAppointments: 2436,
    clientCount: 1433,
    description: 'Physiotherapy and wellness services (active retained clinic)'
  },
  
  {
    id: 21,
    name: 'Century Care',
    displayName: 'Century Care',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    status: 'active',
    lastActivity: '',
    totalAppointments: 0,
    clientCount: 614,
    description: 'Healthcare services (active retained clinic, location details pending)'
  },
  
  {
    id: 6,
    name: 'Ortholine Duncan Mills',
    displayName: 'Ortholine Duncan Mills',
    address: '220 Duncan Mill',
    city: 'Toronto',
    province: 'Ontario',
    postalCode: 'M3B 2M3',
    status: 'active',
    lastActivity: '2023-02-07',
    totalAppointments: 14294,
    clientCount: 11514,
    description: 'Orthopedic services (active retained clinic with highest client volume)'
  },
  
  {
    id: 18,
    name: 'BodyBlissOneCare',
    displayName: 'BodyBlissOneCare',
    address: '1585 Markham Rd',
    city: 'Scarborough',
    province: 'Ontario',
    postalCode: 'M1M 1M1',
    status: 'active',
    lastActivity: '2023-10-24',
    totalAppointments: 10170,
    clientCount: 1180,
    description: 'Integrated care services (active retained clinic)'
  },
  
  // Non-retained clinics
  {
    id: 4,
    name: 'BodyBliss',
    displayName: 'BodyBliss',
    address: '1933A Leslie Street',
    city: 'Toronto',
    province: 'Ontario',
    postalCode: 'M3B 2M3',
    status: 'active',
    lastActivity: '2025-06-28',
    totalAppointments: 35000,
    clientCount: 2500,
    description: 'BodyBliss wellness and rehabilitation center'
  },
  
  {
    id: 3,
    name: 'Bioform Health',
    displayName: 'Bioform Health',
    address: '6033 Shawson Dr',
    city: 'Mississauga',
    province: 'Ontario',
    postalCode: 'L5T 1H8',
    status: 'historical',
    lastActivity: '2018-04-19',
    totalAppointments: 17808,
    clientCount: 7254,
    description: 'Biomechanical health assessment and treatment (inactive since 2018)'
  },
  
  {
    id: 5,
    name: 'Evergold',
    displayName: 'Evergold',
    address: '3833 Midland Ave.',
    city: 'Toronto',
    province: 'Ontario',
    postalCode: 'M1V 5L6',
    status: 'historical',
    lastActivity: '',
    totalAppointments: 0,
    clientCount: 0,
    description: 'Wellness services'
  },
  
  {
    id: 11,
    name: 'ExtremePhysio',
    displayName: 'ExtremePhysio',
    address: '3660 Midland Ave., Unit 102',
    city: 'Scarborough',
    province: 'Ontario',
    postalCode: 'M1V 0B8',
    status: 'historical',
    lastActivity: '2019-11-23',
    totalAppointments: 1774,
    clientCount: 1512,
    description: 'Specialized physiotherapy (inactive since 2019)'
  },
  
  {
    id: 2,
    name: 'Markham Orthopedic',
    displayName: 'Markham Orthopedic',
    address: '7155 Woodbine Avenue',
    city: 'Markham',
    province: 'Ontario',
    postalCode: 'L3R 1A3',
    status: 'historical',
    lastActivity: '2019-12-27',
    totalAppointments: 3294,
    clientCount: 3149,
    description: 'Orthopedic specialist clinic (inactive since 2019)'
  },
  
  {
    id: 1,
    name: 'Orthopedic Orthotic Appliances',
    displayName: 'Orthopedic Orthotic Appliances',
    address: '3833 Midland Ave.',
    city: 'Toronto',
    province: 'Ontario',
    postalCode: 'M1V 5L6',
    status: 'historical',
    lastActivity: '2017-12-28',
    totalAppointments: 4242,
    clientCount: 2860,
    description: 'Custom orthotic devices and appliances (inactive since 2017)'
  },
  
  {
    id: 19,
    name: 'Active force eh',
    displayName: 'Active Force Health Care Inc.',
    address: '4040 Finch Ave East Unit 209',
    city: 'Scarborough',
    province: 'Ontario',
    postalCode: 'M1S4V5',
    status: 'historical',
    lastActivity: '',
    totalAppointments: 0,
    clientCount: 0,
    description: 'Active lifestyle services'
  }
];

// Get the clinic name for data lookups (matches MongoDB exactly)
export const getRealDataClinicName = (clinic: Clinic): string => {
  return clinic.name;
};

// Available clinic types for service generation
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

// Get primary active clinic (first active clinic in list)
export const getActiveClinic = (): Clinic => {
  return realClinicsData.find(clinic => clinic.status === 'active') || realClinicsData[0];
};

// Get all active clinics
export const getActiveClinics = (): Clinic[] => {
  return realClinicsData.filter(clinic => clinic.status === 'active');
};

// Get clinics by status
export const getClinicsByStatus = (status: Clinic['status']): Clinic[] => {
  return realClinicsData.filter(clinic => clinic.status === status);
};

// Clinic data lookup functions
export const getClinicByName = (name: string): Clinic | undefined => {
  return realClinicsData.find(clinic => 
    clinic.name === name || 
    clinic.displayName === name
  );
};

// Get clinic by ID
export const getClinicById = (id: number): Clinic | undefined => {
  return realClinicsData.find(clinic => clinic.id === id);
};

// Return clinic name as-is to match MongoDB exactly (no slug conversion)
export const clinicToSlug = (clinicName: string): string => {
  return clinicName;
};

// Convert URL slug to clinic (must match MongoDB name exactly)
export const slugToClinic = (slug: string): Clinic | undefined => {
  return realClinicsData.find(clinic => clinic.name === slug);
}; 