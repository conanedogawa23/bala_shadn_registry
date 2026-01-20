import { BaseApiService } from './baseApiService';
import type {
  Notification,
  NotificationFilters,
  NotificationResponse,
  UnreadCountResponse
} from '../types/notification';
import { logger } from '../utils/logger';

/**
 * NotificationService
 * Handles all notification-related API calls
 */
class NotificationServiceClass extends BaseApiService {
  /**
   * Get notifications for a clinic with filtering and pagination
   */
  static async getNotifications(
    clinicName: string,
    page: number = 1,
    limit: number = 20,
    filters?: NotificationFilters
  ): Promise<NotificationResponse> {
    try {
      const params = new URLSearchParams({
        clinicName,
        page: page.toString(),
        limit: limit.toString()
      });

      if (filters?.read !== undefined) {
        params.append('read', filters.read.toString());
      }

      if (filters?.category) {
        params.append('category', filters.category);
      }

      return await this.request<Notification[]>(
        `/notifications?${params.toString()}`,
        'GET'
      );
    } catch (error) {
      logger.error('[NotificationService] Error getting notifications:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch notifications'
        }
      };
    }
  }

  /**
   * Get latest notifications for a clinic
   */
  static async getLatestNotifications(
    clinicName: string,
    limit: number = 2
  ): Promise<NotificationResponse> {
    try {
      const params = new URLSearchParams({
        clinicName,
        limit: limit.toString()
      });

      return await this.request<Notification[]>(
        `/notifications/latest?${params.toString()}`,
        'GET'
      );
    } catch (error) {
      logger.error('[NotificationService] Error getting latest notifications:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch latest notifications'
        }
      };
    }
  }

  /**
   * Get unread notification count for a clinic
   */
  static async getUnreadCount(clinicName: string): Promise<UnreadCountResponse> {
    try {
      const params = new URLSearchParams({
        clinicName
      });

      return await this.request<{ count: number }>(
        `/notifications/unread/count?${params.toString()}`,
        'GET'
      );
    } catch (error) {
      logger.error('[NotificationService] Error getting unread count:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch unread count'
        }
      };
    }
  }

  /**
   * Get a single notification by ID
   */
  static async getNotificationById(notificationId: string): Promise<NotificationResponse> {
    try {
      return await this.request<Notification>(
        `/notifications/${notificationId}`,
        'GET'
      );
    } catch (error) {
      logger.error('[NotificationService] Error getting notification by ID:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch notification'
        }
      };
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: string): Promise<NotificationResponse> {
    try {
      return await this.request<Notification>(
        `/notifications/${notificationId}/read`,
        'PUT'
      );
    } catch (error) {
      logger.error('[NotificationService] Error marking notification as read:', error);
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to mark notification as read'
        }
      };
    }
  }

  /**
   * Mark all notifications as read for a clinic
   */
  static async markAllAsRead(clinicName: string): Promise<NotificationResponse> {
    try {
      return await this.request<{ count: number }>(
        '/notifications/read-all',
        'PUT',
        { clinicName }
      );
    } catch (error) {
      logger.error('[NotificationService] Error marking all notifications as read:', error);
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to mark all notifications as read'
        }
      };
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<NotificationResponse> {
    try {
      return await this.request(
        `/notifications/${notificationId}`,
        'DELETE'
      );
    } catch (error) {
      logger.error('[NotificationService] Error deleting notification:', error);
      return {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete notification'
        }
      };
    }
  }
}

export const NotificationService = NotificationServiceClass;
export default NotificationService;
