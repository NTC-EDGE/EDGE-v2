import React, { useState } from "react";
import { useUser } from "@clerk/expo";
import { useApi } from "../../../../../shared/hooks/useApi";
import { ExamApplicantData, ScheduleItem } from "../types/examTypes";

interface UseExamFilingQueriesProps {
  serviceId?: string | null;
  selectedRegionId: string;
  setSelectedRegionId: (id: string) => void;
  selectedOfficeId: string;
  setSelectedOfficeId: (id: string) => void;
  applicants: ExamApplicantData[];
  setApplicants: React.Dispatch<React.SetStateAction<ExamApplicantData[]>>;
  currentApplicantIndex: number;
}

interface ApiResponseEnvelope<T> {
  succeeded?: boolean;
  data?: T;
  items?: T;
}

export function useExamFilingQueries({
  serviceId,
  selectedRegionId,
  setSelectedRegionId,
  selectedOfficeId,
  setSelectedOfficeId,
  applicants,
  setApplicants,
  currentApplicantIndex,
}: UseExamFilingQueriesProps) {
  const api = useApi();
  const { user: clerkUser } = useUser();
  // Form fields schema mapping
  const [formFields, setFormFields] = useState<any[]>([]);
  const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [offices, setOffices] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingOffices, setLoadingOffices] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  // Clerk auto-fill
  React.useEffect(() => {
    if (clerkUser && applicants.length === 1) {
      const firstApp = applicants[0];
      if (firstApp && firstApp.firstName === "" && firstApp.lastName === "" && firstApp.email === "") {
        const firstName = clerkUser.firstName || "";
        const lastName = clerkUser.lastName || "";
        const email = clerkUser.primaryEmailAddress?.emailAddress || "";
        const phone = clerkUser.primaryPhoneNumber?.phoneNumber || "";

        setApplicants(prev => prev.map((app, idx) => idx === 0 ? {
          ...app,
          firstName,
          lastName,
          email,
          contactNo: phone,
        } : app));
      }
    }
  }, [clerkUser, applicants, setApplicants]);

  // Fetch tenants
  React.useEffect(() => {
    async function fetchTenants() {
      setLoadingTenants(true);
      try {
        const res = await api.get<ApiResponseEnvelope<Array<{ id: string; name: string }>> | Array<{ id: string; name: string }>>('/api/v2/tenants');
        if (res && !Array.isArray(res) && res.succeeded && Array.isArray(res.data)) {
          setTenants(res.data);
        } else if (Array.isArray(res)) {
          setTenants(res);
        } else if (res && !Array.isArray(res) && Array.isArray(res.items)) {
          setTenants(res.items);
        } else {
          setTenants([]);
        }
      } catch (err) {
        console.error("Failed to fetch tenants from API:", err);
        setTenants([]);
      } finally {
        setLoadingTenants(false);
      }
    }
    fetchTenants();
  }, []);

  // Fetch offices
  React.useEffect(() => {
    async function fetchOffices() {
      if (!selectedRegionId) {
        setOffices([]);
        return;
      }
      setLoadingOffices(true);
      try {
        const res = await api.get<ApiResponseEnvelope<Array<{ id: string; name: string }>> | Array<{ id: string; name: string }>>(`/api/v2/tenants/${selectedRegionId}/field-offices`);
        if (res && !Array.isArray(res) && res.succeeded && Array.isArray(res.data)) {
          setOffices(res.data);
        } else if (Array.isArray(res)) {
          setOffices(res);
        } else if (res && !Array.isArray(res) && Array.isArray(res.items)) {
          setOffices(res.items);
        } else {
          setOffices([]);
        }
      } catch (err) {
        console.error("Failed to fetch offices from API:", err);
        setOffices([]);
      } finally {
        setLoadingOffices(false);
      }
    }
    fetchOffices();
  }, [selectedRegionId]);

  // Fetch schedules
  React.useEffect(() => {
    async function fetchSchedules() {
      if (!selectedRegionId || !serviceId) {
        setSchedules([]);
        return;
      }
      setLoadingSchedules(true);
      try {
        const currentDateIso = new Date().toISOString();
        const data = await api.get<any>(
          `/api/v2/schedules/client-view?serviceId=${serviceId}&tenantId=${selectedRegionId}&date=${currentDateIso}`
        );
        const rawItems = Array.isArray(data) ? data : (data.items || data.data || []);
        const mappedSchedules: ScheduleItem[] = rawItems.map((item: any) => {
          if (item.scheduledDate && item.startTime && item.endTime) {
            return item;
          }
          const startD = new Date(item.startDate);
          const endD = new Date(item.endDate);
          const scheduledDate = startD.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          const startTime = startD.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
          const endTime = endD.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
          return {
            id: item.id,
            scheduledDate,
            startTime,
            endTime,
            venue: item.venue,
            maximumSlots: item.maximumSlots,
          };
        });
        setSchedules(mappedSchedules);
      } catch (err) {
        console.error("Failed to fetch schedules:", err);
        setSchedules([]);
      } finally {
        setLoadingSchedules(false);
      }
    }
    fetchSchedules();
  }, [selectedRegionId, selectedOfficeId, serviceId]);

  // Variants API Query
  const { data: variantsResponse } = api.useQuery<{ succeeded: boolean; data: any[] }>(
    serviceId ? `/api/v2/services/${serviceId}/variants` : null
  );
  const variants = variantsResponse?.succeeded ? variantsResponse.data : [];

  // Elements API Query
  const activeApplicant = applicants[currentApplicantIndex];
  const selectedVariantId = activeApplicant?.selectedVariantId;
  const { data: elementsResponse } = api.useQuery<any[]>(
    selectedVariantId ? `/api/v2/service-variant-elements?serviceVariantId=${selectedVariantId}` : null
  );
  const variantElements = Array.isArray(elementsResponse) ? elementsResponse : [];
  const isLoadingElements = !!selectedVariantId && elementsResponse === undefined;

  // Requirements API Query
  const { data: requirementsResponse } = api.useQuery<{ succeeded: boolean; data: any[] }>(
    serviceId && selectedVariantId ? `/api/v2/services/${serviceId}/requirements?variantId=${selectedVariantId}` : null
  );
  const dbRequirements = requirementsResponse?.succeeded ? requirementsResponse.data : [];

  return {
    formFields,
    tenants,
    loadingTenants,
    offices,
    loadingOffices,
    schedules,
    loadingSchedules,
    variants,
    variantElements,
    isLoadingElements,
    dbRequirements,
  };
}
