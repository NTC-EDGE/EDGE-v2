import { Platform } from "react-native";
import { useApi } from "../../../../shared/hooks/useApi";
import { apiClient } from "@edge/api";

export interface ApplicantUploadHolder {
  id?: string | number;
  uploads?: Record<string, { name: string; uri: string } | string | undefined>;
}

export interface UploadRequirementsParams {
  api: ReturnType<typeof useApi>;
  applicationId: string;
  tenantId: string;
  applicants: ApplicantUploadHolder[];
  getToken?: () => Promise<string | null>;
}

interface ServerApplicantItem {
  id?: string;
  applicantId?: string;
  sequenceOrder?: number;
}

interface BackendRequirementItem {
  requirementId: string;
  serviceVariantRequirementId?: string;
  requirementName?: string;
}

/**
 * Resolves a File or Blob from an upload descriptor across Web and Mobile.
 */
export const resolveFileFromUpload = async (
  upload: { name: string; uri?: string } | string
): Promise<File | Blob | null> => {
  const name = typeof upload === "string" ? upload : upload.name;
  const uri = typeof upload === "string" ? "" : (upload.uri ?? "");

  if (!uri || uri.trim() === "") return null;

  try {
    const res = await fetch(uri);
    const blob = await res.blob();
    const mimeType = blob.type && blob.type.trim() !== "" ? blob.type : "application/octet-stream";

    if (typeof File !== "undefined") {
      try {
        return new File([blob], name, { type: mimeType });
      } catch {
        return blob;
      }
    }
    return blob;
  } catch (err) {
    console.warn("[requirementUploadHelper] Could not resolve file from URI:", uri, err);
    return null;
  }
};

/**
 * Helper to upload all picked pictures and document attachments for submitted applicants,
 * then link the resulting StoredFileIds to the corresponding applicant requirements.
 */
