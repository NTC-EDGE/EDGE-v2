import { storageService } from '@edge/api';
import { CheckProofFile } from './paymentSubmissionTypes';

export type UploadCheckProofResult =
  | { success: true; fileId: string; error?: never }
  | { success: false; fileId?: never; error: string };

/**
 * Uploads an attached check proof document/image to tenant storage.
 * Explicitly surfaces network fetch failures or storage service rejections
 * to downstream submission flows and the client UI.
 */
export async function uploadCheckProof(
  proof: CheckProofFile,
  tenantId: string
): Promise<UploadCheckProofResult> {
  let fileBlob: Blob | null = null;
  if (proof.file instanceof Blob) {
    fileBlob = proof.file;
  } else if (typeof proof.uri === 'string' && proof.uri.trim() !== '') {
    try {
      const res = await fetch(proof.uri);
      if (res.ok) {
        fileBlob = await res.blob();
      } else {
        return {
          success: false,
          error: `Could not retrieve file data for "${proof.name || 'check proof'}" (HTTP ${res.status}).`,
        };
      }
    } catch (fetchErr: unknown) {
      const detail = fetchErr instanceof Error ? fetchErr.message : 'Network error reading check proof file.';
      console.warn('Could not read check proof file:', fetchErr);
      return {
        success: false,
        error: `Network error reading check proof file "${proof.name || 'proof'}": ${detail}`,
      };
    }
  }

  if (fileBlob === null) {
    return {
      success: false,
      error: `Check proof file "${proof.name || 'unnamed'}" could not be loaded into memory. Please select the file again.`,
    };
  }

  const [storageRes, storageErr] = await storageService.uploadFile(
    fileBlob,
    proof.name || `check_proof_${Date.now()}.jpg`,
    'payments',
    tenantId
  );

  if (storageErr !== null || !storageRes?.data) {
    const errorDetail =
      typeof storageErr === 'string' && storageErr.trim() !== ''
        ? storageErr
        : 'Storage service rejected the file upload.';
    console.warn('Check proof upload failed:', storageErr);
    return {
      success: false,
      error: errorDetail,
    };
  }

  return {
    success: true,
    fileId: storageRes.data.id,
  };
}
