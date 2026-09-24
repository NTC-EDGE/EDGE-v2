import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon, TYPOGRAPHY } from '@edge/ui';
import { Application, ApplicationDocument } from '../../data/applicationsData';
import { SectionCard } from '../../../../shared/formPreview';
import { DocumentPreviewFile } from '../../../../shared/components/DocumentPreviewModal';
import {
  prepareDocumentPreviewFile,
  downloadApplicationDocument,
} from '../../helpers/applicationDocumentActions';

interface BulkApplicantDocListProps {
  app?: Application;
  selectedApplicantDocs: ApplicationDocument[];
  onPreviewDoc: (doc: ApplicationDocument) => void;
  onPreviewCustomDoc: (doc: DocumentPreviewFile) => void;
  onDownloadDoc?: (doc: ApplicationDocument) => void;
  previewLoadingId?: string | null;
  setPreviewLoadingId?: (id: string | null) => void;
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
  app,
  selectedApplicantDocs,
  onPreviewDoc,
  onPreviewCustomDoc,
  onDownloadDoc,
  previewLoadingId,
  setPreviewLoadingId,
}: BulkApplicantDocListProps) {
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
          const isLoading = previewLoadingId === doc.id;

          const handlePreview = async () => {
            if (!hasFile) return;
            if (setPreviewLoadingId !== undefined && isMountedRef.current) {
              setPreviewLoadingId(doc.id);
            }
            try {
              const previewFile = await prepareDocumentPreviewFile(doc, app, null);
              if (isMountedRef.current) {
                onPreviewCustomDoc(previewFile);
              }
            } catch (err) {
              console.warn('[BulkApplicantDocList] Preview preparation error:', err);
              if (isMountedRef.current) {
                onPreviewCustomDoc({
                  uri: '',
                  name: doc.name,
                  category: doc.category,
                  size: doc.size,
                  type: doc.type,
                  referenceNumber: app?.referenceNumber || 'NTC-REQ-2026',
                  serviceName: app?.serviceName || 'Standard Licensing Application',
                  applicantName: app?.companyName || 'Applicant',
                  uploadedAt: doc.uploadedAt || app?.submittedAt,
                });
              }
            } finally {
              if (setPreviewLoadingId !== undefined && isMountedRef.current) {
                setPreviewLoadingId(null);
              }
            }
          };

          const handleDownload = async () => {
            if (onDownloadDoc !== undefined) {
              onDownloadDoc(doc);
            } else {
              await downloadApplicationDocument(doc, app, null);
            }
          };

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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <TouchableOpacity
                    onPress={handlePreview}
                    disabled={isLoading}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: '#EFF6FF',
                      borderWidth: 1,
                      borderColor: '#BFDBFE',
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 8,
                    }}
                    activeOpacity={0.7}
                  >
                    <Icon name={isLoading ? 'loader' : 'eye'} size={13} color={isLoading ? '#94A3B8' : '#1D4ED8'} />
                    <Text
                      style={{
                        fontFamily: TYPOGRAPHY.fonts.primary,
                        fontSize: 11,
                        fontWeight: '700',
                        color: isLoading ? '#94A3B8' : '#1D4ED8',
                      }}
                    >
                      {isLoading ? 'Loading...' : 'View'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleDownload}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: '#FFFFFF',
                      borderWidth: 1,
                      borderColor: '#CBD5E1',
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 8,
                    }}
                    activeOpacity={0.7}
                  >
                    <Icon name="download" size={13} color="#475569" />
                    <Text
                      style={{
                        fontFamily: TYPOGRAPHY.fonts.primary,
                        fontSize: 11,
                        fontWeight: '600',
                        color: '#475569',
                      }}
                    >
                      Download
                    </Text>
                  </TouchableOpacity>
                </View>
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
                ? `${selectedApplicantDocs.length} document${selectedApplicantDocs.length !== 1 ? 's' : ''} attached & verified`
                : `${availableDocsCount} attached · ${unavailableDocsCount} not available`}
            </Text>
          </View>
        </View>
      </View>
    </SectionCard>
  );
}
