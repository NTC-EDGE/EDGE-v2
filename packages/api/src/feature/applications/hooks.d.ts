import { SWRConfiguration, SWRResponse } from "swr";
import { ApiResponse, PaginatedApiResponse } from "../../types";
import { ApplicationDto, GetApplicationsParams } from "./types";
export declare function useApplications(clerkGetToken: () => Promise<string | null>, params?: GetApplicationsParams, config?: SWRConfiguration<PaginatedApiResponse<ApplicationDto>>): SWRResponse<PaginatedApiResponse<ApplicationDto>>;
export declare function useApplicationById(id: string | null, clerkGetToken: () => Promise<string | null>, config?: SWRConfiguration<ApiResponse<ApplicationDto>>): SWRResponse<ApiResponse<ApplicationDto>>;
export declare function useDraftApplications(clerkGetToken: () => Promise<string | null>, config?: SWRConfiguration<ApiResponse<ApplicationDto[]>>): SWRResponse<ApiResponse<ApplicationDto[]>>;
