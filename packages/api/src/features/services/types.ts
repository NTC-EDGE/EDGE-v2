export interface Service {
  id: string;
  serviceCategoryId: string;
  serviceCategoryCode: string;
  serviceCategoryType: string;
  name: string;
  group?: string | null;
  code?: string | null;
  description?: string | null;
  tenantId?: string | null;
}

export interface CreateServiceCommand {
  serviceCategoryId: string;
  tenantId: string;
  name: string;
  group?: string | null;
  code?: string | null;
  description?: string | null;
  contract?: string; // stringified JSON
}

export interface UpdateServiceCommand {
  id: string;
  serviceCategoryId: string;
  tenantId: string;
  name: string;
  group?: string | null;
  code?: string | null;
  description?: string | null;
  contract?: string; // stringified JSON
}
