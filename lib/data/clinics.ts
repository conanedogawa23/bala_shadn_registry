// Real clinic data based on MSSQL database analysis
import { Clinic } from '@/lib/types/clinic';

export const realClinicsData: Clinic[] = [
  // Currently Active Clinic
  {
    id: 9,
    name: 'bodybliss-physio',
    displayName: 'BodyBliss Physio', 
    address: '1929 Leslie Street',
    city: 'Toronto',
    province: 'Ontario',
    postalCode: 'M3B 2M3',
    status: 'active',
    lastActivity: '2025-06-28',
    totalAppointments: 66528,
    clientCount: 4586,
    description: 'Active physiotherapy clinic providing comprehensive rehabilitation services'
  },
  
  // Recently Inactive Clinics (Historical)
  {
    id: 20,
    name: 'My Cloud',
    displayName: 'My Cloud',
    address: '203-3459 Sheppard Ave East',
    city: 'Toronto',
    province: 'Ontario',
    postalCode: 'M1T 3K5',
    status: 'historical',
    lastActivity: '2023-10-28',
    totalAppointments: 1425,
    clientCount: 547,
    description: 'Cloud-based healthcare services (recently inactive)'
  },
  
  {
    id: 18,
    name: 'BodyBlissOneCare',
    displayName: 'BodyBliss OneCare',
    address: '1585 Markham Rd',
    city: 'Scarborough',
    province: 'Ontario',
    postalCode: 'M1M 1M1',
    status: 'historical',
    lastActivity: '2023-10-24',
    totalAppointments: 10170,
    clientCount: 1180,
    description: 'Integrated care services (recently inactive)'
  },
  
  {
    id: 6,
    name: 'Ortholine Duncan Mills',
    displayName: 'Ortholine Duncan Mills',
    address: '220 Duncan Mill',
    city: 'Toronto',
    province: 'Ontario',
    postalCode: 'M3B 2M3',
    status: 'historical',
    lastActivity: '2023-02-07',
    totalAppointments: 14294,
    clientCount: 11514,
    description: 'Orthopedic services (highest client volume, inactive since 2023)'
  },
  
  {
    id: 2,
    name: 'Markham Orthopedic',
    displayName: 'Markham Orthopedic',
    address: '7155 Woodbine Avenue',
    city: 'Markham',
    province: 'Ontario',
    postalCode: 'L3R 1A3',
    status: 'inactive',
    lastActivity: '2019-12-27',
    totalAppointments: 3294,
    clientCount: 3149,
    description: 'Orthopedic specialist clinic (inactive since 2019)'
  },
  
  {
    id: 11,
    name: 'ExtremePhysio',
    displayName: 'Extreme Physio',
    address: '3660 Midland Ave., Unit 102',
    city: 'Scarborough',
    province: 'Ontario',
    postalCode: 'M1V 0B8',
    status: 'inactive',
    lastActivity: '2019-11-23',
    totalAppointments: 1774,
    clientCount: 1512,
    description: 'Specialized physiotherapy (inactive since 2019)'
  },
  
  {
    id: 14,
    name: 'Physio Bliss',
    displayName: 'Physio Bliss',
    address: '220 Duncan Mills Rd, Suite 100',
    city: 'Toronto',
    province: 'Ontario',
    postalCode: 'M3B 2M3',
    status: 'inactive',
    lastActivity: '2018-11-14',
    totalAppointments: 2436,
    clientCount: 1433,
    description: 'Physiotherapy and wellness services (inactive since 2018)'
  },
  
  {
    id: 3,
    name: 'Bioform Health',
    displayName: 'Bioform Health',
    address: '6033 Shawson Dr',
    city: 'Mississauga',
    province: 'Ontario',
    postalCode: 'L5T 1H8',
    status: 'inactive',
    lastActivity: '2018-04-19',
    totalAppointments: 17808,
    clientCount: 7254,
    description: 'Biomechanical health assessment and treatment (inactive since 2018)'
  },
  
  {
    id: 1,
    name: 'Orthopedic Orthotic Appliances',
    displayName: 'Orthopedic Orthotic Appliances',
    address: '3833 Midland Ave.',
    city: 'Toronto',
    province: 'Ontario',
    postalCode: 'M1V 5L6',
    status: 'inactive',
    lastActivity: '2017-12-28',
    totalAppointments: 4242,
    clientCount: 2860,
    description: 'Custom orthotic devices and appliances (inactive since 2017)'
  },
  
  // No-Data Clinics (Setup/Development)
  {
    id: 4,
    name: 'BodyBliss',
    displayName: 'BodyBliss',
    address: '1933A Leslie Street',
    city: 'Toronto',
    province: 'Ontario',
    postalCode: 'M3B 2M3',
    status: 'no-data',
    totalAppointments: 0,
    clientCount: 0,
    description: 'Main BodyBliss location (setup in progress)'
  },
  
  {
    id: 5,
    name: 'Evergold',
    displayName: 'Evergold',
    address: '3833 Midland Ave.',
    city: 'Toronto',
    province: 'Ontario',
    postalCode: 'M1V 5L6',
    status: 'no-data',
    totalAppointments: 0,
    clientCount: 0,
    description: 'Wellness services (in development)'
  },
  
  {
    id: 19,
    name: 'Active force eh',
    displayName: 'Active Force',
    address: '4040 Finch Ave East Unit 209',
    city: 'Scarborough',
    province: 'Ontario',
    postalCode: 'M1S4V5',
    status: 'no-data',
    totalAppointments: 0,
    clientCount: 0,
    description: 'Active lifestyle services (in development)'
  },
  
  {
    id: 21,
    name: 'Century Care',
    displayName: 'Century Care',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    status: 'no-data',
    totalAppointments: 0,
    clientCount: 614,
    description: 'Healthcare services (location details pending)'
  }
];

