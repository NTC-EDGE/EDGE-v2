"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useApplications = useApplications;
exports.useApplicationById = useApplicationById;
exports.useDraftApplications = useDraftApplications;
const client_1 = require("../../client");
function useApplications(clerkGetToken, params, config) {
    // When params is explicitly null, pass null as the SWR key → fetch is skipped
    let key = null;
    if (params !== null) {
        const queryParams = new URLSearchParams();
        if (params !== undefined) {
            if (params.tenantId !== undefined && params.tenantId !== null) {
                queryParams.append("tenantId", params.tenantId);
            }
            if (params.status !== undefined && params.status !== null) {
                queryParams.append("status", params.status);
            }
            if (params.search !== undefined && params.search !== null) {
                queryParams.append("search", params.search);
            }
            if (params.pageNumber !== undefined && params.pageNumber !== null) {
                queryParams.append("pageNumber", params.pageNumber.toString());
            }
            if (params.pageSize !== undefined && params.pageSize !== null) {
                queryParams.append("pageSize", params.pageSize.toString());
            }
        }
        const queryString = queryParams.toString();
        key =
            queryString !== ""
                ? `/api/v2/applications?${queryString}`
                : "/api/v2/applications";
    }
    return (0, client_1.useAuthenticatedSWR)(key, clerkGetToken, config);
}
function useApplicationById(id, clerkGetToken, config) {
    const key = id !== null && id.length > 0 ? `/api/v2/applications/${id}` : null;
    return (0, client_1.useAuthenticatedSWR)(key, clerkGetToken, config);
}
function useDraftApplications(clerkGetToken, enabled = true, config) {
    // When not enabled, pass null key → SWR skips the fetch
    const key = enabled ? "/api/v2/applications/drafts" : null;
    return (0, client_1.useAuthenticatedSWR)(key, clerkGetToken, config);
}
