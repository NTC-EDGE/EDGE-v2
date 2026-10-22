import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Icon } from '@edge/ui';
import {
  Application,
  ApplicationDocument,
  BulkApplicant,
  getStatusLabel,
  getStatusColor,
  getStatusBgColor,
} from '../../data/applicationsData';
import {
  safeGetStatusLabel,
  safeGetStatusColor,
  safeGetStatusBgColor,
} from './applicationDetailsTypes';
import { styles } from './applicationDetailsStyles';
import { BulkMetricsGrid } from './BulkMetricsGrid';
import { SingleApplicantSection } from './SingleApplicantSection';
import { FormFieldValue } from '../../../../shared/formPreview';
import { extractApplicantFullName } from './applicationDetailsHelpers';

import { DocumentPreviewFile } from '../../../../shared/components/DocumentPreviewModal';

interface BulkApplicantsSectionProps {
  app: Application;
  appApplicants: BulkApplicant[];
  totalSubmitted: number;
  approvedCount: number;
  declinedCount: number;
  pendingCount: number;
  tableSearch: string;
  setTableSearch: (val: string) => void;
  tablePage: number;
  setTablePage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  pagedApplicants: BulkApplicant[];
  selectedApplicant: BulkApplicant | null;
  onSelectApplicant: (applicant: BulkApplicant) => void;
  selectedApplicantFormFields: FormFieldValue[];
  selectedApplicantDocs: ApplicationDocument[];
  isExamService: boolean;
  scheduleSummaryText: string | null;
  variantLabel: string;
  isDesktop: boolean;
  onPreviewFile: (uri: string, name: string) => void;
  onPreviewDoc: (doc: ApplicationDocument) => void;
  onPreviewCustomDoc: (doc: DocumentPreviewFile) => void;
  onDownloadDoc?: (doc: ApplicationDocument) => void;
  previewLoadingId?: string | null;
  setPreviewLoadingId: (id: string | null) => void;
}

const TABLE_PAGE_SIZE = 6;

