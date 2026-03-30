'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormWrapper } from '@/components/ui/form/FormWrapper';
import { FormInput } from '@/components/ui/form/FormInput';
import { FormSelect } from '@/components/ui/form/FormSelect';
import { FormClientSelect } from '@/components/ui/form/FormClientSelect';
import { FormReferringDoctorSelect } from '@/components/ui/form/FormReferringDoctorSelect';
import { FormResourceSelect } from '@/components/ui/form/FormResourceSelect';
import { AlertTriangle, ArrowLeft, Save, Plus } from 'lucide-react';
import { findClinicBySlug, generateLink, getBackendClinicName } from '@/lib/route-utils';
import { AppointmentApiService } from '@/lib/api/appointmentService';
import { useClinic } from '@/lib/contexts/clinic-context';
import { useClient } from '@/lib/hooks';

const requiredResourceSchema = z.preprocess(
  (value) => {
    if (value === '' || value === undefined || value === null) {
      return undefined;
    }

    return Number(value);
  },
  z.number({
    required_error: 'Resource is required',
    invalid_type_error: 'Resource is required'
  }).int().min(1, { message: 'Resource is required' })
);

// Define the appointment schema using zod for validation
const appointmentSchema = z.object({
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }),
  subject: z.string().min(2, { message: 'Subject must be at least 2 characters' }),
  clientId: z.string().min(1, { message: 'Client ID is required' }),
  resourceId: requiredResourceSchema,
  referringDoctorId: z.string().trim().nullable().optional(),
  duration: z.coerce.number().min(15, { message: 'Duration must be at least 15 minutes' }).default(30),
  type: z.coerce.number().int().min(0).default(0),
  status: z.coerce.number().int().min(0).default(0),
  label: z.coerce.number().int().min(0).default(0),
  location: z.string().optional(),
  description: z.string().optional(),
  reminderInfo: z.string().optional()
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate']
});

// Type definitions
type AppointmentFormValues = z.infer<typeof appointmentSchema>;

type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

type DayAvailability = {
  start: string;
  end: string;
  available: boolean;
};

type WeeklyAvailability = Partial<Record<DayKey, DayAvailability>>;

type SelectedResource = {
  id: number;
  name: string;
  availability?: WeeklyAvailability;
};

const statusOptions = [
  { value: '0', label: 'Scheduled' },
  { value: '1', label: 'Completed' },
  { value: '2', label: 'Cancelled' },
  { value: '3', label: 'No Show' },
  { value: '4', label: 'Rescheduled' }
];

const typeOptions = [
  { value: '0', label: 'Standard' },
  { value: '1', label: 'Consultation' },
  { value: '2', label: 'Follow-up' },
  { value: '3', label: 'Emergency' }
];

const labelOptions = [
  { value: '0', label: 'Default' },
  { value: '1', label: 'Important' },
  { value: '2', label: 'Urgent' },
  { value: '3', label: 'Follow-up' }
];

