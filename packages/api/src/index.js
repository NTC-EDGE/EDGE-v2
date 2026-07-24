"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetcher =
  exports.formatEndpointUrl =
  exports.setAuthToken =
  exports.apiClient =
    void 0;
exports.useAuthenticatedSWR = useAuthenticatedSWR;
const axios_1 = __importDefault(require("axios"));
const swr_1 = __importDefault(require("swr"));
const getApiUrl = () => {
  const envUrl =
    process.env.EXPO_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL;
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
    exports.apiClient.defaults.headers.common["Authorization"] =
      `Bearer ${token}`;
  } else {
    delete exports.apiClient.defaults.headers.common["Authorization"];
  }
};
exports.setAuthToken = setAuthToken;
const formatEndpointUrl = (url) => {
  let cleanedUrl = url;
  if (cleanedUrl.includes("pg.dev.nextstep-software.com")) {
    cleanedUrl = cleanedUrl.replace(/.*pg\.dev\.nextstep-software\.com/, "");
  }

  return cleanedUrl;
};
exports.formatEndpointUrl = formatEndpointUrl;
const fetcher = (url) =>
  exports.apiClient
    .get((0, exports.formatEndpointUrl)(url))
    .then((res) => res.data);
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
__exportStar(require("./types"), exports);
__exportStar(require("./feature/applications"), exports);
