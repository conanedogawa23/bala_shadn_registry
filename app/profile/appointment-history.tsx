"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";

export interface Appointment {
  id: number;
  service: string;
  provider: string;
  date: string;
  time: string;
  status: "completed" | "scheduled" | "cancelled" | "pending";
}

interface AppointmentHistoryProps {
  appointments: Appointment[];
}

// Badge color based on appointment status
const getStatusBadgeColor = (status: string) => {
  const colors = {
    completed: "bg-green-100 text-green-800 border-green-200",
    scheduled: "bg-blue-100 text-blue-800 border-blue-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
  return colors[status as keyof typeof colors] || colors.pending;
};

export function AppointmentHistory({ appointments }: AppointmentHistoryProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Appointment History</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No appointments found.</p>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-4 border rounded-lg transition-all hover:border-[#6666FF] hover:shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{appointment.service}</h3>
                  <Badge
                    className={`capitalize ${getStatusBadgeColor(appointment.status)}`}
                  >
                    {appointment.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#6666FF]" />
                    <span className="text-gray-600">{appointment.provider}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#6666FF]" />
                    <span className="text-gray-600">
                      {new Date(appointment.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#6666FF]" />
                    <span className="text-gray-600">{appointment.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 