import React, { useRef } from "react";
import * as DocumentPicker from "expo-document-picker";
import { ScrollView, View, Text, Alert, TouchableOpacity } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";
import { useToast } from "../../../../../shared/components/Toast";
import { useExamFilingWizard } from "../hooks/useExamFilingWizard";
import { ExamSteps1To2 } from "./wizard/ExamSteps1To2";
import { ExamStep3TypeSelection } from "./wizard/ExamStep3TypeSelection";
import { ExamStep4Form } from "./wizard/ExamStep4Form";
import { ExamStep5Upload } from "./wizard/ExamStep5Upload";
import { ExamStep6Review } from "./wizard/ExamStep6Review";
import { ExamStep7Confirmed } from "./wizard/ExamStep7Confirmed";
import { ExamWizardNavigation } from "./wizard/ExamWizardNavigation";
import { ExamWizardModals } from "./wizard/ExamWizardModals";
import { ExamApplicantData, initialExamApplicant } from "../types/examTypes";
import { validateExamForm, getRequirementsList } from "../helpers/examMapping";
import { styles } from "./ExamFilingWizard.styles";

interface ExamFilingWizardProps {
  onClose: () => void;
  onSuccess: () => void;
  isDetailsExpanded: boolean;
  onToggleExpand: () => void;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  selectedRegionId: string;
  setSelectedRegionId: (id: string) => void;
  selectedOfficeId: string;
  setSelectedOfficeId: (id: string) => void;
  appMode: "SINGLE" | "BULK" | "";
  setAppMode: (mode: "SINGLE" | "BULK" | "") => void;
  bulkMethod: "MANUAL" | "EXCEL";
  setBulkMethod: (method: "MANUAL" | "EXCEL") => void;
  isFileUploaded: boolean;
  setIsFileUploaded: (val: boolean) => void;
  uploadedFileName: string;
  setUploadedFileName: (name: string) => void;
  applicants: ExamApplicantData[];
  setApplicants: React.Dispatch<React.SetStateAction<ExamApplicantData[]>>;
  currentApplicantIndex: number;
  setCurrentApplicantIndex: (idx: number) => void;
  isBulkSubmitOpen: boolean;
  setIsBulkSubmitOpen: (val: boolean) => void;
  serviceId?: string | null;
  serviceName?: string | null;
}