export default function NewAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const clinicSlug = params.clinic as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prefilledClientId, setPrefilledClientId] = useState('');
  const [prefilledClientName, setPrefilledClientName] = useState('');
  const [selectedResource, setSelectedResource] = useState<SelectedResource | null>(null);

  const { availableClinics } = useClinic();
  const clinicData = findClinicBySlug(availableClinics, clinicSlug);
  const clinicName = getBackendClinicName(clinicData, clinicSlug);

  // Read pre-filled client details from URL params.
  useEffect(() => {
    const clientIdFromUrl = searchParams.get('clientId')?.trim() || '';
    const clientNameFromUrl = searchParams.get('clientName')?.trim() || '';
    setPrefilledClientId(clientIdFromUrl);
    setPrefilledClientName(clientNameFromUrl);
  }, [searchParams]);

  const { client: prefilledClient } = useClient({
    clientId: prefilledClientId,
    autoFetch: !!prefilledClientId
  });

  const handleResourceChange = useCallback((resource: {
    id: string | number;
    resourceId: number;
    resourceName: string;
    availability?: WeeklyAvailability;
  } | null) => {
    if (!resource) {
      setSelectedResource(null);
      return;
    }

    setSelectedResource({
      id: Number(resource.resourceId || resource.id),
      name: resource.resourceName,
      availability: resource.availability
    });
  }, []);

  const toMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map((part) => Number(part));
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return NaN;
    }
    return hours * 60 + minutes;
  };

  const toHHMM = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getDayKey = (date: Date): DayKey => {
    const dayKeys: DayKey[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return dayKeys[date.getDay()];
  };

  const formatDayLabel = (day: string): string => `${day.charAt(0).toUpperCase()}${day.slice(1)}`;

  const getResourceTimingFeedback = (startDateValue: string, endDateValue: string) => {
    if (!selectedResource) {
      return { hoursLabel: '', warning: '' };
    }

    if (!selectedResource.availability) {
      return {
        hoursLabel: '',
        warning: `No operating-hours data is available for "${selectedResource.name}". Backend validation will enforce scheduling constraints.`
      };
    }

    const startDate = new Date(startDateValue);
    const endDate = new Date(endDateValue);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return { hoursLabel: '', warning: '' };
    }

    const dayKey = getDayKey(startDate);
    const dayAvailability = selectedResource.availability[dayKey];
    if (!dayAvailability) {
      return {
        hoursLabel: '',
        warning: `No ${formatDayLabel(dayKey)} availability is configured for "${selectedResource.name}".`
      };
    }

    const hoursLabel = dayAvailability.available
      ? `${formatDayLabel(dayKey)} operating hours: ${dayAvailability.start} - ${dayAvailability.end}`
      : `${formatDayLabel(dayKey)} operating hours: Unavailable`;

    if (!dayAvailability.available) {
      return {
        hoursLabel,
        warning: `"${selectedResource.name}" is not available on ${formatDayLabel(dayKey)}.`
      };
    }

    if (startDate.toDateString() !== endDate.toDateString()) {
      return {
        hoursLabel,
        warning: 'Start and end date must be on the same day to match resource operating hours.'
      };
    }

    const appointmentStartMinutes = toMinutes(toHHMM(startDate));
    const appointmentEndMinutes = toMinutes(toHHMM(endDate));
    const availableStartMinutes = toMinutes(dayAvailability.start);
    const availableEndMinutes = toMinutes(dayAvailability.end);

    if (
      Number.isNaN(appointmentStartMinutes) ||
      Number.isNaN(appointmentEndMinutes) ||
      Number.isNaN(availableStartMinutes) ||
      Number.isNaN(availableEndMinutes)
    ) {
      return {
        hoursLabel,
        warning: 'Unable to validate selected time against resource operating hours.'
      };
    }

    if (appointmentStartMinutes < availableStartMinutes || appointmentEndMinutes > availableEndMinutes) {
      return {
        hoursLabel,
        warning: `Selected time (${toHHMM(startDate)}-${toHHMM(endDate)}) is outside "${selectedResource.name}" operating hours (${dayAvailability.start}-${dayAvailability.end}).`
      };
    }

    return { hoursLabel, warning: '' };
  };

  // If only clientId is provided, resolve a display name for FormClientSelect.
  useEffect(() => {
    if (prefilledClientName || !prefilledClient) {
      return;
    }

    const resolvedName = `${prefilledClient.firstName || ''} ${prefilledClient.lastName || ''}`.trim() || prefilledClient.name || '';
    if (resolvedName) {
      setPrefilledClientName(resolvedName);
    }
  }, [prefilledClient, prefilledClientName]);

  // Calculate default end date based on start date and duration
  const calculateEndDate = (startDate: Date, durationMinutes: number) => {
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + durationMinutes);
    return endDate;
  };

  // Convert dates to datetime-local format (YYYY-MM-DDTHH:mm)
  const formatDateTimeLocal = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  // Default form values
  const currentDate = new Date();
  const defaultEndDate = calculateEndDate(currentDate, 30);
  
  const defaultValues = {
    startDate: formatDateTimeLocal(currentDate),
    endDate: formatDateTimeLocal(defaultEndDate),
    duration: 30,
    type: 0,
    status: 0,
    label: 0,
    subject: '',
    clientId: prefilledClientId,
    referringDoctorId: undefined,
    location: '',
    description: '',
    reminderInfo: ''
  } satisfies Partial<AppointmentFormValues>;

  // Handle form submission
  const handleSubmit = async (formData: AppointmentFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Transform form data to API format
      const appointmentData = {
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        subject: formData.subject,
        clientId: formData.clientId,
        resourceId: formData.resourceId,
        referringDoctorId: formData.referringDoctorId || undefined,
        clinicName: clinicName,
        duration: formData.duration,
        type: formData.type,
        status: formData.status,
        label: formData.label,
        location: formData.location || undefined,
        description: formData.description || undefined,
        reminderInfo: formData.reminderInfo || undefined
      };

      // Call real API
      const newAppointment = await AppointmentApiService.createAppointment(appointmentData);
      
      // Navigate to the new appointment detail page
      const appointmentId = newAppointment.appointmentId || newAppointment.id;
      router.push(generateLink('clinic', `appointments/${appointmentId}`, clinicSlug));
    } catch (error) {
      alert(`Failed to create appointment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (prefilledClientId) {
      router.push(generateLink('clinic', `clients/${prefilledClientId}`, clinicSlug));
      return;
    }
    router.push(generateLink('clinic', 'appointments', clinicSlug));
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            {prefilledClientId ? 'Back to Client' : 'Back'}
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              New Appointment
            </h1>
            <p className="text-gray-600 mt-1">
              Create a new appointment for {clinicData?.displayName || clinicSlug}
            </p>
          </div>
        </div>
      </div>

      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="bg-slate-50 pb-3 pt-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Plus size={18} />
            Create New Appointment
          </CardTitle>
          <CardDescription>
            Enter the appointment details, timing, and additional information
          </CardDescription>
        </CardHeader>
        
        <FormWrapper
          key={`appointment-form-${prefilledClientId || 'new'}`}
          schema={appointmentSchema}
          defaultValues={defaultValues as AppointmentFormValues}
          onSubmit={handleSubmit}
        >
          {(form) => {
            const startDateValue = form.watch('startDate');
            const endDateValue = form.watch('endDate');
            const timingFeedback = getResourceTimingFeedback(startDateValue || '', endDateValue || '');

            return (
              <div className="p-6">
                <div className="grid gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput
                  name="subject"
                  label="Subject"
                  placeholder="Enter appointment subject"
                  required
                />
                
                <FormClientSelect
                  name="clientId"
                  label="Client"
                  placeholder="Select a client"
                  clinicName={clinicName}
                  defaultClientName={prefilledClientName || undefined}
                  required
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <FormResourceSelect
                  name="resourceId"
                  label="Resource"
                  placeholder="Select a practitioner..."
                  clinicName={clinicName}
                  onResourceChange={handleResourceChange}
                  required
                />

                <FormReferringDoctorSelect
                  name="referringDoctorId"
                  label="Referring Doctor"
                  placeholder="Select a referring doctor"
                  clinicName={clinicName}
                />

                <FormInput
                  name="duration"
                  label="Duration (minutes)"
                  type="number"
                  min="15"
                  placeholder="Enter duration in minutes"
                  required
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Date & Time</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput
                  name="startDate"
                  label="Start Date & Time"
                  type="datetime-local"
                  required
                />
                
                <FormInput
                  name="endDate"
                  label="End Date & Time"
                  type="datetime-local"
                  required
                />
              </div>
              
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                <strong>Tip:</strong> The end date will be automatically calculated based on the start date and duration when you submit the form.
              </div>

              {timingFeedback.hoursLabel && (
                <div className="text-sm text-gray-700 bg-slate-50 p-3 rounded-md">
                  <strong>Resource Hours:</strong> {timingFeedback.hoursLabel}
                </div>
              )}

              {timingFeedback.warning && (
                <div className="text-sm text-red-700 bg-red-50 p-3 rounded-md flex items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <span>{timingFeedback.warning}</span>
                </div>
              )}
            </div>

            {/* Status and Type */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Status & Classification</h3>
              
              <div className="grid gap-4 md:grid-cols-3">
                <FormSelect
                  name="status"
                  label="Status"
                  placeholder="Select status"
                  options={statusOptions}
                  required
                />
                
                <FormSelect
                  name="type"
                  label="Type"
                  placeholder="Select type"
                  options={typeOptions}
                  required
                />
                
                <FormSelect
                  name="label"
                  label="Label"
                  placeholder="Select label"
                  options={labelOptions}
                  required
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>
              
              <FormInput
                name="location"
                label="Location"
                placeholder="Enter location (optional)"
              />
              
              <FormInput
                name="description"
                label="Description"
                placeholder="Enter appointment description (optional)"
                multiline
              />
              
              <FormInput
                name="reminderInfo"
                label="Reminder Information"
                placeholder="Enter reminder details (optional)"
                multiline
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                {isSubmitting ? 'Creating...' : 'Create Appointment'}
              </Button>
            </div>
                </div>
              </div>
            );
          }}
        </FormWrapper>
      </Card>
    </div>
  );
}
