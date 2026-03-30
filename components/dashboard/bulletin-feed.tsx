'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EventApiService } from '@/lib/api/eventService';
import type { BulletinEvent } from '@/lib/bulletin-utils';
import { extractBulletinEvents, formatBulletinDate, sortBulletinsByNewest } from '@/lib/bulletin-utils';

interface BulletinFeedProps {
  clinicName: string;
}

const BULLETIN_PREVIEW_LIMIT = 5;

export function BulletinFeed({ clinicName }: BulletinFeedProps) {
  const [events, setEvents] = useState<BulletinEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<BulletinEvent | null>(null);

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

  const previewEvents = useMemo(() => events.slice(0, BULLETIN_PREVIEW_LIMIT), [events]);
  const activeEvent = previewEvents[currentIndex] || null;

  useEffect(() => {
    setCurrentIndex(0);
  }, [previewEvents.length]);

  const goToPrevious = () => {
    setCurrentIndex((previousIndex) => {
      if (previewEvents.length === 0) {
        return 0;
      }

      return previousIndex === 0 ? previewEvents.length - 1 : previousIndex - 1;
    });
  };

  const goToNext = () => {
    setCurrentIndex((previousIndex) => {
      if (previewEvents.length === 0) {
        return 0;
      }

      return previousIndex === previewEvents.length - 1 ? 0 : previousIndex + 1;
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Newspaper className="h-5 w-5" />
                Bulletin Board
              </CardTitle>
              <CardDescription>
                {previewEvents.length > 0
                  ? `Announcement ${currentIndex + 1} of ${previewEvents.length}`
                  : 'Latest news and announcements'}
              </CardDescription>
            </div>

            {previewEvents.length > 1 && (
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="icon" onClick={goToPrevious} aria-label="Previous bulletin">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="icon" onClick={goToNext} aria-label="Next bulletin">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
          ) : !activeEvent ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No announcements at this time
            </div>
          ) : (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setSelectedEvent(activeEvent)}
                className="w-full rounded-lg border bg-muted/20 p-4 text-left transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-base font-semibold">{activeEvent.title}</h4>
                  {activeEvent.eventDate && (
                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatBulletinDate(activeEvent.eventDate)}
                    </span>
                  )}
                </div>
                <p className="mt-3 line-clamp-5 text-sm text-muted-foreground">
                  {activeEvent.description || 'Open this bulletin to read the full announcement.'}
                </p>
                <div className="mt-4 text-sm font-medium text-primary">
                  Open full bulletin
                </div>
              </button>

              {previewEvents.length > 1 && (
                <div className="flex items-center justify-center gap-2">
                  {previewEvents.map((event, index) => (
                    <button
                      key={event.id}
                      type="button"
                      aria-label={`Go to bulletin ${index + 1}`}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-2.5 w-2.5 rounded-full transition-colors ${
                        index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedEvent)} onOpenChange={(isOpen) => !isOpen && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title || 'Bulletin'}</DialogTitle>
            <DialogDescription>
              {selectedEvent?.eventDate ? formatBulletinDate(selectedEvent.eventDate) : 'Announcement details'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedEvent?.location && (
              <p className="text-sm text-muted-foreground">
                Location: {selectedEvent.location}
              </p>
            )}
            <div className="max-h-[55vh] overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-foreground">
              {selectedEvent?.description || 'No additional details were provided for this announcement.'}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
