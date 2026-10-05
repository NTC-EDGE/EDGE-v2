import React, { useState } from "react";
import { useUser } from "@clerk/expo";
import { useApi } from "../../../../../shared/hooks/useApi";
import { ExamApplicantData, ScheduleItem } from "../types/examTypes";
import { extractUserProfile } from "../../../../../shared/utils/userProfileHelper";

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

  // Comprehensive Profile auto-fill (once on auth/mount)
  const hasPrefilledExamProfileRef = React.useRef(false);
  React.useEffect(() => {
    let active = true;
    async function prefillExamApplicant() {
      if (!clerkUser || applicants.length !== 1 || hasPrefilledExamProfileRef.current) return;

      // 1. Initial prefill from local storage / Clerk metadata
      const initialProfile = extractUserProfile(clerkUser, null);
      setApplicants((prev) =>
        prev.map((app, idx) =>
          idx === 0
            ? {
                ...app,
                firstName: app.firstName || initialProfile.firstName,
                lastName: app.lastName || initialProfile.lastName,
                middleName: app.middleName || initialProfile.middleName,
                suffix: app.suffix || initialProfile.suffix,
                email: app.email || initialProfile.email,
                contactNo: app.contactNo || initialProfile.phone,
                sex: app.sex && app.sex !== "Male" ? app.sex : (initialProfile.sex || "Male"),
                nationality: app.nationality || initialProfile.nationality || "Filipino",
                schoolName: app.schoolName || initialProfile.schoolAttended,
                courseDegree: app.courseDegree || initialProfile.courseTaken,
                yearGraduated: app.yearGraduated || initialProfile.yearGraduated,
                street: app.street || initialProfile.street,
                barangay: app.barangay || initialProfile.barangay,
                city: app.city || initialProfile.city,
                province: app.province || initialProfile.province,
                regionName: app.regionName || initialProfile.region,
                zipCode: app.zipCode || initialProfile.zipCode,
                birthYear: app.birthYear && app.birthYear !== "2000" ? app.birthYear : initialProfile.birthYear,
                birthMonth: app.birthMonth && app.birthMonth !== "January" ? app.birthMonth : initialProfile.birthMonth,
                birthDay: app.birthDay && app.birthDay !== "1" ? app.birthDay : initialProfile.birthDay,
              }
            : app
        )
      );

      // 2. Enrich from backend database /api/v2/users/profile
      try {
        const dbRes = await api.get<any>("/api/v2/users/profile").catch((err) => {
          console.warn("[ExamFilingQueries] Notice: Backend profile fetch failed or returned non-200. Using Clerk/local profile fallbacks.", err);
          return null;
        });
        if (!active || !dbRes) return;
        const dbUser = dbRes.data || dbRes;
        if (!dbUser) return;

        const enriched = extractUserProfile(clerkUser, dbUser);
        setApplicants((prev) =>
          prev.map((app, idx) =>
            idx === 0
              ? {
                  ...app,
                  firstName: app.firstName || enriched.firstName,
                  lastName: app.lastName || enriched.lastName,
                  middleName: app.middleName || enriched.middleName,
                  suffix: app.suffix || enriched.suffix,
                  email: app.email || enriched.email,
                  contactNo: app.contactNo || enriched.phone,
                  sex: app.sex && app.sex !== "Male" ? app.sex : (enriched.sex || "Male"),
                  nationality: app.nationality || enriched.nationality || "Filipino",
                  schoolName: app.schoolName || enriched.schoolAttended,
                  courseDegree: app.courseDegree || enriched.courseTaken,
                  yearGraduated: app.yearGraduated || enriched.yearGraduated,
                  street: app.street || enriched.street,
                  barangay: app.barangay || enriched.barangay,
                  city: app.city || enriched.city,
                  province: app.province || enriched.province,
                  regionName: app.regionName || enriched.region,
                  zipCode: app.zipCode || enriched.zipCode,
                  birthYear: app.birthYear && app.birthYear !== "2000" ? app.birthYear : enriched.birthYear,
                  birthMonth: app.birthMonth && app.birthMonth !== "January" ? app.birthMonth : enriched.birthMonth,
                  birthDay: app.birthDay && app.birthDay !== "1" ? app.birthDay : enriched.birthDay,
                }
              : app
          )
        );
        hasPrefilledExamProfileRef.current = true;
      } catch (err) {
        console.warn("[ExamFilingQueries] Failed to process backend profile data:", err);
      }
    }

    prefillExamApplicant();
    return () => {
      active = false;
    };
  }, [clerkUser]);

  // Fetch tenants
  const hasFetchedExamTenantsRef = React.useRef(false);
  React.useEffect(() => {
    if (hasFetchedExamTenantsRef.current) return;
    async function fetchTenants() {
      setLoadingTenants(true);
      try {
        const res = await api.get<ApiResponseEnvelope<Array<{ id: string; name: string }>> | Array<{ id: string; name: string }>>('/api/v2/tenants?pageSize=100&isActive=true');
        let list: Array<{ id: string; name: string }> = [];
        if (res && !Array.isArray(res) && res.succeeded && Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res)) {
          list = res;
        } else if (res && !Array.isArray(res) && Array.isArray(res.items)) {
          list = res.items;
        }
        setTenants(list);
        if (list.length > 0 && !selectedRegionId) {
          setSelectedRegionId(list[0].id);
        }
        hasFetchedExamTenantsRef.current = true;
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
        setSelectedOfficeId("");
        return;
      }
      setLoadingOffices(true);
      try {
        const res = await api.get<ApiResponseEnvelope<Array<{ id: string; name: string }>> | Array<{ id: string; name: string }>>(`/api/v2/tenants/${selectedRegionId}/field-offices?isActive=true`);
        let list: Array<{ id: string; name: string }> = [];
        if (res && !Array.isArray(res) && res.succeeded && Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res)) {
          list = res;
        } else if (res && !Array.isArray(res) && Array.isArray(res.items)) {
          list = res.items;
        }
        setOffices(list);
        if (list.length > 0) {
          setSelectedOfficeId(list[0].id);
        } else {
          setSelectedOfficeId("");
        }
      } catch (err) {
        console.error("Failed to fetch offices from API:", err);
        setOffices([]);
        setSelectedOfficeId("");
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
        const data = await api.get<any>(
          `/api/v2/schedules/client-view?serviceId=${serviceId}&tenantId=${selectedRegionId}&pageSize=50`
        ).catch(async () => {
          // Fallback to general schedules query if client-view has specific window filtering
          return await api.get<any>(
            `/api/v2/schedules?serviceId=${serviceId}&tenantId=${selectedRegionId}&pageSize=50`
          ).catch(() => null);
        });

        if (!data) {
          setSchedules([]);
          return;
        }

        const rawItems = Array.isArray(data)
          ? data
          : (data.items || data.data || []);

        const mappedSchedules: ScheduleItem[] = rawItems.map((rawItem: unknown) => {
          const item = typeof rawItem === "object" && rawItem !== null ? (rawItem as Record<string, unknown>) : {};
          const startD = typeof item.startDate === "string" ? new Date(item.startDate) : new Date();
          const endD = typeof item.endDate === "string" ? new Date(item.endDate) : new Date();
          const scheduledDate = typeof item.scheduledDate === "string" && item.scheduledDate.length > 0
            ? item.scheduledDate
            : !isNaN(startD.getTime())
            ? startD.toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "TBA";
          const startTime = typeof item.startTime === "string" && item.startTime.length > 0
            ? item.startTime
            : !isNaN(startD.getTime())
            ? startD.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
            : "08:00 AM";
          const endTime = typeof item.endTime === "string" && item.endTime.length > 0
            ? item.endTime
            : !isNaN(endD.getTime())
            ? endD.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
            : "12:00 PM";
          return {
            id: String(item.id || ""),
            scheduledDate,
            startTime,
            endTime,
            venue: typeof item.venue === "string" ? item.venue : "NTC Regional Examination Center",
            maximumSlots: typeof item.maximumSlots === "number" ? item.maximumSlots : null,
            availableSlots: typeof item.availableSlots === "number" ? item.availableSlots : null,
            startDate: typeof item.startDate === "string" ? item.startDate : null,
            endDate: typeof item.endDate === "string" ? item.endDate : null,
            startApplication: typeof item.startApplication === "string" ? item.startApplication : null,
            endApplication: typeof item.endApplication === "string" ? item.endApplication : typeof item.applicationDeadline === "string" ? item.applicationDeadline : null,
            applicationDeadline: typeof item.applicationDeadline === "string" ? item.applicationDeadline : typeof item.endApplication === "string" ? item.endApplication : null,
            regionName: typeof item.regionName === "string" ? item.regionName : typeof item.tenantName === "string" ? item.tenantName : null,
            tenantName: typeof item.tenantName === "string" ? item.tenantName : typeof item.regionName === "string" ? item.regionName : null,
            serviceName: typeof item.serviceName === "string" ? item.serviceName : null,
            title: typeof item.title === "string" ? item.title : null,
            remarks: typeof item.remarks === "string" ? item.remarks : typeof item.description === "string" ? item.description : null,
            description: typeof item.description === "string" ? item.description : typeof item.remarks === "string" ? item.remarks : null,
          };
        });
        setSchedules(mappedSchedules);
      } catch (err) {
        console.warn("[ExamFilingQueries] Failed to fetch exam schedules:", err);
        setSchedules([]);
      } finally {
        setLoadingSchedules(false);
      }
    }
    fetchSchedules();
  }, [selectedRegionId, selectedOfficeId, serviceId]);

  // Variants API Query
  const { data: variantsResponse } = api.useQuery<{ succeeded?: boolean; data?: any[]; items?: any[] } | any[]>(
    serviceId ? `/api/v2/services/${serviceId}/variants?pageSize=100` : null
  );
  const variants = Array.isArray(variantsResponse)
    ? variantsResponse
    : Array.isArray(variantsResponse?.data)
    ? variantsResponse.data
    : Array.isArray(variantsResponse?.items)
    ? variantsResponse.items
    : [];

  // Elements API Query
  const activeApplicant = applicants[currentApplicantIndex];
  const selectedVariantId = activeApplicant?.selectedVariantId;
  const { data: elementsResponse } = api.useQuery<{ succeeded?: boolean; data?: any[]; items?: any[] } | any[]>(
    selectedVariantId ? `/api/v2/service-variant-elements?serviceVariantId=${selectedVariantId}&pageSize=100` : null
  );
  const rawElements = Array.isArray(elementsResponse)
    ? elementsResponse
    : Array.isArray(elementsResponse?.data)
    ? elementsResponse.data
    : Array.isArray(elementsResponse?.items)
    ? elementsResponse.items
    : [];

  const seen = new Set<string>();
  const variantElements = rawElements.filter((elem) => {
    const key = typeof elem.id === "string" ? elem.id : String(elem.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const isLoadingElements = selectedVariantId !== undefined && selectedVariantId !== "" && elementsResponse === undefined;

  // Requirements API Query
  const { data: requirementsResponse } = api.useQuery<{ succeeded?: boolean; data?: any[]; items?: any[] } | any[]>(
    serviceId && selectedVariantId ? `/api/v2/services/${serviceId}/requirements?variantId=${selectedVariantId}&pageSize=100` : null
  );
  const dbRequirements = Array.isArray(requirementsResponse)
    ? requirementsResponse
    : Array.isArray(requirementsResponse?.data)
    ? requirementsResponse.data
    : Array.isArray(requirementsResponse?.items)
    ? requirementsResponse.items
    : [];

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
