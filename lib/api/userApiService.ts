import { BaseApiService } from './baseApiService';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
}

export interface User {
  _id: string;
  username: string;
  email: string;
  profile: UserProfile;
  role: string;
  status: string;
  permissions: {
    canManageUsers?: boolean;
    canManageClinic?: boolean;
    canViewReports?: boolean;
    canManageAppointments?: boolean;
    canManageOrders?: boolean;
    canManagePayments?: boolean;
    canViewPayments?: boolean;
    canCreatePayments?: boolean;
    canEditPayments?: boolean;
    canDeletePayments?: boolean;
    canProcessRefunds?: boolean;
    canAccessAllClinics?: boolean;
    allowedClinics: string[];
  };
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  fullName?: string;
  isLocked?: boolean;
}

export interface UpdateUserProfileRequest {
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    dateOfBirth?: Date;
    gender?: string;
    address?: {
      street?: string;
      city?: string;
      province?: string;
      postalCode?: string;
      country?: string;
    };
  };
}

export interface UserQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  clinicName?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class UserApiService extends BaseApiService {
  private static readonly BASE_PATH = '/users';

  /**
   * Get all users with filtering and pagination (Admin only)
   */
  static async getAllUsers(options: UserQueryOptions = {}): Promise<{
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const queryParams = new URLSearchParams();
    
    if (options.page) queryParams.append('page', options.page.toString());
    if (options.limit) queryParams.append('limit', options.limit.toString());
    if (options.search) queryParams.append('search', options.search);
    if (options.role) queryParams.append('role', options.role);
    if (options.status) queryParams.append('status', options.status);
    if (options.clinicName) queryParams.append('clinicName', options.clinicName);
    if (options.sortBy) queryParams.append('sortBy', options.sortBy);
    if (options.sortOrder) queryParams.append('sortOrder', options.sortOrder);

    const endpoint = `${this.BASE_PATH}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await this.request<{
      users: User[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>(endpoint, 'GET');

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '[getAllUsers] Failed to fetch users');
    }

    return response.data;
  }

  /**
   * Get current authenticated user profile
   */
  static async getCurrentUser(userId: string): Promise<User> {
    const endpoint = `${this.BASE_PATH}/${userId}`;
    
    const response = await this.request<{ user: User }>(endpoint, 'GET');

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '[getCurrentUser] Failed to fetch user profile');
    }

    return response.data.user;
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User> {
    const endpoint = `${this.BASE_PATH}/${userId}`;
    
    const response = await this.request<{ user: User }>(endpoint, 'GET');

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '[getUserById] Failed to fetch user');
    }

    return response.data.user;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: string,
    updateData: UpdateUserProfileRequest
  ): Promise<User> {
    const endpoint = `${this.BASE_PATH}/${userId}`;
    
    const response = await this.request<{ user: User }>(
      endpoint,
      'PUT',
      updateData
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '[updateUserProfile] Failed to update profile');
    }

    return response.data.user;
  }

  /**
   * Create a new user (Admin only)
   */
  static async createUser(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: string;
    status?: string;
    clinics?: string[];
    permissions?: any;
  }): Promise<User> {
    const endpoint = this.BASE_PATH;
    
    const response = await this.request<{ user: User }>(
      endpoint,
      'POST',
      userData
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '[createUser] Failed to create user');
    }

    return response.data.user;
  }

  /**
   * Delete user (Admin only)
   */
  static async deleteUser(userId: string): Promise<void> {
    const endpoint = `${this.BASE_PATH}/${userId}`;
    
    const response = await this.request<void>(endpoint, 'DELETE');

    if (!response.success) {
      throw new Error(response.error?.message || '[deleteUser] Failed to delete user');
    }
  }

  /**
   * Update user status (Admin only)
   */
  static async updateUserStatus(
    userId: string,
    status: string
  ): Promise<void> {
    const endpoint = `${this.BASE_PATH}/${userId}/status`;
    
    const response = await this.request<void>(
      endpoint,
      'PUT',
      { status }
    );

    if (!response.success) {
      throw new Error(response.error?.message || '[updateUserStatus] Failed to update status');
    }
  }

  /**
   * Unlock user account (Admin only)
   */
  static async unlockUser(userId: string): Promise<void> {
    const endpoint = `${this.BASE_PATH}/${userId}/unlock`;
    
    const response = await this.request<void>(endpoint, 'PUT');

    if (!response.success) {
      throw new Error(response.error?.message || '[unlockUser] Failed to unlock user');
    }
  }

  /**
   * Get user statistics (Manager/Admin only)
   */
  static async getUserStats(): Promise<{
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
  }> {
    const endpoint = `${this.BASE_PATH}/stats`;
    
    const response = await this.request<{
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
    }>(endpoint, 'GET');

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '[getUserStats] Failed to fetch stats');
    }

    return response.data;
  }
}

