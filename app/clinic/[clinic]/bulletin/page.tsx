'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2, MapPin, Newspaper } from 'lucide-react';

import InvalidClinicError from '@/components/error/invalid-clinic-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { BulletinEvent } from '@/lib/bulletin-utils';
import { extractBulletinEvents, formatBulletinDate, sortBulletinsByNewest } from '@/lib/bulletin-utils';
import { useClinic } from '@/lib/contexts/clinic-context';
import { EventApiService } from '@/lib/api/eventService';
import { findClinicBySlug, generateLink, getBackendClinicName } from '@/lib/route-utils';

export default function ClinicBulletinPage() {
  const params = useParams();
  const clinicSlug = Array.isArray(params.clinic) ? params.clinic[0] : (params.clinic as string);
  const { availableClinics, loading: clinicLoading, error: clinicError } = useClinic();

  const clinic = useMemo(() => {
    if (!clinicSlug) {
      return undefined;
    }

    return findClinicBySlug(availableClinics, clinicSlug);
  }, [availableClinics, clinicSlug]);

  const backendClinicName = useMemo(() => getBackendClinicName(clinic, ''), [clinic]);
  const clinicDisplayName = clinic?.displayName || clinic?.name || clinicSlug;

  const [events, setEvents] = useState<BulletinEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBulletins = async () => {
      if (!backendClinicName) {
        setEvents([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await EventApiService.getPublicEvents({ clinicName: backendClinicName });
        const parsedEvents = sortBulletinsByNewest(
          extractBulletinEvents(response).filter(
            (event) => !event.clinicName || event.clinicName === backendClinicName
          )
        );

        setEvents(parsedEvents);
      } catch (fetchError) {
        setEvents([]);
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load bulletin posts');
      } finally {
        setLoading(false);
      }
    };

    void fetchBulletins();
  }, [backendClinicName]);

  if (clinicLoading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (clinicError || !clinic) {
    return <InvalidClinicError clinicSlug={clinicSlug} />;
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href={generateLink('clinic', '', clinicSlug)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Newspaper className="h-6 w-6" />
              Bulletin Board
            </h1>
            <p className="text-sm text-muted-foreground">
              All public announcements for {clinicDisplayName}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Clinic Bulletins</CardTitle>
          <CardDescription>
            {events.length} bulletin post{events.length !== 1 ? 's' : ''} available for this clinic
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No bulletin posts found for this clinic</p>
          ) : (
            <ScrollArea className="max-h-[65vh] pr-4">
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="rounded-lg border p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="space-y-2">
                        <h2 className="text-base font-semibold">{event.title}</h2>

                        {event.description && (
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {event.description}
                          </p>
                        )}

                        {event.location && (
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.location}
                          </p>
                        )}
                      </div>

                      {event.eventDate && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap sm:text-sm">
                          {formatBulletinDate(event.eventDate)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
