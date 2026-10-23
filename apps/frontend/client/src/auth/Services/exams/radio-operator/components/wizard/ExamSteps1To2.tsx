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
import { ExamScheduleCard, isScheduleOpenForFiling } from "../../../../shared/components/ExamScheduleCard";

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
  const selectedRegionName = tenants.find((t) => t.id === selectedRegionId)?.name;
  const hasOpenSchedule = schedules.some((s) => isScheduleOpenForFiling(s));
  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId);
  const isSelectedOpen = selectedSchedule ? isScheduleOpenForFiling(selectedSchedule) : false;
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
        setUploadedFileName(asset?.name || "Exam_Applicants_Import.csv");
      }

      let fileText = "";
      if (Platform.OS === "web" && asset?.file && typeof asset.file.text === "function") {
        fileText = await asset.file.text();
      } else if (asset?.uri) {
        const response = await fetch(asset.uri);
        fileText = await response.text();
      }

      if (fileText && fileText.trim().length > 0) {
        const parseResult = parseSpreadsheetContent(fileText, examService);
        if (parseResult.applicants.length > 0 && setExamApplicants) {
          const mappedExams = parseResult.applicants.map((app, idx) => ({
            id: idx + 1,
            firstName: app.firstName || `Examinee ${idx + 1}`,
            middleName: app.middleName || "",
            lastName: app.lastName || "Applicant",
            suffix: app.suffix || "",
            birthMonth: app.birthMonth || "January",
            birthDay: app.birthDay || "1",
            birthYear: app.birthYear || "2000",
            sex: (app.sex?.toLowerCase() === "female" ? "Female" : "Male"),
            nationality: app.nationality || "Filipino",
            regionName: app.region || "National Capital Region (NCR)",
            province: app.province || "",
            city: app.city || "",
            barangay: app.barangay || "",
            street: app.street || app.address || "",
            zipCode: app.zipCode || "",
            schoolName: app.schoolName || "",
            courseDegree: app.courseDegree || "",
            yearGraduated: app.yearGraduated || "",
            specialOrderNo: app.specialOrderNo || "",
            email: app.email || "",
            contactNo: app.contactNo || "",
            examType: app.examType || "Radiotelephony",
            examineeType: app.examineeType || "First Taker",
            selectedOption: app.selectedOption || "1PHN - Elements 1, 2, 3 & 4",
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
      <View style={{ gap: 16 }}>
        {/* Region & Office Card */}
        <View style={styles.formSection}>
          <Text style={styles.formSectionHeading}>Region & Office Selection</Text>
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
        </View>

        {/* Application Mode Card */}
        <View style={styles.formSection}>
          <Text style={styles.formSectionHeading}>Application Mode</Text>
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
            <View style={[styles.alertContainer, { marginTop: 16 }]}>
              <Icon name="info" size={16} color={COLORS.brand[700]} />
              <Text style={styles.alertText}>
                <Text style={{ fontWeight: "700" }}>Bulk Filing Workflow Mode Engaged{"\n"}</Text>
                After setting up the regional and office pathways, click Next to choose your document upload workspace method.
              </Text>
            </View>
          )}
        </View>

        {/* Scheduled Dates Card */}
        <View style={styles.formSection}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
            <Text style={styles.formSectionHeading}>Scheduled Exam Dates*</Text>
            {selectedScheduleId && isSelectedOpen ? (
              <View style={{ backgroundColor: "#DCFCE7", borderColor: "#16A34A", borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Icon name="check" size={12} color="#16A34A" />
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#16A34A" }}>Schedule Selected</Text>
              </View>
            ) : schedules.length > 0 && !hasOpenSchedule ? (
              <View style={{ backgroundColor: "#FEF3C7", borderColor: "#F59E0B", borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Icon name="clock" size={12} color="#B45309" />
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#B45309" }}>Upcoming Schedule(s)</Text>
              </View>
            ) : (
              <Text style={{ fontSize: 11, fontStyle: "italic", color: "#E11D48" }}>* Selection required</Text>
            )}
          </View>
          {loadingSchedules ? (
            <View style={{ padding: 20, alignItems: "center", justifyContent: "center", gap: 8 }}>
              <ActivityIndicator size="small" color="#0F2C59" />
              <Text style={{ color: COLORS.neutral[600], fontSize: 13 }}>Checking available examination schedules...</Text>
            </View>
          ) : schedules.length === 0 ? (
            <View
              style={{
                padding: 16,
                backgroundColor: "#FFFBEB",
                borderWidth: 1,
                borderColor: "#FDE68A",
                borderRadius: 10,
                marginVertical: 8,
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#FEF3C7",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 2,
                }}
              >
                <Icon name="calendar" size={18} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#92400E", fontSize: 14, fontWeight: "700", marginBottom: 4 }}>
                  No Open Examination Schedule
                </Text>
                <Text style={{ color: "#B45309", fontSize: 13, lineHeight: 18 }}>
                  There are currently no active or upcoming exam schedules for the selected Region/Office. Examination filing requires an open schedule date. You may switch to another Regional Office or check back soon for newly published exam dates.
                </Text>
              </View>
            </View>
          ) : (
            <View style={{ gap: 4 }}>
              {schedules.map((sched, index) => (
                <ExamScheduleCard
                  key={sched.id || String(index)}
                  schedule={sched}
                  isSelected={selectedScheduleId === sched.id}
                  onSelect={(id) => setSelectedScheduleId(id)}
                  fallbackRegionName={selectedRegionName}
                />
              ))}
            </View>
          )}
        </View>
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
                  {templateConfig.headers.slice(0, 5).map((h, idx) => (
                    <Text key={idx} style={styles.tableCellHeader} numberOfLines={1}>
                      {h}
                    </Text>
                  ))}
                </View>
                {templateConfig.sampleRows.slice(0, 2).map((row, rIdx) => (
                  <View key={rIdx} style={styles.tableRow}>
                    {row.slice(0, 5).map((c, cIdx) => (
                      <Text key={cIdx} style={styles.tableCell} numberOfLines={1}>
                        {c}
                      </Text>
                    ))}
                  </View>
                ))}
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
