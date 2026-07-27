"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetcher = exports.formatEndpointUrl = exports.setAuthToken = exports.apiClient = void 0;
exports.useAuthenticatedSWR = useAuthenticatedSWR;
const axios_1 = __importDefault(require("axios"));
const swr_1 = __importDefault(require("swr"));
const getApiUrl = () => {
    if (typeof process === "undefined") {
        return "http://localhost:5038";
    }
    const envUrl = process.env?.EXPO_PUBLIC_API_URL || process.env?.NEXT_PUBLIC_API_URL;
    if (typeof envUrl === "string" && envUrl.trim().length > 0) {
        return envUrl.trim();
    }
    return "http://localhost:5038";
};
exports.apiClient = axios_1.default.create({
    baseURL: getApiUrl(),
});
const setAuthToken = (token) => {
    if (token !== null) {
        exports.apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    else {
        delete exports.apiClient.defaults.headers.common["Authorization"];
    }
};
exports.setAuthToken = setAuthToken;
const formatEndpointUrl = (url) => {
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
    }
    catch {
        // Fallback if parsing fails
    }
    return cleanedUrl;
};
exports.formatEndpointUrl = formatEndpointUrl;
const fetcher = (url) => exports.apiClient.get((0, exports.formatEndpointUrl)(url)).then((res) => res.data);
exports.fetcher = fetcher;
function useAuthenticatedSWR(key, clerkGetToken, config) {
    const customFetcher = async (rawUrl) => {
        const sanitizedUrl = (0, exports.formatEndpointUrl)(rawUrl);
        const token = await clerkGetToken();
        const headers = token !== null ? { Authorization: `Bearer ${token}` } : {};
        const response = await exports.apiClient.get(sanitizedUrl, { headers });
        return response.data;
    };
    const defaultConfig = {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        keepPreviousData: true,
        dedupingInterval: 10000,
        ...config,
    };
    return (0, swr_1.default)(key, customFetcher, defaultConfig);
}
