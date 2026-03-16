export interface BulletinEvent {
  id: string;
  title: string;
  description?: string;
  eventDate?: string;
  location?: string;
  clinicName?: string;
}

const parseBulletinEvent = (rawEvent: Record<string, unknown>): BulletinEvent | null => {
  const eventId = String(rawEvent.id || rawEvent._id || '');
  if (!eventId) {
    return null;
  }

  const clientRecord =
    rawEvent.client && typeof rawEvent.client === 'object'
      ? (rawEvent.client as Record<string, unknown>)
      : undefined;

  return {
    id: eventId,
    title: String(rawEvent.title || 'Untitled Event'),
    description: rawEvent.description ? String(rawEvent.description) : undefined,
    eventDate: rawEvent.eventDate ? String(rawEvent.eventDate) : undefined,
    location: rawEvent.location ? String(rawEvent.location) : undefined,
    clinicName:
      typeof rawEvent.clientClinicName === 'string'
        ? rawEvent.clientClinicName
        : typeof clientRecord?.clinicName === 'string'
          ? clientRecord.clinicName
          : undefined
  };
};

export const extractBulletinEvents = (response: unknown): BulletinEvent[] => {
  if (!response || typeof response !== 'object') {
    return [];
  }

  const typedResponse = response as Record<string, unknown>;
  const responseData =
    typedResponse.data && typeof typedResponse.data === 'object'
      ? (typedResponse.data as Record<string, unknown>)
      : undefined;

  const eventCandidates = Array.isArray(responseData?.events)
    ? responseData.events
    : Array.isArray(typedResponse.data)
      ? typedResponse.data
      : [];

  return eventCandidates
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map(parseBulletinEvent)
    .filter((event): event is BulletinEvent => Boolean(event));
};

export const formatBulletinDate = (dateStr?: string): string => {
  if (!dateStr) {
    return '';
  }

  try {
    return new Date(dateStr).toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return '';
  }
};

export const sortBulletinsByNewest = (events: BulletinEvent[]): BulletinEvent[] => (
  [...events].sort((firstEvent, secondEvent) => {
    const firstTimestamp = firstEvent.eventDate ? new Date(firstEvent.eventDate).getTime() : 0;
    const secondTimestamp = secondEvent.eventDate ? new Date(secondEvent.eventDate).getTime() : 0;

    return secondTimestamp - firstTimestamp;
  })
);
