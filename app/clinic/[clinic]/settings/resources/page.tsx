'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Building,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
  Wrench
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useClinic } from '@/lib/contexts/clinic-context';
import { ResourceApiService } from '@/lib/api/resourceService';
import { findClinicBySlug, generateLink, getBackendClinicName } from '@/lib/route-utils';

type ResourceType = 'practitioner' | 'service' | 'equipment' | 'room';
type ResourceTypeFilter = 'all' | ResourceType;
type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface DayAvailability {
  start: string;
  end: string;
  available: boolean;
}

type WeeklyAvailability = Record<DayKey, DayAvailability>;

interface ResourceRecord {
  id?: string | number;
  resourceId?: number;
  resourceName?: string;
  name?: string;
  fullName?: string;
  type: ResourceType;
  color?: string;
  practitioner?: {
    firstName?: string;
    lastName?: string;
    credentials?: string;
    licenseNumber?: string;
    specialties?: string[];
    email?: string;
    phone?: string;
  };
  service?: {
    category?: string;
    duration?: number;
    price?: number;
    description?: string;
    requiresEquipment?: string[];
  };
  clinics?: string[];
  isActive: boolean;
  isBookable: boolean;
  requiresApproval?: boolean;
  availability?: WeeklyAvailability;
}

interface ResourceFormState {
  resourceName: string;
  type: ResourceType;
  color: string;
  clinics: string[];
  isActive: boolean;
  isBookable: boolean;
  requiresApproval: boolean;
  practitioner: {
    firstName: string;
    lastName: string;
    credentials: string;
    licenseNumber: string;
    specialties: string;
    email: string;
    phone: string;
  };
  service: {
    category: string;
    duration: string;
    price: string;
    description: string;
    requiresEquipment: string;
  };
  availability: WeeklyAvailability;
}

type ResourceCreatePayload = Parameters<typeof ResourceApiService.createResource>[0];
type ResourceUpdatePayload = Parameters<typeof ResourceApiService.updateResource>[1];

const RESOURCE_TYPE_OPTIONS: Array<{ value: ResourceTypeFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'practitioner', label: 'Practitioners' },
  { value: 'service', label: 'Services' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'room', label: 'Rooms' }
];

const DAY_OPTIONS: Array<{ key: DayKey; label: string }> = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

const DEFAULT_AVAILABILITY: WeeklyAvailability = {
  monday: { start: '09:00', end: '17:00', available: true },
  tuesday: { start: '09:00', end: '17:00', available: true },
  wednesday: { start: '09:00', end: '17:00', available: true },
  thursday: { start: '09:00', end: '17:00', available: true },
  friday: { start: '09:00', end: '17:00', available: true },
  saturday: { start: '09:00', end: '17:00', available: false },
  sunday: { start: '09:00', end: '17:00', available: false }
};

const cloneAvailability = (): WeeklyAvailability => ({
  monday: { ...DEFAULT_AVAILABILITY.monday },
  tuesday: { ...DEFAULT_AVAILABILITY.tuesday },
  wednesday: { ...DEFAULT_AVAILABILITY.wednesday },
  thursday: { ...DEFAULT_AVAILABILITY.thursday },
  friday: { ...DEFAULT_AVAILABILITY.friday },
  saturday: { ...DEFAULT_AVAILABILITY.saturday },
  sunday: { ...DEFAULT_AVAILABILITY.sunday }
});

