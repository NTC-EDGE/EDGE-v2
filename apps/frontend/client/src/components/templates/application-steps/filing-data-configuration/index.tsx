import React, { FC, useCallback } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import Text from '@atoms/text';
import styles from './styles';
import {
  ClipboardList,
  Download,
  Upload,
  FileSpreadsheet,
  Zap,
  Sparkles,
} from 'lucide-react-native';

type BulkEntryMethod = 'manual' | 'excel';

interface Props {
  selectedMethod: BulkEntryMethod;
  onSelectMethod: (method: BulkEntryMethod) => void;
  onDownloadTemplate?: () => void;
  onUploadExcel?: () => void;
  onLoadSingleFiler?: () => void;
  onLoadBulkDemo?: () => void;
}

const FilingDataConfiguration: FC<Props> = ({
  selectedMethod = 'manual',
  onSelectMethod = () => { },
  onDownloadTemplate = () => { },
  onUploadExcel = () => { },
  onLoadSingleFiler = () => { },
  onLoadBulkDemo = () => { },
}) => {
  const isManual = selectedMethod === 'manual';
  const isExcel = selectedMethod === 'excel';

  const handleSelectManual = useCallback(() => onSelectMethod('manual'), [onSelectMethod]);
  const handleSelectExcel = useCallback(() => onSelectMethod('excel'), [onSelectMethod]);

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Select Your Bulk Data Entry Method</Text>
        <Text style={styles.headerSubtitle}>
          Choose between manually entering profiles or importing a complete CSV spreadsheet.
        </Text>
      </View>

      {/* Method Cards */}
      <View style={styles.cardsRow}>
        {/* Card A: Manual Encoding */}
        <TouchableOpacity
          style={[styles.card, isManual && styles.cardActive]}
          onPress={handleSelectManual}
          activeOpacity={0.85}
        >
          <Text style={[styles.cardLabel, !isManual && styles.cardLabelInactive]}>A</Text>
          <Text style={styles.cardTitle}>MANUAL ENCODING BOARD</Text>
          <Text style={styles.cardDescription}>
            Input each applicant's personal details, examinee categories, and radio class options
            directly within the NTC portal form.
          </Text>
          {isManual ? (
            <View style={styles.badgeActive}>
              <Text style={styles.badgeActiveText}>ACTIVE</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.badgeInactive} onPress={handleSelectManual}>
              <Text style={styles.badgeInactiveText}>SELECT MANUAL</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Card B: Excel/CSV Upload */}
        <TouchableOpacity
          style={[styles.card, isExcel && styles.cardActive]}
          onPress={handleSelectExcel}
          activeOpacity={0.85}
        >
          <Text style={[styles.cardLabel, !isExcel && styles.cardLabelInactive]}>B</Text>
          <Text style={styles.cardTitle}>EXCEL / CSV + INDIVIDUAL UPLOAD</Text>
          <Text style={styles.cardDescription}>
            Download a pre-structured spreadsheet template. Once filled, import the file to
            automatically set up 100+ applicant entries.
          </Text>
          {isExcel ? (
            <View style={styles.badgeActive}>
              <Text style={styles.badgeActiveText}>ACTIVE</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.badgeInactive} onPress={handleSelectExcel}>
              <Text style={styles.badgeInactiveText}>SELECT EXCEL IMPORT</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>

      {/* Required Schema Parameters */}
      <View style={styles.schemaContainer}>
        <View style={styles.schemaTitleRow}>
          <ClipboardList color="#2863D6" size={20} style={styles.schemaIcon} />
          <Text style={styles.schemaTitle}>REQUIRED SCHEMA PARAMETERS</Text>
        </View>

        <View style={styles.schemaColumnsRow}>
          {/* Spreadsheet Specifications */}
          <View style={styles.schemaColumn}>
            <Text style={styles.schemaColumnTitle}>Spreadsheet Specifications</Text>
            <Text style={styles.schemaColumnDescription}>
              To guarantee successful backend ingestion, make sure columns line up exactly with our
              official CSV structure template.
            </Text>

            <View style={styles.tableContainer}>
              <View style={styles.tableHeaderRow}>
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderText}>A (Application Type)</Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderText}>B (Examinee Type)</Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderText}>C (Class/Element)</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.tableHeaderCellLast]}>
                  <Text style={styles.tableHeaderText}>... 19 more columns</Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text style={styles.tableCellText}>applicationType.label</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.tableCellText}>service.examineeType...</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.tableCellText}>service.application...</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellLast]}>
                  <Text style={styles.tableCellText}>(Mapping path row)</Text>
                </View>
              </View>
            </View>
          </View>


        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        {
          isExcel && (
            <TouchableOpacity
              style={[styles.downloadButton, !isExcel && { opacity: 0.5 }]}
              onPress={onDownloadTemplate}
              activeOpacity={0.85}
              disabled={!isExcel}
            >
              <Download color="#fff" size={18} />
              <Text style={styles.downloadButtonText}>Download Template Spreadsheet (.csv)</Text>
            </TouchableOpacity>)
        }

        {isExcel && (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={onUploadExcel}
            activeOpacity={0.85}
          >
            <Upload color="#374151" size={18} />
            <Text style={styles.uploadButtonText}>Upload Filled Excel/CSV</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default React.memo(FilingDataConfiguration);
