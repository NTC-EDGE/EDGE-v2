/**
 * Shared utility to validate acceptable document attachment file types (Images & PDFs)
 * across both web file input and native mobile document pickers.
 */
export function isAllowedRequirementFileType(fileName: string, mimeType: string): boolean {
  const cleanFileName = (fileName || '').toLowerCase();
  const cleanMimeType = (mimeType || '').toLowerCase();

  const isImage =
    cleanMimeType.startsWith('image/') ||
    /\.(jpg|jpeg|png|webp|gif|bmp|tif|tiff)$/i.test(cleanFileName);

  const isPdf =
    cleanMimeType === 'application/pdf' || cleanFileName.endsWith('.pdf');

  return isImage || isPdf;
}
