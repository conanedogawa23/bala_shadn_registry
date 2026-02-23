'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppointmentApiService } from '@/lib/api/appointmentService';

interface TodayAppointment {
  _id: string;
  startDate: string;
  endDate?: string;
  subject?: string;
  status: string;
  clientId: number;
  clientName?: string;
  type?: string;
}

interface TodaysAppointmentsProps {
  clinicName: string;
}

export function TodaysAppointments({ clinicName }: TodaysAppointmentsProps) {
  const [appointments, setAppointments] = useState<TodayAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const response = await AppointmentApiService.getAppointmentsByClinic(clinicName, {
          startDate: today,
          endDate: tomorrow,
          limit: 20,
        });
        setAppointments(response.appointments || []);
        setTotal(response.pagination?.total || response.appointments?.length || 0);
      } catch {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    if (clinicName) fetchToday();
  }, [clinicName]);

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '-';
    }
  };

  const statusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today&apos;s Appointments
            </CardTitle>
            <CardDescription>{total} appointment{total !== 1 ? 's' : ''} today</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground text-center py-4">Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            No appointments scheduled for today
          </div>
        ) : (
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-3">
              {appointments.slice(0, 10).map(apt => (
                <div key={apt._id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-primary">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {formatTime(apt.startDate)}
                    </div>
                    <div>
                      <div className="text-sm font-medium flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {apt.clientName || `Client #${apt.clientId}`}
                      </div>
                      {apt.subject && (
                        <div className="text-xs text-muted-foreground">{apt.subject}</div>
                      )}
                    </div>
                  </div>
                  <Badge variant={statusColor(apt.status) as any}>{apt.status}</Badge>
                </div>
              ))}
              {appointments.length > 10 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{appointments.length - 10} more
                </p>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
