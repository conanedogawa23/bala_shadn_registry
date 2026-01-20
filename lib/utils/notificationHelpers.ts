import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';

/**
 * Format timestamp to relative time (e.g., "2 minutes ago")
 */
export function formatNotificationTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Get icon component for notification type
 */
export function getNotificationIcon(type: 'info' | 'success' | 'warning' | 'error') {
  switch (type) {
    case 'success':
      return CheckCircle;
    case 'warning':
      return AlertCircle;
    case 'error':
      return XCircle;
    case 'info':
    default:
      return Info;
  }
}

/**
 * Get color classes for notification type
 */
export function getNotificationColor(type: 'info' | 'success' | 'warning' | 'error'): {
  badge: string;
  icon: string;
  bg: string;
} {
  switch (type) {
    case 'success':
      return {
        badge: 'bg-green-100 text-green-800',
        icon: 'text-green-500',
        bg: 'bg-green-50'
      };
    case 'warning':
      return {
        badge: 'bg-yellow-100 text-yellow-800',
        icon: 'text-yellow-500',
        bg: 'bg-yellow-50'
      };
    case 'error':
      return {
        badge: 'bg-red-100 text-red-800',
        icon: 'text-red-500',
        bg: 'bg-red-50'
      };
    case 'info':
    default:
      return {
        badge: 'bg-blue-100 text-blue-800',
        icon: 'text-blue-500',
        bg: 'bg-blue-50'
      };
  }
}

/**
 * Truncate long messages to specified length
 */
export function truncateMessage(message: string, maxLength: number = 100): string {
  if (message.length <= maxLength) {
    return message;
  }
  return message.substring(0, maxLength) + '...';
}

/**
 * Get category display name
 */
export function getCategoryName(category: string): string {
  switch (category) {
    case 'payment':
      return 'Payment';
    case 'order':
      return 'Order';
    case 'appointment':
      return 'Appointment';
    default:
      return category.charAt(0).toUpperCase() + category.slice(1);
  }
}

/**
 * Check if notification is unread by user
 */
export function isNotificationUnread(notification: { readBy: string[] }, userId?: string): boolean {
  if (!userId) return !notification.readBy || notification.readBy.length === 0;
  return !notification.readBy.includes(userId);
}
