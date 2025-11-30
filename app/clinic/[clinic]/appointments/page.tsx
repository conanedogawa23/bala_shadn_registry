'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter,
  Clock,
  User,
  MapPin,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { generateLink } from '@/lib/route-utils';
import { useClinic } from '@/lib/contexts/clinic-context';
import { useAppointments, useAppointmentStats } from '@/lib/hooks';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Error component
const ErrorMessage = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
    <p className="text-red-600 mb-4">{message}</p>
    <Button onClick={onRetry} variant="outline">
      <RotateCcw className="h-4 w-4 mr-2" />
      Try Again
    </Button>
  </div>
);

// Empty state component
const EmptyAppointments = ({ clinicName }: { clinicName: string }) => (
  <div className="text-center py-12">
    <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
    <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
    <p className="text-gray-600 mb-6">
      No appointments match your current filters for {clinicName}.
    </p>
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Schedule New Appointment
    </Button>
  </div>
);

// Appointment status utility functions
const getStatusColor = (status: number): string => {
  switch (status) {
    case 0: return 'bg-blue-100 text-blue-800'; // Scheduled
    case 1: return 'bg-green-100 text-green-800'; // Completed
    case 2: return 'bg-red-100 text-red-800'; // Cancelled
    case 3: return 'bg-orange-100 text-orange-800'; // No Show
    case 4: return 'bg-yellow-100 text-yellow-800'; // Rescheduled
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: number): string => {
  switch (status) {
    case 0: return 'Scheduled';
    case 1: return 'Completed';
    case 2: return 'Cancelled';
    case 3: return 'No Show';
    case 4: return 'Rescheduled';
    default: return 'Unknown';
  }
};

const getStatusIcon = (status: number) => {
  switch (status) {
    case 0: return <Clock className="h-4 w-4" />;
    case 1: return <CheckCircle className="h-4 w-4" />;
    case 2: return <XCircle className="h-4 w-4" />;
    case 3: return <AlertCircle className="h-4 w-4" />;
    case 4: return <RotateCcw className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

const formatDateTime = (dateTime: string): { date: string; time: string } => {
  const date = new Date(dateTime);
  return {
    date: date.toLocaleDateString('en-CA'),
    time: date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  };
};

export default function AppointmentsPage() {
  const params = useParams();
  const router = useRouter();
  const clinicSlug = Array.isArray(params.clinic) ? params.clinic[0] : params.clinic as string;
  const { availableClinics, loading: clinicLoading, error: clinicError } = useClinic();
  
  // Find clinic from dynamic data
  const clinic = availableClinics.find(c => c.name === clinicSlug);
  const clinicName = clinic?.backendName || clinic?.displayName || clinicSlug;

  // State for filtering and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

  // Fetch appointments and stats
  const {
    appointments,
    loading,
    error,
    pagination,
    refetch
  } = useAppointments({
    clinicName,
    startDate: dateRange.start,
    endDate: dateRange.end,
    status: statusFilter === 'all' ? undefined : parseInt(statusFilter),
    page,
    limit: 20
  });

  const {
    stats,
    loading: statsLoading,
    error: statsError
  } = useAppointmentStats({
    clinicName,
    startDate: dateRange.start,
    endDate: dateRange.end
  });

  // Filter appointments by search query
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    if (!searchQuery.trim()) return appointments;
    
    const query = searchQuery.toLowerCase();
    return appointments.filter(appointment => 
      appointment.subject?.toLowerCase().includes(query) ||
      appointment.clientId?.toLowerCase().includes(query) ||
      appointment.resourceName?.toLowerCase().includes(query) ||
      appointment.location?.toLowerCase().includes(query)
    );
  }, [appointments, searchQuery]);

  const handleBack = () => {
    router.push(generateLink('clinic', '', clinicSlug));
  };

  // Helper function to get appointment ID with fallback
  // Use business appointmentId for navigation (backend has business ID endpoint)
  const getAppointmentId = (appointment: any): string | number | null => {
    return appointment.appointmentId || appointment._id || appointment.id;
  };

  const handleViewAppointment = (appointment: any) => {
    const appointmentId = getAppointmentId(appointment);
    if (!appointmentId) {
      console.warn('Cannot view appointment: ID is missing');
      return;
    }
    router.push(generateLink('clinic', `appointments/${appointmentId}`, clinicSlug));
  };

  const handleEditAppointment = (appointment: any) => {
    const appointmentId = getAppointmentId(appointment);
    if (!appointmentId) {
      console.warn('Cannot edit appointment: ID is missing');
      return;
    }
    router.push(generateLink('clinic', `appointments/${appointmentId}/edit`, clinicSlug));
  };

  const handleNewAppointment = () => {
    router.push(generateLink('clinic', 'appointments/new', clinicSlug));
  };

  // Handle clinic loading state
  if (clinicLoading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Handle clinic error or not found
  if (clinicError || !clinic) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Clinic Not Found</h2>
            <p className="text-gray-600">The requested clinic could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold break-words">
          Appointments - {clinic?.displayName || clinicSlug}
        </h1>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <p className="text-gray-600">
            Manage and schedule appointments
          </p>
          <Button onClick={handleNewAppointment} className="flex items-center gap-2 whitespace-nowrap">
            <Plus className="h-4 w-4" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && !statsLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats.totalAppointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedAppointments}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.upcomingCount}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold">{Math.round(stats.completionRate)}%</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-green-600">%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="0">Scheduled</SelectItem>
                <SelectItem value="1">Completed</SelectItem>
                <SelectItem value="2">Cancelled</SelectItem>
                <SelectItem value="3">No Show</SelectItem>
                <SelectItem value="4">Rescheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointments
            {pagination && (
              <span className="text-sm font-normal text-gray-500">
                ({pagination.total} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <LoadingSpinner />}
          
          {error && (
            <ErrorMessage message={error} onRetry={refetch} />
          )}
          
          {!loading && !error && filteredAppointments.length === 0 && (
            <EmptyAppointments clinicName={clinic?.displayName || clinicName} />
          )}
          
          {!loading && !error && filteredAppointments.length > 0 && (
            <div className="space-y-4">
              {filteredAppointments.map((appointment, index) => {
                const { date, time } = formatDateTime(appointment.startDate);
                const endTime = formatDateTime(appointment.endDate).time;
                
                return (
                  <div
                    key={getAppointmentId(appointment) || `appointment-${index}-${appointment.startDate}`}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{appointment.subject}</h3>
                          <Badge 
                            variant="secondary" 
                            className={getStatusColor(appointment.status)}
                          >
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1">{getStatusText(appointment.status)}</span>
                          </Badge>
                          {appointment.readyToBill && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Ready to Bill
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {time} - {endTime}
                          </div>
                          {appointment.resourceName && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {appointment.resourceName}
                            </div>
                          )}
                          {appointment.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {appointment.location}
                            </div>
                          )}
                        </div>
                        
                        {appointment.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {appointment.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAppointment(appointment)}
                          disabled={!getAppointmentId(appointment)}
                          title={!getAppointmentId(appointment) ? "Appointment ID is missing" : "View appointment details"}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={!getAppointmentId(appointment)}
                              title={!getAppointmentId(appointment) ? "Appointment ID is missing" : "Appointment actions"}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem 
                              key={`edit-${getAppointmentId(appointment) || index}`}
                              onClick={() => handleEditAppointment(appointment)}
                            >
                              Edit Appointment
                            </DropdownMenuItem>
                            {appointment.status === 0 && (
                              <DropdownMenuItem key={`complete-${getAppointmentId(appointment) || index}`}>
                                Complete Appointment
                              </DropdownMenuItem>
                            )}
                            {appointment.status === 0 && (
                              <DropdownMenuItem key={`cancel-${getAppointmentId(appointment) || index}`}>
                                Cancel Appointment
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} appointments
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}