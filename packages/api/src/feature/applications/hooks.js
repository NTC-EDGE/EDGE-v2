"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useApplications = useApplications;
exports.useApplicationById = useApplicationById;
exports.useDraftApplications = useDraftApplications;
const client_1 = require("../../client");
function useApplications(clerkGetToken, params, config) {
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
    const key = queryString !== "" ? `/applications?${queryString}` : "/applications";
    return (0, client_1.useAuthenticatedSWR)(key, clerkGetToken, config);
}
function useApplicationById(id, clerkGetToken, config) {
    const key = id !== null && id.length > 0 ? `/applications/${id}` : null;
    return (0, client_1.useAuthenticatedSWR)(key, clerkGetToken, config);
}
function useDraftApplications(clerkGetToken, config) {
    return (0, client_1.useAuthenticatedSWR)("/applications/drafts", clerkGetToken, config);
}
