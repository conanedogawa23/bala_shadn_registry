'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  EmailApiService,
  AppointmentReminderEmailRequest,
  InvoiceEmailRequest,
  FollowUpEmailRequest
} from '@/lib/api/emailService';

type EmailType = 'appointment-reminder' | 'invoice' | 'follow-up';

interface EmailComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientEmail?: string;
  clientName: string;
}

const getDateString = (date: Date): string => date.toISOString().split('T')[0];

const getDefaultSubject = (emailType: EmailType, clientName: string): string => {
  const safeName = clientName || 'Client';

  switch (emailType) {
    case 'appointment-reminder':
      return `Appointment Reminder for ${safeName}`;
    case 'invoice':
      return `Invoice from Visio Health`;
    case 'follow-up':
      return `Follow-up from Visio Health`;
    default:
      return 'Message from Visio Health';
  }
};

const getDefaultMessage = (emailType: EmailType, clientName: string): string => {
  const safeName = clientName || 'Client';

  switch (emailType) {
    case 'appointment-reminder':
      return `Hi ${safeName}, this is a reminder for your upcoming appointment.`;
    case 'invoice':
      return `Hi ${safeName}, please find your invoice details below.`;
    case 'follow-up':
      return `Hi ${safeName}, thank you for your recent visit. We wanted to follow up on your progress.`;
    default:
      return '';
  }
};

export function EmailComposeDialog({
  open,
  onOpenChange,
  clientEmail,
  clientName
}: EmailComposeDialogProps) {
  const [emailType, setEmailType] = useState<EmailType>('appointment-reminder');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(getDateString(new Date()));
  const [appointmentTime, setAppointmentTime] = useState('09:00');
  const [location, setLocation] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [dueDate, setDueDate] = useState(getDateString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)));
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const missingRecipientEmail = useMemo(() => !clientEmail?.trim(), [clientEmail]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const defaultType: EmailType = 'appointment-reminder';
    setEmailType(defaultType);
    setSubject(getDefaultSubject(defaultType, clientName));
    setMessage(getDefaultMessage(defaultType, clientName));
    setAppointmentDate(getDateString(new Date()));
    setAppointmentTime('09:00');
    setLocation('');
    setInvoiceNumber('');
    setInvoiceAmount('');
    setDueDate(getDateString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)));
    setFeedback(null);
    setIsError(false);
  }, [open, clientName]);

  const updateEmailType = (nextType: EmailType) => {
    setEmailType(nextType);
    setSubject(getDefaultSubject(nextType, clientName));
    setMessage(getDefaultMessage(nextType, clientName));
    setFeedback(null);
    setIsError(false);
  };

  const handleSend = async () => {
    if (!clientEmail) {
      setIsError(true);
      setFeedback('Client email is missing. Add an email address before sending.');
      return;
    }

    if (!subject.trim() || !message.trim()) {
      setIsError(true);
      setFeedback('Subject and message are required.');
      return;
    }

    setIsSending(true);
    setFeedback(null);
    setIsError(false);

    try {
      if (emailType === 'appointment-reminder') {
        if (!appointmentDate || !appointmentTime) {
          throw new Error('Appointment date and time are required for reminder emails.');
        }

        const payload: AppointmentReminderEmailRequest = {
          to: clientEmail,
          clientName,
          appointmentDate,
          appointmentTime,
          subject,
          message,
          location: location.trim() || undefined
        };

        await EmailApiService.sendAppointmentReminder(payload);
      } else if (emailType === 'invoice') {
        const parsedAmount = Number(invoiceAmount);
        if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
          throw new Error('Invoice amount must be a valid non-negative number.');
        }

        const payload: InvoiceEmailRequest = {
          to: clientEmail,
          clientName,
          invoiceNumber: invoiceNumber.trim() || undefined,
          totalAmount: parsedAmount,
          dueDate: dueDate || undefined,
          subject,
          message
        };

        await EmailApiService.sendInvoiceEmail(payload);
      } else {
        const payload: FollowUpEmailRequest = {
          to: clientEmail,
          subject,
          message
        };

        await EmailApiService.sendFollowUpEmail(payload);
      }

      setIsError(false);
      setFeedback('Email sent successfully.');
      onOpenChange(false);
    } catch (error) {
      setIsError(true);
      setFeedback(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Email
          </DialogTitle>
          <DialogDescription>
            Compose and send a client communication email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-recipient">Recipient</Label>
            <Input
              id="email-recipient"
              value={clientEmail || ''}
              readOnly
              className={missingRecipientEmail ? 'border-destructive' : ''}
            />
            {missingRecipientEmail && (
              <p className="text-xs text-destructive">
                This client does not have an email address on file.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-type">Email Type</Label>
            <Select value={emailType} onValueChange={(value) => updateEmailType(value as EmailType)}>
              <SelectTrigger id="email-type">
                <SelectValue placeholder="Select email type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appointment-reminder">Appointment Reminder</SelectItem>
                <SelectItem value="invoice">Billing Invoice</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {emailType === 'appointment-reminder' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="appointment-date">Appointment Date</Label>
                <Input
                  id="appointment-date"
                  type="date"
                  value={appointmentDate}
                  onChange={(event) => setAppointmentDate(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointment-time">Appointment Time</Label>
                <Input
                  id="appointment-time"
                  type="time"
                  value={appointmentTime}
                  onChange={(event) => setAppointmentTime(event.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="appointment-location">Location</Label>
                <Input
                  id="appointment-location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Clinic location (optional)"
                />
              </div>
            </div>
          )}

          {emailType === 'invoice' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invoice-number">Invoice Number</Label>
                <Input
                  id="invoice-number"
                  value={invoiceNumber}
                  onChange={(event) => setInvoiceNumber(event.target.value)}
                  placeholder="INV-0001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-amount">Invoice Amount</Label>
                <Input
                  id="invoice-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={invoiceAmount}
                  onChange={(event) => setInvoiceAmount(event.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="invoice-due-date">Due Date</Label>
                <Input
                  id="invoice-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email-subject">Subject</Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-message">Message</Label>
            <Textarea
              id="email-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={5}
            />
          </div>

          {feedback && (
            <div className={`text-sm rounded-md p-3 ${isError ? 'bg-destructive/10 text-destructive' : 'bg-green-50 text-green-700'}`}>
              {feedback}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending || missingRecipientEmail}>
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Email'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
