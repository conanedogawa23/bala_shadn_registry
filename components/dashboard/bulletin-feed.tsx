'use client';

import React, { useState, useEffect } from 'react';
import { Newspaper } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { EventApiService } from '@/lib/api/eventService';

interface BulletinEvent {
  _id: string;
  title: string;
  description?: string;
  eventDate?: string;
  location?: string;
}

export function BulletinFeed() {
  const [events, setEvents] = useState<BulletinEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBulletin = async () => {
      try {
        const response = await EventApiService.getPublicEvents();
        const data = response?.data as any;
        setEvents(data?.events || data || []);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBulletin();
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Bulletin Board
        </CardTitle>
        <CardDescription>Latest news and announcements</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground text-center py-4">Loading...</div>
        ) : events.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            No announcements at this time
          </div>
        ) : (
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-1">
              {events.map((event, index) => (
                <React.Fragment key={event._id}>
                  <div className="py-3">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium">{event.title}</h4>
                      {event.eventDate && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {formatDate(event.eventDate)}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  {index < events.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
