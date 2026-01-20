import { useState, useEffect, useCallback, useRef } from 'react';
import NotificationService from '../api/notificationService';
import type { Notification, NotificationFilters } from '../types/notification';
import { logger } from '../utils/logger';

interface UseNotificationsOptions {
  clinicName: string;
  pollingInterval?: number; // in milliseconds, default 30000 (30 seconds)
  page?: number;
  limit?: number;
  filters?: NotificationFilters;
  enablePolling?: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  latestNotifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * useNotifications Hook
 * Manages notification state with automatic polling
 */
export function useNotifications(options: UseNotificationsOptions): UseNotificationsReturn {
  const {
    clinicName,
    pollingInterval = 30000, // Default 30 seconds
    page = 1,
    limit = 20,
    filters,
    enablePolling = true
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [latestNotifications, setLatestNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseNotificationsReturn['pagination']>();

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Fetch all notifications
   */
  const fetchNotifications = useCallback(async () => {
    if (!clinicName) {
      return;
    }

    try {
      const response = await NotificationService.getNotifications(
        clinicName,
        page,
        limit,
        filters
      );

      if (!isMountedRef.current) return;

      if (response.success && response.data) {
        setNotifications(Array.isArray(response.data) ? response.data : [response.data]);
        if (response.pagination) {
          setPagination(response.pagination);
        }
        setError(null);
      } else {
        setError(response.error?.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      logger.error('[useNotifications] Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    }
  }, [clinicName, page, limit, filters]);

  /**
   * Fetch latest notifications (for dropdown)
   */
  const fetchLatestNotifications = useCallback(async () => {
    if (!clinicName) {
      return;
    }

    try {
      const response = await NotificationService.getLatestNotifications(clinicName, 2);

      if (!isMountedRef.current) return;

      if (response.success && response.data) {
        setLatestNotifications(Array.isArray(response.data) ? response.data : [response.data]);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      logger.error('[useNotifications] Error fetching latest notifications:', err);
    }
  }, [clinicName]);

  /**
   * Fetch unread count
   */
  const fetchUnreadCount = useCallback(async () => {
    if (!clinicName) {
      return;
    }

    try {
      const response = await NotificationService.getUnreadCount(clinicName);

      if (!isMountedRef.current) return;

      if (response.success && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      logger.error('[useNotifications] Error fetching unread count:', err);
    }
  }, [clinicName]);

  /**
   * Refresh all notification data
   */
  const refreshNotifications = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchNotifications(),
      fetchLatestNotifications(),
      fetchUnreadCount()
    ]);
    if (isMountedRef.current) {
      setLoading(false);
    }
  }, [fetchNotifications, fetchLatestNotifications, fetchUnreadCount]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await NotificationService.markAsRead(id);

      if (response.success) {
        // Update local state
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === id ? { ...notif, read: true } : notif
          )
        );
        setLatestNotifications(prev =>
          prev.map(notif =>
            notif._id === id ? { ...notif, read: true } : notif
          )
        );
        // Refresh unread count
        await fetchUnreadCount();
      }
    } catch (err) {
      logger.error('[useNotifications] Error marking notification as read:', err);
    }
  }, [fetchUnreadCount]);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    if (!clinicName) {
      return;
    }

    try {
      const response = await NotificationService.markAllAsRead(clinicName);

      if (response.success) {
        // Refresh all data
        await refreshNotifications();
      }
    } catch (err) {
      logger.error('[useNotifications] Error marking all notifications as read:', err);
    }
  }, [clinicName, refreshNotifications]);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(async (id: string) => {
    try {
      const response = await NotificationService.deleteNotification(id);

      if (response.success) {
        // Update local state
        setNotifications(prev => prev.filter(notif => notif._id !== id));
        setLatestNotifications(prev => prev.filter(notif => notif._id !== id));
        // Refresh unread count
        await fetchUnreadCount();
      }
    } catch (err) {
      logger.error('[useNotifications] Error deleting notification:', err);
    }
  }, [fetchUnreadCount]);

  // Initial load
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // Setup polling
  useEffect(() => {
    if (!enablePolling || !clinicName) {
      return;
    }

    // Clear existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Setup new polling interval
    pollingIntervalRef.current = setInterval(() => {
      fetchLatestNotifications();
      fetchUnreadCount();
    }, pollingInterval);

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [clinicName, pollingInterval, enablePolling, fetchLatestNotifications, fetchUnreadCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return {
    notifications,
    latestNotifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    pagination
  };
}

export default useNotifications;
