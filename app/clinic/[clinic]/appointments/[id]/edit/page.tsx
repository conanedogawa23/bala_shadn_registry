'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { z } from 'zod';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormWrapper } from '@/components/ui/form/FormWrapper';
import { FormInput } from '@/components/ui/form/FormInput';
import { FormSelect } from '@/components/ui/form/FormSelect';
import { FormClientSelect } from '@/components/ui/form/FormClientSelect';
import { FormResourceSelect } from '@/components/ui/form/FormResourceSelect';
import { FormDatePicker } from '@/components/ui/form/FormDatePicker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Edit3, AlertCircle } from 'lucide-react';
import { generateLink } from '@/lib/route-utils';
import { AppointmentApiService } from '@/lib/api/appointmentService';
import { slugToClinic, getRealDataClinicName } from '@/lib/data/clinics';

// Define the appointment schema using zod for validation
const appointmentSchema = z.object({
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }),
  subject: z.string().min(2, { message: 'Subject must be at least 2 characters' }),
  clientId: z.string().min(1, { message: 'Client ID is required' }),
  resourceId: z.coerce.number().min(1, { message: 'Resource is required' }),
  duration: z.coerce.number().min(5, { message: 'Duration must be at least 5 minutes' }),
  type: z.coerce.number().int().min(0).default(0),
  status: z.coerce.number().int().min(0).default(0),
  label: z.coerce.number().int().min(0).default(0),
  location: z.string().optional(),
  description: z.string().optional(),
  reminderInfo: z.string().optional(),
  isActive: z.boolean().default(true)
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate']
});

// Type definitions
type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface Appointment {
  id: string;
  appointmentId?: number;
  type: number;
  startDate: string;
  endDate: string;
  subject: string;
  location?: string;
  description?: string;
  status: number;
  label: number;
  resourceId: number;
  duration: number;
  clientId: string;
  readyToBill: boolean;
  clinicName: string;
  resourceName?: string;
  isActive: boolean;
  reminderInfo?: string;
  dateCreated: string;
  dateModified: string;
}

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

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const clinicSlug = params.clinic as string;
  const appointmentId = params.id as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [appointmentData, setAppointmentData] = useState<AppointmentFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string>('');
  const [resourceName, setResourceName] = useState<string>('');

  const clinicData = slugToClinic(clinicSlug);
  const clinicName = clinicData ? getRealDataClinicName(clinicData) : clinicSlug;

  // Fetch appointment data from API
  useEffect(() => {
    const fetchAppointment = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const appointment: Appointment = await AppointmentApiService.getAppointmentById(appointmentId);
        
        // Transform API data to form format
        // Convert dates to datetime-local format (YYYY-MM-DDTHH:mm)
        const formatDateTimeLocal = (dateString: string) => {
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16);
        };

        // Store resource name if available
        if (appointment.resourceName) {
          setResourceName(appointment.resourceName);
        }

        // Store subject as client name (subject usually contains client name in appointments)
        setClientName(appointment.subject);

        setAppointmentData({
          startDate: formatDateTimeLocal(appointment.startDate),
          endDate: formatDateTimeLocal(appointment.endDate),
          subject: appointment.subject,
          clientId: appointment.clientId,
          resourceId: appointment.resourceId,
          duration: appointment.duration,
          type: appointment.type,
          status: appointment.status,
          label: appointment.label,
          location: appointment.location || '',
          description: appointment.description || '',
          reminderInfo: appointment.reminderInfo || '',
          isActive: appointment.isActive
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load appointment');
      } finally {
        setIsLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId]);

  // Handle form submission
  const handleSubmit = async (formData: AppointmentFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Transform form data to API format
      const updateData = {
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        subject: formData.subject,
        clientId: formData.clientId,
        resourceId: formData.resourceId,
        duration: formData.duration,
        type: formData.type,
        status: formData.status,
        label: formData.label,
        location: formData.location || undefined,
        description: formData.description || undefined,
        reminderInfo: formData.reminderInfo || undefined,
        isActive: formData.isActive,
        clinicName: clinicName
      };

      // Call real API
      await AppointmentApiService.updateAppointment(appointmentId, updateData);
      
      // Navigate back to appointment detail page
      router.push(generateLink('clinic', `appointments/${appointmentId}`, clinicSlug));
    } catch (error) {
      alert(`Failed to update appointment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    router.push(generateLink('clinic', `appointments/${appointmentId}`, clinicSlug));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center min-h-64 gap-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error Loading Appointment:</strong> {error}
            </AlertDescription>
          </Alert>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Back to Appointment
          </Button>
        </div>
      </div>
    );
  }

  if (!appointmentData) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Appointment Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The appointment you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={handleBack} className="mt-4">
            Back to Appointments
          </Button>
        </div>
      </div>
    );
  }

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
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Edit Appointment
            </h1>
            <p className="text-gray-600 mt-1">
              Update appointment details for {clinicData?.displayName || clinicSlug}
            </p>
          </div>
        </div>
      </div>

      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="bg-slate-50 pb-3 pt-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Edit3 size={18} />
            Edit Appointment Information
          </CardTitle>
          <CardDescription>
            Update the appointment details, timing, and status
          </CardDescription>
        </CardHeader>
        
        <FormWrapper
          schema={appointmentSchema}
          defaultValues={appointmentData}
          onSubmit={handleSubmit}
        >
          {(form) => (
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
                  required
                  defaultClientName={clientName}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormResourceSelect
                  name="resourceId"
                  label="Resource"
                  placeholder="Select a practitioner or resource"
                  clinicName={clinicName}
                  required
                  defaultResourceName={resourceName}
                />
                
                <FormInput
                  name="duration"
                  label="Duration (minutes)"
                  type="number"
                  min="5"
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
                />
                
                <FormInput
                  name="endDate"
                  label="End Date & Time"
                  type="datetime-local"
                />
              </div>
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
                {isSubmitting ? 'Updating...' : 'Update Appointment'}
              </Button>
            </div>
              </div>
            </div>
          )}
        </FormWrapper>
      </Card>
    </div>
  );
}
