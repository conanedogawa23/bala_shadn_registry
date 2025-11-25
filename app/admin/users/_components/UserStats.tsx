"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserPlus, Activity } from "lucide-react";

interface UserStatsProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    usersByRole: Record<string, number>;
    usersByStatus: Record<string, number>;
    usersByClinic: Record<string, number>;
    recentActivity: Array<{
      userId: string;
      username: string;
      lastActivity: Date;
      role: string;
    }>;
  };
}

export function UserStats({ stats }: UserStatsProps) {
  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "New This Month",
      value: stats.newUsersThisMonth,
      icon: UserPlus,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Recent Activity",
      value: stats.recentActivity.length,
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {statsCards.map((stat, index) => (
        <Card key={index} className="shadow-sm border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

