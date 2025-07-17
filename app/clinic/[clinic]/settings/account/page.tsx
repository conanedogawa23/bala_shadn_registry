import { redirect } from 'next/navigation';
import { generateLink } from '@/lib/route-utils';

export default function ClinicAccountPage() {
  // Redirect to the global account settings page
  redirect(generateLink('global', 'settings/account'));
} 