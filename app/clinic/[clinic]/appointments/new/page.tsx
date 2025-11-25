'use client';

import React, { useState } from 'react';
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
import { ArrowLeft, Save, Plus } from 'lucide-react';
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
  duration: z.coerce.number().min(5, { message: 'Duration must be at least 5 minutes' }).default(30),
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
  const clinicSlug = params.clinic as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clinicData = slugToClinic(clinicSlug);
  const clinicName = clinicData ? getRealDataClinicName(clinicData) : clinicSlug;

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
  
  const defaultValues: Partial<AppointmentFormValues> = {
    startDate: formatDateTimeLocal(currentDate),
    endDate: formatDateTimeLocal(defaultEndDate),
    duration: 30,
    type: 0,
    status: 0,
    label: 0,
    subject: '',
    clientId: '',
    resourceId: 1,
    location: '',
    description: '',
    reminderInfo: ''
  };

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
            Back
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
          schema={appointmentSchema}
          defaultValues={defaultValues}
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
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormResourceSelect
                  name="resourceId"
                  label="Resource"
                  placeholder="Select a practitioner..."
                  clinicName={clinicName}
                  required
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
          )}
        </FormWrapper>
      </Card>
    </div>
  );
}
