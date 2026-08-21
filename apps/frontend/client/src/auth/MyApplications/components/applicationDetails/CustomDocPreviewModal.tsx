import React from 'react';
import { DocumentPreviewModal } from '../../../../shared/components/DocumentPreviewModal';

interface CustomDocPreviewModalProps {
  previewCustomDoc: { uri: string; name: string } | null;
  onClose: () => void;
}

export function CustomDocPreviewModal({ previewCustomDoc, onClose }: CustomDocPreviewModalProps) {
  return (
    <DocumentPreviewModal
      visible={previewCustomDoc !== null}
      onClose={onClose}
      file={previewCustomDoc}
      label={previewCustomDoc?.name}
    />
  );
}
