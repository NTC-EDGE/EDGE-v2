import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon, TYPOGRAPHY } from '@edge/ui';
import { Application, ApplicationDocument, RawRequirement } from '../../data/applicationsData';
import { isGuid } from './applicationDetailsTypes';
import { useApi } from '../../../../shared/hooks/useApi';
import { SectionCard } from '../../../../shared/formPreview';

interface ApplicantRequirementsCardProps {
  app: Application;
  docs: ApplicationDocument[];
  onPreviewDoc: (doc: ApplicationDocument) => void;
  onPreviewCustomDoc: (doc: { uri: string; name: string }) => void;
  setPreviewLoadingId: (id: string | null) => void;
}

export function ApplicantRequirementsCard({
  app,
  docs,
  onPreviewDoc,
  onPreviewCustomDoc,
  setPreviewLoadingId,
}: ApplicantRequirementsCardProps) {
  const api = useApi();

  if (docs.length === 0) return null;

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
          {docs.length} official document(s) and uploaded requirement proofs attached to this application:
        </Text>

        {docs.map((doc, dIdx) => (
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
                    fontWeight: '700',
                    color: '#0F172A',
                  }}
                  numberOfLines={1}
                >
                  {doc.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <View
                    style={{
                      backgroundColor: '#EFF6FF',
                      borderWidth: 1,
                      borderColor: '#BFDBFE',
                      borderRadius: 6,
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: TYPOGRAPHY.fonts.primary,
                        fontSize: 10,
                        fontWeight: '700',
                        color: '#1D4ED8',
                        textTransform: 'uppercase',
                      }}
                    >
                      {doc.category.replace('_', ' ')}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: '#64748B' }}>
                    {doc.size}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={async () => {
                const rawReq = (app.requirements ?? app.Requirements ?? []) as RawRequirement[];
                const matched = rawReq.find(
                  (r) => r.id === doc.id || (r.url !== undefined && r.url.includes(doc.id)) || (r.storedFileId !== undefined && r.storedFileId === doc.storedFileId)
                );
                let fileUrl: string | undefined = doc.url ?? matched?.url ?? undefined;
                if (!fileUrl && (doc.storedFileId || matched?.storedFileId)) {
                  const targetFileId = doc.storedFileId || matched?.storedFileId;
                  const tenantId = (app.tenantId && isGuid(app.tenantId)) ? app.tenantId : (app.region && isGuid(app.region) ? app.region : 'aa0cd342-7265-4d9e-9242-948fc7e3d0a8');
                  fileUrl = `/api/v2/tenants/${tenantId}/storage/files/${targetFileId}`;
                }

                if (fileUrl !== undefined && fileUrl !== '') {
                  setPreviewLoadingId(doc.id);
                  try {
                    const baseUrl =
                      (process.env.EXPO_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '').trim();
                    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${baseUrl}${fileUrl}`;
                    const blob = await api.get<Blob>(fullUrl);
                    const objectUrl =
                      typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
                        ? URL.createObjectURL(blob as unknown as Blob)
                        : fullUrl;

                    onPreviewCustomDoc({ uri: objectUrl, name: doc.name });
                  } catch (fetchErr) {
                    console.warn('[ApplicationDetails] Could not fetch file preview:', fetchErr);
                    onPreviewCustomDoc({ uri: fileUrl, name: doc.name });
                  } finally {
                    setPreviewLoadingId(null);
                  }
                } else {
                  onPreviewDoc(doc);
                }
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#EFF6FF',
                borderWidth: 1,
                borderColor: '#BFDBFE',
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 8,
                gap: 4,
              }}
              activeOpacity={0.8}
            >
              <Icon name="eye" size={13} color="#1D4ED8" />
              <Text
                style={{
                  fontFamily: TYPOGRAPHY.fonts.primary,
                  fontSize: 11,
                  fontWeight: '700',
                  color: '#1D4ED8',
                }}
              >
                View Document
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </SectionCard>
  );
}