export function ExamFilingWizard(props: ExamFilingWizardProps) {
  const [selectedScheduleId, setSelectedScheduleId] = React.useState<string | null>(null);

  const wizard = useExamFilingWizard({
    ...props,
    selectedScheduleId,
    setSelectedScheduleId,
  });

  const scrollViewRef = useRef<ScrollView | null>(null);
  const isManualScrolling = useRef(false);
  const sectionOffsets = useRef<Record<string, number>>({});

  const requirementsList = getRequirementsList(
    wizard.dbRequirements,
    wizard.activeApplicant.examType,
    props.serviceName
  );

  const handleDocumentPick = (slotKey: string, file: { name: string; uri: string }) => {
    const nextUploads = { ...wizard.activeApplicant.uploads };
    nextUploads[slotKey] = file;
    wizard.updateActiveApplicant({ uploads: nextUploads });
  };

  const handleMockCSVUpload = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
      });
      if (res.canceled === false && res.assets && res.assets.length > 0) {
        wizard.setIsPreviewModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      wizard.setIsPreviewModalOpen(true);
    }
  };

  const handleConfirmCSVImport = () => {
    props.setIsFileUploaded(true);
    props.setUploadedFileName("NTC_Bulk_Template.csv");
    props.setApplicants([
      {
        ...initialExamApplicant(1),
        examType: "Amateur",
        examineeType: "First Taker",
        selectedOption: "Class A - Elements 8, 9, 10 & Code",
        lastName: "Doe", firstName: "John", middleName: "Smith", suffix: "Jr.",
        birthMonth: "January", birthDay: "1", birthYear: "1990", sex: "Male", nationality: "Filipino",
        regionName: "National Capital Region (NCR)", province: "Metro Manila", city: "Quezon City", barangay: "Barangay 1", street: "Main Street", zipCode: "1100",
        schoolName: "University of the Philippines", courseDegree: "BS Computer Science", yearGraduated: "2012",
        contactNo: "09123456789", email: "john.doe@example.com",
      },
      {
        ...initialExamApplicant(2),
        examType: "Amateur",
        examineeType: "First Taker",
        selectedOption: "Class B - Elements 5, 6, 7",
        lastName: "Reyes", firstName: "Maria", middleName: "Santos", suffix: "",
        birthMonth: "May", birthDay: "15", birthYear: "1992", sex: "Female", nationality: "Filipino",
        regionName: "National Capital Region (NCR)", province: "Metro Manila", city: "Makati City", barangay: "Barangay 2", street: "Second Street", zipCode: "1200",
        schoolName: "Ateneo de Manila University", courseDegree: "BS Management", yearGraduated: "2014",
        contactNo: "09198765432", email: "maria.reyes@example.com",
      },
      {
        ...initialExamApplicant(3),
        examType: "Amateur",
        examineeType: "First Taker",
        selectedOption: "Class C - Elements 2, 3, 4",
        lastName: "Cruz", firstName: "Juan", middleName: "Dela", suffix: "",
        birthMonth: "October", birthDay: "20", birthYear: "1988", sex: "Male", nationality: "Filipino",
        regionName: "National Capital Region (NCR)", province: "Metro Manila", city: "Pasig City", barangay: "Barangay 3", street: "Third Street", zipCode: "1600",
        schoolName: "De La Salle University", courseDegree: "BS Engineering", yearGraduated: "2010",
        contactNo: "09176543210", email: "juan.cruz@example.com",
      }
    ]);
    props.setCurrentApplicantIndex(0);
    wizard.setIsPreviewModalOpen(false);
    props.setStep(5);
  };

  const handleNext = () => {
    if (props.step === 1) {
      if (!props.selectedRegionId || !props.selectedOfficeId || !props.appMode) {
        Alert.alert("Validation Error", "Please select a Region, Processing Office, and Application Mode.");
        return;
      }
      if (!selectedScheduleId) {
        Alert.alert(
          "Exam Schedule Required",
          "Please select an Exam Schedule date before you can proceed with the application."
        );
        return;
      }
      props.setStep(props.appMode === "SINGLE" ? 3 : 2);
    } else if (props.step === 2) {
      if (props.bulkMethod === "EXCEL" && !props.isFileUploaded) {
        Alert.alert("Error", "Please upload the CSV/Excel template file.");
        return;
      }
      props.setStep(props.bulkMethod === "EXCEL" ? 6 : 3);
    } else if (props.step === 3) {
      if (!wizard.activeApplicant.selectedVariantId) {
        Alert.alert("Error", "Please select an Examinee Type.");
        return;
      }
      if (wizard.variantElements && wizard.variantElements.length > 0 && !wizard.activeApplicant.selectedElementId && !wizard.activeApplicant.selectedOption) {
        Alert.alert("Error", "Please select an element / option for your exam.");
        return;
      }
      props.setStep(4);
    } else if (props.step === 4) {
      if (!validateExamForm(wizard.activeApplicant, wizard.setErrors)) {
        const fields = ["lastName", "firstName", "province", "city", "barangay", "street", "zipCode", "schoolName", "courseDegree", "yearGraduated", "email", "contactNo"];
        const nextTouched: Record<string, boolean> = {};
        fields.forEach((f) => (nextTouched[f] = true));
        wizard.setTouched(nextTouched);
        Alert.alert("Validation Error", "Please fill in all required fields marked with *.");
        return;
      }
      props.setStep(5);
    } else if (props.step === 5) {
      const allUploaded = requirementsList.every((_, idx) => wizard.activeApplicant.uploads[idx.toString()]);
      if (!allUploaded) {
        Alert.alert("Error", "Please upload all mandatory supporting documents.");
        return;
      }
      props.setStep(6);
    } else if (props.step === 6) {
      wizard.setIsConfirmModalOpen(true);
    } else if (props.step === 7) {
      handleAddAnotherApplicant();
    }
  };

  const handleBack = () => {
    if (props.step === 1) props.onClose();
    else if (props.step === 2) props.setStep(1);
    else if (props.step === 3) props.setStep(props.appMode === "SINGLE" ? 1 : 2);
    else if (props.step === 4) props.setStep(3);
    else if (props.step === 5) props.setStep(4);
    else if (props.step === 6) props.setStep(props.appMode === "BULK" && props.bulkMethod === "EXCEL" ? 2 : 5);
    else if (props.step === 7) props.setStep(6);
  };

  const handleScrollToSection = (tab: "BASIC" | "ADDRESS" | "EDUCATION" | "CONTACT") => {
    wizard.setActiveFormTab(tab);
    isManualScrolling.current = true;
    const offset = sectionOffsets.current[tab];
    if (offset !== undefined && scrollViewRef.current !== null) {
      scrollViewRef.current.scrollTo({ y: offset, animated: true });
    }
    setTimeout(() => { isManualScrolling.current = false; }, 600);
  };

  const handleScroll = (event: any) => {
    if (isManualScrolling.current) return;
    const scrollY = event.nativeEvent.contentOffset.y;
    const basic = sectionOffsets.current["BASIC"] || 0;
    const address = sectionOffsets.current["ADDRESS"] || 0;
    const education = sectionOffsets.current["EDUCATION"] || 0;
    const contact = sectionOffsets.current["CONTACT"] || 0;

    let active: typeof wizard.activeFormTab = "BASIC";
    if (scrollY >= contact - 120) active = "CONTACT";
    else if (scrollY >= education - 120) active = "EDUCATION";
    else if (scrollY >= address - 120) active = "ADDRESS";
    else active = "BASIC";

    if (wizard.activeFormTab !== active) {
      wizard.setActiveFormTab(active);
    }
  };

  const handleConfirmApplicantInBulk = () => {
    wizard.setShowToast(true);
    setTimeout(() => wizard.setShowToast(false), 3000);

    if (props.currentApplicantIndex < props.applicants.length - 1) {
      props.setCurrentApplicantIndex(props.currentApplicantIndex + 1);
      props.setStep(props.bulkMethod === "EXCEL" ? 5 : 3);
    } else {
      props.setStep(7);
    }
  };

  const handleAddAnotherApplicant = () => {
    const nextId = props.applicants.length + 1;
    props.setApplicants((prev) => [...prev, initialExamApplicant(nextId)]);
    props.setCurrentApplicantIndex(props.applicants.length);
    props.setStep(3);
  };

  const toast = useToast();

  const handleFinalSubmit = async () => {
    wizard.setIsSubmitting(true);
    try {
      await wizard.submitApplicationPayload();
      toast.success(
        "Application Submitted",
        "Your radio operator exam application has been submitted successfully."
      );
      wizard.setIsConfirmModalOpen(false);
      props.onSuccess();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error && err.message.length > 0 ? err.message : "Failed to submit application.";
      toast.error("Submission Failed", msg);
    } finally {
      wizard.setIsSubmitting(false);
    }
  };

  const handleBulkFinalSubmit = async () => {
    if (!wizard.validateBulkSubmit()) return;
    wizard.setIsSubmitting(true);
    try {
      await wizard.submitApplicationPayload();
      toast.success(
        "Applications Submitted",
        "Your bulk radio operator exam applications have been submitted successfully."
      );
      props.setIsBulkSubmitOpen(false);
      props.onSuccess();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error && err.message.length > 0 ? err.message : "Failed to submit applications.";
      toast.error("Submission Failed", msg);
    } finally {
      wizard.setIsSubmitting(false);
    }
  };

  const TOTAL_STEPS = props.appMode === "BULK" ? 7 : 6;
  const stepLabels: Record<number, string> = {
    1: "Region, Office & Schedule",
    2: "Bulk Entry Method",
    3: "Examinee Type & Elements",
    4: "Personal Information",
    5: "Upload Documents",
    6: "Review & Submit",
    7: "Confirmed",
  };

  return (
    <View style={styles.container}>
      {/* Step Header — matches GeneralServiceWizard design */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View>
            <Text style={styles.headerTitle}>
              {props.serviceName || "Radio Operator Examination"}
            </Text>
            <Text style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 12,
              color: COLORS.neutral[500],
              marginTop: 2,
            }}>
              {stepLabels[props.step] ?? ""}
            </Text>
          </View>
        </View>
        <View style={styles.progressContainer}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <View
              key={i}
              style={[styles.progressDash, i + 1 <= props.step && styles.progressDashActive]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {(props.step === 1 || props.step === 2) && (
          <ExamSteps1To2
            {...props}
            {...wizard}
            step={props.step}
            handleMockCSVUpload={handleMockCSVUpload}
            selectedScheduleId={selectedScheduleId}
            setSelectedScheduleId={setSelectedScheduleId}
          />
        )}
        {props.step === 3 && <ExamStep3TypeSelection {...props} {...wizard} />}
        {props.step === 4 && <ExamStep4Form {...props} {...wizard} handleScrollToSection={handleScrollToSection} sectionOffsets={sectionOffsets} />}
        {props.step === 5 && <ExamStep5Upload {...props} {...wizard} requirementsList={requirementsList} handleDocumentPick={handleDocumentPick} isWeb={false} />}
        {props.step === 6 && <ExamStep6Review {...props} {...wizard} />}
        {props.step === 7 && <ExamStep7Confirmed applicantsCount={props.applicants.length} handleAddAnotherApplicant={handleAddAnotherApplicant} />}
      </ScrollView>

      <ExamWizardNavigation
        {...props}
        {...wizard}
        isNextDisabled={props.step === 1 ? (!props.selectedRegionId || !props.selectedOfficeId) : props.step === 2 && props.bulkMethod === "EXCEL" ? !props.isFileUploaded : false}
        handleBack={handleBack}
        handleNext={handleNext}
        getNextBtnText={() => props.step === 5 ? "Review" : props.step === 6 ? (props.appMode === "BULK" ? "Confirm" : "Submit") : "Next"}
      />
      <ExamWizardModals
        {...props}
        {...wizard}
        applicantsCount={props.applicants.length}
        handleConfirmCSVImport={handleConfirmCSVImport}
        handleFinalSubmit={handleFinalSubmit}
        handleConfirmApplicantInBulk={handleConfirmApplicantInBulk}
        handleBulkFinalSubmit={handleBulkFinalSubmit}
      />
    </View>
  );
}
