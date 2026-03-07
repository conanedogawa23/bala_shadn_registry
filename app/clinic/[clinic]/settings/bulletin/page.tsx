'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Trash2
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useClinic } from '@/lib/contexts/clinic-context';
import { EventApiService } from '@/lib/api/eventService';
import { findClinicBySlug, generateLink, getBackendClinicName } from '@/lib/route-utils';

type BulletinEvent = {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  isPublic: boolean;
  isApproved: boolean;
  clinicName?: string;
};

type BulletinFormState = {
  title: string;
  description: string;
  eventDate: string;
  isPublic: boolean;
};

const DEFAULT_FORM_STATE: BulletinFormState = {
  title: '',
  description: '',
  eventDate: new Date().toISOString().split('T')[0],
  isPublic: true
};

const normalizeEventDate = (rawDate: unknown): string => {
  const parsedDate = new Date(String(rawDate || ''));
  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }
  return parsedDate.toISOString();
};

const parseEventRecord = (rawEvent: Record<string, unknown>): BulletinEvent | null => {
  const eventId = String(rawEvent.id || rawEvent._id || '');
  if (!eventId) {
    return null;
  }

  return {
    id: eventId,
    title: String(rawEvent.title || 'Untitled Event'),
    description: rawEvent.description ? String(rawEvent.description) : undefined,
    eventDate: normalizeEventDate(rawEvent.eventDate),
    isPublic: Boolean(rawEvent.isPublic),
    isApproved: Boolean(rawEvent.isApproved),
    clinicName: rawEvent.clientClinicName ? String(rawEvent.clientClinicName) : undefined
  };
};

const extractEventsFromResponse = (response: unknown): BulletinEvent[] => {
  if (!response || typeof response !== 'object') {
    return [];
  }

  const typedResponse = response as Record<string, unknown>;
  let eventCandidates: unknown[] = [];

  if (Array.isArray(typedResponse.data)) {
    eventCandidates = typedResponse.data;
  } else if (typedResponse.data && typeof typedResponse.data === 'object') {
    const nestedData = typedResponse.data as Record<string, unknown>;
    if (Array.isArray(nestedData.events)) {
      eventCandidates = nestedData.events;
    }
  } else if (Array.isArray(typedResponse.events)) {
    eventCandidates = typedResponse.events;
  }

  return eventCandidates
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map(parseEventRecord)
    .filter((event): event is BulletinEvent => Boolean(event));
};

const formatDateForInput = (isoDate: string): string => {
  if (!isoDate) {
    return new Date().toISOString().split('T')[0];
  }

  const parsedDate = new Date(isoDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return new Date().toISOString().split('T')[0];
  }

  return parsedDate.toISOString().split('T')[0];
};

