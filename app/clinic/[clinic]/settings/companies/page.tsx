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

interface Company {
  _id: string;
  companyName: string;
  displayName?: string;
  industry?: string;
  contact?: { phone?: string; email?: string };
  isActive: boolean;
}

export default function CompaniesPage() {
  const params = useParams();
  const clinicSlug = Array.isArray(params.clinic) ? params.clinic[0] : params.clinic as string;

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ companyName: '', displayName: '', industry: '', phone: '', email: '' });

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const response = await baseApiService.get(`/companies?search=${search}`);
      setCompanies((response as any).data || []);
    } catch {
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const openNew = () => {
    setEditing(null);
    setForm({ companyName: '', displayName: '', industry: '', phone: '', email: '' });
    setDialogOpen(true);
  };

  const openEdit = (c: Company) => {
    setEditing(c);
    setForm({
      companyName: c.companyName || '',
      displayName: c.displayName || '',
      industry: c.industry || '',
      phone: c.contact?.phone || '',
      email: c.contact?.email || ''
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.companyName) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        companyName: form.companyName,
        displayName: form.displayName,
        industry: form.industry,
        contact: { phone: form.phone, email: form.email }
      };
      if (editing) {
        await baseApiService.put(`/companies/${editing._id}`, payload);
      } else {
        await baseApiService.post('/companies', payload);
      }
      setDialogOpen(false);
      fetchCompanies();
    } catch (e: any) {
      setError(e?.message || 'Failed to save company');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await baseApiService.delete(`/companies/${id}`);
      fetchCompanies();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete company');
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
            <h1 className="text-2xl sm:text-3xl font-bold">Companies</h1>
            <p className="text-sm text-muted-foreground">Manage client companies</p>
          </div>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Add Company</Button>
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
              <CardTitle>Company Directory</CardTitle>
              <CardDescription>{companies.length} compan{companies.length !== 1 ? 'ies' : 'y'}</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search companies..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : companies.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No companies found</p>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map(c => (
                    <TableRow key={c._id}>
                      <TableCell className="font-medium">{c.displayName || c.companyName}</TableCell>
                      <TableCell>{c.industry || '-'}</TableCell>
                      <TableCell>{c.contact?.phone || '-'}</TableCell>
                      <TableCell>{c.contact?.email || '-'}</TableCell>
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
            <DialogTitle>{editing ? 'Edit Company' : 'Add Company'}</DialogTitle>
            <DialogDescription>Fill in the company details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Company Name *</Label><Input value={form.companyName} onChange={(e) => setForm(f => ({ ...f, companyName: e.target.value }))} /></div>
            <div><Label>Display Name</Label><Input value={form.displayName} onChange={(e) => setForm(f => ({ ...f, displayName: e.target.value }))} /></div>
            <div><Label>Industry</Label><Input value={form.industry} onChange={(e) => setForm(f => ({ ...f, industry: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.companyName}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : (editing ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
