"use client";

import React, { useState, useEffect } from "react";
import { Bell, CheckCircle, Trash2, Mail, ListTodo, DollarSign, ShoppingCart, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useClinic } from "@/lib/contexts/clinic-context";
import { formatNotificationTime, getNotificationIcon, getNotificationColor, getCategoryName } from "@/lib/utils/notificationHelpers";
import { baseApiService } from "@/lib/api/baseApiService";

interface TodoItem {
  id: string;
  type: 'payment' | 'order' | 'followup';
  title: string;
  description: string;
  date: string;
  done: boolean;
}

export default function NotificationsPage() {
  const { selectedClinic } = useClinic();
  const clinicName = selectedClinic?.name || 'bodyblissphysio';
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [activeTab, setActiveTab] = useState('notifications');
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [todoLoading, setTodoLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'todos' && clinicName) {
      setTodoLoading(true);
      Promise.all([
        baseApiService.get(`/payments?outstanding=true&clinicName=${encodeURIComponent(clinicName)}&limit=20`).catch(() => ({ data: [] })),
        baseApiService.get(`/orders?status=pending&clinicName=${encodeURIComponent(clinicName)}&limit=20`).catch(() => ({ data: [] }))
      ]).then(([paymentsRes, ordersRes]) => {
        const items: TodoItem[] = [];
        const payments = (paymentsRes as any).data || [];
        payments.forEach((p: any) => {
          items.push({
            id: `pay-${p._id}`,
            type: 'payment',
            title: `Outstanding Payment: ${p.clientName || 'Client #' + p.clientId}`,
            description: `$${(p.amounts?.totalOwed || 0).toFixed(2)} outstanding - Order #${p.orderNumber || 'N/A'}`,
            date: p.paymentDate || p.createdAt,
            done: false
          });
        });
        const orders = (ordersRes as any).data || [];
        orders.forEach((o: any) => {
          items.push({
            id: `ord-${o._id}`,
            type: 'order',
            title: `Pending Order: ${o.clientName || 'Client #' + o.clientId}`,
            description: `Order #${o.orderNumber || 'N/A'} - ${o.status}`,
            date: o.createdAt,
            done: false
          });
        });
        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTodoItems(items);
      }).finally(() => setTodoLoading(false));
    }
  }, [activeTab, clinicName]);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  } = useNotifications({
    clinicName,
    pollingInterval: 30000,
    enablePolling: true,
    page: 1,
    limit: 50,
    filters: filter === 'unread' ? { read: false } : undefined
  });

  const handleToggleRead = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(notificationId);
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      await deleteNotification(notificationId);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const filteredNotifications = notifications;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.primary }}>
            Notifications
          </h1>
          <p className="text-gray-600 mt-1">
            Stay updated with your clinic activities
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge 
              variant="secondary" 
              className="bg-red-100 text-red-800 px-3 py-1"
            >
              {unreadCount} unread
            </Badge>
          )}
          
          <Button 
            variant="outline" 
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || loading}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Mark All Read
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
            {unreadCount > 0 && <Badge variant="secondary" className="ml-1 h-5 text-xs">{unreadCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="todos" className="flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            To-Do
            {todoItems.filter(t => !t.done).length > 0 && <Badge variant="secondary" className="ml-1 h-5 text-xs">{todoItems.filter(t => !t.done).length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-6">
          {todoLoading ? (
            <Card><CardContent className="py-12 text-center"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" /><p className="text-gray-500">Loading to-do items...</p></CardContent></Card>
          ) : todoItems.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><ListTodo className="h-12 w-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">No actionable items right now</p></CardContent></Card>
          ) : (
            <div className="space-y-3">
              {todoItems.map(item => (
                <Card key={item.id} className={`shadow-sm transition-all ${item.done ? 'opacity-50' : ''}`}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <Checkbox
                      checked={item.done}
                      onCheckedChange={() => setTodoItems(prev => prev.map(t => t.id === item.id ? { ...t, done: !t.done } : t))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {item.type === 'payment' && <DollarSign className="h-4 w-4 text-red-500" />}
                        {item.type === 'order' && <ShoppingCart className="h-4 w-4 text-blue-500" />}
                        {item.type === 'followup' && <Clock className="h-4 w-4 text-yellow-500" />}
                        <h3 className={`font-medium text-sm ${item.done ? 'line-through text-gray-400' : ''}`}>{item.title}</h3>
                      </div>
                      <p className="text-xs text-gray-500">{item.description}</p>
                      {item.date && <p className="text-xs text-gray-400 mt-1">{new Date(item.date).toLocaleDateString()}</p>}
                    </div>
                    <Badge variant={item.type === 'payment' ? 'destructive' : 'outline'} className="text-xs">{item.type}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
      <div className="mb-6">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            onClick={() => setFilter('unread')}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Unread ({unreadCount})
          </Button>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="py-4">
            <p className="text-red-600 text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshNotifications}
              className="mt-2"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && notifications.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading notifications...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const colors = getNotificationColor(notification.type);
              const isUnread = !notification.read;

              return (
                <Card 
                  key={notification._id}
                  className={`shadow-sm transition-all hover:shadow-md ${
                    isUnread ? 'ring-2 ring-blue-100 bg-blue-50/30' : ''
                  }`}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <IconComponent className={`h-5 w-5 ${colors.icon}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold text-gray-900">
                                {notification.title}
                              </h3>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${colors.badge}`}
                              >
                                {notification.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getCategoryName(notification.category || 'general')}
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatNotificationTime(notification.createdAt)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleRead(notification._id, notification.read)}
                              className="h-8 w-8 p-0"
                              title={notification.read ? 'Mark as unread' : 'Mark as read'}
                            >
                              {notification.read ? (
                                <Mail className="h-4 w-4 text-gray-500" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-gray-500" />
                              )}
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(notification._id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              title="Delete notification"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 