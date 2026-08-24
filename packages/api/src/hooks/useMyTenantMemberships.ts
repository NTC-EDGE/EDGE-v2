import useSWR from "swr";
import { fetchMyTenantMemberships } from "../services/authService";
import { TenantRegionMembershipDto } from "../types/auth";

export interface UseMyTenantMembershipsReturn {
  memberships: TenantRegionMembershipDto[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<TenantRegionMembershipDto[] | undefined>;
}

/**
 * Data Layer Hook (useSWR) for consuming the user's authorized Regional Office tenant memberships
 * from the C# .NET 10 Backend API.
 */
export function useMyTenantMemberships(
  token: string | null | undefined,
  shouldFetch = true
): UseMyTenantMembershipsReturn {
  const isReady = shouldFetch && typeof token === "string" && token.trim().length > 0;
  const cacheKey = isReady ? ["/api/v2/tenants/my-memberships", token] : null;

  const { data, error, isLoading, mutate } = useSWR<TenantRegionMembershipDto[]>(
    cacheKey,
    () => fetchMyTenantMemberships(token),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  );

  const memberships = data ?? [];

  return {
    memberships,
    isLoading: isReady ? isLoading : shouldFetch,
    isError: Boolean(error),
    error,
    refetch: mutate,
  };
}
