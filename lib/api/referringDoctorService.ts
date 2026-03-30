import { BaseApiService } from './baseApiService';

export interface ReferringDoctor {
  _id: string;
  doctorId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  specialty?: string;
  phone?: string;
  fax?: string;
  email?: string;
  clinicName?: string;
  isActive: boolean;
}

interface ReferringDoctorListResponse {
  doctors: ReferringDoctor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ReferringDoctorQueryOptions {
  clinicName?: string;
  isActive?: boolean;
  limit?: number;
  page?: number;
  search?: string;
}

interface ReferringDoctorMutationRequest {
  clinicName?: string;
  email?: string;
  fax?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  specialty?: string;
}

export class ReferringDoctorApiService extends BaseApiService {
  private static readonly ENDPOINT = '/referring-doctors';

  static async getAll(
    options: ReferringDoctorQueryOptions = {}
  ): Promise<ReferringDoctorListResponse> {
    const query = this.buildQuery({
      clinicName: options.clinicName,
      isActive: options.isActive,
      limit: options.limit ?? 50,
      page: options.page ?? 1,
      search: options.search
    });
    const endpoint = query ? `${this.ENDPOINT}?${query}` : this.ENDPOINT;
    const response = await this.request<ReferringDoctor[]>(endpoint);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || response.message || 'Failed to fetch referring doctors');
    }

    return {
      doctors: response.data,
      pagination: {
        page: response.pagination?.page ?? 1,
        limit: response.pagination?.limit ?? options.limit ?? 50,
        total: response.pagination?.total ?? response.data.length,
        totalPages: (response.pagination as { totalPages?: number } | undefined)?.totalPages
          ?? Math.max(1, Math.ceil((response.pagination?.total ?? response.data.length) / (response.pagination?.limit ?? options.limit ?? 50)))
      }
    };
  }

  static async create(
    doctorData: ReferringDoctorMutationRequest
  ): Promise<ReferringDoctor> {
    const response = await this.request<ReferringDoctor>(this.ENDPOINT, 'POST', doctorData);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || response.message || 'Failed to create referring doctor');
    }

    return response.data;
  }

  static async update(
    doctorId: string,
    doctorData: Partial<ReferringDoctorMutationRequest>
  ): Promise<ReferringDoctor> {
    const response = await this.request<ReferringDoctor>(
      `${this.ENDPOINT}/${encodeURIComponent(doctorId)}`,
      'PUT',
      doctorData
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || response.message || 'Failed to update referring doctor');
    }

    return response.data;
  }

  static async deactivate(doctorId: string): Promise<void> {
    const response = await this.request(
      `${this.ENDPOINT}/${encodeURIComponent(doctorId)}`,
      'DELETE'
    );

    if (!response.success) {
      throw new Error(response.error?.message || response.message || 'Failed to deactivate referring doctor');
    }
  }
}
