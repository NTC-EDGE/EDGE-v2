import { Platform } from "react-native";
import { useApi } from "../../../../shared/hooks/useApi";
import { apiClient } from "@edge/api";

export interface UploadFileDescriptor {
  name: string;
  uri?: string;
  type?: string;
  file?: File | Blob;
}

export interface ApplicantUploadHolder {
  id?: string | number;
  uploads?: Record<string, UploadFileDescriptor | string | undefined>;
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

const isGuidString = (val: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());

const inferMimeFromName = (name: string): string => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  if (ext === "bmp") return "image/bmp";
  return "application/octet-stream";
};

/**
 * Resolves a File or Blob from an upload descriptor across Web and Mobile.
 */
export const resolveFileFromUpload = async (
  upload: UploadFileDescriptor | string
): Promise<File | Blob | null> => {
  const name = typeof upload === "string" ? upload : (upload?.name || "document");
  const uri = typeof upload === "string" ? "" : (upload?.uri ?? "");
  const explicitType = typeof upload === "object" && upload !== null ? upload?.type : undefined;
  const fallbackMime = inferMimeFromName(name);

  // 1. Prefer direct in-memory File / Blob when available (immune to blob: URL revocation)
  if (typeof upload === "object" && upload !== null && upload?.file instanceof Blob && (upload.file?.size ?? 0) > 0) {
    const rawBlob = upload.file;
    const mimeType =
      explicitType || (rawBlob?.type && rawBlob.type.trim() !== "" ? rawBlob.type : fallbackMime);
    if (typeof File !== "undefined") {
      try {
        return new File([rawBlob], name, { type: mimeType });
      } catch {
        return rawBlob;
      }
    }
    return rawBlob;
  }

  if (!uri || uri.trim() === "") return null;

  // 2. Fetch from URI (blob:, data:, file:, http:, etc.)
  try {
    const res = await fetch(uri);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} while reading ${uri}`);
    }
    const blob = await res.blob();
    const mimeType =
      explicitType || (blob?.type && blob.type.trim() !== "" ? blob.type : fallbackMime);

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
    const uploadKeys = Object.keys(uploadsMap).filter((k) => {
      const entry = uploadsMap[k];
      if (entry === null || entry === undefined) return false;
      if (typeof entry === "string") return entry.trim().length > 0;
      return Boolean((entry.name && entry.name.trim().length > 0) || (entry.uri && entry.uri.trim().length > 0) || entry.file);
    });
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

    // Pre-resolve each upload key to its target BackendRequirementItem so that
    // deleting & re-uploading an attachment (which reorders Object.keys) never
    // causes index collisions or overwrites an already-matched requirement.
    const getReqUniqueKey = (br: BackendRequirementItem): string =>
      (br.serviceVariantRequirementId || br.requirementId).toLowerCase();

    const resolvedReqByUploadKey = new Map<string, BackendRequirementItem>();
    const claimedReqKeys = new Set<string>();

    // Pass 1: Match by exact requirementId, serviceVariantRequirementId, or requirementName (case-insensitive)
    for (const fileKey of uploadKeys) {
      const rawReqIdInKey = (fileKey.startsWith("req-") ? fileKey.slice(4) : fileKey).trim();
      const rawLower = rawReqIdInKey.toLowerCase();
      const keyLower = fileKey.trim().toLowerCase();

      const matched = backendRequirements.find((br) => {
        const reqIdLower = br.requirementId.toLowerCase();
        const svrIdLower = (br.serviceVariantRequirementId ?? "").toLowerCase();
        const nameLower = (br.requirementName ?? "").replace(/\*$/, "").trim().toLowerCase();
        return (
          reqIdLower === rawLower ||
          (svrIdLower !== "" && svrIdLower === rawLower) ||
          (nameLower !== "" && (nameLower === rawLower || nameLower === keyLower))
        );
      });

      if (matched) {
        resolvedReqByUploadKey.set(fileKey, matched);
        claimedReqKeys.add(getReqUniqueKey(matched));
      }
    }

    // Pass 2: Match strictly numeric index keys (e.g. "req-0", "req-gen-0", "0")
    for (const fileKey of uploadKeys) {
      if (resolvedReqByUploadKey.has(fileKey)) continue;
      const rawReqIdInKey = (fileKey.startsWith("req-") ? fileKey.slice(4) : fileKey).trim();
      const indexMatch = /^(?:gen-)?(\d+)$/i.exec(rawReqIdInKey);
      if (!indexMatch) continue;

      const parsedKeyIdx = parseInt(indexMatch[1], 10);
      if (!Number.isNaN(parsedKeyIdx) && parsedKeyIdx >= 0 && parsedKeyIdx < backendRequirements.length) {
        const candidate = backendRequirements[parsedKeyIdx];
        if (candidate && !claimedReqKeys.has(getReqUniqueKey(candidate))) {
          resolvedReqByUploadKey.set(fileKey, candidate);
          claimedReqKeys.add(getReqUniqueKey(candidate));
        }
      }
    }

    // Pass 3: Fallback for any remaining keys — assign to unclaimed backendRequirements in order.
    // Note: If a key is a GUID from a previously selected variant and all backendRequirements
    // are already claimed, leave it unresolved so we don't overwrite a valid requirement.
    for (const fileKey of uploadKeys) {
      if (resolvedReqByUploadKey.has(fileKey)) continue;
      const rawReqIdInKey = (fileKey.startsWith("req-") ? fileKey.slice(4) : fileKey).trim();
      const unclaimed = backendRequirements.find((br) => !claimedReqKeys.has(getReqUniqueKey(br)));
      if (unclaimed) {
        resolvedReqByUploadKey.set(fileKey, unclaimed);
        claimedReqKeys.add(getReqUniqueKey(unclaimed));
      } else if (!isGuidString(rawReqIdInKey) && backendRequirements.length > 0) {
        resolvedReqByUploadKey.set(fileKey, backendRequirements[0]);
      }
    }

    // 4. Upload and link each picture / file
    for (let keyIdx = 0; keyIdx < uploadKeys.length; keyIdx++) {
      const fileKey = uploadKeys[keyIdx];
      const uploadEntry = uploadsMap[fileKey];
      if (uploadEntry === null || uploadEntry === undefined) continue;

      const matchedReq = resolvedReqByUploadKey.get(fileKey);
      if (backendRequirements.length > 0 && !matchedReq) {
        // Stale upload entry from a previous variant when all active requirements are already satisfied
        continue;
      }

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
