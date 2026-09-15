import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '@clerk/expo';
import { Icon, TYPOGRAPHY } from '@edge/ui';
import { Application, ApplicationDocument, RawRequirement } from '../../data/applicationsData';
import { isGuid } from './applicationDetailsTypes';
import { SectionCard } from '../../../../shared/formPreview';
import { DocumentPreviewFile } from '../../../../shared/components/DocumentPreviewModal';

interface ApplicantRequirementsCardProps {
  app: Application;
  docs: ApplicationDocument[];
  onPreviewDoc: (doc: ApplicationDocument) => void;
  onPreviewCustomDoc: (doc: DocumentPreviewFile) => void;
  onDownloadDoc?: (doc: ApplicationDocument) => void;
  previewLoadingId?: string | null;
  setPreviewLoadingId: (id: string | null) => void;
}

export function ApplicantRequirementsCard({
  app,
  docs,
  onPreviewDoc,
  onPreviewCustomDoc,
  onDownloadDoc,
  previewLoadingId,
  setPreviewLoadingId,
}: ApplicantRequirementsCardProps) {
  const { getToken } = useAuth();

  return (
    <SectionCard
      icon="paperclip"
      title="Uploaded Supporting Documents"
      accentColor="#059669"
    >
      {docs.length === 0 ? (
        <View
          style={{
            backgroundColor: '#FEF9C3',
            borderColor: '#FDE047',
            borderWidth: 1,
            borderRadius: 8,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Icon name="alert-triangle" size={14} color="#92400E" />
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 12,
              color: '#92400E',
              flex: 1,
            }}
          >
            No supporting documents or uploaded requirement attachments found for this application.
          </Text>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          {docs.map((doc, idx) => {
            const isLoading = previewLoadingId === doc.id;

            const handlePreview = async () => {
              const rawReq: RawRequirement[] = [];
              const pushR = (r: RawRequirement | null | undefined) => {
                if (r && !rawReq.some((e) => (r.id && e.id === r.id) || (r.storedFileId && e.storedFileId === r.storedFileId))) {
                  rawReq.push(r);
                }
              };
              const topList = app.requirements || app.Requirements || app.documents || app.Documents;
              if (Array.isArray(topList)) topList.forEach(pushR);
              const appList = app.applicants || app.Applicants;
              if (Array.isArray(appList)) {
                appList.forEach((a) => {
                  const aReqs = (a as { requirements?: RawRequirement[]; Requirements?: RawRequirement[]; documents?: RawRequirement[] }).requirements ||
                    (a as { requirements?: RawRequirement[]; Requirements?: RawRequirement[]; documents?: RawRequirement[] }).Requirements ||
                    (a as { requirements?: RawRequirement[]; Requirements?: RawRequirement[]; documents?: RawRequirement[] }).documents;
                  if (Array.isArray(aReqs)) aReqs.forEach(pushR);
                });
              }

              const matched = rawReq.find(
                (r) =>
                  r.id === doc.id ||
                  (typeof r.url === 'string' && r.url.includes(doc.id)) ||
                  (typeof r.storedFileId === 'string' && r.storedFileId === doc.storedFileId)
              );

              let fileUrl: string | undefined = doc.url ?? matched?.url ?? undefined;
              if (!fileUrl && (doc.storedFileId || matched?.storedFileId)) {
                const targetFileId = doc.storedFileId || matched?.storedFileId;
                const tenantId =
                  app.tenantId && isGuid(app.tenantId)
                    ? app.tenantId
                    : app.region && isGuid(app.region)
                      ? app.region
                      : 'aa0cd342-7265-4d9e-9242-948fc7e3d0a8';
                fileUrl = `/api/v2/tenants/${tenantId}/storage/files/${targetFileId}`;
              }

              if (fileUrl !== undefined && fileUrl !== '') {
                if (fileUrl.startsWith('data:') || fileUrl.startsWith('blob:')) {
                  onPreviewCustomDoc({
                    uri: fileUrl,
                    name: doc.name,
                    category: doc.category,
                    size: doc.size,
                    type: doc.type,
                  });
                  return;
                }

                setPreviewLoadingId(doc.id);
                try {
                  const baseUrl =
                    (process.env.EXPO_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '').trim();
                  const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${baseUrl}${fileUrl}`;
                  const token = await getToken();
                  const headers: Record<string, string> = {};
                  if (token) headers['Authorization'] = `Bearer ${token}`;

                  const response = await fetch(fullUrl, { headers });
                  if (response.ok) {
                    const blob = await response.blob();
                    const objectUrl =
                      typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
                        ? URL.createObjectURL(blob)
                        : fullUrl;

                    onPreviewCustomDoc({
                      uri: objectUrl,
                      name: doc.name,
                      category: doc.category,
                      size: doc.size,
                      type: doc.type,
                    });
                  } else {
                    onPreviewCustomDoc({
                      uri: fullUrl,
                      name: doc.name,
                      category: doc.category,
                      size: doc.size,
                      type: doc.type,
                    });
                  }
                } catch (fetchErr) {
                  console.warn('[ApplicationDetails] Could not fetch file preview:', fetchErr);
                  onPreviewCustomDoc({
                    uri: fileUrl,
                    name: doc.name,
                    category: doc.category,
                    size: doc.size,
                    type: doc.type,
                  });
                } finally {
                  setPreviewLoadingId(null);
                }
              } else {
                onPreviewCustomDoc({
                  uri: '',
                  name: doc.name,
                  category: doc.category,
                  size: doc.size,
                  type: doc.type,
                });
              }
            };

            return (
              <View
                key={doc.id || `doc-${idx}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: '#F0FDF4',
                  borderWidth: 1,
                  borderColor: '#BBF7D0',
                  borderRadius: 10,
                  padding: 12,
                  flexWrap: 'wrap',
                }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: '#DCFCE7',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 11,
                      fontWeight: '800',
                      color: '#166534',
                    }}
                  >
                    {idx + 1}
                  </Text>
                </View>

                <View style={{ flex: 1, minWidth: 180 }}>
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 13,
                      fontWeight: '700',
                      color: '#166534',
                    }}
                    numberOfLines={1}
                  >
                    {doc.name}
                  </Text>
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 11,
                      color: '#15803D',
                      marginTop: 2,
                    }}
                  >
                    {doc.category.replace('_', ' ')} · {doc.size}
                  </Text>
                </View>

                <Icon name="check-circle" size={16} color="#16A34A" />

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <TouchableOpacity
                    onPress={handlePreview}
                    disabled={isLoading}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#EFF6FF',
                      borderWidth: 1,
                      borderColor: '#BFDBFE',
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                      borderRadius: 8,
                    }}
                    activeOpacity={0.7}
                  >
                    <Icon name={isLoading ? 'loader' : 'eye'} size={13} color={isLoading ? '#94A3B8' : '#1D4ED8'} style={{ marginRight: 4 }} />
                    <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: '700', color: isLoading ? '#94A3B8' : '#1D4ED8' }}>
                      {isLoading ? 'Loading...' : 'View'}
                    </Text>
                  </TouchableOpacity>

                  {onDownloadDoc !== undefined ? (
                    <TouchableOpacity
                      onPress={() => onDownloadDoc(doc)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#FFFFFF',
                        borderWidth: 1,
                        borderColor: '#CBD5E1',
                        paddingVertical: 5,
                        paddingHorizontal: 10,
                        borderRadius: 8,
                      }}
                      activeOpacity={0.7}
                    >
                      <Icon name="download" size={13} color="#475569" style={{ marginRight: 4 }} />
                      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: '600', color: '#475569' }}>
                        Download
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
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
                backgroundColor: '#DCFCE7',
                borderColor: '#86EFAC',
                borderWidth: 1,
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 4,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Icon name="paperclip" size={11} color="#166534" />
              <Text
                style={{
                  fontFamily: TYPOGRAPHY.fonts.primary,
                  fontSize: 11,
                  fontWeight: '700',
                  color: '#166534',
                }}
              >
                {docs.length} document{docs.length !== 1 ? 's' : ''} attached & verified
              </Text>
            </View>
          </View>
        </View>
      )}
    </SectionCard>
  );
}
