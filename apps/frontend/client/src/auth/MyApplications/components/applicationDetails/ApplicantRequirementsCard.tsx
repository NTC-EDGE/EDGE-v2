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

function isDocAvailable(doc: ApplicationDocument, matchedReq?: RawRequirement | null): boolean {
  const urlCandidate = doc.url !== undefined && doc.url !== null ? doc.url : matchedReq?.url;
  const storedCandidate = doc.storedFileId !== undefined && doc.storedFileId !== null ? doc.storedFileId : matchedReq?.storedFileId;

  const hasValidUrl =
    typeof urlCandidate === 'string' &&
    urlCandidate.trim() !== '' &&
    urlCandidate.trim().toLowerCase() !== 'none' &&
    urlCandidate.trim().toLowerCase() !== 'null' &&
    urlCandidate.trim().toLowerCase() !== 'undefined';

  const hasValidStoredId =
    typeof storedCandidate === 'string' &&
    storedCandidate.trim() !== '' &&
    storedCandidate.trim().toLowerCase() !== 'none' &&
    storedCandidate.trim().toLowerCase() !== 'null' &&
    storedCandidate.trim().toLowerCase() !== 'undefined';

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

  const availableDocsCount = docs.filter((d) => isDocAvailable(d)).length;
  const unavailableDocsCount = docs.length - availableDocsCount;

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
                if (typeof a === 'object' && a !== null) {
                  const reqKey = Object.keys(a).find(
                    (k) => k.toLowerCase() === 'requirements' || k.toLowerCase() === 'documents'
                  );
                  if (reqKey !== undefined) {
                    const desc = Object.getOwnPropertyDescriptor(a, reqKey);
                    const val = desc ? desc.value : undefined;
                    if (Array.isArray(val)) {
                      val.forEach((item: unknown) => {
                        if (typeof item === 'object' && item !== null) {
                          pushR(item);
                        }
                      });
                    }
                  }
                }
              });
            }

            const matched = rawReq.find(
              (r) =>
                r.id === doc.id ||
                (typeof r.url === 'string' && r.url.includes(doc.id)) ||
                (typeof r.storedFileId === 'string' && r.storedFileId === doc.storedFileId)
            );

            const hasFile = isDocAvailable(doc, matched);

            const handlePreview = async () => {
              if (!hasFile) return;

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

              const primaryApplicantName =
                app.mode === 'BULK'
                  ? app.companyName || (app.company as { name?: string })?.name || 'Applicant'
                  : app.applicantName || 'Applicant';

              if (fileUrl !== undefined && fileUrl !== '') {
                if (fileUrl.startsWith('data:') || fileUrl.startsWith('blob:')) {
                  onPreviewCustomDoc({
                    uri: fileUrl,
                    name: doc.name,
                    category: doc.category,
                    size: doc.size,
                    type: doc.type,
                    referenceNumber: app.referenceNumber || 'NTC-REQ-2026',
                    serviceName: app.serviceName || 'Standard Licensing Application',
                    applicantName: primaryApplicantName,
                    uploadedAt: doc.uploadedAt || app.submittedAt,
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
                      referenceNumber: app.referenceNumber || 'NTC-REQ-2026',
                      serviceName: app.serviceName || 'Standard Licensing Application',
                      applicantName: primaryApplicantName,
                      uploadedAt: doc.uploadedAt || app.submittedAt,
                    });
                  } else {
                    onPreviewCustomDoc({
                      uri: fullUrl,
                      name: doc.name,
                      category: doc.category,
                      size: doc.size,
                      type: doc.type,
                      referenceNumber: app.referenceNumber || 'NTC-REQ-2026',
                      serviceName: app.serviceName || 'Standard Licensing Application',
                      applicantName: primaryApplicantName,
                      uploadedAt: doc.uploadedAt || app.submittedAt,
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
                    referenceNumber: app.referenceNumber || 'NTC-REQ-2026',
                    serviceName: app.serviceName || 'Standard Licensing Application',
                    applicantName: primaryApplicantName,
                    uploadedAt: doc.uploadedAt || app.submittedAt,
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
                  referenceNumber: app.referenceNumber || 'NTC-REQ-2026',
                  serviceName: app.serviceName || 'Standard Licensing Application',
                  applicantName: primaryApplicantName,
                  uploadedAt: doc.uploadedAt || app.submittedAt,
                });
              }
            };

            const dateText = formatDocDate(doc.uploadedAt);

            return (
              <View
                key={doc.id || `doc-${idx}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: hasFile ? '#F0FDF4' : '#FFFDF5',
                  borderWidth: 1,
                  borderColor: hasFile ? '#BBF7D0' : '#FED7AA',
                  borderRadius: 10,
                  padding: 12,
                  flexWrap: 'wrap',
                }}
              >
                {/* Index Pill */}
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: hasFile ? '#DCFCE7' : '#FFEDD5',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 11,
                      fontWeight: '800',
                      color: hasFile ? '#166534' : '#9A3412',
                    }}
                  >
                    {idx + 1}
                  </Text>
                </View>

                {/* Doc Details Info Column */}
                <View style={{ flex: 1, minWidth: 180 }}>
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 13,
                      fontWeight: '700',
                      color: hasFile ? '#166534' : '#9A3412',
                    }}
                    numberOfLines={1}
                  >
                    {doc.name}
                  </Text>
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 11,
                      color: hasFile ? '#15803D' : '#C2410C',
                      marginTop: 2,
                    }}
                  >
                    {doc.category.replace('_', ' ')}{hasFile ? ` · ${doc.type} · ${doc.size}` : ' · No File Attached'}{hasFile && dateText ? ` · ${dateText}` : ''}
                  </Text>
                </View>

                {/* Status Indicator & Actions */}
                {hasFile ? (
                  <>
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
                  </>
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
                  ? `${docs.length} document${docs.length !== 1 ? 's' : ''} attached & verified`
                  : `${availableDocsCount} attached · ${unavailableDocsCount} not available`}
              </Text>
            </View>
          </View>
        </View>
      )}
    </SectionCard>
  );
}
