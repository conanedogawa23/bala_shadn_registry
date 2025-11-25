"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, Unlock, UserCheck, UserX } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User } from "@/lib/api/userApiService";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onUnlock: (userId: string) => void;
  onUpdateStatus: (userId: string, status: string) => void;
}

export function UserTable({ users, onEdit, onDelete, onUnlock, onUpdateStatus }: UserTableProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      suspended: "bg-red-100 text-red-800 border-red-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: "bg-purple-100 text-purple-800 border-purple-200",
      manager: "bg-blue-100 text-blue-800 border-blue-200",
      staff: "bg-cyan-100 text-cyan-800 border-cyan-200",
      practitioner: "bg-indigo-100 text-indigo-800 border-indigo-200",
      receptionist: "bg-pink-100 text-pink-800 border-pink-200"
    };
    return styles[role as keyof typeof styles] || styles.staff;
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-gray-50">
        <p className="text-gray-500">No users found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell className="font-medium">
                <div>
                  <div>{user.fullName || `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim()}</div>
                  <div className="text-sm text-gray-500">@{user.username}</div>
                  {user.isLocked && (
                    <Badge variant="outline" className="mt-1 text-xs bg-red-50 text-red-600 border-red-200">
                      Locked
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`capitalize ${getRoleBadge(user.role)}`}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`capitalize ${getStatusBadge(user.status)}`}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>
                {user.lastLogin 
                  ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : 'Never'}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit User
                    </DropdownMenuItem>
                    
                    {user.isLocked && (
                      <DropdownMenuItem onClick={() => onUnlock(user._id)}>
                        <Unlock className="mr-2 h-4 w-4" />
                        Unlock Account
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    {user.status === 'active' ? (
                      <DropdownMenuItem onClick={() => onUpdateStatus(user._id, 'suspended')}>
                        <UserX className="mr-2 h-4 w-4" />
                        Suspend User
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => onUpdateStatus(user._id, 'active')}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Activate User
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => onDelete(user._id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

