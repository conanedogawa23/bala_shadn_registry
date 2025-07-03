import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { slugToClinic, clinicToSlug } from '@/lib/data/clinics';

interface ClinicLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    clinic: string;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clinic: string }>;
}): Promise<Metadata> {
  const { clinic: clinicSlug } = await params;
  const clinic = slugToClinic(clinicSlug);

  if (!clinic) {
    return {
      title: 'Clinic Not Found',
    };
  }

  return {
    title: `${clinic.displayName} - Healthcare Management`,
    description: clinic.description || `Manage ${clinic.displayName} operations, appointments, and client data.`,
    openGraph: {
      title: `${clinic.displayName} - Healthcare Management`,
      description: clinic.description,
      type: 'website',
    },
  };
}

export default async function ClinicLayout({ children, params }: ClinicLayoutProps) {
  const { clinic: clinicSlug } = await params;
  const clinic = slugToClinic(clinicSlug);

  // If clinic doesn't exist, redirect to 404
  if (!clinic) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Clinic-specific header/breadcrumb could go here */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

// Generate static params for all available clinics
export async function generateStaticParams() {
  const { realClinicsData } = await import('@/lib/data/clinics');
  
  return realClinicsData.map((clinic) => ({
    clinic: clinicToSlug(clinic.displayName),
  }));
} 