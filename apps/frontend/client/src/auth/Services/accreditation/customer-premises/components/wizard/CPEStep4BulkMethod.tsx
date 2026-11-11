import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, Platform, ActivityIndicator } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Icon, COLORS, SPACING, TYPOGRAPHY } from "@edge/ui";
import {
  getSpreadsheetTemplateForService,
  generateCsvContent,
  downloadCsvFile,
  parseSpreadsheetContent,
} from "../../../../shared/spreadsheet";

interface CPEStep4BulkMethodProps {
  appMode: "SINGLE" | "BULK" | "";
  setAppMode: (mode: "SINGLE" | "BULK" | "") => void;
  bulkMethod: "MANUAL" | "EXCEL";
  setBulkMethod: (method: "MANUAL" | "EXCEL") => void;
  isFileUploaded: boolean;
  setIsFileUploaded?: (val: boolean) => void;
  setUploadedFileName?: (name: string) => void;
  handleMockFileUpload: () => void;
  setApplicants?: React.Dispatch<React.SetStateAction<any[]>>;
  styles: any;
}

export function CPEStep4BulkMethod({
  appMode,
  setAppMode,
  bulkMethod,
  setBulkMethod,
  isFileUploaded,
  setIsFileUploaded,
  setUploadedFileName,
  handleMockFileUpload,
  setApplicants,
  styles,
}: CPEStep4BulkMethodProps) {
  const [loading, setLoading] = useState(false);

  const mockService = {
    code: "NTC_1_18",
    title: "Accreditation of Customer Premises Equipment (CPE) Suppliers",
    description: "",
    requirements: [],
    fee: "",
    time: "",
  };

  const templateConfig = getSpreadsheetTemplateForService(mockService);

  const handleDownloadTemplate = () => {
    const csvContent = generateCsvContent(templateConfig);
    downloadCsvFile(templateConfig.filename, csvContent);
  };

  const handleRealFileUpload = async () => {
    try {
      setLoading(true);
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          "text/csv",
          "text/comma-separated-values",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/plain",
          "*/*",
        ],
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) {
        setLoading(false);
        return;
      }

      const asset = res.assets[0];
      if (!asset) {
        setLoading(false);
        return;
      }

      if (setUploadedFileName) {
        setUploadedFileName(asset?.name || "CPE_Supplier_Import.csv");
      }

      let fileText = "";
      if (Platform.OS === "web" && asset?.file && typeof asset.file.text === "function") {
        fileText = await asset.file.text();
      } else if (asset?.uri) {
        const response = await fetch(asset.uri);
        fileText = await response.text();
      }

      if (fileText && fileText.trim().length > 0) {
        const parseResult = parseSpreadsheetContent(fileText, mockService);
        if ((parseResult?.applicants?.length ?? 0) > 0 && setApplicants) {
          // Map to CPE Applicant structure
          const mappedCPE = (parseResult.applicants ?? []).map((app, idx) => ({
            id: idx + 1,
            businessName: app.firstName || `CPE Supplier ${idx + 1}`,
            businessType: "Corporation",
            secDtiRegNo: "",
            contactNo: app.contactNo || "",
            email: app.email || "",
            province: app.province || "",
            city: app.city || "",
            barangay: app.barangay || "",
            street: app.street || app.address || "",
            years: "3",
            variation: "Mobile",
            applicationType: "NEW",
            supervisingEngineer: { name: "", peceNumber: "" },
            technician: { name: "", certificateNumber: "" },
            uploads: {},
          }));
          setApplicants(mappedCPE);
        }
        if (setIsFileUploaded) {
          setIsFileUploaded(true);
        }
        Alert.alert(
          "Import Successful",
          `Parsed ${parseResult.totalRows} supplier entries (${parseResult.validCount} valid). Populated directly into your CPE cohort.`
        );
      } else {
        handleMockFileUpload();
      }
    } catch (err) {
      console.warn("Document picker fallback:", err);
      handleMockFileUpload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text style={styles.stepSubtitle}>SELECT YOUR BULK DATA ENTRY METHOD</Text>
      <Text style={[styles.infoDesc, { marginBottom: SPACING[16] }]}>
        Choose between manually entering profiles or importing an Excel / CSV spreadsheet template.
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
            Download our official pre-formatted spreadsheet template. Once filled, import the file to automatically set up 100+ applicant entries.
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
            {templateConfig.headers.slice(0, 4).map((h, idx) => (
              <Text key={idx} style={styles.tableCellHeader}>
                {h}
              </Text>
            ))}
          </View>
          {templateConfig.sampleRows.slice(0, 1).map((row, rIdx) => (
            <View key={rIdx} style={styles.tableRow}>
              {row.slice(0, 4).map((c, cIdx) => (
                <Text key={cIdx} style={styles.tableCell} numberOfLines={1}>
                  {c}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Extra file action buttons if Option B is active */}
      {appMode === "BULK" && bulkMethod === "EXCEL" && (
        <View style={styles.bulkActionRow}>
          <TouchableOpacity
            onPress={handleDownloadTemplate}
            style={styles.downloadBtn}
          >
            <Icon name="download" size={16} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.downloadBtnText}>Download Template Spreadsheet (.csv)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRealFileUpload}
            disabled={loading}
            style={styles.uploadBtn}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.brand[800]} style={{ marginRight: 8 }} />
            ) : (
              <Icon name="upload" size={16} color={COLORS.neutral[700]} style={{ marginRight: 8 }} />
            )}
            <Text style={styles.uploadBtnText}>
              {isFileUploaded ? "Spreadsheet Ingested ✔" : "Upload Filled Excel/CSV"}
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