const splitCommaSeparated = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const getResourceNumericId = (resource: ResourceRecord): number | null => {
  const candidate = resource.resourceId ?? resource.id;
  const parsed = Number(candidate);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const getResourceDisplayName = (resource: ResourceRecord): string =>
  resource.fullName || resource.resourceName || resource.name || 'Unnamed resource';

const getTypeBadgeLabel = (type: ResourceType): string => {
  if (type === 'practitioner') return 'Practitioner';
  if (type === 'service') return 'Service';
  if (type === 'equipment') return 'Equipment';
  return 'Room';
};

const getDefaultFormState = (defaultClinicName?: string): ResourceFormState => ({
  resourceName: '',
  type: 'practitioner',
  color: '#2563EB',
  clinics: defaultClinicName ? [defaultClinicName] : [],
  isActive: true,
  isBookable: true,
  requiresApproval: false,
  practitioner: {
    firstName: '',
    lastName: '',
    credentials: '',
    licenseNumber: '',
    specialties: '',
    email: '',
    phone: ''
  },
  service: {
    category: '',
    duration: '30',
    price: '',
    description: '',
    requiresEquipment: ''
  },
  availability: cloneAvailability()
});

const mapResourceToFormState = (resource: ResourceRecord, defaultClinicName?: string): ResourceFormState => ({
  resourceName: resource.resourceName || resource.name || '',
  type: resource.type,
  color: resource.color || '#2563EB',
  clinics: resource.clinics?.length ? resource.clinics : defaultClinicName ? [defaultClinicName] : [],
  isActive: resource.isActive !== false,
  isBookable: resource.isBookable !== false,
  requiresApproval: resource.requiresApproval === true,
  practitioner: {
    firstName: resource.practitioner?.firstName || '',
    lastName: resource.practitioner?.lastName || '',
    credentials: resource.practitioner?.credentials || '',
    licenseNumber: resource.practitioner?.licenseNumber || '',
    specialties: (resource.practitioner?.specialties || []).join(', '),
    email: resource.practitioner?.email || '',
    phone: resource.practitioner?.phone || ''
  },
  service: {
    category: resource.service?.category || '',
    duration: String(resource.service?.duration || 30),
    price: resource.service?.price !== undefined ? String(resource.service.price) : '',
    description: resource.service?.description || '',
    requiresEquipment: (resource.service?.requiresEquipment || []).join(', ')
  },
  availability: resource.availability
    ? {
        monday: { ...resource.availability.monday },
        tuesday: { ...resource.availability.tuesday },
        wednesday: { ...resource.availability.wednesday },
        thursday: { ...resource.availability.thursday },
        friday: { ...resource.availability.friday },
        saturday: { ...resource.availability.saturday },
        sunday: { ...resource.availability.sunday }
      }
    : cloneAvailability()
});

const getTypeIcon = (type: ResourceType) => {
  if (type === 'practitioner') return <User className="h-4 w-4" />;
  if (type === 'service') return <Wrench className="h-4 w-4" />;
  return <Building className="h-4 w-4" />;
};

const generateResourceId = (): number => Date.now() * 1000 + Math.floor(Math.random() * 1000);

export default function ResourcesPage() {
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

  const clinicOptions = useMemo(() => {
    const names = new Set<string>();
    for (const item of availableClinics) {
      const clinicName = getBackendClinicName(item, item.name);
      if (clinicName) {
        names.add(clinicName);
      }
    }
    if (backendClinicName) {
      names.add(backendClinicName);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [availableClinics, backendClinicName]);

  const [resources, setResources] = useState<ResourceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ResourceTypeFilter>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);
  const [loadingEditResource, setLoadingEditResource] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<ResourceFormState>(() => getDefaultFormState());

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryBase = {
        clinicName: backendClinicName || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        limit: 1000
      };

      const [activeResponse, inactiveResponse] = await Promise.all([
        ResourceApiService.getAllResources({ ...queryBase, isActive: true }),
        ResourceApiService.getAllResources({ ...queryBase, isActive: false })
      ]);

      const merged = [...(activeResponse.resources || []), ...(inactiveResponse.resources || [])] as ResourceRecord[];

      const dedupedMap = new Map<number, ResourceRecord>();
      for (const resource of merged) {
        const resourceId = getResourceNumericId(resource);
        if (resourceId !== null) {
          dedupedMap.set(resourceId, resource);
        }
      }

      const nextResources = Array.from(dedupedMap.values()).sort((a, b) =>
        getResourceDisplayName(a).localeCompare(getResourceDisplayName(b))
      );

      setResources(nextResources);
    } catch (fetchError: unknown) {
      setResources([]);
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  }, [backendClinicName, typeFilter]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const filteredResources = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return resources;
    }

    return resources.filter((resource) => {
      const name = getResourceDisplayName(resource).toLowerCase();
      const type = resource.type.toLowerCase();
      const clinics = (resource.clinics || []).join(' ').toLowerCase();
      const credentials = resource.practitioner?.credentials?.toLowerCase() || '';
      const specialties = (resource.practitioner?.specialties || []).join(' ').toLowerCase();
      const serviceCategory = resource.service?.category?.toLowerCase() || '';

      return (
        name.includes(term) ||
        type.includes(term) ||
        clinics.includes(term) ||
        credentials.includes(term) ||
        specialties.includes(term) ||
        serviceCategory.includes(term)
      );
    });
  }, [resources, search]);

  const openNew = () => {
    setEditingResourceId(null);
    setFormError(null);
    setForm(getDefaultFormState(backendClinicName || undefined));
    setDialogOpen(true);
  };

  const openEdit = async (resource: ResourceRecord) => {
    const resourceId = getResourceNumericId(resource);
    if (!resourceId) {
      setError('Could not determine resource ID for edit.');
      return;
    }

    setEditingResourceId(resourceId);
    setFormError(null);
    setLoadingEditResource(true);
    setDialogOpen(true);

    try {
      const fullResource = await ResourceApiService.getResourceById(resourceId);
      setForm(mapResourceToFormState(fullResource as unknown as ResourceRecord, backendClinicName || undefined));
    } catch (editError: unknown) {
      setFormError(editError instanceof Error ? editError.message : 'Failed to load resource details');
    } finally {
      setLoadingEditResource(false);
    }
  };

  const handleClinicToggle = (clinicName: string, checked: boolean) => {
    setForm((previous) => {
      const selected = new Set(previous.clinics);
      if (checked) {
        selected.add(clinicName);
      } else {
        selected.delete(clinicName);
      }
      return {
        ...previous,
        clinics: Array.from(selected)
      };
    });
  };

  const handleAvailabilityToggle = (day: DayKey, checked: boolean) => {
    setForm((previous) => ({
      ...previous,
      availability: {
        ...previous.availability,
        [day]: {
          ...previous.availability[day],
          available: checked
        }
      }
    }));
  };

  const handleAvailabilityTimeChange = (day: DayKey, field: 'start' | 'end', value: string) => {
    setForm((previous) => ({
      ...previous,
      availability: {
        ...previous.availability,
        [day]: {
          ...previous.availability[day],
          [field]: value
        }
      }
    }));
  };

  const validateForm = (): string | null => {
    if (!form.resourceName.trim()) {
      return 'Resource name is required.';
    }

    if (form.type === 'service') {
      if (!form.service.category.trim()) {
        return 'Service category is required.';
      }
      const duration = Number(form.service.duration);
      if (!Number.isInteger(duration) || duration < 15 || duration > 480) {
        return 'Service duration must be between 15 and 480 minutes.';
      }
    }

    for (const { key, label } of DAY_OPTIONS) {
      const dayConfig = form.availability[key];
      if (!dayConfig.available) {
        continue;
      }
      if (!dayConfig.start || !dayConfig.end) {
        return `${label} availability requires both start and end times.`;
      }
      if (dayConfig.start >= dayConfig.end) {
        return `${label} start time must be before end time.`;
      }
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    setFormError(null);
    setError(null);

    const clinics = form.clinics.length > 0 ? form.clinics : backendClinicName ? [backendClinicName] : [];

    const payload: ResourceUpdatePayload = {
      resourceName: form.resourceName.trim(),
      type: form.type,
      color: form.color.trim() || undefined,
      clinics,
      isActive: form.isActive,
      isBookable: form.isBookable,
      requiresApproval: form.requiresApproval,
      availability: form.availability
    };

    if (form.type === 'practitioner') {
      payload.practitioner = {
        firstName: form.practitioner.firstName.trim() || undefined,
        lastName: form.practitioner.lastName.trim() || undefined,
        credentials: form.practitioner.credentials.trim() || undefined,
        licenseNumber: form.practitioner.licenseNumber.trim() || undefined,
        specialties: splitCommaSeparated(form.practitioner.specialties),
        email: form.practitioner.email.trim() || undefined,
        phone: form.practitioner.phone.trim() || undefined
      };
    }

    if (form.type === 'service') {
      payload.service = {
        category: form.service.category.trim(),
        duration: Number(form.service.duration),
        price: form.service.price.trim() ? Number(form.service.price) : undefined,
        description: form.service.description.trim() || undefined,
        requiresEquipment: splitCommaSeparated(form.service.requiresEquipment)
      };
    }

    try {
      if (editingResourceId) {
        await ResourceApiService.updateResource(editingResourceId, payload);
        await ResourceApiService.updateResourceAvailability(editingResourceId, form.availability);
      } else {
        const createPayload: ResourceCreatePayload = {
          ...payload,
          resourceId: generateResourceId()
        } as ResourceCreatePayload;
        await ResourceApiService.createResource(createPayload);
      }

      setDialogOpen(false);
      setEditingResourceId(null);
      setForm(getDefaultFormState(backendClinicName || undefined));
      await fetchResources();
    } catch (saveError: unknown) {
      setFormError(saveError instanceof Error ? saveError.message : 'Failed to save resource');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (resource: ResourceRecord) => {
    const resourceId = getResourceNumericId(resource);
    if (!resourceId) {
      setError('Could not determine resource ID for delete.');
      return;
    }

    const confirmed = window.confirm(`Delete resource "${getResourceDisplayName(resource)}"?`);
    if (!confirmed) {
      return;
    }

    setError(null);
    try {
      await ResourceApiService.deleteResource(resourceId);
      await fetchResources();
    } catch (deleteError: unknown) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete resource');
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
            <h1 className="text-2xl sm:text-3xl font-bold">Resources</h1>
            <p className="text-sm text-muted-foreground">Manage appointment resources and availability</p>
          </div>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div>
                <CardTitle>Resource Directory</CardTitle>
                <CardDescription>
                  {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Tabs value={typeFilter} onValueChange={(value) => setTypeFilter(value as ResourceTypeFilter)}>
              <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
                {RESOURCE_TYPE_OPTIONS.map((option) => (
                  <TabsTrigger key={option.value} value={option.value}>
                    {option.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredResources.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No resources found</p>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Clinics</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bookable</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResources.map((resource) => {
                    const resourceId = getResourceNumericId(resource);
                    const resourceName = getResourceDisplayName(resource);
                    return (
                      <TableRow key={`${resourceId ?? 'resource'}-${resourceName}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(resource.type)}
                            <span>{resourceName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{getTypeBadgeLabel(resource.type)}</Badge>
                        </TableCell>
                        <TableCell>{resource.clinics?.length ? resource.clinics.join(', ') : '-'}</TableCell>
                        <TableCell>
                          <Badge variant={resource.isActive ? 'default' : 'secondary'}>
                            {resource.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={resource.isBookable ? 'default' : 'outline'}>
                            {resource.isBookable ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(resource)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(resource)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingResourceId ? 'Edit Resource' : 'Add Resource'}</DialogTitle>
            <DialogDescription>Fill in resource details and weekly availability</DialogDescription>
          </DialogHeader>

          {loadingEditResource ? (
            <div className="py-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading resource details...
            </div>
          ) : (
            <div className="space-y-6 py-2">
              {formError && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {formError}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Resource Name *</Label>
                  <Input
                    value={form.resourceName}
                    onChange={(event) =>
                      setForm((previous) => ({ ...previous, resourceName: event.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Type *</Label>
                  <Select
                    value={form.type}
                    onValueChange={(value) =>
                      setForm((previous) => ({ ...previous, type: value as ResourceType }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="practitioner">Practitioner</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="room">Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Color</Label>
                  <Input
                    value={form.color}
                    onChange={(event) => setForm((previous) => ({ ...previous, color: event.target.value }))}
                    placeholder="#2563EB"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.isActive}
                      onCheckedChange={(checked) =>
                        setForm((previous) => ({ ...previous, isActive: checked === true }))
                      }
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.isBookable}
                      onCheckedChange={(checked) =>
                        setForm((previous) => ({ ...previous, isBookable: checked === true }))
                      }
                    />
                    Bookable
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.requiresApproval}
                      onCheckedChange={(checked) =>
                        setForm((previous) => ({ ...previous, requiresApproval: checked === true }))
                      }
                    />
                    Requires Approval
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Clinics</Label>
                {clinicOptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No clinics available.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {clinicOptions.map((clinicOption) => (
                      <label key={clinicOption} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={form.clinics.includes(clinicOption)}
                          onCheckedChange={(checked) => handleClinicToggle(clinicOption, checked === true)}
                        />
                        {clinicOption}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {form.type === 'practitioner' && (
                <div className="space-y-4 border rounded-md p-4">
                  <h3 className="font-medium">Practitioner Details</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        value={form.practitioner.firstName}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            practitioner: { ...previous.practitioner, firstName: event.target.value }
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={form.practitioner.lastName}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            practitioner: { ...previous.practitioner, lastName: event.target.value }
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Credentials</Label>
                      <Input
                        value={form.practitioner.credentials}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            practitioner: { ...previous.practitioner, credentials: event.target.value }
                          }))
                        }
                        placeholder="PT, RMT, MD..."
                      />
                    </div>
                    <div>
                      <Label>License Number</Label>
                      <Input
                        value={form.practitioner.licenseNumber}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            practitioner: { ...previous.practitioner, licenseNumber: event.target.value }
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Specialties (comma separated)</Label>
                    <Input
                      value={form.practitioner.specialties}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          practitioner: { ...previous.practitioner, specialties: event.target.value }
                        }))
                      }
                      placeholder="Physiotherapy, Sports rehab"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={form.practitioner.email}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            practitioner: { ...previous.practitioner, email: event.target.value }
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={form.practitioner.phone}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            practitioner: { ...previous.practitioner, phone: event.target.value }
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.type === 'service' && (
                <div className="space-y-4 border rounded-md p-4">
                  <h3 className="font-medium">Service Details</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Category *</Label>
                      <Input
                        value={form.service.category}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            service: { ...previous.service, category: event.target.value }
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Duration (minutes) *</Label>
                      <Input
                        type="number"
                        min="15"
                        max="480"
                        value={form.service.duration}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            service: { ...previous.service, duration: event.target.value }
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.service.price}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            service: { ...previous.service, price: event.target.value }
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Required Equipment (comma separated)</Label>
                      <Input
                        value={form.service.requiresEquipment}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            service: { ...previous.service, requiresEquipment: event.target.value }
                          }))
                        }
                        placeholder="Bed, Ultrasound machine"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={form.service.description}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          service: { ...previous.service, description: event.target.value }
                        }))
                      }
                      rows={3}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3 border rounded-md p-4">
                <h3 className="font-medium">Weekly Availability</h3>
                {DAY_OPTIONS.map((day) => (
                  <div
                    key={day.key}
                    className="grid gap-3 md:grid-cols-[120px_auto_1fr_1fr] items-center border rounded-md p-3"
                  >
                    <div className="text-sm font-medium">{day.label}</div>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={form.availability[day.key].available}
                        onCheckedChange={(checked) => handleAvailabilityToggle(day.key, checked === true)}
                      />
                      Available
                    </label>
                    <Input
                      type="time"
                      value={form.availability[day.key].start}
                      disabled={!form.availability[day.key].available}
                      onChange={(event) => handleAvailabilityTimeChange(day.key, 'start', event.target.value)}
                    />
                    <Input
                      type="time"
                      value={form.availability[day.key].end}
                      disabled={!form.availability[day.key].available}
                      onChange={(event) => handleAvailabilityTimeChange(day.key, 'end', event.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || loadingEditResource}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingResourceId ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
