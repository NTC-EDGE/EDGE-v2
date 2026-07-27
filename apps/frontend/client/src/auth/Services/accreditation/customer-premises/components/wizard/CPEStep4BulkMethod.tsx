import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Icon, COLORS, SPACING, TYPOGRAPHY } from "@edge/ui";

interface CPEStep4BulkMethodProps {
  appMode: "SINGLE" | "BULK" | "";
  setAppMode: (mode: "SINGLE" | "BULK" | "") => void;
  bulkMethod: "MANUAL" | "EXCEL";
  setBulkMethod: (method: "MANUAL" | "EXCEL") => void;
  isFileUploaded: boolean;
  handleMockFileUpload: () => void;
  styles: any;
}

export function CPEStep4BulkMethod({
  appMode,
  setAppMode,
  bulkMethod,
  setBulkMethod,
  isFileUploaded,
  handleMockFileUpload,
  styles,
}: CPEStep4BulkMethodProps) {
  return (
    <View>
      <Text style={styles.stepSubtitle}>SELECT YOUR BULK DATA ENTRY METHOD</Text>
      <Text style={[styles.infoDesc, { marginBottom: SPACING[16] }]}>
        Choose between manually entering profiles or importing a complete CSV spreadsheet.
      </Text>

      <View style={styles.cardsRow}>
        {/* Option A: Manual */}
        <TouchableOpacity
          onPress={() => {
            setAppMode("BULK");
            setBulkMethod("MANUAL");
          }}
          style={[
            styles.configCard,
            appMode === "BULK" && bulkMethod === "MANUAL" && styles.configCardActive,
          ]}
        >
          <View
            style={[
              styles.badgeCircle,
              appMode === "BULK" && bulkMethod === "MANUAL" && styles.badgeCircleActive,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                appMode === "BULK" && bulkMethod === "MANUAL" && styles.badgeTextActive,
              ]}
            >
              A
            </Text>
          </View>
          <Text style={styles.cardTitle}>MANUAL ENCODING BOARD</Text>
          <Text style={styles.cardDesc}>
            Input each applicant's personal details, examinee categories, and radio class options directly within the NTC portal form.
          </Text>
          <TouchableOpacity
            onPress={() => {
              setAppMode("BULK");
              setBulkMethod("MANUAL");
            }}
            style={[
              styles.cardBtn,
              appMode === "BULK" && bulkMethod === "MANUAL" && styles.cardBtnActive,
            ]}
          >
            <Text
              style={[
                styles.cardBtnText,
                appMode === "BULK" && bulkMethod === "MANUAL" && styles.cardBtnTextActive,
              ]}
            >
              {appMode === "BULK" && bulkMethod === "MANUAL" ? "ACTIVE" : "SELECT MANUAL"}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Option B: Excel/CSV */}
        <TouchableOpacity
          onPress={() => {
            setAppMode("BULK");
            setBulkMethod("EXCEL");
          }}
          style={[
            styles.configCard,
            appMode === "BULK" && bulkMethod === "EXCEL" && styles.configCardActive,
          ]}
        >
          <View
            style={[
              styles.badgeCircle,
              appMode === "BULK" && bulkMethod === "EXCEL" && styles.badgeCircleActive,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                appMode === "BULK" && bulkMethod === "EXCEL" && styles.badgeTextActive,
              ]}
            >
              B
            </Text>
          </View>
          <Text style={styles.cardTitle}>EXCEL / CSV + INDIVIDUAL UPLOAD</Text>
          <Text style={styles.cardDesc}>
            Download a pre-structured spreadsheet template. Once filled, import the file to automatically set up 100+ applicant entries.
          </Text>
          <TouchableOpacity
            onPress={() => {
              setAppMode("BULK");
              setBulkMethod("EXCEL");
            }}
            style={[
              styles.cardBtn,
              appMode === "BULK" && bulkMethod === "EXCEL" && styles.cardBtnActive,
            ]}
          >
            <Text
              style={[
                styles.cardBtnText,
                appMode === "BULK" && bulkMethod === "EXCEL" && styles.cardBtnTextActive,
              ]}
            >
              {appMode === "BULK" && bulkMethod === "EXCEL" ? "ACTIVE" : "SELECT EXCEL IMPORT"}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* Required Schema Card */}
      <View style={styles.specCard}>
        <View style={styles.specTitleWrapper}>
          <Icon name="file-text" size={18} color={COLORS.brand[700]} />
          <Text style={styles.specTitle}>REQUIRED SCHEMA PARAMETERS</Text>
        </View>
        <Text style={styles.specSubheading}>SPREADSHEET SPECIFICATIONS</Text>
        <Text style={styles.specDesc}>
          To guarantee successful backend ingestion, make sure columns line up exactly with our official CSV structure template.
        </Text>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.tableCellHeader}>A (Application Type)</Text>
            <Text style={styles.tableCellHeader}>B (Examinee Type)</Text>
            <Text style={styles.tableCellHeader}>C (Class/Element)</Text>
            <Text style={styles.tableCellHeader}>... 19 more columns</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>applicationType.label</Text>
            <Text style={styles.tableCell}>service.examineeType...</Text>
            <Text style={styles.tableCell}>service.application...</Text>
            <Text style={styles.tableCell}>(Mapping path row)</Text>
          </View>
        </View>
      </View>

      {/* Extra file action buttons if Option B is active */}
      {appMode === "BULK" && bulkMethod === "EXCEL" && (
        <View style={styles.bulkActionRow}>
          <TouchableOpacity
            onPress={() => Alert.alert("Download Complete", "CPE_Supplier_Template.csv downloaded successfully.")}
            style={styles.downloadBtn}
          >
            <Icon name="download" size={16} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.downloadBtnText}>Download Template Spreadsheet (.csv)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleMockFileUpload}
            style={styles.uploadBtn}
          >
            <Icon name="upload" size={16} color={COLORS.neutral[700]} style={{ marginRight: 8 }} />
            <Text style={styles.uploadBtnText}>
              {isFileUploaded ? "Uploaded ✔" : "Upload Filled Excel/CSV"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Standard navigation choice helper */}
      <View style={{ marginTop: 24, padding: 12, backgroundColor: COLORS.neutral[100], borderRadius: 8 }}>
        <TouchableOpacity onPress={() => {
          setAppMode("SINGLE");
          Alert.alert("Filing Mode", "Switched to standard Single applicant filing mode.");
        }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.brand[700], textAlign: "center", fontWeight: "600" }}>
            Or proceed with standard Single Applicant filing flow
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
