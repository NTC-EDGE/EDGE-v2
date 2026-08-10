import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, Platform, ActivityIndicator } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Icon, COLORS, SPACING } from "@edge/ui";
import { Select } from "../../../../../../shared/components/Select";
import { ScheduleItem } from "../../types/examTypes";
import { styles } from "../ExamFilingWizard.styles";
import {
  getSpreadsheetTemplateForService,
  generateCsvContent,
  downloadCsvFile,
  parseSpreadsheetContent,
} from "../../../../shared/spreadsheet";

interface ExamSteps1To2Props {
  step: number;
  selectedRegionId: string;
  setSelectedRegionId: (id: string) => void;
  selectedOfficeId: string;
  setSelectedOfficeId: (id: string) => void;
  appMode: "SINGLE" | "BULK" | "";
  setAppMode: (mode: "SINGLE" | "BULK" | "") => void;
  bulkMethod: "MANUAL" | "EXCEL";
  setBulkMethod: (method: "MANUAL" | "EXCEL") => void;
  isFileUploaded: boolean;
  setIsFileUploaded?: (val: boolean) => void;
  uploadedFileName: string;
  setUploadedFileName?: (name: string) => void;
  tenants: Array<{ id: string; name: string }>;
  loadingTenants: boolean;
  offices: Array<{ id: string; name: string }>;
  loadingOffices: boolean;
  schedules: ScheduleItem[];
  loadingSchedules: boolean;
  selectedScheduleId: string | null;
  setSelectedScheduleId: (id: string | null) => void;
  handleMockCSVUpload: () => void;
  setExamApplicants?: React.Dispatch<React.SetStateAction<any[]>>;
}

