'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar,
  Clock,
  User,
  MapPin,
  Edit,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  DollarSign,
  Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateLink } from '@/lib/route-utils';
import { useClinic } from '@/lib/contexts/clinic-context';
import { AppointmentApiService } from '@/lib/api/appointmentService';
import { formatDate, formatTime } from '@/lib/utils';

interface Appointment {
  id: string;
  appointmentId?: number;
  type: number;
  startDate: string;
  endDate: string;
  allDay?: boolean;
  subject: string;
  location?: string;
  description?: string;
  status: number;
  label: number;
  resourceId: number;
  duration: number;
  clientId: string;
  clientKey?: number;
  readyToBill: boolean;
  clinicName: string;
  resourceName?: string;
  isActive: boolean;
  dateCreated: string;
  dateModified: string;
}

const getStatusInfo = (status: number) => {
  switch (status) {
    case 0:
      return { label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: Clock };
    case 1:
      return { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    case 2:
      return { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle };
    case 3:
      return { label: 'No Show', color: 'bg-orange-100 text-orange-800', icon: AlertCircle };
    case 4:
      return { label: 'Rescheduled', color: 'bg-yellow-100 text-yellow-800', icon: Calendar };
    default:
      return { label: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
  }
};

export default function AppointmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clinicSlug = params.clinic as string;
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { availableClinics } = useClinic();
  const clinicData = useMemo(() => availableClinics.find(c => c.name === clinicSlug), [availableClinics, clinicSlug]);
  const clinicName = useMemo(() => {
    return clinicData?.backendName || clinicData?.displayName || clinicSlug;
  }, [clinicData, clinicSlug]);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId) return;

      setLoading(true);
      setError(null);

      try {
        const appointmentData = await AppointmentApiService.getAppointmentById(appointmentId);
        setAppointment(appointmentData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch appointment details');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  const handleBack = () => {
    router.push(generateLink('clinic', 'appointments', clinicSlug));
  };

  const handleEdit = () => {
    router.push(generateLink('clinic', `appointments/${appointmentId}/edit`, clinicSlug));
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={handleBack} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Appointments
          </Button>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Appointment not found'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(appointment.status);
  const StatusIcon = statusInfo.icon;
  const startDate = formatDate(appointment.startDate);
  const startTime = formatTime(appointment.startDate);
  const endTime = formatTime(appointment.endDate);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button variant="ghost" onClick={handleBack} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Appointments
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              Appointment Details
            </h1>
            <p className="text-gray-600 mt-1">
              Appointment #{appointment.appointmentId || appointment.id}
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Appointment
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Appointment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{appointment.subject}</h3>
                  <Badge className={statusInfo.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium">{startDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">
                        {startTime} - {endTime}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Resource</p>
                      <p className="font-medium">{appointment.resourceName || `Resource ${appointment.resourceId}`}</p>
                    </div>
                  </div>
                  
                  {appointment.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{appointment.location}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {appointment.description && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Description</p>
                      <p className="text-gray-900">{appointment.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{appointment.duration} minutes</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Client ID</p>
                    <p className="font-medium">{appointment.clientId}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Ready to Bill</p>
                    <Badge variant={appointment.readyToBill ? "default" : "secondary"}>
                      {appointment.readyToBill ? "Yes" : "No"}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Active</p>
                    <Badge variant={appointment.isActive ? "default" : "destructive"}>
                      {appointment.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <StatusIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <Badge className={`${statusInfo.color} text-lg px-3 py-1`}>
                    {statusInfo.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium text-sm">
                    {formatDate(appointment.dateCreated)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Modified</p>
                  <p className="font-medium text-sm">
                    {formatDate(appointment.dateModified)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Billing Information */}
            {appointment.readyToBill && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Billing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      This appointment is ready for billing.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
