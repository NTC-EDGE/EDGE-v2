import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';

import Text from '@atoms/text';
import Button from '@atoms/button';
import ModalMoti from '@organisms/MotiModal';
import { primaryColor, dangerColor, successColor } from '@styles/color';

interface PreviewRow {
  index: number;
  rawRow: any;
  isValid: boolean;
  errors: string[];
}

interface CSVPreviewModalProps {
  visible: boolean;
  rows: PreviewRow[];
  onConfirm: () => void;
  onCancel: () => void;
}

const CSVPreviewModal: React.FC<CSVPreviewModalProps> = ({
  visible,
  rows,
  onConfirm,
  onCancel,
}) => {
  const validCount = rows.filter(row => row.isValid).length;
  const invalidCount = rows.length - validCount;

  const screenWidth = Dimensions.get('window').width;

  const modalWidth =
    Platform.OS === 'web'
      ? Math.min(screenWidth * 0.94, 1300)
      : '96%';

  const getValue = (row: PreviewRow, key: string) => {
    return row.rawRow?.[key] || '-';
  };

  return (
    <ModalMoti visible={visible} onClose={onCancel} width={modalWidth}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>CSV Import Preview</Text>
            <Text style={styles.subtitle}>
              Review your uploaded CSV data before importing.
            </Text>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.totalCard]}>
            <Text style={styles.summaryLabel}>Total Rows</Text>
            <Text style={styles.summaryValue}>{rows.length}</Text>
          </View>

          <View style={[styles.summaryCard, styles.validCard]}>
            <Text style={styles.summaryLabel}>Valid</Text>
            <Text style={[styles.summaryValue, { color: successColor }]}>
              {validCount}
            </Text>
          </View>

          <View style={[styles.summaryCard, styles.invalidCard]}>
            <Text style={styles.summaryLabel}>Invalid</Text>
            <Text style={[styles.summaryValue, { color: dangerColor }]}>
              {invalidCount}
            </Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.tableWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator
            contentContainerStyle={styles.horizontalScrollContent}
          >
            <View style={styles.tableInner}>
              {/* Table Header */}
              <View style={[styles.row, styles.headerRow]}>
                <Text style={[styles.cell, styles.headerCell, styles.indexCell]}>
                  #
                </Text>

                <Text style={[styles.cell, styles.headerCell, styles.statusCell]}>
                  Status
                </Text>

                <Text style={[styles.cell, styles.headerCell, styles.nameCell]}>
                  Applicant Name
                </Text>

                <Text style={[styles.cell, styles.headerCell, styles.appTypeCell]}>
                  Application Type
                </Text>

                <Text
                  style={[
                    styles.cell,
                    styles.headerCell,
                    styles.examineeTypeCell,
                  ]}
                >
                  Examinee Type
                </Text>

                <Text style={[styles.cell, styles.headerCell, styles.errorCell]}>
                  Validation Remarks
                </Text>
              </View>

              {/* Table Body */}
              <ScrollView
                style={styles.verticalScroll}
                showsVerticalScrollIndicator
              >
                {rows.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>No CSV rows found</Text>
                    <Text style={styles.emptySubtitle}>
                      Please upload a valid CSV file to continue.
                    </Text>
                  </View>
                ) : (
                  rows.map((row, rowIndex) => {
                    const firstName = getValue(row, 'First Name');
                    const lastName = getValue(row, 'Last Name');
                    const applicationType = getValue(row, 'Application Type');
                    const examineeType = getValue(row, 'Examinee Type');
                    const errors = row.errors?.length
                      ? row.errors.join(', ')
                      : 'Ready for import';

                    return (
                      <View
                        key={row.index}
                        style={[
                          styles.row,
                          rowIndex % 2 === 0 && styles.evenRow,
                          !row.isValid && styles.invalidRow,
                        ]}
                      >
                        <Text style={[styles.cell, styles.indexCell]}>
                          {row.index + 1}
                        </Text>

                        <View style={[styles.cell, styles.statusCell]}>
                          <View
                            style={[
                              styles.statusBadge,
                              row.isValid
                                ? styles.validBadge
                                : styles.invalidBadge,
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusText,
                                {
                                  color: row.isValid
                                    ? successColor
                                    : dangerColor,
                                },
                              ]}
                            >
                              {row.isValid ? 'Valid' : 'Invalid'}
                            </Text>
                          </View>
                        </View>

                        <Text
                          style={[styles.cell, styles.nameCell, styles.boldText]}
                          numberOfLines={1}
                        >
                          {firstName} {lastName}
                        </Text>

                        <Text
                          style={[styles.cell, styles.appTypeCell]}
                          numberOfLines={1}
                        >
                          {applicationType}
                        </Text>

                        <Text
                          style={[styles.cell, styles.examineeTypeCell]}
                          numberOfLines={1}
                        >
                          {examineeType}
                        </Text>

                        <Text
                          style={[
                            styles.cell,
                            styles.errorCell,
                            row.isValid
                              ? styles.readyText
                              : styles.errorText,
                          ]}
                          numberOfLines={2}
                        >
                          {errors}
                        </Text>
                      </View>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </ScrollView>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerTitle}>
              {invalidCount > 0
                ? `${invalidCount} row/s need correction`
                : 'All rows are ready'}
            </Text>

            <Text style={styles.footerSubtitle}>
              Only valid rows will be imported into the system.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <Button
              style={[
                styles.confirmButton,
                validCount === 0 && styles.disabled,
              ]}
              onPress={onConfirm}
              disabled={validCount === 0}
            >
              <Text style={styles.confirmText}>
                Import {validCount} Valid Rows
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </ModalMoti>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: Platform.OS === 'web' ? 26 : 16,
    backgroundColor: '#ffffff',
    borderRadius: 24,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 20,
    position: 'relative',
  },

  title: {
    fontSize: Platform.OS === 'web' ? 28 : 22,
    fontWeight: '800',
    color: primaryColor,
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },

  closeButton: {
    position: 'absolute',
    right: 0,
    top: -4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeText: {
    fontSize: 26,
    color: '#6B7280',
    lineHeight: 28,
  },

  summaryContainer: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 22,
  },

  summaryCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
  },

  totalCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E5E7EB',
  },

  validCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#BBF7D0',
  },

  invalidCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },

  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 6,
  },

  summaryValue: {
    fontSize: 24,
    color: '#111827',
    fontWeight: '800',
  },

  tableWrapper: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginBottom: 22,

    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'web' ? 0.08 : 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },

  horizontalScrollContent: {
    flexGrow: 1,
    width: Platform.OS === 'web' ? '100%' : undefined,
  },

  tableInner: {
    width: '100%',
    minWidth: Platform.OS === 'web' ? 1120 : 950,
  },

  verticalScroll: {
    maxHeight: Platform.OS === 'web' ? 430 : 320,
  },

  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
    minHeight: 62,
    paddingHorizontal: 18,
  },

  headerRow: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 58,
  },

  evenRow: {
    backgroundColor: '#FCFCFD',
  },

  invalidRow: {
    backgroundColor: '#FFF7F7',
  },

  cell: {
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#374151',
  },

  headerCell: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4B5563',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  indexCell: {
    width: 60,
  },

  statusCell: {
    width: 130,
  },

  nameCell: {
    flex: 1.4,
    minWidth: 210,
  },

  appTypeCell: {
    flex: 1.3,
    minWidth: 220,
  },

  examineeTypeCell: {
    flex: 1.1,
    minWidth: 190,
  },

  errorCell: {
    flex: 1.8,
    minWidth: 280,
  },

  boldText: {
    fontWeight: '700',
    color: '#111827',
  },

  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },

  validBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#BBF7D0',
  },

  invalidBadge: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },

  statusText: {
    fontSize: 13,
    fontWeight: '800',
  },

  readyText: {
    color: successColor,
    fontWeight: '600',
  },

  errorText: {
    color: dangerColor,
    fontSize: 13,
    fontWeight: '600',
  },

  emptyState: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },

  footer: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
    gap: 16,
  },

  footerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },

  footerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    minWidth: Platform.OS === 'web' ? 430 : undefined,
  },

  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  confirmButton: {
    flex: 1.3,
    height: 50,
    backgroundColor: primaryColor,
    borderRadius: 14,
  },

  cancelText: {
    color: '#4B5563',
    fontSize: 15,
    fontWeight: '800',
  },

  confirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  disabled: {
    opacity: 0.5,
  },
});

export default CSVPreviewModal;