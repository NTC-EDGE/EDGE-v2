import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { Icon } from '@edge/ui';
import { Application, ApplicationDocument, formatRelativeTime } from '../../data/applicationsData';
import { styles } from './applicationDetailsStyles';

interface DocumentPreviewSectionProps {
  app: Application;
  primaryName: string;
  previewDoc: ApplicationDocument | null;
  onClose: () => void;
  onDownloadDoc?: (doc: ApplicationDocument) => void;
}

export function DocumentPreviewSection({
  app,
  primaryName,
  previewDoc,
  onClose,
  onDownloadDoc,
}: DocumentPreviewSectionProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <Modal
      visible={previewDoc !== null}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {previewDoc !== null && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxWidth: isMobile ? '95%' : 600 }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleGroup}>
                <Icon name="file-text" size={20} color="#1D4ED8" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    {previewDoc.name}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {previewDoc.category.replace('_', ' ')} · {previewDoc.size} · {previewDoc.type}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
                <Icon name="x" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBodyScroll} contentContainerStyle={styles.modalBodyContent}>
              <View style={styles.docSheetHeader}>
                <Text style={styles.docSheetGovText}>REPUBLIC OF THE PHILIPPINES</Text>
                <Text style={styles.docSheetAgencyText}>NATIONAL TELECOMMUNICATIONS COMMISSION</Text>
                <Text style={styles.docSheetSubAgency}>NTC Building, BIR Road, East Triangle, Diliman, Quezon City</Text>
              </View>

              <View style={styles.docSheetDivider} />

              <View style={styles.docSheetTitleBox}>
                <Text style={styles.docSheetTitleText}>{previewDoc.name}</Text>
                <Text style={styles.docSheetRefText}>REF NO: #{app.referenceNumber}</Text>
              </View>

              <View style={styles.docSheetDataGrid}>
                <View style={styles.docSheetDataRow}>
                  <Text style={styles.docSheetLabel}>Service Name:</Text>
                  <Text style={styles.docSheetValue}>{app.serviceName}</Text>
                </View>

                <View style={styles.docSheetDataRow}>
                  <Text style={styles.docSheetLabel}>Applicant / Company:</Text>
                  <Text style={styles.docSheetValue}>{primaryName}</Text>
                </View>

                <View style={styles.docSheetDataRow}>
                  <Text style={styles.docSheetLabel}>Document Category:</Text>
                  <Text style={styles.docSheetValue}>{previewDoc.category.replace('_', ' ')}</Text>
                </View>

                <View style={styles.docSheetDataRow}>
                  <Text style={styles.docSheetLabel}>Uploaded Date:</Text>
                  <Text style={styles.docSheetValue}>{formatRelativeTime(previewDoc.uploadedAt)}</Text>
                </View>
              </View>

              <View style={styles.docSheetStampRow}>
                <View style={styles.officialStampBadge}>
                  <Icon name="check-circle" size={16} color="#16A34A" />
                  <Text style={styles.officialStampText}>OFFICIALLY VERIFIED & VALID</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => {
                  if (onDownloadDoc !== undefined) onDownloadDoc(previewDoc);
                }}
                style={styles.modalDownloadBtn}
                activeOpacity={0.85}
              >
                <Icon name="download" size={15} color="#FFFFFF" />
                <Text style={styles.modalDownloadBtnText}>Download File</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                style={styles.modalCloseFooterBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCloseFooterBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
}
