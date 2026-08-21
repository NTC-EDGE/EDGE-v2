import React from 'react';
import { View, Text } from 'react-native';
import { TYPOGRAPHY } from '@edge/ui';
import { isRecord } from './generalReviewHelpers';
import { JsonTableSummaryRow } from './JsonTableSummaryRow';
import { SignatureSummaryRow } from './SignatureSummaryRow';
import { CheckboxSummaryRow } from './CheckboxSummaryRow';
import { DocumentSummaryRow } from './DocumentSummaryRow';

interface SummaryRowProps {
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

  // Check if value is a JSON array or object
  let parsedArray: Array<Record<string, unknown>> | null = null;
  if (
    (trimmedVal.startsWith('[') && trimmedVal.endsWith(']')) ||
    (trimmedVal.startsWith('{') && trimmedVal.endsWith('}'))
  ) {
    try {
      const parsed: unknown = JSON.parse(trimmedVal);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validRows = parsed.filter(isRecord);
        if (validRows.length > 0) {
          parsedArray = validRows;
        }
      } else if (isRecord(parsed)) {
        parsedArray = [parsed];
      }
    } catch {
      // Ignored if not JSON
    }
  }

  if (parsedArray !== null && parsedArray.length > 0) {
    return <JsonTableSummaryRow label={label} parsedArray={parsedArray} />;
  }

  const isSignature =
    labelLower.includes('signature') ||
    trimmedVal.startsWith('data:image') ||
    trimmedVal.startsWith('typed:cursive:') ||
    trimmedVal.startsWith('blob:');

  const isCheckbox =
    labelLower.includes('declare') ||
    labelLower.includes('certify') ||
    labelLower.includes('agreement') ||
    labelLower.includes('declaration') ||
    trimmedVal === 'true' ||
    trimmedVal === 'false' ||
    trimmedVal === 'agreed' ||
    trimmedVal === 'yes' ||
    trimmedVal === 'no';

  const isDocumentFile =
    !isSignature &&
    (trimmedVal.startsWith('data:application/pdf') ||
      trimmedVal.startsWith('blob:') ||
      trimmedVal.toLowerCase().endsWith('.pdf') ||
      trimmedVal.toLowerCase().endsWith('.png') ||
      trimmedVal.toLowerCase().endsWith('.jpg') ||
      trimmedVal.toLowerCase().endsWith('.jpeg'));

  if (isSignature) {
    return <SignatureSummaryRow label={label} trimmedVal={trimmedVal} />;
  }

  if (isCheckbox) {
    return <CheckboxSummaryRow label={label} trimmedVal={trimmedVal} />;
  }

  if (isDocumentFile) {
    return <DocumentSummaryRow label={label} trimmedVal={trimmedVal} onPreviewFile={onPreviewFile} />;
  }

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
