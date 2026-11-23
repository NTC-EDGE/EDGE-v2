import React from 'react';
import { EditedImageResult } from '@edge/ui';
import { DocumentPreviewModal, DocumentPreviewFile } from './DocumentPreviewModal';

interface CustomDocPreviewModalProps {
  previewCustomDoc: DocumentPreviewFile | null;
  onClose: () => void;
  onSaveEditedImage?: (result: EditedImageResult) => void;
  allowEditImage?: boolean;
}

export function CustomDocPreviewModal({
  previewCustomDoc,
  onClose,
  onSaveEditedImage,
  allowEditImage = false,
}: CustomDocPreviewModalProps) {
  return (
    <DocumentPreviewModal
      visible={previewCustomDoc !== null}
      onClose={onClose}
      file={previewCustomDoc}
      label={previewCustomDoc?.name}
      onSaveEditedImage={allowEditImage ? onSaveEditedImage : undefined}
      allowEditImage={allowEditImage}
    />
  );
}
