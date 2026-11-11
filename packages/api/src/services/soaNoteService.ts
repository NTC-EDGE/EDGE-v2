import { apiClient } from '../apiClient';
import { SoaNote, PaginatedApiResponse } from '../types';

export interface CreateSoaNoteDto {
  notes: string;
  code?: string | null;
  title?: string | null;
  tenantId?: string | null;
}

export interface UpdateSoaNoteDto {
  id: string;
  notes: string;
  code?: string | null;
  title?: string | null;
  tenantId?: string | null;
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null;
}

function isSoaNote(val: unknown): val is SoaNote {
  if (!isRecord(val)) return false;
  return typeof val.id === 'string' && typeof val.notes === 'string';
}

function isPaginatedApiResponse(val: unknown): val is PaginatedApiResponse<SoaNote> {
  if (!isRecord(val)) return false;
  return Array.isArray(val.data);
}

export const soaNoteService = {
  async getNotes(params?: {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    tenantId?: string;
  }): Promise<SoaNote[]> {
    const q = new URLSearchParams();
    if (params?.pageNumber !== undefined) q.append('pageNumber', params.pageNumber.toString());
    if (params?.pageSize !== undefined) q.append('pageSize', params.pageSize.toString());
    if (params?.searchTerm !== undefined && params.searchTerm.trim().length > 0) {
      q.append('searchTerm', params.searchTerm.trim());
    }
    if (params?.tenantId !== undefined && params.tenantId.trim().length > 0) {
      q.append('tenantId', params.tenantId.trim());
    }

    const res = await apiClient.get<unknown>(`/api/v2/soa-notes?${q.toString()}`);
    if (isPaginatedApiResponse(res.data) && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    if (Array.isArray(res.data)) {
      return res.data.filter(isSoaNote);
    }
    return [];
  },

  async createNote(dto: CreateSoaNoteDto): Promise<SoaNote | null> {
    const q = dto.tenantId ? `?tenantId=${encodeURIComponent(dto.tenantId)}` : '';
    const res = await apiClient.post<unknown>(`/api/v2/soa-notes${q}`, dto);
    if (isRecord(res.data) && 'data' in res.data && isSoaNote(res.data.data)) {
      return res.data.data;
    }
    if (isSoaNote(res.data)) {
      return res.data;
    }
    return null;
  },

  async updateNote(id: string, dto: UpdateSoaNoteDto): Promise<SoaNote | null> {
    const res = await apiClient.put<unknown>(`/api/v2/soa-notes/${encodeURIComponent(id)}`, dto);
    if (isRecord(res.data) && 'data' in res.data && isSoaNote(res.data.data)) {
      return res.data.data;
    }
    if (isSoaNote(res.data)) {
      return res.data;
    }
    return null;
  },

  async deleteNote(id: string): Promise<boolean> {
    const res = await apiClient.delete(`/api/v2/soa-notes/${encodeURIComponent(id)}`);
    return res.status >= 200 && res.status < 300;
  },
};
