'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateLink } from '@/lib/route-utils';
import { Building2, AlertTriangle } from 'lucide-react';

interface InvalidClinicErrorProps {
  clinicSlug?: string;
  message?: string;
}

export default function InvalidClinicError({ 
  clinicSlug, 
  message = 'The clinic you are trying to access does not exist or you do not have permission to view it.' 
}: InvalidClinicErrorProps) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-2xl mx-auto border-red-200">
        <CardHeader className="bg-red-50 text-red-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle>Invalid Clinic</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center mb-6">
            <Building2 className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Clinic Not Found</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            {clinicSlug && (
              <div className="bg-gray-100 px-3 py-1 rounded-md text-gray-700 font-mono text-sm mb-6">
                {clinicSlug}
              </div>
            )}
            <p className="text-sm text-gray-500 mb-6">
              Please select a valid clinic from the available options.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleGoHome}>
                Back to Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}