export async function uploadRequirementsAfterSubmit({
  api,
  applicationId,
  tenantId,
  applicants,
  getToken,
}: UploadRequirementsParams): Promise<void> {
  if (!applicationId || !tenantId || applicants.length === 0) return;

  // 1. Fetch the created application to get server-assigned applicant IDs
  let serverApplicants: ServerApplicantItem[] = [];
  try {
    const res = await api.get<unknown>(`/api/v2/applications/${applicationId}`);
    const resObj = typeof res === "object" && res !== null ? (res as Record<string, unknown>) : {};
    const appData =
      resObj.succeeded === true && typeof resObj.data === "object" && resObj.data !== null
        ? (resObj.data as Record<string, unknown>)
        : resObj;

    const rawApplicants = Array.isArray(appData.applicationApplicants)
      ? (appData.applicationApplicants as unknown[])
      : Array.isArray(appData.Applicants)
      ? (appData.Applicants as unknown[])
      : Array.isArray(appData.applicants)
      ? (appData.applicants as unknown[])
      : [];

    serverApplicants = rawApplicants.map((item) => {
      if (typeof item === "object" && item !== null) {
        const o = item as Record<string, unknown>;
        const rawSeq = o.sequenceOrder;
        const parsedSeq = typeof rawSeq === "number" ? rawSeq : typeof rawSeq === "string" ? parseInt(rawSeq, 10) : undefined;
        return {
          id: typeof o.id === "string" ? o.id : undefined,
          applicantId: typeof o.applicantId === "string" ? o.applicantId : undefined,
          sequenceOrder: Number.isNaN(parsedSeq) ? undefined : parsedSeq,
        };
      }
      return {};
    });
  } catch (err) {
    console.warn("[requirementUploadHelper] Could not fetch application details:", err);
    return;
  }

  let authHeaders: Record<string, string> = {};
  if (getToken) {
    try {
      const token = await getToken();
      if (token && token.trim() !== "") {
        authHeaders = { Authorization: `Bearer ${token}` };
      }
    } catch {
      // ignore
    }
  }

  // 2. Loop through each applicant and their uploads
  for (let i = 0; i < applicants.length; i++) {
    const localApplicant = applicants[i];
    const uploadsMap = localApplicant?.uploads ?? {};
    const uploadKeys = Object.keys(uploadsMap);
    if (uploadKeys.length === 0) continue;

    // Match server applicant by sequenceOrder (1-indexed) or fallback to array index
    const serverApplicant =
      serverApplicants.find((sa) => sa.sequenceOrder === i + 1) ?? serverApplicants[i];

    const applicantId = serverApplicant?.applicantId ?? serverApplicant?.id ?? null;
    if (!applicantId) {
      console.warn(`[requirementUploadHelper] No server applicantId found for applicant index ${i}. Skipping.`);
      continue;
    }

    // 3. Fetch backend requirement definitions for this applicant
    let backendRequirements: BackendRequirementItem[] = [];
    try {
      const reqRes = await api.get<unknown>(
        `/api/v2/applications/${applicationId}/applicants/${applicantId}/requirements`
      );
      const reqObj = typeof reqRes === "object" && reqRes !== null ? (reqRes as Record<string, unknown>) : {};
      const reqList =
        reqObj.succeeded === true && Array.isArray(reqObj.data)
          ? (reqObj.data as unknown[])
          : Array.isArray(reqRes)
          ? (reqRes as unknown[])
          : [];

      backendRequirements = reqList.map((r) => {
        if (typeof r === "object" && r !== null) {
          const ro = r as Record<string, unknown>;
          return {
            requirementId: typeof ro.requirementId === "string" ? ro.requirementId : "",
            serviceVariantRequirementId:
              typeof ro.serviceVariantRequirementId === "string" ? ro.serviceVariantRequirementId : undefined,
            requirementName: typeof ro.requirementName === "string" ? ro.requirementName : undefined,
          };
        }
        return { requirementId: "" };
      }).filter((r) => r.requirementId !== "");
    } catch (err) {
      console.warn(`[requirementUploadHelper] Could not fetch requirements for applicant ${applicantId}:`, err);
    }

    // 4. Upload and link each picture / file
    for (let keyIdx = 0; keyIdx < uploadKeys.length; keyIdx++) {
      const fileKey = uploadKeys[keyIdx];
      const uploadEntry = uploadsMap[fileKey];
      if (uploadEntry === null || uploadEntry === undefined) continue;

      const fileName =
        typeof uploadEntry === "string"
          ? uploadEntry
          : typeof uploadEntry.name === "string" && uploadEntry.name.trim() !== ""
          ? uploadEntry.name
          : `requirement_attachment_${keyIdx + 1}.jpg`;

      const resolvedFile = await resolveFileFromUpload(uploadEntry);
      if (!resolvedFile) {
        console.warn(`[requirementUploadHelper] Could not resolve file for key "${fileKey}". Skipping.`);
        continue;
      }

      // Step A: Upload to tenant storage
      let storedFileId: string | null = null;
      try {
        const formData = new FormData();
        if (typeof File !== "undefined" && resolvedFile instanceof File) {
          formData.append("file", resolvedFile, fileName);
        } else {
          formData.append("file", resolvedFile, fileName);
        }
        formData.append("category", "requirements");

        const uploadRes = await apiClient.post<unknown>(
          `/api/v2/tenants/${tenantId}/storage/upload`,
          formData,
          {
            headers: {
              ...authHeaders,
              "Content-Type": "multipart/form-data",
            },
            timeout: 60000,
          }
        );

        const uploadResObj = typeof uploadRes.data === "object" && uploadRes.data !== null
          ? (uploadRes.data as Record<string, unknown>)
          : {};
        const uploadData =
          uploadResObj.succeeded === true && typeof uploadResObj.data === "object" && uploadResObj.data !== null
            ? (uploadResObj.data as Record<string, unknown>)
            : uploadResObj;

        if (typeof uploadData.id === "string" && uploadData.id.trim() !== "") {
          storedFileId = uploadData.id;
        }
      } catch (uploadErr) {
        console.warn(`[requirementUploadHelper] Storage upload failed for file "${fileName}":`, uploadErr);
        continue;
      }

      if (!storedFileId) {
        console.warn(`[requirementUploadHelper] Storage upload succeeded but no StoredFileId for "${fileName}".`);
        continue;
      }

      // Step B: Resolve requirement target ID
      // 1. Key could be "req-<Guid>"
      const rawReqIdInKey = fileKey.startsWith("req-") ? fileKey.slice(4) : fileKey;
      const matchedByExactId = backendRequirements.find(
        (br) => br.requirementId === rawReqIdInKey || br.serviceVariantRequirementId === rawReqIdInKey
      );

      // 2. Key could be numeric index "0", "1", "req-0"
      const parsedKeyIdx = parseInt(rawReqIdInKey, 10);
      const matchedByIndex = !Number.isNaN(parsedKeyIdx) && parsedKeyIdx >= 0 && parsedKeyIdx < backendRequirements.length
        ? backendRequirements[parsedKeyIdx]
        : undefined;

      // 3. Fallback to current loop index
      const matchedReq = matchedByExactId ?? matchedByIndex ?? backendRequirements[keyIdx] ?? backendRequirements[0];

      const requirementBody: Record<string, unknown> = { storedFileId };
      if (matchedReq) {
        if (matchedReq.serviceVariantRequirementId) {
          requirementBody.serviceVariantRequirementId = matchedReq.serviceVariantRequirementId;
        } else if (matchedReq.requirementId) {
          requirementBody.requirementId = matchedReq.requirementId;
        }
      }

      const hasReqId =
        typeof requirementBody.requirementId === "string" ||
        typeof requirementBody.serviceVariantRequirementId === "string";

      if (!hasReqId) {
        console.warn(
          `[requirementUploadHelper] No requirementId found for file "${fileName}" (key: ${fileKey}). Skipping link.`
        );
        continue;
      }

      try {
        await api.post(
          `/api/v2/applications/${applicationId}/applicants/${applicantId}/requirements`,
          requirementBody
        );
      } catch (linkErr) {
        console.warn(
          `[requirementUploadHelper] Failed to link StoredFileId "${storedFileId}" for applicant ${applicantId}:`,
          linkErr
        );
      }
    }
  }
}
