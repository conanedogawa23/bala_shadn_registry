import { BaseApiService } from './baseApiService';

interface EmailApiSuccessResponse {
  success: boolean;
  message: string;
}

export interface AppointmentReminderEmailRequest {
  to: string;
  clientName?: string;
  appointmentDate: string;
  appointmentTime: string;
  subject?: string;
  message?: string;
  location?: string;
  practitionerName?: string;
  notes?: string;
}

export interface InvoiceEmailRequest {
  to: string;
  clientName?: string;
  invoiceNumber?: string;
  totalAmount: number;
  currency?: string;
  dueDate?: string;
  subject?: string;
  message?: string;
  summary?: string;
}

export interface FollowUpEmailRequest {
  to: string;
  subject: string;
  message: string;
}

export class EmailApiService extends BaseApiService {
  private static readonly ENDPOINT = '/email';

  static async sendAppointmentReminder(
    payload: AppointmentReminderEmailRequest
  ): Promise<EmailApiSuccessResponse> {
    const response = await this.post<EmailApiSuccessResponse>(
      `${this.ENDPOINT}/appointment-reminder`,
      payload
    );

    if (response.success) {
      return {
        success: true,
        message: response.message || response.data?.message || 'Appointment reminder sent'
      };
    }

    throw new Error(response.message || 'Failed to send appointment reminder');
  }

  static async sendInvoiceEmail(payload: InvoiceEmailRequest): Promise<EmailApiSuccessResponse> {
    const response = await this.post<EmailApiSuccessResponse>(`${this.ENDPOINT}/invoice`, payload);

    if (response.success) {
      return {
        success: true,
        message: response.message || response.data?.message || 'Invoice email sent'
      };
    }

    throw new Error(response.message || 'Failed to send invoice email');
  }

  static async sendFollowUpEmail(payload: FollowUpEmailRequest): Promise<EmailApiSuccessResponse> {
    const response = await this.post<EmailApiSuccessResponse>(`${this.ENDPOINT}/follow-up`, payload);

    if (response.success) {
      return {
        success: true,
        message: response.message || response.data?.message || 'Follow-up email sent'
      };
    }

    throw new Error(response.message || 'Failed to send follow-up email');
  }
}

export default EmailApiService;
