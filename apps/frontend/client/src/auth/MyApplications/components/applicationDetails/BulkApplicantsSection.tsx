import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Icon } from '@edge/ui';
import { Application, BulkApplicant, getStatusLabel, getStatusColor, getStatusBgColor } from '../../data/applicationsData';
import { safeGetStatusLabel, safeGetStatusColor, safeGetStatusBgColor } from './applicationDetailsTypes';
import { styles } from './applicationDetailsStyles';
import { BulkMetricsGrid } from './BulkMetricsGrid';

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
  onSelectApplicant: (applicant: BulkApplicant) => void;
}

const TABLE_PAGE_SIZE = 6;

export function BulkApplicantsSection({
  app,
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
  onSelectApplicant,
}: BulkApplicantsSectionProps) {
  return (
    <>
      <BulkMetricsGrid
        totalSubmitted={totalSubmitted}
        approvedCount={approvedCount}
        declinedCount={declinedCount}
        pendingCount={pendingCount}
      />

      {/* Alert Warning Banner */}
      <View style={styles.alertBanner}>
        <Icon name="alert-circle" size={16} color="#B45309" />
        <Text style={styles.alertBannerText}>
          {approvedCount > 0 || declinedCount > 0
            ? `${approvedCount} applicant(s) approved and ${declinedCount} declined. Click "View Details" on any applicant below to review individual form parameters and uploaded requirements.`
            : `This bulk application contains ${totalSubmitted} submitted applicant(s). Click "View Details" on any applicant below to inspect their full details and attached documents one by one.`}
        </Text>
      </View>

      {/* Bulk Applicants Table */}
      <View style={styles.tableSectionCard}>
        <View style={styles.tableSectionHeader}>
          <View style={styles.tableHeaderTitleRow}>
            <Text style={styles.tableSectionTitle}>
              {app.status === 'APPROVED' ? 'Approved Applicants' : 'Bulk Applicants List'}
            </Text>
            <View style={styles.tableCountBadge}>
              <Text style={styles.tableCountBadgeText}>{pagedApplicants.length}</Text>
            </View>
          </View>

          <View style={styles.tableSearchBox}>
            <Icon name="search" size={14} color="#94A3B8" />
            <TextInput
              style={styles.tableSearchInput}
              placeholder="Search applicants by name or type..."
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
        </View>

        {/* Responsive Grid/Table layout */}
        <View style={styles.tableWrapper}>
          <View style={styles.tableThRow}>
            <Text style={[styles.thCol, { flex: 0.5 }]}>#</Text>
            <Text style={[styles.thCol, { flex: 2.5 }]}>APPLICANT NAME</Text>
            <Text style={[styles.thCol, { flex: 1.5 }]}>APPLICATION TYPE</Text>
            <Text style={[styles.thCol, { flex: 1.5 }]}>STATUS</Text>
            <Text style={[styles.thCol, { flex: 1.5 }]}>INCLUDED IN SOA</Text>
            <Text style={[styles.thCol, { flex: 1.5, textAlign: 'right' }]}>ACTION</Text>
          </View>

          {pagedApplicants.length === 0 ? (
            <View style={styles.emptyTableState}>
              <Text style={styles.emptyTableText}>No applicants found matching "{tableSearch}"</Text>
            </View>
          ) : (
            pagedApplicants.map((applicant, idx) => {
              const absoluteIndex = (tablePage - 1) * TABLE_PAGE_SIZE + idx + 1;
              return (
                <View key={applicant.id} style={[styles.tableTdRow, idx % 2 === 1 && styles.tableTdRowAlt]}>
                  <Text style={[styles.tdCol, { flex: 0.5, color: '#64748B' }]}>{absoluteIndex}</Text>
                  <Text style={[styles.tdCol, { flex: 2.5, fontWeight: '600', color: '#0F172A' }]} numberOfLines={1}>
                    {applicant.name}
                  </Text>
                  <Text style={[styles.tdCol, { flex: 1.5 }]}>{applicant.applicationType}</Text>
                  <View style={{ flex: 1.5, alignItems: 'flex-start' }}>
                    <View style={[styles.tableStatusChip, { backgroundColor: safeGetStatusBgColor(applicant.status, getStatusBgColor) }]}>
                      <Text style={[styles.tableStatusChipText, { color: safeGetStatusColor(applicant.status, getStatusColor) }]}>
                        {safeGetStatusLabel(applicant.status, getStatusLabel)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.tdCol, { flex: 1.5, fontWeight: '500', color: '#334155' }]}>
                    {applicant.includedInSOA ? 'Yes' : 'No'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => onSelectApplicant(applicant)}
                    style={{ flex: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewDetailsLinkText}>View Details</Text>
                    <Icon name="external-link" size={11} color="#1D4ED8" />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        {/* Table Pagination */}
        {totalPages > 1 && (
          <View style={styles.tablePaginationBar}>
            <Text style={styles.tablePaginationSummary}>
              Showing {(tablePage - 1) * TABLE_PAGE_SIZE + 1} to{' '}
              {Math.min(tablePage * TABLE_PAGE_SIZE, pagedApplicants.length)} applicants
            </Text>

            <View style={styles.tablePaginationBtns}>
              <TouchableOpacity
                onPress={() => setTablePage((p) => Math.max(1, p - 1))}
                disabled={tablePage === 1}
                style={[styles.tablePageNavBtn, tablePage === 1 && styles.tablePageNavBtnDisabled]}
              >
                <Icon name="chevron-left" size={14} color={tablePage === 1 ? '#CBD5E1' : '#334155'} />
              </TouchableOpacity>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <TouchableOpacity
                  key={pg}
                  onPress={() => setTablePage(pg)}
                  style={[styles.tablePageNumberBtn, pg === tablePage && styles.tablePageNumberBtnActive]}
                >
                  <Text style={[styles.tablePageNumberText, pg === tablePage && styles.tablePageNumberTextActive]}>
                    {pg}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => setTablePage((p) => Math.min(totalPages, p + 1))}
                disabled={tablePage === totalPages}
                style={[styles.tablePageNavBtn, tablePage === totalPages && styles.tablePageNavBtnDisabled]}
              >
                <Icon name="chevron-right" size={14} color={tablePage === totalPages ? '#CBD5E1' : '#334155'} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </>
  );
}
