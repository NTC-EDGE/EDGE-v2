import React from 'react';
import { EditedImageResult } from '@edge/ui';
import { DocumentPreviewModal, DocumentPreviewFile } from './DocumentPreviewModal';

interface CustomDocPreviewModalProps {
  previewCustomDoc: DocumentPreviewFile | null;
  onClose: () => void;
  onSaveEditedImage?: (result: EditedImageResult) => void;
}

export function CustomDocPreviewModal({ previewCustomDoc, onClose, onSaveEditedImage }: CustomDocPreviewModalProps) {
  return (
    <DocumentPreviewModal
      visible={previewCustomDoc !== null}
      onClose={onClose}
      file={previewCustomDoc}
      label={previewCustomDoc?.name}
      onSaveEditedImage={onSaveEditedImage}
    />
  );
}
