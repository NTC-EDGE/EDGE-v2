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
const index_1 = require("../../index");
async function submitApplication(command) {
    const response = await index_1.apiClient.post('/applications', command);
    return response.data;
}
async function submitTenantApplication(tenantId, command) {
    const response = await index_1.apiClient.post(`/tenants/${tenantId}/applications`, command);
    return response.data;
}
async function getApplicationById(id) {
    const response = await index_1.apiClient.get(`/applications/${id}`);
    return response.data;
}
async function getDraftApplications() {
    const response = await index_1.apiClient.get('/applications/drafts');
    return response.data;
}
async function getApplications(params) {
    const queryParams = new URLSearchParams();
    if (params !== undefined) {
        if (params.tenantId !== undefined && params.tenantId !== null) {
            queryParams.append('tenantId', params.tenantId);
        }
        if (params.status !== undefined && params.status !== null) {
            queryParams.append('status', params.status);
        }
        if (params.search !== undefined && params.search !== null) {
            queryParams.append('search', params.search);
        }
        if (params.pageNumber !== undefined && params.pageNumber !== null) {
            queryParams.append('pageNumber', params.pageNumber.toString());
        }
        if (params.pageSize !== undefined && params.pageSize !== null) {
            queryParams.append('pageSize', params.pageSize.toString());
        }
    }
    const url = queryParams.toString() !== ''
        ? `/applications?${queryParams.toString()}`
        : '/applications';
    const response = await index_1.apiClient.get(url);
    return response.data;
}
async function updateApplicationDraft(id, command) {
    const response = await index_1.apiClient.put(`/applications/${id}`, command);
    return response.data;
}
async function deleteDraftApplication(id) {
    const response = await index_1.apiClient.delete(`/applications/${id}`);
    return response.data;
}
async function finalizeApplicationSubmission(id) {
    const response = await index_1.apiClient.post(`/applications/${id}/submit`);
    return response.data;
}
async function uploadApplicantRequirement(id, applicantId, command) {
    const response = await index_1.apiClient.post(`/applications/${id}/applicants/${applicantId}/requirements`, command);
    return response.data;
}
async function uploadTenantApplicationRequirement(tenantId, appId, command) {
    const response = await index_1.apiClient.patch(`/tenants/${tenantId}/applications/${appId}`, command);
    return response.data;
}
async function previewCsvImport(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await index_1.apiClient.post('/applications/csv-preview', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}
