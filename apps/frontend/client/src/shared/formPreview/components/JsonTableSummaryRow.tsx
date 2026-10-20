import React from 'react';
import { View, Text } from 'react-native';
import { TYPOGRAPHY } from '@edge/ui';
import {
  formatFieldKey,
  isRecord,
  extractSerialNumbers,
  normalizeRepeaterRowEntries,
} from '../core/formPreviewHelpers';

interface JsonTableSummaryRowProps {
  label: string;
  parsedArray: Array<Record<string, unknown>>;
}

function renderSerialBadges(serials: string[]): React.ReactNode {
  if (serials.length === 0) {
    return (
      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: '#94A3B8' }}>
        —
      </Text>
    );
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
      {serials.map((sn, idx) => (
        <View
          key={idx}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#EFF6FF',
            borderWidth: 1,
            borderColor: '#BFDBFE',
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
        >
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 11,
              fontWeight: '700',
              color: '#1D4ED8',
            }}
          >
            {sn}
          </Text>
        </View>
      ))}
    </View>
  );
}

function renderCellValue(v: unknown, fieldKey?: string): React.ReactNode {
  if (v === null || v === undefined) return null;

  // 1. Detect serial number values (by key or by value content)
  const isSerialField = Boolean(
    fieldKey &&
      (fieldKey.toLowerCase().includes('serial') ||
        fieldKey.toLowerCase().includes('equipmentserial') ||
        fieldKey.toLowerCase().includes('sn') ||
        fieldKey.toLowerCase().includes('imei'))
  );

  // Detect file attachment object
  if (isRecord(v) && typeof v.name === 'string') {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#EFF6FF',
          borderWidth: 1,
          borderColor: '#BFDBFE',
          borderRadius: 6,
          paddingHorizontal: 8,
          paddingVertical: 4,
          gap: 5,
          marginTop: 2,
        }}
      >
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: '600', color: '#1D4ED8' }}>
          📄 {v.name}
        </Text>
      </View>
    );
  }

  const extractedSerials = extractSerialNumbers(v);
  if (extractedSerials !== null && extractedSerials.length > 0) {
    return renderSerialBadges(extractedSerials);
  }

  if (isSerialField && typeof v === 'string' && v.trim().length > 0) {
    return renderSerialBadges([v.trim()]);
  }

  // 2. Check if string is serialized JSON
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}'))
    ) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        return renderCellValue(parsed, fieldKey);
      } catch {
        // Fall through to plain text
      }
    }
  }

  // 3. Array of items
  if (Array.isArray(v)) {
    if (v.length === 0) {
      return (
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: '#94A3B8' }}>
          —
        </Text>
      );
    }
    if (v.every((item) => typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean')) {
      return (
        <Text
          style={{
            fontFamily: TYPOGRAPHY.fonts.primary,
            fontSize: 12,
            fontWeight: '600',
            color: '#0F172A',
          }}
        >
          {v.join(', ')}
        </Text>
      );
    }
    // Array of objects (e.g. nested equipment sub-items)
    const validSubObjs = v.filter(isRecord);
    return (
      <View style={{ gap: 6, marginTop: 4 }}>
        {validSubObjs.map((subObj, sIdx) => {
          const subEntries = normalizeRepeaterRowEntries(subObj);
          if (subEntries.length === 0) return null;

          return (
            <View
              key={sIdx}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 6,
                borderWidth: 1,
                borderColor: '#E2E8F0',
                padding: 8,
                gap: 4,
              }}
            >
              {subEntries.map(([sk, sv]) => (
                <View
                  key={sk}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 10,
                      fontWeight: '700',
                      color: '#64748B',
                    }}
                  >
                    {formatFieldKey(sk)}:
                  </Text>
                  {renderCellValue(sv, sk)}
                </View>
              ))}
            </View>
          );
        })}
      </View>
    );
  }

  // 4. Record/Object
  if (isRecord(v)) {
    const subEntries = normalizeRepeaterRowEntries(v);
    if (subEntries.length === 0) return null;

    return (
      <View style={{ gap: 4, marginTop: 2 }}>
        {subEntries.map(([sk, sv]) => (
          <View
            key={sk}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 10,
                fontWeight: '700',
                color: '#64748B',
              }}
            >
              {formatFieldKey(sk)}:
            </Text>
            {renderCellValue(sv, sk)}
          </View>
        ))}
      </View>
    );
  }

  return (
    <Text
      style={{
        fontFamily: TYPOGRAPHY.fonts.primary,
        fontSize: 12.5,
        fontWeight: '600',
        color: '#0F172A',
      }}
    >
      {String(v)}
    </Text>
  );
}

export function JsonTableSummaryRow({ label, parsedArray }: JsonTableSummaryRowProps) {
  return (
    <View
      style={{
        backgroundColor: '#F8FAFC',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        marginBottom: 12,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontFamily: TYPOGRAPHY.fonts.primary,
            fontSize: 11,
            fontWeight: '700',
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Text>
        <View
          style={{
            backgroundColor: '#EFF6FF',
            borderWidth: 1,
            borderColor: '#BFDBFE',
            borderRadius: 10,
            paddingHorizontal: 8,
            paddingVertical: 2,
          }}
        >
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 10,
              fontWeight: '700',
              color: '#1D4ED8',
            }}
          >
            {parsedArray.length} {parsedArray.length === 1 ? 'ENTRY RECORDED' : 'ENTRIES RECORDED'}
          </Text>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        {parsedArray.map((row, rIdx) => {
          const entries = normalizeRepeaterRowEntries(row);

          if (entries.length === 0) return null;

          return (
            <View
              key={row._id ? String(row._id) : `row-${rIdx}`}
              style={{
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#E2E8F0',
                borderRadius: 8,
                padding: 12,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 8,
                  paddingBottom: 6,
                  borderBottomWidth: 1,
                  borderBottomColor: '#F1F5F9',
                }}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: '#0F2C59',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 10,
                      fontWeight: '700',
                      color: '#FFFFFF',
                    }}
                  >
                    {rIdx + 1}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: TYPOGRAPHY.fonts.primary,
                    fontSize: 12,
                    fontWeight: '700',
                    color: '#0F2C59',
                  }}
                >
                  Item #{rIdx + 1}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%' }}>
                {entries.map(([k, v]) => {
                  const isSerial = k.toLowerCase().includes('serial');
                  const isMakeOrModel = k.toLowerCase().includes('make') || k.toLowerCase().includes('model');
                  const isDeviceType = k.toLowerCase().includes('device') || k.toLowerCase().includes('type');
                  return (
                    <View
                      key={k}
                      style={{
                        flex: isSerial ? 2 : isMakeOrModel ? 1.4 : isDeviceType ? 1.5 : 1,
                        minWidth: isSerial ? 180 : 140,
                        backgroundColor: '#F8FAFC',
                        padding: 10,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: TYPOGRAPHY.fonts.primary,
                          fontSize: 10,
                          fontWeight: '700',
                          color: '#64748B',
                          marginBottom: 2,
                        }}
                      >
                        {formatFieldKey(k)}
                      </Text>
                      {renderCellValue(v, k)}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
