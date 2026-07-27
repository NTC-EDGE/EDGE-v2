"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitApplication = submitApplication;
exports.submitTenantApplication = submitTenantApplication;
exports.getApplicationById = getApplicationById;
exports.getDraftApplications = getDraftApplications;
exports.getApplications = getApplications;
exports.updateApplicationDraft = updateApplicationDraft;
exports.deleteDraftApplication = deleteDraftApplication;
exports.finalizeApplicationSubmission = finalizeApplicationSubmission;
exports.uploadApplicantRequirement = uploadApplicantRequirement;
exports.uploadTenantApplicationRequirement = uploadTenantApplicationRequirement;
exports.previewCsvImport = previewCsvImport;
const client_1 = require("../../client");
async function submitApplication(command) {
    const response = await client_1.apiClient.post("/api/v2/applications", command);
    return response.data;
}
async function submitTenantApplication(tenantId, command) {
    const response = await client_1.apiClient.post(`/api/v2/tenants/${tenantId}/applications`, command);
    return response.data;
}
async function getApplicationById(id) {
    const response = await client_1.apiClient.get(`/api/v2/applications/${id}`);
    return response.data;
}
async function getDraftApplications() {
    const response = await client_1.apiClient.get("/api/v2/applications/drafts");
    return response.data;
}
async function getApplications(params) {
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
    const url = queryParams.toString() !== ""
        ? `/api/v2/applications?${queryParams.toString()}`
        : "/api/v2/applications";
    const response = await client_1.apiClient.get(url);
    return response.data;
}
async function updateApplicationDraft(id, command) {
    const response = await client_1.apiClient.put(`/api/v2/applications/${id}`, command);
    return response.data;
}
async function deleteDraftApplication(id) {
    const response = await client_1.apiClient.delete(`/api/v2/applications/${id}`);
    return response.data;
}
async function finalizeApplicationSubmission(id) {
    const response = await client_1.apiClient.post(`/api/v2/applications/${id}/submit`);
    return response.data;
}
async function uploadApplicantRequirement(id, applicantId, command) {
    const response = await client_1.apiClient.post(`/api/v2/applications/${id}/applicants/${applicantId}/requirements`, command);
    return response.data;
}
async function uploadTenantApplicationRequirement(tenantId, appId, command) {
    const response = await client_1.apiClient.patch(`/api/v2/tenants/${tenantId}/applications/${appId}`, command);
    return response.data;
}
async function previewCsvImport(file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await client_1.apiClient.post("/api/v2/applications/csv-preview", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
}
