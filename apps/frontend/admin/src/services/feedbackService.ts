import { useApi } from "./api";

export interface AdminFeedbackItem {
  id: string;
  tenantId?: string | null;
  tenantName?: string | null;
  tenantCode?: string | null;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  rating: number;
  status: string;
  isAnonymous: boolean;
  createdAt: string;
}

export interface PublicRegionalOfficeOption {
  id: string;
  name: string;
  code: string;
  regionCode: string;
  regionName: string;
}

export interface ApiListResponse<T> {
  succeeded: boolean;
  data: T[];
}

export function useFeedbackService() {
  const { useQuery, del } = useApi();

  const useFeedbacks = (tenantId?: string) => {
    const hasTenant =
      typeof tenantId === "string" &&
      tenantId.trim().length > 0 &&
      tenantId !== "ALL";
    const url = hasTenant
      ? `/api/v2/feedback?tenantId=${encodeURIComponent(tenantId.trim())}`
      : "/api/v2/feedback";
    return useQuery<ApiListResponse<AdminFeedbackItem>>(url);
  };

  const useRegionalOffices = () => {
    return useQuery<ApiListResponse<PublicRegionalOfficeOption>>(
      "/api/v2/tenants/public-directory"
    );
  };

  const deleteFeedback = async (id: string): Promise<void> => {
    return del<void>(`/api/v2/feedback/${id}`);
  };

  return {
    useFeedbacks,
    useRegionalOffices,
    deleteFeedback,
  };
}
