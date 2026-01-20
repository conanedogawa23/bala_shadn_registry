"use client";

import React from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { formatNotificationTime, getNotificationIcon, getNotificationColor } from '@/lib/utils/notificationHelpers';
import { generateLink } from '@/lib/route-utils';

interface NotificationDropdownProps {
  clinicName: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * NotificationDropdown Component
 * Displays latest 2 notifications in a dropdown menu
 */
export function NotificationDropdown({ clinicName, isOpen, onClose }: NotificationDropdownProps) {
  const { latestNotifications, unreadCount, markAsRead, loading } = useNotifications({
    clinicName,
    pollingInterval: 30000,
    enablePolling: true
  });

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
        {unreadCount > 0 && (
          <span className="text-xs bg-red-100 text-red-800 py-0.5 px-2 rounded-full font-medium">
            {unreadCount} new
          </span>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            Loading notifications...
          </div>
        ) : latestNotifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No notifications</p>
          </div>
        ) : (
          latestNotifications.map((notification) => {
            const IconComponent = getNotificationIcon(notification.type);
            const colors = getNotificationColor(notification.type);
            const isUnread = !notification.read;

            return (
              <div
                key={notification._id}
                className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  isUnread ? 'bg-blue-50/30' : ''
                }`}
                onClick={() => handleNotificationClick(notification._id)}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    <IconComponent className={`h-5 w-5 ${colors.icon}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                  </div>

                  {/* Unread indicator */}
                  {isUnread && (
                    <div className="flex-shrink-0">
                      <span className="block h-2 w-2 rounded-full bg-blue-500"></span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer - View All Link */}
      <div className="px-4 py-2 text-center border-t border-gray-100">
        <Link
          href={generateLink('clinic', 'notifications', clinicName)}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          onClick={onClose}
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}

export default NotificationDropdown;
