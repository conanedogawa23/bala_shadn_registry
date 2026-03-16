'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Newspaper } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { EventApiService } from '@/lib/api/eventService';
import type { BulletinEvent } from '@/lib/bulletin-utils';
import { extractBulletinEvents, formatBulletinDate, sortBulletinsByNewest } from '@/lib/bulletin-utils';
import { generateLink } from '@/lib/route-utils';

interface BulletinFeedProps {
  clinicName: string;
  clinicSlug: string;
}

const BULLETIN_PREVIEW_LIMIT = 5;

export function BulletinFeed({ clinicName, clinicSlug }: BulletinFeedProps) {
  const [events, setEvents] = useState<BulletinEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBulletin = async () => {
      if (!clinicName) {
        setEvents([]);
        setLoading(false);
        return;
      }

      try {
        const response = await EventApiService.getPublicEvents({ clinicName });
        const parsedEvents = sortBulletinsByNewest(
          extractBulletinEvents(response).filter(
            (event) => !event.clinicName || event.clinicName === clinicName
          )
        );

        setEvents(parsedEvents);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBulletin();
  }, [clinicName]);

  const previewEvents = events.slice(0, BULLETIN_PREVIEW_LIMIT);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              Bulletin Board
            </CardTitle>
            <CardDescription>Latest news and announcements</CardDescription>
          </div>

          <Button asChild size="sm" variant="ghost">
            <Link href={generateLink('clinic', 'bulletin', clinicSlug)}>
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
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
              {previewEvents.map((event, index) => (
                <React.Fragment key={event.id}>
                  <div className="py-3">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium">{event.title}</h4>
                      {event.eventDate && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {formatBulletinDate(event.eventDate)}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  {index < previewEvents.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
