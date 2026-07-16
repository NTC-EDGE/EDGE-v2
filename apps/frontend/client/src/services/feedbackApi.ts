import { BASE_URL } from "@services/config";

export interface SubmitFeedbackPayload {
    fullName?: string;
    email?: string;
    contactNumber?: string;
    officeOrAgency?: string;
    regionCode?: string;
    rating: number;
    comments: string;
    submittedBy?: string;
}

export const submitFeedback = async (
    regionCode: string,
    payload: SubmitFeedbackPayload,
    token?: string
) => {
    const API_BASE_URL = BASE_URL;

    if (!API_BASE_URL) {
        throw new Error("Missing API base URL.");
    }

    const response = await fetch(
        `${API_BASE_URL}/v2/google-sheet-feedback/${regionCode?.trim().toUpperCase()}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
                fullName: payload.fullName ?? "",
                email: payload.email ?? "",
                contactNumber: payload.contactNumber ?? "",
                officeOrAgency: payload.officeOrAgency ?? "",
                regionCode: regionCode?.trim().toUpperCase(),
                rating: payload.rating,
                comments: payload.comments ?? "",
                submittedBy: payload.submittedBy ?? "",
            }),
        }
    );

    const responseText = await response.text();
    let data: any = {};
    try {
        data = responseText ? JSON.parse(responseText) : {};
    } catch {
        data = { message: responseText };
    }

    if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to submit feedback.");
    }

    return data;
};