// Clinic types based on real database analysis

export interface Clinic {
  id: number;
  name: string;
  displayName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  status: 'active' | 'inactive' | 'historical' | 'no-data';
  lastActivity?: string;
  totalAppointments?: number;
  clientCount?: number;
  description?: string;
}

export interface ClinicStats {
  totalClients: number;
  totalAppointments: number;
  recentAppointments: number;
  lastActivity?: string;
  firstActivity?: string;
}

export interface ClinicContextType {
  selectedClinic: Clinic | null;
  availableClinics: Clinic[];
  setSelectedClinic: (clinic: Clinic) => void;
  isClinicActive: (clinicName: string) => boolean;
  getClinicStats: (clinicName: string) => ClinicStats | null;
  switchClinic: (clinicId: number) => void;
}

export interface ClinicRouteParams {
  clinic: string;
  [key: string]: string | string[] | undefined;
} 