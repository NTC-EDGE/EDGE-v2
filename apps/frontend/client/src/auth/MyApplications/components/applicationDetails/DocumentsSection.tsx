import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Icon } from '@edge/ui';
import { applicationService } from '@edge/api';
import { Application, ApplicationDocument, RawRequirement } from '../../data/applicationsData';
import { styles } from './applicationDetailsStyles';
import { DocumentPreviewFile } from '../../../../shared/components/DocumentPreviewModal';
import {
  prepareDocumentPreviewFile,
  downloadApplicationDocument,
} from '../../helpers/applicationDocumentActions';

interface DocumentsSectionProps {
  app: Application;
  docs: ApplicationDocument[];
  onPreviewDoc: (doc: ApplicationDocument) => void;
  onPreviewCustomDoc: (doc: DocumentPreviewFile) => void;
  onDownloadDoc?: (doc: ApplicationDocument) => void;
  previewLoadingId: string | null;
  setPreviewLoadingId: (id: string | null) => void;
}

export function DocumentsSection({
  app,
  docs,
  onPreviewDoc,
  onPreviewCustomDoc,
  onDownloadDoc,
  previewLoadingId,
  setPreviewLoadingId,
}: DocumentsSectionProps) {
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return (
    <View style={styles.tabContentList}>
      <View style={styles.docHeaderContainer}>
        <Text style={styles.docHeaderTitle}>Attached & Issued Documents</Text>
        <Text style={styles.docHeaderSubtitle}>
          Preview official application documents, admission slips, receipts, and permits below.
        </Text>
      </View>

      {docs.map((doc) => {
        const isLoading = previewLoadingId === doc.id;

        const handlePreview = async () => {
          const rawReq = (app.requirements ?? app.Requirements ?? []) as RawRequirement[];
          const matched = rawReq.find(
            (r) => r.id === doc.id || (r.url !== undefined && r.url.includes(doc.id))
          );

          if (isMountedRef.current) {
            setPreviewLoadingId(doc.id);
          }
          try {
            const previewFile = await prepareDocumentPreviewFile(doc, app, matched);
            if (isMountedRef.current) {
              onPreviewCustomDoc(previewFile);
            }
          } catch (fetchErr) {
            console.warn('[DocumentsSection] Could not fetch file preview:', fetchErr);
            if (isMountedRef.current) {
              onPreviewCustomDoc({
                uri: '',
                name: doc.name,
                category: doc.category,
                size: doc.size,
                type: doc.type,
                referenceNumber: app.referenceNumber || 'NTC-REQ-2026',
                serviceName: app.serviceName || 'Standard Licensing Application',
                applicantName: app.applicantName || 'Applicant',
                uploadedAt: doc.uploadedAt || app.submittedAt,
              });
            }
          } finally {
            if (isMountedRef.current) {
              setPreviewLoadingId(null);
            }
          }
        };

        const isIssuedPermit = doc.category === 'ISSUED_PERMIT';

        const handleDownload = async () => {
          if (onDownloadDoc !== undefined) {
            onDownloadDoc(doc);
          } else {
            if (isIssuedPermit && Platform.OS === 'web' && typeof window !== 'undefined' && app.id) {
              window.open(applicationService.getIssuedDocumentPrintUrl(app.id), '_blank');
              return;
            }
            const rawReq = (app.requirements ?? app.Requirements ?? []) as RawRequirement[];
            const matched = rawReq.find(
              (r) => r.id === doc.id || (r.url !== undefined && r.url.includes(doc.id))
            );
            await downloadApplicationDocument(doc, app, matched);
          }
        };

        return (
          <View
            key={doc.id}
            style={[
              styles.docRowCard,
              isIssuedPermit && {
                borderColor: '#059669',
                backgroundColor: '#F0FDF4',
                borderWidth: 1.5,
              },
            ]}
          >
            <View
              style={[
                styles.docIconBox,
                isIssuedPermit && { backgroundColor: '#DCFCE7' },
              ]}
            >
              <Icon
                name={isIssuedPermit ? 'award' : 'file-text'}
                size={20}
                color={isIssuedPermit ? '#059669' : '#1D4ED8'}
              />
            </View>

            <View style={styles.docInfoCol}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Text style={styles.docNameText} numberOfLines={1}>
                  {doc.name}
                </Text>
                {isIssuedPermit && (
                  <View
                    style={{
                      backgroundColor: '#059669',
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                      borderRadius: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 9,
                        fontWeight: 'bold',
                        letterSpacing: 0.5,
                      }}
                    >
                      OFFICIAL
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.docSubtext,
                  isIssuedPermit && { color: '#059669' },
                ]}
              >
                {isIssuedPermit
                  ? 'OFFICIALLY ISSUED STATUTORY PERMIT · 1.4 MB · PDF'
                  : `${doc.category.replace('_', ' ')} · ${doc.size} · ${doc.type}`}
              </Text>
            </View>

            <View style={styles.docActionsRowGroup}>
              <TouchableOpacity
                onPress={handlePreview}
                style={[
                  styles.docPreviewPillBtn,
                  isIssuedPermit && { borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' },
                ]}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Icon
                  name={isLoading ? 'loader' : 'eye'}
                  size={14}
                  color={isLoading ? '#94A3B8' : isIssuedPermit ? '#059669' : '#1D4ED8'}
                />
                <Text
                  style={[
                    styles.docPreviewPillBtnText,
                    isLoading && { color: '#94A3B8' },
                    isIssuedPermit && { color: '#059669' },
                  ]}
                >
                  {isLoading ? 'Loading...' : 'Preview'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDownload}
                style={[
                  styles.docDownloadBtn,
                  isIssuedPermit && { backgroundColor: '#059669', borderColor: '#059669' },
                ]}
                activeOpacity={0.8}
              >
                <Icon
                  name="download"
                  size={14}
                  color={isIssuedPermit ? '#FFFFFF' : '#475569'}
                />
                <Text
                  style={[
                    styles.docDownloadBtnText,
                    isIssuedPermit && { color: '#FFFFFF', fontWeight: 'bold' },
                  ]}
                >
                  Download
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}
