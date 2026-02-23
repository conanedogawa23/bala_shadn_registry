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
import { generateLink } from '@/lib/route-utils';
import { baseApiService } from '@/lib/api/baseApiService';

interface City {
  _id: string;
  cityName: string;
  province?: string;
  country: string;
  postalCodePrefix?: string;
  isActive: boolean;
}

export default function CitiesPage() {
  const params = useParams();
  const clinicSlug = Array.isArray(params.clinic) ? params.clinic[0] : params.clinic as string;

  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<City | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ cityName: '', province: '', country: 'Canada', postalCodePrefix: '' });

  const fetchCities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await baseApiService.get(`/cities?search=${search}`);
      setCities((response as any).data || []);
    } catch {
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchCities(); }, [fetchCities]);

  const openNew = () => {
    setEditing(null);
    setForm({ cityName: '', province: '', country: 'Canada', postalCodePrefix: '' });
    setDialogOpen(true);
  };

  const openEdit = (c: City) => {
    setEditing(c);
    setForm({
      cityName: c.cityName || '',
      province: c.province || '',
      country: c.country || 'Canada',
      postalCodePrefix: c.postalCodePrefix || ''
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.cityName) return;
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await baseApiService.put(`/cities/${editing._id}`, form);
      } else {
        await baseApiService.post('/cities', form);
      }
      setDialogOpen(false);
      fetchCities();
    } catch (e: any) {
      setError(e?.message || 'Failed to save city');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await baseApiService.delete(`/cities/${id}`);
      fetchCities();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete city');
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
            <h1 className="text-2xl sm:text-3xl font-bold">Cities</h1>
            <p className="text-sm text-muted-foreground">Manage city directory</p>
          </div>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Add City</Button>
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
              <CardTitle>City Directory</CardTitle>
              <CardDescription>{cities.length} cit{cities.length !== 1 ? 'ies' : 'y'}</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search cities..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : cities.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No cities found</p>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>City</TableHead>
                    <TableHead>Province</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Postal Prefix</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cities.map(c => (
                    <TableRow key={c._id}>
                      <TableCell className="font-medium">{c.cityName}</TableCell>
                      <TableCell>{c.province || '-'}</TableCell>
                      <TableCell>{c.country}</TableCell>
                      <TableCell>{c.postalCodePrefix || '-'}</TableCell>
                      <TableCell><Badge variant={c.isActive ? 'default' : 'secondary'}>{c.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(c._id)}><Trash2 className="h-4 w-4" /></Button>
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
            <DialogTitle>{editing ? 'Edit City' : 'Add City'}</DialogTitle>
            <DialogDescription>Fill in the city details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>City Name *</Label><Input value={form.cityName} onChange={(e) => setForm(f => ({ ...f, cityName: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Province</Label><Input value={form.province} onChange={(e) => setForm(f => ({ ...f, province: e.target.value }))} /></div>
              <div><Label>Country</Label><Input value={form.country} onChange={(e) => setForm(f => ({ ...f, country: e.target.value }))} /></div>
            </div>
            <div><Label>Postal Code Prefix</Label><Input value={form.postalCodePrefix} onChange={(e) => setForm(f => ({ ...f, postalCodePrefix: e.target.value }))} maxLength={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.cityName}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : (editing ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
