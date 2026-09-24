import React from 'react';
import { DocumentPreviewModal, DocumentPreviewFile } from '../../../../shared/components/DocumentPreviewModal';

interface CustomDocPreviewModalProps {
  previewCustomDoc: DocumentPreviewFile | null;
  onClose: () => void;
  onDownload?: (file: DocumentPreviewFile | string) => void;
}

export function CustomDocPreviewModal({
  previewCustomDoc,
  onClose,
  onDownload,
}: CustomDocPreviewModalProps) {
  return (
    <DocumentPreviewModal
      visible={previewCustomDoc !== null}
      onClose={onClose}
      file={previewCustomDoc}
      label={previewCustomDoc?.name}
      onDownload={onDownload}
    />
  );
}
