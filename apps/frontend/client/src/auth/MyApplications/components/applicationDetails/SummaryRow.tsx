import React from 'react';
import { View, Text } from 'react-native';
import { TYPOGRAPHY } from '@edge/ui';
import { isRecord } from './applicationDetailsHelpers';
import { SignatureSummaryRow } from './SignatureSummaryRow';
import { JsonTableSummaryRow } from './JsonTableSummaryRow';
import { CheckboxSummaryRow } from './CheckboxSummaryRow';
import { DocumentSummaryRow } from './DocumentSummaryRow';
import { BsdSummaryRow } from './BsdSummaryRow';

export interface SummaryRowProps {
  label: string;
  value?: string | null;
  onPreviewFile?: (file: string, label: string) => void;
}

export function SummaryRow({ label, value, onPreviewFile }: SummaryRowProps) {
  if (
    !value ||
    value.trim() === '' ||
    value.trim().toUpperCase() === 'N/A' ||
    value.trim().toUpperCase() === 'NA' ||
    value.trim() === '-' ||
    value.trim() === '[]' ||
    value.trim() === '{}'
  ) {
    return null;
  }

  const trimmedVal = value.trim();
  const labelLower = label.toLowerCase();

  // 1. JSON Array Table Check
  let parsedArray: Array<Record<string, unknown>> | null = null;
  if (
    (trimmedVal.startsWith('[') && trimmedVal.endsWith(']')) ||
    (trimmedVal.startsWith('{') && trimmedVal.endsWith('}'))
  ) {
    try {
      const parsed: unknown = JSON.parse(trimmedVal);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validRows = parsed.filter(isRecord);
        if (validRows.length > 0) parsedArray = validRows;
      } else if (isRecord(parsed)) {
        parsedArray = [parsed];
      }
    } catch {
      // Not JSON
    }
  }

  if (parsedArray !== null && parsedArray.length > 0) {
    return <JsonTableSummaryRow label={label} parsedArray={parsedArray} />;
  }

  // 2. Signature Check
  const isSignature =
    labelLower.includes('signature') ||
    trimmedVal.startsWith('data:image') ||
    trimmedVal.startsWith('typed:cursive:') ||
    trimmedVal.startsWith('blob:');

  if (isSignature) {
    return <SignatureSummaryRow label={label} trimmedVal={trimmedVal} />;
  }

  // 3. Checkbox / Legal Agreement Check
  const isCheckbox =
    labelLower.includes('declare') ||
    labelLower.includes('certify') ||
    labelLower.includes('agreement') ||
    labelLower.includes('declaration') ||
    trimmedVal.toLowerCase() === 'true' ||
    trimmedVal.toLowerCase() === 'false' ||
    trimmedVal.toLowerCase() === 'agreed' ||
    trimmedVal.toLowerCase() === 'yes' ||
    trimmedVal.toLowerCase() === 'no';

  if (isCheckbox) {
    return <CheckboxSummaryRow label={label} trimmedVal={trimmedVal} />;
  }

  // 4. Document File Preview Check
  const isDocumentFile =
    trimmedVal.startsWith('data:application/pdf') ||
    trimmedVal.startsWith('blob:') ||
    trimmedVal.toLowerCase().endsWith('.pdf') ||
    trimmedVal.toLowerCase().endsWith('.png') ||
    trimmedVal.toLowerCase().endsWith('.jpg') ||
    trimmedVal.toLowerCase().endsWith('.jpeg');

  if (isDocumentFile) {
    return <DocumentSummaryRow label={label} trimmedVal={trimmedVal} onPreviewFile={onPreviewFile} />;
  }

  // 5. BSD Check
  if (labelLower.includes('bsd')) {
    return <BsdSummaryRow label={label} trimmedVal={trimmedVal} />;
  }

  // 6. Standard Field View
  return (
    <View
      style={{
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 8,
      }}
    >
      <Text
        style={{
          fontFamily: TYPOGRAPHY.fonts.primary,
          fontSize: 10,
          fontWeight: '700',
          color: '#64748B',
          marginBottom: 3,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: TYPOGRAPHY.fonts.primary,
          fontSize: 13,
          fontWeight: '600',
          color: '#0F172A',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export function DetailRow({
  label,
  value,
  onPreviewFile,
}: {
  label: string;
  value?: string | null;
  isLast?: boolean;
  onPreviewFile?: (file: string, label: string) => void;
}) {
  return <SummaryRow label={label} value={value} onPreviewFile={onPreviewFile} />;
}
