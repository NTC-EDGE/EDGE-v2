import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '@edge/ui';
import { Application, ApplicationDocument, RawRequirement } from '../../data/applicationsData';
import { styles } from './applicationDetailsStyles';
import { useApi } from '../../../../shared/hooks/useApi';

interface DocumentsSectionProps {
  app: Application;
  docs: ApplicationDocument[];
  onPreviewDoc: (doc: ApplicationDocument) => void;
  onPreviewCustomDoc: (doc: { uri: string; name: string }) => void;
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
  const api = useApi();
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
          const fileUrl: string | undefined = doc.url ?? matched?.url ?? undefined;

          if (fileUrl !== undefined && fileUrl !== '') {
            if (isMountedRef.current) {
              setPreviewLoadingId(doc.id);
            }
            try {
              const baseUrl =
                (process.env.EXPO_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '').trim();
              const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${baseUrl}${fileUrl}`;

              const blob = await api.get<Blob>(fullUrl);
              if (!isMountedRef.current) return;
              const objectUrl =
                typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
                  ? URL.createObjectURL(blob as unknown as Blob)
                  : fullUrl;

              onPreviewCustomDoc({ uri: objectUrl, name: doc.name });
            } catch (fetchErr) {
              console.warn('[ApplicationDetails] Could not fetch file preview:', fetchErr);
              if (isMountedRef.current) {
                onPreviewCustomDoc({ uri: fileUrl, name: doc.name });
              }
            } finally {
              if (isMountedRef.current) {
                setPreviewLoadingId(null);
              }
            }
          } else {
            if (isMountedRef.current) {
              onPreviewDoc(doc);
            }
          }
        };

        return (
          <View key={doc.id} style={styles.docRowCard}>
            <View style={styles.docIconBox}>
              <Icon name="file-text" size={20} color="#1D4ED8" />
            </View>

            <View style={styles.docInfoCol}>
              <Text style={styles.docNameText} numberOfLines={1}>
                {doc.name}
              </Text>
              <Text style={styles.docSubtext}>
                {doc.category.replace('_', ' ')} · {doc.size} · {doc.type}
              </Text>
            </View>

            <View style={styles.docActionsRowGroup}>
              <TouchableOpacity
                onPress={handlePreview}
                style={styles.docPreviewPillBtn}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Icon
                  name={isLoading ? 'loader' : 'eye'}
                  size={14}
                  color={isLoading ? '#94A3B8' : '#1D4ED8'}
                />
                <Text style={[styles.docPreviewPillBtnText, isLoading && { color: '#94A3B8' }]}>
                  {isLoading ? 'Loading...' : 'Preview'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (onDownloadDoc !== undefined) onDownloadDoc(doc);
                }}
                style={styles.docDownloadBtn}
                activeOpacity={0.8}
              >
                <Icon name="download" size={14} color="#475569" />
                <Text style={styles.docDownloadBtnText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}
