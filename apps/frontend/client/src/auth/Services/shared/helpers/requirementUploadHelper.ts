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

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

/**
 * Helper to upload all picked pictures and document attachments for submitted applicants,
 * then link the resulting StoredFileIds to the corresponding applicant requirements.
 * Throws an error if any requirement upload or link operation fails.
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
    const resObj = isRecord(res) ? res : {};
    const appData =
      resObj.succeeded === true && isRecord(resObj.data)
        ? resObj.data
        : resObj;

    const rawApplicants = Array.isArray(appData.applicationApplicants)
      ? appData.applicationApplicants
      : Array.isArray(appData.Applicants)
      ? appData.Applicants
      : Array.isArray(appData.applicants)
      ? appData.applicants
      : [];

    serverApplicants = rawApplicants.map((item) => {
      if (isRecord(item)) {
        const rawSeq = item.sequenceOrder;
        const parsedSeq = typeof rawSeq === "number" ? rawSeq : typeof rawSeq === "string" ? parseInt(rawSeq, 10) : undefined;
        return {
          id: typeof item.id === "string" ? item.id : undefined,
          applicantId: typeof item.applicantId === "string" ? item.applicantId : undefined,
          sequenceOrder: Number.isNaN(parsedSeq) ? undefined : parsedSeq,
        };
      }
      return {};
    });
  } catch (err) {
    console.error("[requirementUploadHelper] Could not fetch application details for upload:", err);
    throw new Error("Failed to load application details for document attachment. Please try again.");
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
      console.warn(`[requirementUploadHelper] No server applicantId found for applicant index ${i}.`);
      throw new Error(`Unable to map applicant record for document upload at applicant #${i + 1}.`);
    }

    // 3. Fetch backend requirement definitions for this applicant
    let backendRequirements: BackendRequirementItem[] = [];
    try {
      const reqRes = await api.get<unknown>(
        `/api/v2/applications/${applicationId}/applicants/${applicantId}/requirements`
      );
      const reqObj = isRecord(reqRes) ? reqRes : {};
      const reqList =
        reqObj.succeeded === true && Array.isArray(reqObj.data)
          ? reqObj.data
          : Array.isArray(reqRes)
          ? reqRes
          : [];

      backendRequirements = reqList.map((r) => {
        if (isRecord(r)) {
          return {
            requirementId: typeof r.requirementId === "string" ? r.requirementId : "",
            serviceVariantRequirementId:
              typeof r.serviceVariantRequirementId === "string" ? r.serviceVariantRequirementId : undefined,
            requirementName: typeof r.requirementName === "string" ? r.requirementName : undefined,
          };
        }
        return { requirementId: "" };
      }).filter((r) => r.requirementId !== "");
    } catch (err) {
      console.warn(`[requirementUploadHelper] Could not fetch requirements catalog for applicant ${applicantId}:`, err);
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
        throw new Error(`Could not read file data for requirement "${fileName}".`);
      }

      // Step A: Upload to tenant storage
      let storedFileId: string | null = null;
      try {
        const formData = new FormData();
        formData.append("file", resolvedFile, fileName);
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

        const uploadResObj = isRecord(uploadRes.data) ? uploadRes.data : {};
        const uploadData =
          uploadResObj.succeeded === true && isRecord(uploadResObj.data)
            ? uploadResObj.data
            : uploadResObj;

        if (typeof uploadData.id === "string" && uploadData.id.trim() !== "") {
          storedFileId = uploadData.id;
        }
      } catch (uploadErr) {
        console.error(`[requirementUploadHelper] Storage upload failed for file "${fileName}":`, uploadErr);
        throw new Error(`Failed to upload supporting document "${fileName}". Please check your connection and try again.`);
      }

      if (!storedFileId) {
        throw new Error(`Failed to store attachment "${fileName}". Storage service returned no file identifier.`);
      }

      // Step B: Resolve requirement target ID
      const rawReqIdInKey = fileKey.startsWith("req-") ? fileKey.slice(4) : fileKey;
      const matchedByExactId = backendRequirements.find(
        (br) => br.requirementId === rawReqIdInKey || br.serviceVariantRequirementId === rawReqIdInKey
      );

      const parsedKeyIdx = parseInt(rawReqIdInKey, 10);
      const matchedByIndex = !Number.isNaN(parsedKeyIdx) && parsedKeyIdx >= 0 && parsedKeyIdx < backendRequirements.length
        ? backendRequirements[parsedKeyIdx]
        : undefined;

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
        const linkRes = await api.post<unknown>(
          `/api/v2/applications/${applicationId}/applicants/${applicantId}/requirements`,
          requirementBody
        );
        const linkObj = isRecord(linkRes) ? linkRes : {};
        if (linkObj.succeeded === false) {
          const msg = typeof linkObj.message === "string" ? linkObj.message : `Failed to link requirement "${fileName}".`;
          throw new Error(msg);
        }
      } catch (linkErr) {
        console.error(
          `[requirementUploadHelper] Failed to link StoredFileId "${storedFileId}" for applicant ${applicantId}:`,
          linkErr
        );
        const msg = linkErr instanceof Error ? linkErr.message : `Failed to register requirement document "${fileName}" with application.`;
        throw new Error(msg);
      }
    }
  }
}
