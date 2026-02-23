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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { generateLink } from '@/lib/route-utils';
import { baseApiService } from '@/lib/api/baseApiService';

interface GroupNumber {
  _id: string;
  groupNumber: string;
  planName?: string;
  planType: string;
  isActive: boolean;
}

export default function GroupNumbersPage() {
  const params = useParams();
  const clinicSlug = Array.isArray(params.clinic) ? params.clinic[0] : params.clinic as string;

  const [groups, setGroups] = useState<GroupNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GroupNumber | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ groupNumber: '', planName: '', planType: 'group' });

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const response = await baseApiService.get(`/insurance-reference/group-numbers?search=${search}`);
      setGroups((response as any).data || []);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const openNew = () => {
    setEditing(null);
    setForm({ groupNumber: '', planName: '', planType: 'group' });
    setDialogOpen(true);
  };

  const openEdit = (g: GroupNumber) => {
    setEditing(g);
    setForm({ groupNumber: g.groupNumber, planName: g.planName || '', planType: g.planType || 'group' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.groupNumber) return;
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await baseApiService.put(`/insurance-reference/group-numbers/${editing._id}`, form);
      } else {
        await baseApiService.post('/insurance-reference/group-numbers', form);
      }
      setDialogOpen(false);
      fetchGroups();
    } catch (e: any) {
      setError(e?.message || 'Failed to save group number');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await baseApiService.delete(`/insurance-reference/group-numbers/${id}`);
      fetchGroups();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete group number');
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
            <h1 className="text-2xl sm:text-3xl font-bold">Insurance Group Numbers</h1>
            <p className="text-sm text-muted-foreground">Manage insurance group number plans</p>
          </div>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Add Group Number</Button>
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
              <CardTitle>Group Numbers</CardTitle>
              <CardDescription>{groups.length} group number{groups.length !== 1 ? 's' : ''}</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : groups.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No group numbers found</p>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group Number</TableHead>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Plan Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map(g => (
                    <TableRow key={g._id}>
                      <TableCell className="font-medium">{g.groupNumber}</TableCell>
                      <TableCell>{g.planName || '-'}</TableCell>
                      <TableCell className="capitalize">{g.planType}</TableCell>
                      <TableCell><Badge variant={g.isActive ? 'default' : 'secondary'}>{g.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(g)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(g._id)}><Trash2 className="h-4 w-4" /></Button>
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
            <DialogTitle>{editing ? 'Edit Group Number' : 'Add Group Number'}</DialogTitle>
            <DialogDescription>Fill in the group number details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Group Number *</Label><Input value={form.groupNumber} onChange={(e) => setForm(f => ({ ...f, groupNumber: e.target.value }))} /></div>
            <div><Label>Plan Name</Label><Input value={form.planName} onChange={(e) => setForm(f => ({ ...f, planName: e.target.value }))} /></div>
            <div>
              <Label>Plan Type</Label>
              <Select value={form.planType} onValueChange={(v) => setForm(f => ({ ...f, planType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.groupNumber}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : (editing ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
