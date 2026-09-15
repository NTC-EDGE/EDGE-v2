import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon, TYPOGRAPHY } from '@edge/ui';
import { ApplicationDocument } from '../../data/applicationsData';
import { useApi } from '../../../../shared/hooks/useApi';
import { SectionCard } from '../../../../shared/formPreview';

interface BulkApplicantDocListProps {
  selectedApplicantDocs: ApplicationDocument[];
  onPreviewDoc: (doc: ApplicationDocument) => void;
  onPreviewCustomDoc: (doc: { uri: string; name: string }) => void;
}

function isDocAvailable(doc: ApplicationDocument): boolean {
  const hasValidUrl =
    typeof doc.url === 'string' &&
    doc.url.trim() !== '' &&
    doc.url.trim().toLowerCase() !== 'none' &&
    doc.url.trim().toLowerCase() !== 'null' &&
    doc.url.trim().toLowerCase() !== 'undefined';

  const hasValidStoredId =
    typeof doc.storedFileId === 'string' &&
    doc.storedFileId.trim() !== '' &&
    doc.storedFileId.trim().toLowerCase() !== 'none' &&
    doc.storedFileId.trim().toLowerCase() !== 'null' &&
    doc.storedFileId.trim().toLowerCase() !== 'undefined';

  return hasValidUrl || hasValidStoredId;
}

function formatDocDate(isoDate?: string | null): string {
  if (!isoDate || typeof isoDate !== 'string') return '';
  try {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function BulkApplicantDocList({
  selectedApplicantDocs,
  onPreviewDoc,
  onPreviewCustomDoc,
}: BulkApplicantDocListProps) {
  const api = useApi();
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (selectedApplicantDocs.length === 0) return null;

  const availableDocsCount = selectedApplicantDocs.filter(isDocAvailable).length;
  const unavailableDocsCount = selectedApplicantDocs.length - availableDocsCount;

  return (
    <SectionCard
      icon="paperclip"
      title="Uploaded Supporting Documents"
      accentColor="#059669"
    >
      <View style={{ gap: 10 }}>
        <Text
          style={{
            fontFamily: TYPOGRAPHY.fonts.primary,
            fontSize: 12,
            color: '#64748B',
            marginBottom: 4,
          }}
        >
          {selectedApplicantDocs.length} official requirement document(s) listed for this applicant:
        </Text>

        {selectedApplicantDocs.map((doc, dIdx) => {
          const hasFile = isDocAvailable(doc);
          const dateText = formatDocDate(doc.uploadedAt);

          return (
            <View
              key={doc.id || `doc-req-${dIdx}`}
              style={{
                backgroundColor: hasFile ? '#F8FAFC' : '#FFFDF5',
                borderWidth: 1,
                borderColor: hasFile ? '#E2E8F0' : '#FED7AA',
                borderRadius: 10,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: hasFile ? '#EFF6FF' : '#FFEDD5',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Icon
                    name={hasFile ? 'file-text' : 'alert-triangle'}
                    size={18}
                    color={hasFile ? '#1D4ED8' : '#EA580C'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 13,
                      fontWeight: '600',
                      color: hasFile ? '#0F172A' : '#9A3412',
                    }}
                    numberOfLines={1}
                  >
                    {doc.name}
                  </Text>
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 11,
                      color: hasFile ? '#64748B' : '#C2410C',
                      marginTop: 2,
                    }}
                  >
                    {doc.category.replace('_', ' ')}{hasFile ? ` · ${doc.type} · ${doc.size}` : ' · No File Attached'}{hasFile && dateText ? ` · ${dateText}` : ''}
                  </Text>
                </View>
              </View>

              {hasFile ? (
                <TouchableOpacity
                  onPress={async () => {
                    const rawFileUrl = doc.url || (doc.storedFileId ? `/api/v2/tenants/aa0cd342-7265-4d9e-9242-948fc7e3d0a8/storage/files/${doc.storedFileId}` : undefined);
                    if (rawFileUrl) {
                      try {
                        const baseUrl =
                          (process.env.EXPO_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '').trim();
                        const fullUrl = rawFileUrl.startsWith('http') ? rawFileUrl : `${baseUrl}${rawFileUrl}`;
                        const blob = await api.get<Blob>(fullUrl);
                        if (!isMountedRef.current) return;
                        const objectUrl =
                          typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
                            ? URL.createObjectURL(blob as unknown as Blob)
                            : fullUrl;
                        onPreviewCustomDoc({ uri: objectUrl, name: doc.name });
                      } catch {
                        if (isMountedRef.current) {
                          onPreviewCustomDoc({ uri: rawFileUrl, name: doc.name });
                        }
                      }
                    } else {
                      if (isMountedRef.current) {
                        onPreviewDoc(doc);
                      }
                    }
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: '#EFF6FF',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                  }}
                  activeOpacity={0.7}
                >
                  <Icon name="eye" size={14} color="#1D4ED8" />
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 12,
                      fontWeight: '600',
                      color: '#1D4ED8',
                    }}
                  >
                    View
                  </Text>
                </TouchableOpacity>
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#FEF2F2',
                    borderWidth: 1,
                    borderColor: '#FECACA',
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 6,
                    gap: 4,
                  }}
                >
                  <Icon name="alert-circle" size={12} color="#DC2626" />
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 11,
                      fontWeight: '700',
                      color: '#DC2626',
                    }}
                  >
                    Requirement not available
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: 4,
          }}
        >
          <View
            style={{
              backgroundColor: unavailableDocsCount === 0 ? '#DCFCE7' : '#FEF3C7',
              borderColor: unavailableDocsCount === 0 ? '#86EFAC' : '#FDE047',
              borderWidth: 1,
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 4,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Icon name="paperclip" size={11} color={unavailableDocsCount === 0 ? '#166534' : '#92400E'} />
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 11,
                fontWeight: '700',
                color: unavailableDocsCount === 0 ? '#166534' : '#92400E',
              }}
            >
              {unavailableDocsCount === 0
                ? `${selectedApplicantDocs.length} attached & verified`
                : `${availableDocsCount} attached · ${unavailableDocsCount} not available`}
            </Text>
          </View>
        </View>
      </View>
    </SectionCard>
  );
}