// Comprehensive clinic name mapping for data resolution
// Maps clinic names from clinics.ts to corresponding names in realData.json
export const clinicNameMapping: Record<string, string> = {
  // Direct matches (clinic name → realData.json clientCounts key)
  'My Cloud': 'My Cloud',
  'BodyBlissOneCare': 'BodyBlissOneCare', 
  'Ortholine Duncan Mills': 'Ortholine Duncan Mills',
  'Markham Orthopedic': 'Markham Orthopedic',
  'ExtremePhysio': 'ExtremePhysio',
  'Physio Bliss': 'Physio Bliss',
  'Bioform Health': 'Bioform Health',
  'Orthopedic Orthotic Appliances': 'Orthopedic Orthotic Appliances',
  'Century Care': 'Century Care',
  'Active force eh': 'Active force eh',
  'Evergold': 'Evergold',
  
  // Special cases that need mapping
  'bodybliss-physio': 'BodyBlissPhysio', // Use the larger dataset (4586 vs 120)
  'BodyBliss': 'BodyBliss',
  
  // Display name mappings (for when displayName is used)
  'BodyBliss Physio': 'BodyBlissPhysio',
  'BodyBliss OneCare': 'BodyBlissOneCare',
  'Extreme Physio': 'ExtremePhysio',
  'Active Force': 'Active force eh'
};

// Get the realData.json clinic name for data lookups
export const getRealDataClinicName = (clinic: Clinic): string => {
  // Try clinic name first, then displayName, then fallback to clinic name
  return clinicNameMapping[clinic.name] || 
         clinicNameMapping[clinic.displayName] || 
         clinic.name;
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

// Get active clinic (currently BodyBlissPhysio)
export const getActiveClinic = (): Clinic => {
  return realClinicsData.find(clinic => clinic.status === 'active') || realClinicsData[0];
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

// Convert clinic name to URL slug
export const clinicToSlug = (clinicName: string): string => {
  return clinicName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

// Convert URL slug to clinic name
export const slugToClinic = (slug: string): Clinic | undefined => {
  return realClinicsData.find(clinic => 
    clinicToSlug(clinic.name) === slug || 
    clinicToSlug(clinic.displayName) === slug
  );
}; 