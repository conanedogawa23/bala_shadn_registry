'use client';

import React from 'react';
import { Check, ChevronDown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useClinic } from '@/lib/contexts/clinic-context';
import { Clinic } from '@/lib/types/clinic';

const getStatusColor = (status: Clinic['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'historical':
      return 'bg-orange-100 text-orange-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'no-data':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: Clinic['status']) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'historical':
      return 'Historical';
    case 'inactive':
      return 'Inactive';
    case 'no-data':
      return 'Setup';
    default:
      return 'Unknown';
  }
};

interface ClinicSelectorProps {
  className?: string;
}

export const ClinicSelector: React.FC<ClinicSelectorProps> = ({ className }) => {
  const { selectedClinic, availableClinics, setSelectedClinic } = useClinic();

  const handleClinicSelect = (clinic: Clinic) => {
    setSelectedClinic(clinic);
  };

  // Group clinics by status
  const activeClinic = availableClinics.filter(c => c.status === 'active');
  const historicalClinics = availableClinics.filter(c => c.status === 'historical');
  const inactiveClinics = availableClinics.filter(c => c.status === 'inactive');
  const setupClinics = availableClinics.filter(c => c.status === 'no-data');

  if (!selectedClinic) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  const ClinicMenuItem: React.FC<{ clinic: Clinic }> = ({ clinic }) => (
    <DropdownMenuItem
      onClick={() => handleClinicSelect(clinic)}
      className="flex items-center justify-between p-2"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Check
          className={cn(
            "h-4 w-4 flex-shrink-0",
            selectedClinic?.id === clinic.id ? "opacity-100" : "opacity-0"
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm truncate">{clinic.displayName}</div>
          <div className="text-xs text-muted-foreground truncate">
            {clinic.city && clinic.province ? `${clinic.city}, ${clinic.province}` : 'Location TBD'}
          </div>
        </div>
      </div>
      <Badge variant="secondary" className={cn("text-xs ml-2 flex-shrink-0", getStatusColor(clinic.status))}>
        {getStatusLabel(clinic.status)}
      </Badge>
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "justify-between text-left font-normal px-3 py-2 h-auto min-w-0",
            className
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm truncate">
                {selectedClinic.displayName}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {selectedClinic.city && selectedClinic.province 
                  ? `${selectedClinic.city}, ${selectedClinic.province}`
                  : 'Location TBD'
                }
              </div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="start">
        {/* Active Clinic */}
        {activeClinic.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs font-medium text-green-700">Active Clinic</DropdownMenuLabel>
            <DropdownMenuGroup>
              {activeClinic.map((clinic) => (
                <ClinicMenuItem key={clinic.id} clinic={clinic} />
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Historical Clinics */}
        {historicalClinics.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs font-medium text-orange-700">Recently Inactive</DropdownMenuLabel>
            <DropdownMenuGroup>
              {historicalClinics.map((clinic) => (
                <ClinicMenuItem key={clinic.id} clinic={clinic} />
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Inactive Clinics */}
        {inactiveClinics.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs font-medium text-gray-600">Inactive Clinics</DropdownMenuLabel>
            <DropdownMenuGroup>
              {inactiveClinics.map((clinic) => (
                <ClinicMenuItem key={clinic.id} clinic={clinic} />
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Setup/No Data Clinics */}
        {setupClinics.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs font-medium text-blue-700">In Development</DropdownMenuLabel>
            <DropdownMenuGroup>
              {setupClinics.map((clinic) => (
                <ClinicMenuItem key={clinic.id} clinic={clinic} />
              ))}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 