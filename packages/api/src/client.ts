import axios from "axios";
import useSWR, { SWRConfiguration, SWRResponse } from "swr";

declare const process: { env: Record<string, string | undefined> };

const getApiUrl = (): string => {
  if (typeof process === "undefined") {
    return "http://localhost:5038";
  }
  const envUrl =
    process.env?.EXPO_PUBLIC_API_URL || process.env?.NEXT_PUBLIC_API_URL;
  if (typeof envUrl === "string" && envUrl.trim().length > 0) {
    return envUrl.trim();
  }
  return "http://localhost:5038";
};

export const apiClient = axios.create({
  baseURL: getApiUrl(),
});

export const setAuthToken = (token: string | null): void => {
  if (token !== null) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

export const formatEndpointUrl = (url: string): string => {
  let cleanedUrl = url;
  const apiUrl = getApiUrl();
  try {
    const match = apiUrl.match(/^(?:https?:\/\/)?([^/]+)/i);
    const host = match ? match[1] : null;
    if (host && cleanedUrl.includes(host)) {
      const escapedHost = host.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`.*${escapedHost}`);
      cleanedUrl = cleanedUrl.replace(regex, "");
    }
  } catch {
    // Fallback if parsing fails
  }
  return cleanedUrl;
};

export const fetcher = <T>(url: string): Promise<T> =>
  apiClient.get<T>(formatEndpointUrl(url)).then((res) => res.data);

export function useAuthenticatedSWR<Data = unknown, Error = unknown>(
  key: string | null,
  clerkGetToken: () => Promise<string | null>,
  config?: SWRConfiguration<Data, Error>,
): SWRResponse<Data, Error> {
  const customFetcher = async (rawUrl: string): Promise<Data> => {
    const sanitizedUrl = formatEndpointUrl(rawUrl);
    const token = await clerkGetToken();
    const headers = token !== null ? { Authorization: `Bearer ${token}` } : {};
    const response = await apiClient.get<Data>(sanitizedUrl, { headers });
    return response.data;
  };

  const defaultConfig: SWRConfiguration<Data, Error> = {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    keepPreviousData: true,
    dedupingInterval: 10000,
    ...config,
  };

  return useSWR<Data, Error>(key, customFetcher, defaultConfig);
}
