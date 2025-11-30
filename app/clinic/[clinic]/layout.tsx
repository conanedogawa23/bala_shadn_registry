'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useClinic } from '@/lib/contexts/clinic-context';
import { ErrorBoundary } from '@/components/error-boundary';
import { isAuthenticated } from '@/lib/auth';

interface ClinicLayoutProps {
  children: React.ReactNode;
}

export default function ClinicLayout({ children }: ClinicLayoutProps) {
  const params = useParams();
  const router = useRouter();
  const { availableClinics, loading: clinicLoading } = useClinic();
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [_clinicInfo, setClinicInfo] = useState<{
    slug: string;
    name: string;
    backendName: string;
    isActive: boolean;
  } | null>(null);

  // Decode URL-encoded clinic slug (e.g., 'My%20Cloud' -> 'My Cloud')
  const clinicSlug = decodeURIComponent(params.clinic as string);

  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  // Check authentication first - redirect to login if not authenticated
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authenticated = isAuthenticated();
      setIsUserAuthenticated(authenticated);
      setIsAuthChecking(false);
      
      if (!authenticated) {
        const currentPath = window.location.pathname;
        router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
      }
    }
  }, [router]);

  useEffect(() => {
    const validateClinic = async () => {
      if (!clinicSlug) {
        setValidationError('Clinic parameter is required');
        setIsValidating(false);
        return;
      }

      console.log('🔍 Validating clinic slug:', clinicSlug);
      console.log('📋 Available clinics:', availableClinics.map(c => ({ name: c.name, displayName: c.displayName, backendName: c.backendName })));

      // Check with context data (case-insensitive matching)
      // All clinic data comes from MongoDB via API
      // Need to normalize both sides for comparison (remove spaces, lowercase)
      const normalizedSlug = clinicSlug.toLowerCase().replace(/\s+/g, '');
      const matchedClinic = availableClinics.find(c => 
        c.name.toLowerCase() === clinicSlug.toLowerCase() ||
        c.name.toLowerCase().replace(/\s+/g, '') === normalizedSlug ||
        c.displayName.toLowerCase().replace(/\s+/g, '') === normalizedSlug ||
        c.backendName?.toLowerCase() === clinicSlug.toLowerCase() ||
        c.backendName?.toLowerCase().replace(/\s+/g, '') === normalizedSlug
      );

      if (matchedClinic) {
        console.log('✅ Found clinic in context:', matchedClinic);
        setClinicInfo({
          slug: clinicSlug,
          name: matchedClinic.displayName,
          backendName: matchedClinic.backendName || matchedClinic.displayName,
          isActive: matchedClinic.status === 'active'
        });
        setValidationError(null);
        setIsValidating(false);
        return;
      }

      // Clinic not found in available clinics
      console.error('❌ Clinic not found:', clinicSlug);
      setValidationError(
        `Clinic "${clinicSlug}" not found. Please select from available clinics.`
      );
      setIsValidating(false);
    };

    // Wait for clinic context to load before validating
    if (!clinicLoading && availableClinics.length > 0) {
      validateClinic();
    } else if (!clinicLoading && availableClinics.length === 0) {
      setValidationError('No clinics available in the system');
      setIsValidating(false);
    }
  }, [clinicSlug, availableClinics, clinicLoading]);

  // Auth checking state - show nothing while checking
  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show redirecting message
  if (!isUserAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Loading state - validating clinic
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Validating clinic access...</p>
        </div>
      </div>
    );
  }

  // Error state with available clinic suggestions
  if (validationError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-red-600">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Clinic Access Restricted</h2>
            <p className="text-gray-600 mb-4">{validationError}</p>
          </div>

          {/* Show available clinics */}
          {availableClinics.length > 0 && (
            <div className="text-left bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Available clinics:</p>
              <div className="space-y-1">
                {availableClinics.map((clinic) => (
                  <button
                    key={clinic.id}
                    onClick={() => router.push(`/clinic/${clinic.name}/clients`)}
                    className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    {clinic.displayName}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button 
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Go to Home
            </button>
            
            <button 
              onClick={() => router.back()}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - render children with clinic context wrapped in error boundary
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Clinic layout error:', error);
        console.error('Error info:', errorInfo);
      }}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Main content */}
        <main className="max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </ErrorBoundary>
  );
}
