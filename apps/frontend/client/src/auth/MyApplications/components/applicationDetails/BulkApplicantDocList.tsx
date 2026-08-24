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

export function BulkApplicantDocList({
  selectedApplicantDocs,
  onPreviewDoc,
  onPreviewCustomDoc,
}: BulkApplicantDocListProps) {
  const api = useApi();

  if (selectedApplicantDocs.length === 0) return null;

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
          {selectedApplicantDocs.length} official document(s) attached for this applicant:
        </Text>

        {selectedApplicantDocs.map((doc, dIdx) => (
          <View
            key={doc.id || `doc-req-${dIdx}`}
            style={{
              backgroundColor: '#F8FAFC',
              borderWidth: 1,
              borderColor: '#E2E8F0',
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
                  backgroundColor: '#EFF6FF',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Icon name="file-text" size={18} color="#1D4ED8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: TYPOGRAPHY.fonts.primary,
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#0F172A',
                  }}
                  numberOfLines={1}
                >
                  {doc.name}
                </Text>
                <Text
                  style={{
                    fontFamily: TYPOGRAPHY.fonts.primary,
                    fontSize: 11,
                    color: '#64748B',
                    marginTop: 2,
                  }}
                >
                  {doc.size} • {doc.type}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={async () => {
                if (doc.url) {
                  try {
                    const baseUrl =
                      (process.env.EXPO_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '').trim();
                    const fullUrl = doc.url.startsWith('http') ? doc.url : `${baseUrl}${doc.url}`;
                    const blob = await api.get<Blob>(fullUrl);
                    const objectUrl =
                      typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
                        ? URL.createObjectURL(blob as unknown as Blob)
                        : fullUrl;
                    onPreviewCustomDoc({ uri: objectUrl, name: doc.name });
                  } catch {
                    onPreviewCustomDoc({ uri: doc.url, name: doc.name });
                  }
                } else {
                  onPreviewDoc(doc);
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
          </View>
        ))}
      </View>
    </SectionCard>
  );
}
