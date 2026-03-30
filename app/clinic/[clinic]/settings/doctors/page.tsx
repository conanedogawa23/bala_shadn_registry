'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { findClinicBySlug, generateLink, getBackendClinicName } from '@/lib/route-utils';
import { useClinic } from '@/lib/contexts/clinic-context';
import { ReferringDoctorApiService } from '@/lib/api/referringDoctorService';

interface ReferringDoctor {
  _id: string;
  doctorId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  specialty?: string;
  phone?: string;
  fax?: string;
  email?: string;
  isActive: boolean;
}

export default function DoctorsPage() {
  const params = useParams();
  const clinicSlug = Array.isArray(params.clinic) ? params.clinic[0] : params.clinic as string;
  const { availableClinics } = useClinic();
  const clinic = findClinicBySlug(availableClinics, clinicSlug);
  const clinicName = getBackendClinicName(clinic, clinicSlug);

  const [doctors, setDoctors] = useState<ReferringDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ReferringDoctor | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', specialty: '', phone: '', fax: '', email: '' });

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ReferringDoctorApiService.getAll({
        clinicName,
        search: search || undefined
      });
      setDoctors(response.doctors);
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [clinicName, search]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const openNew = () => {
    setEditing(null);
    setForm({ firstName: '', lastName: '', specialty: '', phone: '', fax: '', email: '' });
    setDialogOpen(true);
  };

  const openEdit = (doc: ReferringDoctor) => {
    setEditing(doc);
    setForm({
      firstName: doc.firstName || '',
      lastName: doc.lastName || '',
      specialty: doc.specialty || '',
      phone: doc.phone || '',
      fax: doc.fax || '',
      email: doc.email || ''
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName) return;
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await ReferringDoctorApiService.update(editing._id, {
          ...form,
          clinicName
        });
      } else {
        await ReferringDoctorApiService.create({
          ...form,
          clinicName
        });
      }
      setDialogOpen(false);
      fetchDoctors();
    } catch (e: any) {
      setError(e?.message || 'Failed to save doctor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await ReferringDoctorApiService.deactivate(id);
      fetchDoctors();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete doctor');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link href={generateLink('clinic', 'settings', clinicSlug)}>
            <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Settings</Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Referring Doctors</h1>
            <p className="text-sm text-muted-foreground">Manage referring physician directory</p>
          </div>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Add Doctor</Button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <CardTitle>Doctor Directory</CardTitle>
              <CardDescription>{doctors.length} doctor{doctors.length !== 1 ? 's' : ''}</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : doctors.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No referring doctors found</p>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map(doc => (
                    <TableRow key={doc._id}>
                      <TableCell className="font-medium">Dr. {doc.fullName || `${doc.firstName} ${doc.lastName}`}</TableCell>
                      <TableCell>{doc.specialty || '-'}</TableCell>
                      <TableCell>{doc.phone || '-'}</TableCell>
                      <TableCell>{doc.email || '-'}</TableCell>
                      <TableCell><Badge variant={doc.isActive ? 'default' : 'secondary'}>{doc.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(doc)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(doc._id)}><Trash2 className="h-4 w-4" /></Button>
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
            <DialogTitle>{editing ? 'Edit Doctor' : 'Add Referring Doctor'}</DialogTitle>
            <DialogDescription>Fill in the doctor details below</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>First Name *</Label><Input value={form.firstName} onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))} /></div>
              <div><Label>Last Name *</Label><Input value={form.lastName} onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))} /></div>
            </div>
            <div><Label>Specialty</Label><Input value={form.specialty} onChange={(e) => setForm(f => ({ ...f, specialty: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><Label>Fax</Label><Input value={form.fax} onChange={(e) => setForm(f => ({ ...f, fax: e.target.value }))} /></div>
            </div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.firstName || !form.lastName}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : (editing ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