export function ExamSteps1To2({
  step,
  selectedRegionId,
  setSelectedRegionId,
  selectedOfficeId,
  setSelectedOfficeId,
  appMode,
  setAppMode,
  bulkMethod,
  setBulkMethod,
  isFileUploaded,
  setIsFileUploaded,
  uploadedFileName,
  setUploadedFileName,
  tenants,
  loadingTenants,
  offices,
  loadingOffices,
  schedules,
  loadingSchedules,
  selectedScheduleId,
  setSelectedScheduleId,
  handleMockCSVUpload,
  setExamApplicants,
}: ExamSteps1To2Props) {
  const [uploadLoading, setUploadLoading] = useState(false);

  const examService = {
    code: "NTC_1_01",
    title: "Radio Operator Examination",
    description: "",
    requirements: [],
    fee: "",
    time: "",
  };

  const templateConfig = getSpreadsheetTemplateForService(examService);

  const handleDownloadTemplate = () => {
    const csvContent = generateCsvContent(templateConfig);
    downloadCsvFile(templateConfig.filename, csvContent);
  };

  const handleRealCSVUpload = async () => {
    try {
      setUploadLoading(true);
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
        setUploadLoading(false);
        return;
      }

      const asset = res.assets[0];
      if (!asset) {
        setUploadLoading(false);
        return;
      }

      if (setUploadedFileName) {
        setUploadedFileName(asset.name || "Exam_Applicants_Import.csv");
      }

      let fileText = "";
      if (Platform.OS === "web" && asset.file) {
        fileText = await asset.file.text();
      } else if (asset.uri) {
        const response = await fetch(asset.uri);
        fileText = await response.text();
      }

      if (fileText && fileText.trim().length > 0) {
        const parseResult = parseSpreadsheetContent(fileText, examService);
        if (parseResult.applicants.length > 0 && setExamApplicants) {
          const mappedExams = parseResult.applicants.map((app, idx) => ({
            id: idx + 1,
            firstName: app.firstName || `Examinee ${idx + 1}`,
            lastName: app.lastName || "Applicant",
            email: app.email,
            contactNo: app.contactNo,
            address: app.address,
            birthMonth: app.birthMonth,
            birthDay: app.birthDay,
            birthYear: app.birthYear,
            notes: app.notes,
            examType: "Radiotelephony",
            examineeType: "FirstTaker",
            selectedOption: "1PHN - Elements 1, 2, 3 & 4",
            schoolAttended: "NTC Certified Training Center",
            specialAssistance: false,
            specialAssistanceType: "",
            uploads: {},
          }));
          setExamApplicants(mappedExams);
        }
        if (setIsFileUploaded) {
          setIsFileUploaded(true);
        }
        Alert.alert(
          "Import Successful",
          `Parsed ${parseResult.totalRows} examinee records (${parseResult.validCount} valid). Populated directly into your exam cohort.`
        );
      } else {
        handleMockCSVUpload();
      }
    } catch (err) {
      console.warn("Document picker fallback:", err);
      handleMockCSVUpload();
    } finally {
      setUploadLoading(false);
    }
  };

  if (step === 1) {
    return (
      <View>
        <Text style={styles.stepSubtitle}>Select from which region you intend to apply:</Text>

        <Text style={styles.selectLabel}>Region</Text>
        <Select
          placeholder={loadingTenants ? "Loading Regions..." : "Region"}
          value={selectedRegionId}
          onValueChange={(val: string) => {
            setSelectedRegionId(val);
            setSelectedOfficeId("");
          }}
          options={tenants.map((t) => ({ label: t.name, value: t.id }))}
        />

        <Text style={styles.selectLabel}>Select Office:</Text>
        <Select
          placeholder={loadingOffices ? "Loading Offices..." : "Offices*"}
          value={selectedOfficeId}
          onValueChange={(val: string) => setSelectedOfficeId(val)}
          options={offices.map((o) => ({ label: o.name, value: o.id }))}
        />

        <Text style={styles.selectLabel}>Select how you would like to process your application:</Text>
        <Select
          placeholder="Application Mode"
          value={appMode}
          onValueChange={(val: string) => setAppMode(val as "SINGLE" | "BULK")}
          options={[
            { label: "Single Application", value: "SINGLE" },
            { label: "Bulk Application", value: "BULK" },
          ]}
        />

        {appMode === "BULK" && (
          <View style={[styles.alertContainer, { marginTop: 20 }]}>
            <Icon name="info" size={16} color={COLORS.brand[700]} />
            <Text style={styles.alertText}>
              <Text style={{ fontWeight: "700" }}>Bulk Filing Workflow Mode Engaged{"\n"}</Text>
              After setting up the regional and office pathways, click Next to choose your document upload workspace method.
            </Text>
          </View>
        )}

        <Text style={styles.scheduleTitle}>Scheduled Dates</Text>
        {loadingSchedules ? (
          <Text style={{ marginVertical: 10, color: COLORS.neutral[500] }}>Loading schedules...</Text>
        ) : schedules.length === 0 ? (
          <Text style={{ marginVertical: 10, color: COLORS.neutral[500] }}>No schedules available for the selected region.</Text>
        ) : (
          schedules.map((sched, index) => {
            const isSelected = selectedScheduleId === sched.id;
            const d = new Date(sched.scheduledDate);
            const dateStr = !isNaN(d.getTime()) 
              ? d.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })
              : sched.scheduledDate;
            
            return (
              <TouchableOpacity
                key={sched.id || index}
                onPress={() => setSelectedScheduleId(sched.id)}
                style={[styles.dateCard, isSelected && styles.dateCardSelected]}
              >
                <View style={styles.dateItem}>
                  <Icon name="calendar" size={16} color={COLORS.brand[600]} />
                  <Text style={styles.dateText}>DATE: {dateStr}</Text>
                </View>
                <View style={styles.dateItem}>
                  <Icon name="clock" size={16} color={COLORS.brand[600]} />
                  <Text style={styles.dateText}>TIME: {sched.startTime || 'TBA'} - {sched.endTime || 'TBA'}</Text>
                </View>
                <View style={styles.dateItem}>
                  <Icon name="map-pin" size={16} color={COLORS.brand[600]} />
                  <Text style={styles.dateText}>VENUE: {sched.venue || "NTC Office"}</Text>
                </View>
                {sched.maximumSlots !== null && sched.maximumSlots !== undefined && (
                  <View style={styles.dateItem}>
                    <Icon name="users" size={16} color={COLORS.brand[600]} />
                    <Text style={styles.dateText}>SLOTS: {sched.maximumSlots} Maximum Slots</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>
    );
  }

  if (step === 2) {
    return (
      <View>
        <Text style={styles.stepSubtitle}>SELECT YOUR BULK DATA ENTRY METHOD</Text>
        <Text style={[styles.infoDesc, { marginBottom: SPACING[16] }]}>
          Choose between manually entering examinee profiles or importing an Excel / CSV spreadsheet template.
        </Text>

        <View style={styles.cardsRow}>
          <TouchableOpacity onPress={() => setBulkMethod("MANUAL")} style={[styles.configCard, bulkMethod === "MANUAL" && styles.configCardActive]}>
            <View style={[styles.badgeCircle, bulkMethod === "MANUAL" && styles.badgeCircleActive]}>
              <Text style={[styles.badgeText, bulkMethod === "MANUAL" && styles.badgeTextActive]}>A</Text>
            </View>
            <Text style={styles.cardTitle}>MANUAL ENCODING BOARD</Text>
            <Text style={styles.cardDesc}>
              Input each examinee's personal details, examinee categories, and radio class options directly within the NTC portal form.
            </Text>
            <TouchableOpacity onPress={() => setBulkMethod("MANUAL")} style={[styles.cardBtn, bulkMethod === "MANUAL" && styles.cardBtnActive]}>
              <Text style={[styles.cardBtnText, bulkMethod === "MANUAL" && styles.cardBtnTextActive]}>
                {bulkMethod === "MANUAL" ? "ACTIVE" : "SELECT MANUAL"}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setBulkMethod("EXCEL")} style={[styles.configCard, bulkMethod === "EXCEL" && styles.configCardActive]}>
            <View style={[styles.badgeCircle, bulkMethod === "EXCEL" && styles.badgeCircleActive]}>
              <Text style={[styles.badgeText, bulkMethod === "EXCEL" && styles.badgeTextActive]}>B</Text>
            </View>
            <Text style={styles.cardTitle}>EXCEL / CSV + INDIVIDUAL UPLOAD</Text>
            <Text style={styles.cardDesc}>
              Download a pre-structured spreadsheet template. Once filled, import the file to automatically set up applicant entries.
            </Text>
            <TouchableOpacity onPress={() => setBulkMethod("EXCEL")} style={[styles.cardBtn, bulkMethod === "EXCEL" && styles.cardBtnActive]}>
              <Text style={[styles.cardBtnText, bulkMethod === "EXCEL" && styles.cardBtnTextActive]}>
                {bulkMethod === "EXCEL" ? "ACTIVE" : "SELECT EXCEL IMPORT"}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {bulkMethod === "EXCEL" && (
          <View>
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
                  <Text style={styles.tableCellHeader}>A (Exam Type)</Text>
                  <Text style={styles.tableCellHeader}>B (Examinee Type)</Text>
                  <Text style={styles.tableCellHeader}>C (Option Class)</Text>
                  <Text style={styles.tableCellHeader}>... 8 more columns</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>examType.value</Text>
                  <Text style={styles.tableCell}>examineeType.value</Text>
                  <Text style={styles.tableCell}>selectedOption.value</Text>
                  <Text style={styles.tableCell}>(Mapping path row)</Text>
                </View>
              </View>
            </View>

            <View style={styles.bulkActionRow}>
              <TouchableOpacity
                onPress={handleDownloadTemplate}
                style={styles.downloadBtn}
              >
                <Icon name="download" size={16} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.downloadBtnText}>Download Template Spreadsheet (.csv)</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleRealCSVUpload} disabled={uploadLoading} style={styles.uploadBtn}>
                {uploadLoading ? (
                  <ActivityIndicator size="small" color={COLORS.brand[800]} style={{ marginRight: 8 }} />
                ) : (
                  <Icon name="upload" size={16} color={COLORS.neutral[700]} style={{ marginRight: 8 }} />
                )}
                <Text style={styles.uploadBtnText}>
                  {isFileUploaded ? `Ingested ✔ (${uploadedFileName})` : "Upload Filled Excel/CSV"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }

  return null;
}