export function BulkApplicantsSection({
  app,
  appApplicants,
  totalSubmitted,
  approvedCount,
  declinedCount,
  pendingCount,
  tableSearch,
  setTableSearch,
  tablePage,
  setTablePage,
  totalPages,
  pagedApplicants,
  selectedApplicant,
  onSelectApplicant,
  selectedApplicantFormFields,
  selectedApplicantDocs,
  isExamService,
  scheduleSummaryText,
  variantLabel,
  isDesktop,
  onPreviewFile,
  onPreviewDoc,
  onPreviewCustomDoc,
  onDownloadDoc,
  previewLoadingId,
  setPreviewLoadingId,
}: BulkApplicantsSectionProps) {
  const activeApplicant = selectedApplicant || (appApplicants.length > 0 ? appApplicants[0] : null);

  return (
    <>
      <BulkMetricsGrid
        totalSubmitted={totalSubmitted}
        approvedCount={approvedCount}
        declinedCount={declinedCount}
        pendingCount={pendingCount}
      />

      {/* Alert Warning / Info Banner */}
      <View style={styles.alertBanner}>
        <Icon name="alert-circle" size={16} color="#B45309" />
        <Text style={styles.alertBannerText}>
          {approvedCount > 0 || declinedCount > 0
            ? `${approvedCount} applicant(s) approved and ${declinedCount} declined. Select any applicant on the left to review their complete application details and attached documents.`
            : `This bulk application contains ${totalSubmitted} submitted applicant(s). Select an applicant on the left to inspect their full particulars on the right.`}
        </Text>
      </View>

      {/* 2-Column Responsive Layout: Left List | Right Details Preview */}
      <View
        style={[
          styles.bulkTwoColumnContainer,
          { flexDirection: isDesktop ? 'row' : 'column' },
        ]}
      >
        {/* Left Column: Applicants Cohort List */}
        <View style={[styles.bulkLeftSidebar, { width: isDesktop ? 360 : '100%' }]}>
          <View style={styles.tableHeaderTitleRow}>
            <Icon name="users" size={18} color="#1D4ED8" />
            <Text style={styles.tableSectionTitle}>Applicants List</Text>
            <View style={styles.tableCountBadge}>
              <Text style={styles.tableCountBadgeText}>{appApplicants.length}</Text>
            </View>
          </View>

          {/* Search Box */}
          <View style={[styles.tableSearchBox, { width: '100%' }]}>
            <Icon name="search" size={14} color="#94A3B8" />
            <TextInput
              style={styles.tableSearchInput}
              placeholder="Search applicants..."
              placeholderTextColor="#94A3B8"
              value={tableSearch}
              onChangeText={(text) => {
                setTableSearch(text);
                setTablePage(1);
              }}
            />
            {tableSearch.length > 0 && (
              <TouchableOpacity onPress={() => setTableSearch('')}>
                <Icon name="x" size={14} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Selectable Applicant Cards */}
          <View style={{ gap: 8 }}>
            {pagedApplicants.length === 0 ? (
              <View style={styles.emptyTableState}>
                <Text style={styles.emptyTableText}>No applicants match "{tableSearch}"</Text>
              </View>
            ) : (
              pagedApplicants.map((applicant, idx) => {
                const absoluteIndex = (tablePage - 1) * TABLE_PAGE_SIZE + idx + 1;
                const isSelected = activeApplicant?.id === applicant.id;

                return (
                  <TouchableOpacity
                    key={applicant.id || `app-${idx}`}
                    onPress={() => onSelectApplicant(applicant)}
                    style={[
                      styles.applicantListCard,
                      isSelected && styles.applicantListCardActive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.applicantCardTop}>
                      <View
                        style={[
                          styles.applicantIndexBadge,
                          isSelected && styles.applicantIndexBadgeActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.applicantIndexText,
                            isSelected && styles.applicantIndexTextActive,
                          ]}
                        >
                          {absoluteIndex}
                        </Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          style={[
                            styles.applicantCardName,
                            isSelected && styles.applicantCardNameActive,
                          ]}
                          numberOfLines={1}
                        >
                          {applicant.name}
                        </Text>
                        <Text style={styles.applicantCardType} numberOfLines={1}>
                          {applicant.applicationType}
                        </Text>
                      </View>
                      <Icon
                        name="chevron-right"
                        size={16}
                        color={isSelected ? '#1D4ED8' : '#94A3B8'}
                      />
                    </View>

                    <View style={styles.applicantCardFooter}>
                      <View
                        style={[
                          styles.tableStatusChip,
                          {
                            backgroundColor: safeGetStatusBgColor(
                              applicant.status,
                              getStatusBgColor
                            ),
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.tableStatusChipText,
                            {
                              color: safeGetStatusColor(applicant.status, getStatusColor),
                            },
                          ]}
                        >
                          {safeGetStatusLabel(applicant.status, getStatusLabel)}
                        </Text>
                      </View>

                      {isSelected ? (
                        <View style={styles.activeIndicatorBadge}>
                          <Icon name="check" size={10} color="#1D4ED8" />
                          <Text style={styles.activeIndicatorText}>Active</Text>
                        </View>
                      ) : applicant.includedInSOA ? (
                        <View style={styles.soaBadge}>
                          <Text style={styles.soaBadgeText}>SOA Included</Text>
                        </View>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <View style={styles.tablePaginationBar}>
              <Text style={styles.tablePaginationSummary}>
                Page {tablePage} of {totalPages}
              </Text>
              <View style={styles.tablePaginationBtns}>
                <TouchableOpacity
                  onPress={() => setTablePage((p) => Math.max(1, p - 1))}
                  disabled={tablePage === 1}
                  style={[
                    styles.tablePageNavBtn,
                    tablePage === 1 && styles.tablePageNavBtnDisabled,
                  ]}
                >
                  <Icon
                    name="chevron-left"
                    size={14}
                    color={tablePage === 1 ? '#CBD5E1' : '#334155'}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setTablePage((p) => Math.min(totalPages, p + 1))}
                  disabled={tablePage === totalPages}
                  style={[
                    styles.tablePageNavBtn,
                    tablePage === totalPages && styles.tablePageNavBtnDisabled,
                  ]}
                >
                  <Icon
                    name="chevron-right"
                    size={14}
                    color={tablePage === totalPages ? '#CBD5E1' : '#334155'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Right Column: Full Unified Application Preview Summary */}
        <View style={styles.bulkRightContent}>
          {activeApplicant ? (
            <SingleApplicantSection
              app={app}
              singleApplicant={{
                applicantName: extractApplicantFullName(app, activeApplicant.details, activeApplicant),
                sex: activeApplicant.sex || activeApplicant.details?.sex || 'Male',
                nationality: activeApplicant.nationality || activeApplicant.details?.nationality || 'Filipino',
                streetAddress: activeApplicant.streetAddress || activeApplicant.details?.streetAddress || activeApplicant.details?.address || 'N/A',
                barangay: activeApplicant.barangay || activeApplicant.details?.barangay || '',
                cityMunicipality: activeApplicant.cityMunicipality || activeApplicant.details?.cityMunicipality || 'N/A',
                province: activeApplicant.province || activeApplicant.details?.province || 'N/A',
                region: activeApplicant.region || activeApplicant.details?.region || 'N/A',
                zipCode: activeApplicant.zipCode || activeApplicant.details?.zipCode || '',
                mobileNumber: activeApplicant.mobileNumber || activeApplicant.details?.mobileNumber || activeApplicant.details?.contactNumber || 'N/A',
                email: activeApplicant.email || activeApplicant.details?.email || activeApplicant.details?.emailAddress || 'N/A',
                examineeType: activeApplicant.applicationType || activeApplicant.details?.examineeType || 'New',
                birthDate: activeApplicant.birthDate || activeApplicant.details?.birthDate || null,
                civilStatus: activeApplicant.civilStatus || activeApplicant.details?.civilStatus || null,
                companyName: activeApplicant.companyName || activeApplicant.details?.companyName || null,
                representativeName: activeApplicant.representativeName || activeApplicant.details?.representativeName || null,
                notes: activeApplicant.notes || activeApplicant.details?.notes || null,
                schoolAttended: activeApplicant.schoolAttended || activeApplicant.details?.schoolAttended || activeApplicant.schoolName || activeApplicant.details?.schoolName || null,
                schoolName: activeApplicant.schoolName || activeApplicant.details?.schoolName || activeApplicant.schoolAttended || activeApplicant.details?.schoolAttended || null,
                courseTaken: activeApplicant.courseTaken || activeApplicant.details?.courseTaken || activeApplicant.courseDegree || activeApplicant.details?.courseDegree || null,
                courseDegree: activeApplicant.courseDegree || activeApplicant.details?.courseDegree || activeApplicant.courseTaken || activeApplicant.details?.courseTaken || null,
                yearGraduated: activeApplicant.yearGraduated || activeApplicant.details?.yearGraduated || null,
                specialOrderNo: activeApplicant.specialOrderNo || activeApplicant.details?.specialOrderNo || null,
              }}
              primaryName={extractApplicantFullName(app, activeApplicant.details, activeApplicant)}
              formFieldValues={selectedApplicantFormFields}
              isExamService={isExamService}
              scheduleSummaryText={
                activeApplicant.schedule
                  ? `${activeApplicant.schedule.date} • ${activeApplicant.schedule.time} (${activeApplicant.schedule.venue})`
                  : scheduleSummaryText
              }
              variantLabel={activeApplicant.applicationType || variantLabel}
              isDesktop={isDesktop}
              docs={selectedApplicantDocs}
              onPreviewFile={onPreviewFile}
              onPreviewDoc={onPreviewDoc}
              onPreviewCustomDoc={onPreviewCustomDoc}
              onDownloadDoc={onDownloadDoc}
              previewLoadingId={previewLoadingId}
              setPreviewLoadingId={setPreviewLoadingId}
            />
          ) : (
            <View style={styles.emptyTableState}>
              <Icon name="user" size={32} color="#94A3B8" />
              <Text style={[styles.emptyTableText, { marginTop: 8 }]}>
                Select an applicant from the list to inspect their preview details.
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
}
