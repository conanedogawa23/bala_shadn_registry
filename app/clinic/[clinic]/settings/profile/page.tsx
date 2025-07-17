import { redirect } from 'next/navigation';
import { generateLink } from '@/lib/route-utils';

export default function ClinicProfilePage() {
  // Redirect to the global profile settings page
  redirect(generateLink('global', 'settings/profile'));
} 