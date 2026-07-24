import axios from "axios";
import { SWRConfiguration, SWRResponse } from "swr";
export declare const apiClient: axios.AxiosInstance;
export declare const setAuthToken: (token: string | null) => void;
export declare const formatEndpointUrl: (url: string) => string;
export declare const fetcher: <T>(url: string) => Promise<T>;
export declare function useAuthenticatedSWR<Data = unknown, Error = unknown>(key: string | null, clerkGetToken: () => Promise<string | null>, config?: SWRConfiguration<Data, Error>): SWRResponse<Data, Error>;
export * from "./types";
export * from "./feature/applications";
