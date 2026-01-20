// Notification Types
export interface Notification {
  _id: string;
  notificationId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'payment' | 'order' | 'appointment';
  action: string;
  title: string;
  message: string;
  clinicName: string;
  entityId: string;
  entityType: 'Payment' | 'Order' | 'Appointment';
  metadata?: NotificationMetadata;
  read: boolean;
  readBy: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationMetadata {
  clientName?: string;
  orderNumber?: string;
  paymentNumber?: string;
  appointmentId?: string | number;
  amount?: number;
  status?: string;
  oldStatus?: string;
  newStatus?: string;
  paymentMethod?: string;
  reason?: string;
  startDate?: string;
  [key: string]: any;
}

export interface NotificationFilters {
  read?: boolean;
  category?: 'payment' | 'order' | 'appointment';
}

export interface NotificationResponse {
  success: boolean;
  data?: Notification | Notification[];
  message?: string;
  error?: {
    code: string;
    message: string;
  };
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data?: {
    count: number;
  };
  error?: {
    code: string;
    message: string;
  };
}
