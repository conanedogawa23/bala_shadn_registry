'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';
import { findClinicBySlug, generateLink } from '@/lib/route-utils';
import { useClinic } from '@/lib/contexts/clinic-context';
import { PaymentApiService, PaymentMethod, PaymentType, CreatePaymentRequest } from '@/lib/api/paymentService';

interface OutstandingOrder {
  _id: string;
  orderNumber: string;
  clientId: number;
  clientName: string;
  clinicName: string;
  totalAmount: number;
  amountPaid: number;
  amountOwed: number;
  orderDate: string;
  status: string;
}

export default function BatchPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const clinicSlug = Array.isArray(params.clinic) ? params.clinic[0] : params.clinic as string;
  const { availableClinics } = useClinic();
  const clinic = findClinicBySlug(availableClinics, clinicSlug);

  const [orders, setOrders] = useState<OutstandingOrder[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.INSURANCE);
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.INSURANCE_1ST);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<{ created: any[]; errors: any[] } | null>(null);

  const realClinicName = clinic?.backendName || clinic?.name || clinicSlug;

  const fetchOutstandingOrders = async () => {
    setFetching(true);
    try {
      const response = await PaymentApiService.getOutstandingPayments(realClinicName);
      const outstanding: OutstandingOrder[] = ((response?.data || []) as any[]).map((p: any) => ({
        _id: p._id,
        orderNumber: p.orderNumber || p.paymentNumber || '',
        clientId: p.clientId,
        clientName: p.clientName || `Client #${p.clientId}`,
        clinicName: p.clinicName,
        totalAmount: p.amounts?.totalPaymentAmount || 0,
        amountPaid: p.amounts?.totalPaid || 0,
        amountOwed: p.amounts?.totalOwed || 0,
        orderDate: p.paymentDate || p.createdAt,
        status: p.status
      }));
      setOrders(outstanding);
    } catch {
      setOrders([]);
    } finally {
      setFetching(false);
    }
  };

  React.useEffect(() => {
    if (realClinicName) {
      fetchOutstandingOrders();
    }
  }, [realClinicName]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map(o => o._id)));
    }
  };

  const selectedOrders = useMemo(
    () => orders.filter(o => selectedIds.has(o._id)),
    [orders, selectedIds]
  );

  const totalSelected = useMemo(
    () => selectedOrders.reduce((sum, o) => sum + o.amountOwed, 0),
    [selectedOrders]
  );

  const handleBatchPay = async () => {
    setLoading(true);
    setConfirmOpen(false);

    try {
      const payments: CreatePaymentRequest[] = selectedOrders.map(order => ({
        orderNumber: order.orderNumber,
        clientId: order.clientId,
        clientName: order.clientName,
        clinicName: order.clinicName,
        paymentMethod,
        paymentType,
        amounts: {
          totalPaymentAmount: order.amountOwed,
          totalPaid: order.amountOwed,
          totalOwed: 0,
          popAmount: 0,
          popfpAmount: 0,
          dpaAmount: 0,
          dpafpAmount: 0,
          cob1Amount: 0,
          cob2Amount: 0,
          insurance1stAmount: paymentType === PaymentType.INSURANCE_1ST ? order.amountOwed : 0,
          insurance2ndAmount: paymentType === PaymentType.INSURANCE_2ND ? order.amountOwed : 0,
          refundAmount: 0,
          salesRefundAmount: 0,
          writeoffAmount: 0,
          noInsurFpAmount: 0,
          badDebtAmount: 0
        }
      }));

      const batchResult = await PaymentApiService.batchCreatePayments(payments);
      setResult(batchResult);
      setSelectedIds(new Set());
      fetchOutstandingOrders();
    } catch {
      setResult({ created: [], errors: [{ error: 'Batch payment request failed' }] });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount);
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link href={generateLink('clinic', 'payments', clinicSlug)}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Payments
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Batch Invoice Payment</h1>
            <p className="text-sm text-muted-foreground">
              Select outstanding invoices and apply payment in bulk
            </p>
          </div>
        </div>
      </div>

      {/* Payment Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Payment Settings</CardTitle>
          <CardDescription>Configure how payments will be applied</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                <SelectTrigger id="paymentMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PaymentMethod).map(method => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentType">Payment Type</Label>
              <Select value={paymentType} onValueChange={(v) => setPaymentType(v as PaymentType)}>
                <SelectTrigger id="paymentType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentType.POP}>Patient Out of Pocket</SelectItem>
                  <SelectItem value={PaymentType.POPFP}>POP Final Payment</SelectItem>
                  <SelectItem value={PaymentType.DPA}>Direct Payment Authorization</SelectItem>
                  <SelectItem value={PaymentType.DPAFP}>DPA Final Payment</SelectItem>
                  <SelectItem value={PaymentType.COB_1}>COB Primary</SelectItem>
                  <SelectItem value={PaymentType.COB_2}>COB Secondary</SelectItem>
                  <SelectItem value={PaymentType.INSURANCE_1ST}>1st Insurance</SelectItem>
                  <SelectItem value={PaymentType.INSURANCE_2ND}>2nd Insurance</SelectItem>
                  <SelectItem value={PaymentType.NO_INSUR_FP}>No Insurance Final Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg">Outstanding Invoices</CardTitle>
              <CardDescription>
                {orders.length} outstanding invoice{orders.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              {selectedIds.size > 0 && (
                <div className="text-sm font-medium">
                  {selectedIds.size} selected - Total: {formatCurrency(totalSelected)}
                </div>
              )}
              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={selectedIds.size === 0 || loading}
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  <><CreditCard className="h-4 w-4 mr-2" /> Pay Selected ({selectedIds.size})</>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {fetching ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading outstanding invoices...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No outstanding invoices found for this clinic
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.size === orders.length && orders.length > 0}
                        onCheckedChange={toggleAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Order #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Owing</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => (
                    <TableRow
                      key={order._id}
                      data-state={selectedIds.has(order._id) ? 'selected' : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(order._id)}
                          onCheckedChange={() => toggleSelect(order._id)}
                          aria-label={`Select ${order.orderNumber}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.clientName}</TableCell>
                      <TableCell>
                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(order.amountPaid)}</TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        {formatCurrency(order.amountOwed)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'partial' ? 'secondary' : 'destructive'}>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result Summary */}
      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {result.errors.length === 0 ? (
                <><CheckCircle2 className="h-5 w-5 text-green-600" /> Batch Payment Complete</>
              ) : (
                <><AlertCircle className="h-5 w-5 text-yellow-600" /> Batch Payment Completed with Issues</>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              {result.created.length} payment{result.created.length !== 1 ? 's' : ''} created successfully
              {result.errors.length > 0 && `, ${result.errors.length} error${result.errors.length !== 1 ? 's' : ''}`}
            </p>
            {result.errors.length > 0 && (
              <div className="mt-2 p-3 bg-destructive/10 rounded-md">
                {result.errors.map((err, i) => (
                  <p key={i} className="text-sm text-destructive">
                    Order {err.orderNumber}: {err.error}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Batch Payment</DialogTitle>
            <DialogDescription>
              You are about to process payments for {selectedIds.size} invoice{selectedIds.size !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Invoices selected:</span>
              <span className="font-medium">{selectedIds.size}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Payment method:</span>
              <span className="font-medium">{paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Payment type:</span>
              <span className="font-medium">{PaymentApiService.getPaymentTypeDescription(paymentType)}</span>
            </div>
            <div className="flex justify-between text-base font-bold mt-4 pt-4 border-t">
              <span>Total amount:</span>
              <span>{formatCurrency(totalSelected)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleBatchPay}>Confirm Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
