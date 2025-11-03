'use client';

import React from 'react';
import { User, Calendar, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ClientsStatsProps {
  stats: {
    total: number;
    active: number;
    newThisMonth: number;
    withEmail: number;
  };
  loading?: boolean;
}

export function ClientsStats({ stats, loading = false }: ClientsStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="flex items-center p-6">
              <div className="animate-pulse flex items-center w-full">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-4 mb-8">
      <Card>
        <CardContent className="flex items-center p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Clients</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mr-4">
            <User className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Active Clients</p>
            <p className="text-2xl font-bold">{stats.active}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mr-4">
            <Calendar className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">New This Month</p>
            <p className="text-2xl font-bold">{stats.newThisMonth}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mr-4">
            <Mail className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">With Email</p>
            <p className="text-2xl font-bold">{stats.withEmail}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