const formatDateForDisplay = (isoDate: string): string => {
  if (!isoDate) {
    return '-';
  }

  const parsedDate = new Date(isoDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return '-';
  }

  return parsedDate.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function BulletinSettingsPage() {
  const params = useParams();
  const clinicSlug = Array.isArray(params.clinic) ? params.clinic[0] : (params.clinic as string);
  const { availableClinics } = useClinic();

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<BulletinEvent | null>(null);
  const [form, setForm] = useState<BulletinFormState>(DEFAULT_FORM_STATE);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await EventApiService.getEvents(
        backendClinicName ? { clinicName: backendClinicName } : {},
        1,
        250
      );

      const parsedEvents = extractEventsFromResponse(response)
        .filter((event) => !backendClinicName || !event.clinicName || event.clinicName === backendClinicName)
        .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

      setEvents(parsedEvents);
    } catch (fetchError) {
      setEvents([]);
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load bulletin posts');
    } finally {
      setLoading(false);
    }
  }, [backendClinicName]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const openCreateDialog = () => {
    setEditingEvent(null);
    setForm({
      ...DEFAULT_FORM_STATE,
      eventDate: new Date().toISOString().split('T')[0]
    });
    setDialogOpen(true);
  };

  const openEditDialog = (event: BulletinEvent) => {
    setEditingEvent(event);
    setForm({
      title: event.title,
      description: event.description || '',
      eventDate: formatDateForInput(event.eventDate),
      isPublic: event.isPublic
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!form.eventDate) {
      setError('Event date is required');
      return;
    }

    setSaving(true);
    setError(null);

    const eventPayload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      eventDate: new Date(`${form.eventDate}T00:00:00`).toISOString(),
      isPublic: form.isPublic,
      clientClinicName: backendClinicName || undefined
    };

    try {
      if (editingEvent) {
        await EventApiService.updateEvent(editingEvent.id, eventPayload);
      } else {
        await EventApiService.createEvent(eventPayload);
      }

      setDialogOpen(false);
      setEditingEvent(null);
      setForm(DEFAULT_FORM_STATE);
      await fetchEvents();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save bulletin post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (event: BulletinEvent) => {
    const confirmed = window.confirm(`Delete bulletin post "${event.title}"?`);
    if (!confirmed) {
      return;
    }

    setError(null);
    try {
      await EventApiService.deleteEvent(event.id);
      await fetchEvents();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete bulletin post');
    }
  };

  const handleApprove = async (event: BulletinEvent) => {
    if (event.isApproved) {
      return;
    }

    setError(null);
    try {
      await EventApiService.approveEvent(event.id);
      await fetchEvents();
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : 'Failed to approve bulletin post');
    }
  };

  const handleToggleVisibility = async (event: BulletinEvent) => {
    setError(null);
    try {
      await EventApiService.toggleEventVisibility(event.id);
      await fetchEvents();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'Failed to toggle post visibility');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link href={generateLink('clinic', 'settings', clinicSlug)}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Bulletin Board</h1>
            <p className="text-sm text-muted-foreground">
              Manage clinic announcements for {clinicDisplayName}
            </p>
          </div>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Post
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Bulletin Posts</CardTitle>
          <CardDescription>
            {events.length} post{events.length !== 1 ? 's' : ''} in this clinic feed
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No bulletin posts found</p>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead className="w-[300px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="font-medium">{event.title}</div>
                        {event.description && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {event.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{formatDateForDisplay(event.eventDate)}</TableCell>
                      <TableCell>
                        <Badge variant={event.isPublic ? 'default' : 'outline'}>
                          {event.isPublic ? 'Public' : 'Private'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={event.isApproved ? 'default' : 'secondary'}>
                          {event.isApproved ? 'Approved' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(event)}>
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(event)}
                            disabled={event.isApproved}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            {event.isApproved ? 'Approved' : 'Approve'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleVisibility(event)}
                          >
                            {event.isPublic ? (
                              <EyeOff className="h-4 w-4 mr-1" />
                            ) : (
                              <Eye className="h-4 w-4 mr-1" />
                            )}
                            {event.isPublic ? 'Make Private' : 'Make Public'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(event)}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Bulletin Post' : 'Add Bulletin Post'}</DialogTitle>
            <DialogDescription>
              Configure announcement details and visibility.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="bulletin-title">Title *</Label>
              <Input
                id="bulletin-title"
                value={form.title}
                onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))}
                placeholder="Enter bulletin title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulletin-date">Event Date *</Label>
              <Input
                id="bulletin-date"
                type="date"
                value={form.eventDate}
                onChange={(event) => setForm((previous) => ({ ...previous, eventDate: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulletin-description">Description</Label>
              <Textarea
                id="bulletin-description"
                value={form.description}
                onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
                placeholder="Enter announcement details"
                rows={4}
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.isPublic}
                onCheckedChange={(checked) =>
                  setForm((previous) => ({ ...previous, isPublic: checked === true }))
                }
              />
              Make this post public
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingEvent ? (
                'Update Post'
              ) : (
                'Create Post'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
