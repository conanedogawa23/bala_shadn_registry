"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Search, RefreshCw } from "lucide-react";
import { UserApiService, User, UserQueryOptions } from "@/lib/api/userApiService";
import { UserStats } from "./_components/UserStats";
import { UserTable } from "./_components/UserTable";
import { UserDialog } from "./_components/UserDialog";

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Filters and pagination
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 20;

  // Check authentication and authorization
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const isAuthenticatedValue = localStorage.getItem('isAuthenticated');
    if (isAuthenticatedValue !== 'true') {
      router.push('/login');
      return;
    }

    const userJson = localStorage.getItem('user');
    if (!userJson) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(userJson);
      // Check role property first, fallback to membershipDetails.membershipType for backward compatibility
      const userRole = userData.role || userData.membershipDetails?.membershipType;
      
      // Only allow admin and manager roles
      if (userRole !== 'admin' && userRole !== 'manager') {
        console.log('Access denied. User role:', userRole, '(requires admin or manager)');
        router.push('/');
        return;
      }
      
      console.log('Admin access granted. User role:', userRole);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      router.push('/login');
      return;
    }
  }, [router]);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryOptions: UserQueryOptions = {
        page,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      if (search) {
        queryOptions.search = search;
      }

      if (roleFilter && roleFilter !== 'all') {
        queryOptions.role = roleFilter;
      }

      if (statusFilter && statusFilter !== 'all') {
        queryOptions.status = statusFilter;
      }

      const response = await UserApiService.getAllUsers(queryOptions);
      setUsers(response.users);
      setTotalPages(response.pagination.pages);
      setTotalUsers(response.pagination.total);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const statsData = await UserApiService.getUserStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [page, roleFilter, statusFilter]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
      } else {
        fetchUsers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleCreateUser = () => {
    setDialogMode("create");
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setDialogMode("edit");
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleSaveUser = async (userData: any) => {
    try {
      if (dialogMode === "create") {
        await UserApiService.createUser(userData);
      } else if (dialogMode === "edit" && selectedUser) {
        await UserApiService.updateUserProfile(selectedUser._id, userData);
      }
      
      await fetchUsers();
      await fetchStats();
    } catch (err) {
      console.error('Failed to save user:', err);
      throw err;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await UserApiService.deleteUser(userId);
      await fetchUsers();
      await fetchStats();
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError('Failed to delete user. Please try again.');
    }
  };

  const handleUnlockUser = async (userId: string) => {
    try {
      await UserApiService.unlockUser(userId);
      await fetchUsers();
    } catch (err) {
      console.error('Failed to unlock user:', err);
      setError('Failed to unlock user. Please try again.');
    }
  };

  const handleUpdateStatus = async (userId: string, status: string) => {
    try {
      await UserApiService.updateUserStatus(userId, status);
      await fetchUsers();
      await fetchStats();
    } catch (err) {
      console.error('Failed to update user status:', err);
      setError('Failed to update user status. Please try again.');
    }
  };

  const handleRefresh = () => {
    fetchUsers();
    fetchStats();
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreateUser}>
            <UserPlus className="h-4 w-4 mr-2" />
            Create User
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Statistics */}
      {stats && <UserStats stats={stats} />}

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, email, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="practitioner">Practitioner</SelectItem>
            <SelectItem value="receptionist">Receptionist</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          {/* User Table */}
          <UserTable
            users={users}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onUnlock={handleUnlockUser}
            onUpdateStatus={handleUpdateStatus}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalUsers)} of {totalUsers} users
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* User Dialog */}
      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={selectedUser}
        onSave={handleSaveUser}
        mode={dialogMode}
      />
    </div>
  );
}

