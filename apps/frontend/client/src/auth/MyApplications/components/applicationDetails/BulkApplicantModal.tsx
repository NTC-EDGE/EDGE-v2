import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { Icon } from '@edge/ui';
import { Application, ApplicationDocument, BulkApplicant, getStatusLabel } from '../../data/applicationsData';
import { safeGetStatusLabel } from './applicationDetailsTypes';
import { styles } from './applicationDetailsStyles';
import { SectionCard, SummaryRow } from '../../../../shared/formPreview';
import { SubmittedFormStructuredView } from './SubmittedFormStructuredView';
import { BulkApplicantDocList } from './BulkApplicantDocList';

interface BulkApplicantModalProps {
  app: Application;
  selectedApplicant: BulkApplicant | null;
  selectedApplicantFormFields: Array<{ fieldId: string; fieldLabel: string; value: string }>;
  selectedApplicantDocs: ApplicationDocument[];
  onClose: () => void;
  onPreviewDoc: (doc: ApplicationDocument) => void;
  onPreviewCustomDoc: (doc: { uri: string; name: string }) => void;
}

export function BulkApplicantModal({
  app,
  selectedApplicant,
  selectedApplicantFormFields,
  selectedApplicantDocs,
  onClose,
  onPreviewDoc,
  onPreviewCustomDoc,
}: BulkApplicantModalProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isDesktop = width >= 768;

  if (!selectedApplicant) return null;

  const serviceCategoryLower = (app.serviceCategory || '').toLowerCase().trim();
  const serviceTitleLower = (app.serviceName || '').toLowerCase().trim();
  const isExamService =
    serviceCategoryLower.includes('exam') ||
    serviceTitleLower.includes('exam') ||
    serviceTitleLower.includes('admission') ||
    serviceTitleLower.includes('operator examination');

  return (
    <Modal
      visible={selectedApplicant !== null}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxWidth: isMobile ? '95%' : 780, maxHeight: '92%' }]}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderTitleGroup}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: '#EFF6FF',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Icon name="user" size={18} color="#1D4ED8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {selectedApplicant.name}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {selectedApplicant.applicationType} • {safeGetStatusLabel(selectedApplicant.status, getStatusLabel)}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Icon name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBodyScroll} contentContainerStyle={styles.modalBodyContent}>
            <View style={{ gap: 16 }}>
              {/* Section 1: Examination & Service Parameters */}
              <SectionCard
                icon={isExamService ? 'file-text' : 'layers'}
                title={isExamService ? 'Examination Details' : 'Service & Jurisdiction Parameters'}
                accentColor="#0F2C59"
              >
                <View style={{ gap: 4 }}>
                  <SummaryRow label="Service Name" value={app.serviceName} />
                  <SummaryRow label="Service Category" value={app.serviceCategory} />
                  <SummaryRow label="Application Type" value={selectedApplicant.applicationType} />
                  {selectedApplicant.schedule && (
                    <SummaryRow
                      label="Examination Schedule"
                      value={`${selectedApplicant.schedule.date} • ${selectedApplicant.schedule.time} (${selectedApplicant.schedule.venue})`}
                    />
                  )}
                  <SummaryRow
                    label="Included in SOA Assessment"
                    value={selectedApplicant.includedInSOA ? 'Yes - Included' : 'No'}
                  />
                </View>
              </SectionCard>

              {/* Section 2: Applicant Details */}
              <SectionCard
                icon="user"
                title="Applicant Personal Particulars"
                accentColor="#1D4ED8"
              >
                <View style={{ gap: 4 }}>
                  <SummaryRow label="Full Name" value={selectedApplicant.name} />
                  <SummaryRow
                    label="Address"
                    value={[
                      selectedApplicant.streetAddress,
                      selectedApplicant.barangay,
                      selectedApplicant.cityMunicipality,
                      selectedApplicant.province,
                      selectedApplicant.region,
                      selectedApplicant.zipCode,
                    ]
                      .filter(Boolean)
                      .filter((v) => v !== 'N/A' && v !== '')
                      .join(', ')}
                  />
                  <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <SummaryRow label="Sex / Gender" value={selectedApplicant.sex} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <SummaryRow label="Nationality" value={selectedApplicant.nationality} />
                    </View>
                  </View>
                </View>
              </SectionCard>

              {/* Section 3: Dynamic Form Particulars */}
              {selectedApplicantFormFields.length > 0 && (
                <SubmittedFormStructuredView
                  app={app}
                  primaryName={selectedApplicant.name}
                  formFieldValues={selectedApplicantFormFields}
                  onPreviewFile={(uri, name) => onPreviewCustomDoc({ uri, name })}
                  sectionNumber="3"
                  serviceId={selectedApplicant.serviceId || app.serviceId}
                  serviceVariantId={selectedApplicant.serviceVariantId || app.serviceVariantId}
                />
              )}

              {/* Section 4: Attached Requirements & Document Proofs */}
              <BulkApplicantDocList
                selectedApplicantDocs={selectedApplicantDocs}
                onPreviewDoc={onPreviewDoc}
                onPreviewCustomDoc={onPreviewCustomDoc}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
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
    </Modal>
  );
}
