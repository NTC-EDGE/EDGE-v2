import React, { useState, useRef } from "react";
import * as DocumentPicker from "expo-document-picker";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  useWindowDimensions,
} from "react-native";
import { Icon, SPACING, TYPOGRAPHY } from "@edge/ui";
import { COLORS } from "@edge/ui";
import { styles } from "./RadioOperatorExamWizard.styles";
import { PHILIPPINE_REGIONS_WITH_OFFICES } from "../../../accreditation/customer-premises/data/mockRegionData";
import { Select } from "../../../../../shared/components/Select";
import { ValidatedInput } from "../../../../../shared/components/ValidatedInput";
import { SharedDocumentUpload } from "../../../../../shared/components/SharedDocumentUpload";
import { apiClient } from "@edge/api";
import { useAuth, useUser } from "@clerk/expo";

export interface ExamApplicantData {
  id: number;
  examType: "Radiotelegraphy" | "RROC-Aircraft" | "Amateur";
  examineeType: "First Taker" | "Repeater" | "Upgrader";
  selectedOption: string;
  lastName: string;
  firstName: string;
  middleName: string;
  suffix: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;
  sex: string;
  nationality: string;
  regionName: string;
  province: string;
  city: string;
  barangay: string;
  street: string;
  zipCode: string;
  schoolName: string;
  courseDegree: string;
  yearGraduated: string;
  specialOrderNo: string;
  email: string;
  contactNo: string;
  uploads: Record<string, string | { name: string; uri: string }>; // Maps requirement index/key to filename or file object
}

export const initialExamApplicant = (id: number): ExamApplicantData => ({
  id,
  examType: "Radiotelegraphy",
  examineeType: "First Taker",
  selectedOption: "1RTG - Elements 1, 2, 5, 6 & Code (25/20 wpm)",
  lastName: "",
  firstName: "",
  middleName: "",
  suffix: "",
  birthMonth: "January",
  birthDay: "1",
  birthYear: "2000",
  sex: "Male",
  nationality: "Filipino",
  regionName: "",
  province: "",
  city: "",
  barangay: "",
  street: "",
  zipCode: "",
  schoolName: "",
  courseDegree: "",
  yearGraduated: "",
  specialOrderNo: "",
  email: "",
  contactNo: "",
  uploads: {},
});

interface RadioOperatorExamWizardProps {
  onClose: () => void;
  onSuccess: () => void;
  isDetailsExpanded: boolean;
  onToggleExpand: () => void;
  step: number;
  setStep: (step: number | ((p: number) => number)) => void;
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
}

export function RadioOperatorExamWizard({
  onClose,
  onSuccess,
  isDetailsExpanded,
  onToggleExpand,
  step,
  setStep,
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
  applicants,
  setApplicants,
  currentApplicantIndex,
  setCurrentApplicantIndex,
  isBulkSubmitOpen,
  setIsBulkSubmitOpen,
}: RadioOperatorExamWizardProps) {
  const { width } = useWindowDimensions();
  const isWeb = width > 768;

  // Local UI and validation states
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<"BASIC" | "ADDRESS" | "EDUCATION" | "CONTACT">("BASIC");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Bulk Manual Submission Dialog States
  const [bulkCompanyName, setBulkCompanyName] = useState("");
  const [bulkEmail, setBulkEmail] = useState("");
  const [bulkPhone, setBulkPhone] = useState("");
  const [bulkErrors, setBulkErrors] = useState<Record<string, string>>({});
  const [bulkTouched, setBulkTouched] = useState<Record<string, boolean>>({});

  // Toast pill confirmation
  const [showToast, setShowToast] = useState(false);

  // Excel CSV Import preview state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Scroll ref for jump-links in Form Step
  const scrollViewRef = useRef<ScrollView | null>(null);
  const isManualScrolling = useRef(false);
  const sectionOffsets = useRef<Record<string, number>>({});

  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();
  // Toggle this constant to switch between live API integration and mock logic
  const USE_MOCKS = false;

  // Auto-fill first applicant with logged-in user details
  React.useEffect(() => {
    if (clerkUser && applicants.length === 1) {
      const firstApp = applicants[0];
      if (firstApp && firstApp.firstName === "" && firstApp.lastName === "" && firstApp.email === "") {
        const firstName = clerkUser.firstName || "";
        const lastName = clerkUser.lastName || "";
        const email = clerkUser.primaryEmailAddress?.emailAddress || "";
        const phone = clerkUser.primaryPhoneNumber?.phoneNumber || "";

        setApplicants(prev => prev.map((app, idx) => idx === 0 ? {
          ...app,
          firstName,
          lastName,
          email,
          contactNo: phone,
        } : app));
      }
    }
  }, [clerkUser, applicants, setApplicants]);

  const [tenants, setTenants] = useState<any[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);

  React.useEffect(() => {
    async function fetchTenants() {
      setLoadingTenants(true);
      try {
        const token = await getToken();
        const headers = token !== null ? { Authorization: `Bearer ${token}` } : {};
        const response = await apiClient.get('/api/v2/tenants', { headers });
        const data = response.data;
        setTenants(Array.isArray(data) ? data : (data.items || []));
      } catch (err) {
        console.error("Failed to fetch tenants from API:", err);
        setTenants([]);
      } finally {
        setLoadingTenants(false);
      }
    }
    fetchTenants();
  }, []);

  // Dynamic values mapped based on chosen region (which is now a tenant ID)
  const selectedTenant = tenants.find((t) => t.id === selectedRegionId);
  const activeRegionObj = selectedTenant 
    ? {
        id: selectedTenant.id,
        name: selectedTenant.name,
        offices: []
      }
    : undefined;

  const [offices, setOffices] = useState<any[]>([]);
  const [loadingOffices, setLoadingOffices] = useState(false);

  React.useEffect(() => {
    async function fetchOffices() {
      if (!selectedRegionId) {
        setOffices([]);
        return;
      }
      setLoadingOffices(true);
      try {
        const token = await getToken();
        const headers = token !== null ? { Authorization: `Bearer ${token}` } : {};
        const response = await apiClient.get(`/api/v2/tenants/${selectedRegionId}/field-offices`, { headers });
        const data = response.data;
        setOffices(Array.isArray(data) ? data : (data.items || []));
      } catch (err) {
        console.error("Failed to fetch offices from API:", err);
        setOffices([]);
      } finally {
        setLoadingOffices(false);
      }
    }
    fetchOffices();
  }, [selectedRegionId]);

  const officesList = offices;

  const [schedules, setSchedules] = useState<any[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  React.useEffect(() => {
    async function fetchSchedules() {
      if (!selectedRegionId) {
        setSchedules([]);
        return;
      }
      setLoadingSchedules(true);
      try {
        if (USE_MOCKS) {
          // Generate mock schedules using the chosen office name (or fallback)
          const officeObj = offices.find((o) => o.id === selectedOfficeId) || { name: "NTC Office" };
          const mockSchedules = [
            {
              id: "mock-sched-1",
              scheduledDate: "2026-08-07",
              startTime: "1:00 PM",
              endTime: "5:00 PM",
              venue: officeObj.name,
            },
            {
              id: "mock-sched-2",
              scheduledDate: "2026-08-14",
              startTime: "9:00 AM",
              endTime: "12:00 PM",
              venue: officeObj.name,
            },
          ];
          setSchedules(mockSchedules);
          return;
        }

        const token = await getToken();
        const headers = token !== null ? { Authorization: `Bearer ${token}` } : {};
        const response = await apiClient.get('/api/v2/schedules/client-view', {
          params: {
            serviceId: '',
            tenantId: selectedRegionId,
          },
          headers,
        });
        const data = response.data;
        setSchedules(Array.isArray(data) ? data : (data.items || []));
      } catch (err) {
        console.error("Failed to fetch schedules:", err);
        setSchedules([]);
      } finally {
        setLoadingSchedules(false);
      }
    }
    fetchSchedules();
  }, [selectedRegionId, selectedOfficeId, offices]);

  const getStepTitle = (): string => {
    switch (step) {
      case 1:
        return "Exam Schedule";
      case 2:
        return "Filing Data Configuration";
      case 3:
        return "Application Type & Requirements";
      case 4:
        return "Application Form";
      case 5:
        return "Upload Requirements";
      case 6:
        return "Review & Submit";
      case 7:
        return "Application Confirmed";
      default:
        return "Exam Filing Wizard";
    }
  };

  const getNextBtnText = (): string => {
    if (step === 5) return "Review";
    if (step === 6) {
      if (appMode === "BULK") {
        return "Confirm";
      }
      return "Submit";
    }
    return "Next";
  };

  const activeApplicant = applicants[currentApplicantIndex] || initialExamApplicant(1);

  const updateActiveApplicant = (fields: Partial<ExamApplicantData>) => {
    setApplicants((prev) =>
      prev.map((app, idx) => (idx === currentApplicantIndex ? { ...app, ...fields } : app))
    );
  };

  // Get dynamic options based on selected exam type
  const getExamOptions = (type: "Radiotelegraphy" | "RROC-Aircraft" | "Amateur"): string[] => {
    switch (type) {
      case "Radiotelegraphy":
        return [
          "1RTG - Elements 1, 2, 5, 6 & Code (25/20 wpm)",
          "1RTG - For removal, Code (25/20 wpm)",
          "1RTG - For upgrade (2RTG Holder) & Code (25/20 wpm)",
          "2RTG - Elements 1, 2, 5, 6 & Code (16 wpm)",
          "2RTG - For removal, Code (16 wpm)",
          "2RTG - For upgrade (3RTG Holder), Element 6",
        ];
      case "RROC-Aircraft":
        return [
          "RROC - Commercial Pilot (Elements 1, 2, 3)",
          "RROC - Student Pilot (Elements 1, 2)",
        ];
      case "Amateur":
        return [
          "Class A - Elements 8, 9, 10 & Code",
          "Class B - Elements 5, 6, 7",
          "Class C - Elements 2, 3, 4",
          "Class D - Element 2",
        ];
    }
  };

  const getRequirementsList = (
    type: "Radiotelegraphy" | "RROC-Aircraft" | "Amateur",
    examineeType: "First Taker" | "Repeater" | "Upgrader"
  ): string[] => {
    const list = [
      "PSA Birth Certificate or Valid Passport / Government ID",
      "Transcript of Records or Diploma with Special Order (SO) Number",
      "Three (3) clear 1x1 ID pictures taken within the last six (6) months",
    ];
    if (examineeType === "Upgrader") {
      list.push("Copy of prior Radio Operator Certificate (ROC) / License");
    }
    return list;
  };

  // Document picker trigger
  const handleDocumentPick = (slotKey: string, file: { name: string; uri: string }) => {
    const nextUploads = { ...activeApplicant.uploads };
    nextUploads[slotKey] = file;
    updateActiveApplicant({ uploads: nextUploads });
  };

  const handleMockCSVUpload = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
      });
      if (res.canceled === false && res.assets && res.assets.length > 0) {
        setIsPreviewModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      setIsPreviewModalOpen(true);
    }
  };

  const handleConfirmCSVImport = () => {
    setIsFileUploaded(true);
    setUploadedFileName("NTC_Bulk_Template.csv");
    setApplicants([
      {
        ...initialExamApplicant(1),
        examType: "Amateur",
        examineeType: "First Taker",
        selectedOption: "Class A - Elements 8, 9, 10 & Code",
        lastName: "Doe",
        firstName: "John",
        middleName: "Smith",
        suffix: "Jr.",
        birthMonth: "January",
        birthDay: "1",
        birthYear: "1990",
        sex: "Male",
        nationality: "Filipino",
        regionName: "National Capital Region (NCR)",
        province: "Metro Manila",
        city: "Quezon City",
        barangay: "Barangay 1",
        street: "Main Street",
        zipCode: "1100",
        schoolName: "University of the Philippines",
        courseDegree: "BS Computer Science",
        yearGraduated: "2012",
        contactNo: "09123456789",
        email: "john.doe@example.com",
      },
      {
        ...initialExamApplicant(2),
        examType: "Amateur",
        examineeType: "First Taker",
        selectedOption: "Class B - Elements 5, 6, 7",
        lastName: "Reyes",
        firstName: "Maria",
        middleName: "Santos",
        suffix: "",
        birthMonth: "May",
        birthDay: "15",
        birthYear: "1992",
        sex: "Female",
        nationality: "Filipino",
        regionName: "National Capital Region (NCR)",
        province: "Metro Manila",
        city: "Makati City",
        barangay: "Barangay 2",
        street: "Second Street",
        zipCode: "1200",
        schoolName: "Ateneo de Manila University",
        courseDegree: "BS Management",
        yearGraduated: "2014",
        contactNo: "09198765432",
        email: "maria.reyes@example.com",
      },
      {
        ...initialExamApplicant(3),
        examType: "Amateur",
        examineeType: "First Taker",
        selectedOption: "Class C - Elements 2, 3, 4",
        lastName: "Cruz",
        firstName: "Juan",
        middleName: "Dela",
        suffix: "",
        birthMonth: "October",
        birthDay: "20",
        birthYear: "1988",
        sex: "Male",
        nationality: "Filipino",
        regionName: "National Capital Region (NCR)",
        province: "Metro Manila",
        city: "Pasig City",
        barangay: "Barangay 3",
        street: "Third Street",
        zipCode: "1600",
        schoolName: "De La Salle University",
        courseDegree: "BS Engineering",
        yearGraduated: "2010",
        contactNo: "09176543210",
        email: "juan.cruz@example.com",
      },
    ]);
    setCurrentApplicantIndex(0);
    setIsPreviewModalOpen(false);
    setStep(5);
  };

  const validateForm = (app: ExamApplicantData): boolean => {
    const newErrors: Record<string, string> = {};

    if (!app.lastName) newErrors.lastName = "Last name is required.";
    if (!app.firstName) newErrors.firstName = "First name is required.";
    if (!app.province) newErrors.province = "Province is required.";
    if (!app.city) newErrors.city = "City is required.";
    if (!app.barangay) newErrors.barangay = "Barangay is required.";
    if (!app.street) newErrors.street = "Street is required.";
    if (!app.zipCode) {
      newErrors.zipCode = "Zip Code is required.";
    } else if (!/^\d{4}$/.test(app.zipCode)) {
      newErrors.zipCode = "Zip Code must be a 4-digit number.";
    }

    if (!app.schoolName) newErrors.schoolName = "School name is required.";
    if (!app.courseDegree) newErrors.courseDegree = "Course/Degree is required.";
    if (!app.yearGraduated) {
      newErrors.yearGraduated = "Graduation year is required.";
    } else if (!/^\d{4}$/.test(app.yearGraduated)) {
      newErrors.yearGraduated = "Must be a valid 4-digit year.";
    }

    if (!app.email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(app.email)) {
      newErrors.email = "Invalid email format.";
    }

    if (!app.contactNo) {
      newErrors.contactNo = "Contact number is required.";
    } else if (!/^(09|\+639)\d{9}$/.test(app.contactNo) && !/^\d{10,11}$/.test(app.contactNo)) {
      newErrors.contactNo = "Invalid contact number format.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: keyof ExamApplicantData, value: string) => {
    updateActiveApplicant({ [field]: value });
    setTouched((prev) => ({ ...prev, [field]: true }));

    const newErrors = { ...errors };
    if (field === "lastName" && !value) {
      newErrors.lastName = "Last name is required.";
    } else if (field === "lastName") {
      delete newErrors.lastName;
    }

    if (field === "firstName" && !value) {
      newErrors.firstName = "First name is required.";
    } else if (field === "firstName") {
      delete newErrors.firstName;
    }

    if (field === "province" && !value) {
      newErrors.province = "Province is required.";
    } else if (field === "province") {
      delete newErrors.province;
    }

    if (field === "city" && !value) {
      newErrors.city = "City is required.";
    } else if (field === "city") {
      delete newErrors.city;
    }

    if (field === "barangay" && !value) {
      newErrors.barangay = "Barangay is required.";
    } else if (field === "barangay") {
      delete newErrors.barangay;
    }

    if (field === "street" && !value) {
      newErrors.street = "Street is required.";
    } else if (field === "street") {
      delete newErrors.street;
    }

    if (field === "zipCode") {
      if (!value) {
        newErrors.zipCode = "Zip Code is required.";
      } else if (!/^\d{4}$/.test(value)) {
        newErrors.zipCode = "Zip Code must be a 4-digit number.";
      } else {
        delete newErrors.zipCode;
      }
    }

    if (field === "schoolName" && !value) {
      newErrors.schoolName = "School name is required.";
    } else if (field === "schoolName") {
      delete newErrors.schoolName;
    }

    if (field === "courseDegree" && !value) {
      newErrors.courseDegree = "Course/Degree is required.";
    } else if (field === "courseDegree") {
      delete newErrors.courseDegree;
    }

    if (field === "yearGraduated") {
      if (!value) {
        newErrors.yearGraduated = "Graduation year is required.";
      } else if (!/^\d{4}$/.test(value)) {
        newErrors.yearGraduated = "Must be a valid 4-digit year.";
      } else {
        delete newErrors.yearGraduated;
      }
    }

    if (field === "email") {
      if (!value) {
        newErrors.email = "Email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = "Invalid email format.";
      } else {
        delete newErrors.email;
      }
    }

    if (field === "contactNo") {
      if (!value) {
        newErrors.contactNo = "Contact number is required.";
      } else if (!/^(09|\+639)\d{9}$/.test(value) && !/^\d{10,11}$/.test(value)) {
        newErrors.contactNo = "Invalid contact number format.";
      } else {
        delete newErrors.contactNo;
      }
    }

    setErrors(newErrors);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!selectedRegionId || !selectedOfficeId) {
        Alert.alert("Error", "Please select region and office.");
        return;
      }
      if (!appMode) {
        Alert.alert("Error", "Please select an application mode.");
        return;
      }
      if (appMode === "SINGLE") {
        if (!selectedScheduleId) {
          Alert.alert("Error", "Please select an exam schedule date.");
          return;
        }
        setStep(3);
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      if (bulkMethod === "EXCEL") {
        if (!isFileUploaded) {
          Alert.alert("Error", "Please upload the CSV/Excel template file.");
          return;
        }
        setStep(6);
      } else {
        setStep(3);
      }
    } else if (step === 3) {
      if (!activeApplicant.selectedOption) {
        Alert.alert("Error", "Please select a certificate/element option.");
        return;
      }
      setStep(4);
    } else if (step === 4) {
      const isValid = validateForm(activeApplicant);
      if (!isValid) {
        const fields = [
          "lastName", "firstName", "province", "city", "barangay",
          "street", "zipCode", "schoolName", "courseDegree", "yearGraduated", "email", "contactNo"
        ];
        const nextTouched: Record<string, boolean> = {};
        fields.forEach((f) => (nextTouched[f] = true));
        setTouched(nextTouched);
        Alert.alert("Validation Error", "Please fill in all required fields marked with *.");
        return;
      }
      setStep(5);
    } else if (step === 5) {
      const reqs = getRequirementsList(activeApplicant.examType, activeApplicant.examineeType);
      const allUploaded = reqs.every((_, idx) => activeApplicant.uploads[idx.toString()]);
      if (!allUploaded) {
        Alert.alert("Error", "Please upload all mandatory supporting documents.");
        return;
      }
      setStep(6);
    } else if (step === 6) {
      setIsConfirmModalOpen(true);
    } else if (step === 7) {
      handleAddAnotherApplicant();
    }
  };

  const handleConfirmApplicantInBulk = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);

    if (currentApplicantIndex < applicants.length - 1) {
      const nextIdx = currentApplicantIndex + 1;
      setCurrentApplicantIndex(nextIdx);
      if (bulkMethod === "EXCEL") {
        setStep(5);
      } else {
        setStep(3);
      }
    } else {
      setStep(7);
    }
  };

  const handleAddAnotherApplicant = () => {
    const nextId = applicants.length + 1;
    const newApp = initialExamApplicant(nextId);
    setApplicants((prev) => [...prev, newApp]);
    setCurrentApplicantIndex(applicants.length);
    setStep(3);
  };

  const handleBack = () => {
    if (step === 1) {
      onClose();
    } else if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      if (appMode === "SINGLE") {
        setStep(1);
      } else {
        setStep(2);
      }
    } else if (step === 4) {
      setStep(3);
    } else if (step === 5) {
      setStep(4);
    } else if (step === 6) {
      if (appMode === "BULK" && bulkMethod === "EXCEL") {
        setStep(2);
      } else {
        setStep(5);
      }
    } else if (step === 7) {
      setStep(6);
    }
  };

  const handleScrollToSection = (tab: "BASIC" | "ADDRESS" | "EDUCATION" | "CONTACT") => {
    setActiveFormTab(tab);
    isManualScrolling.current = true;
    const offset = sectionOffsets.current[tab];
    if (offset !== undefined && scrollViewRef.current !== null) {
      scrollViewRef.current.scrollTo({ y: offset, animated: true });
    }
    setTimeout(() => {
      isManualScrolling.current = false;
    }, 600);
  };

  const handleScroll = (event: any) => {
    if (isManualScrolling.current) return;
    const scrollY = event.nativeEvent.contentOffset.y;

    const basicOffset = sectionOffsets.current["BASIC"] || 0;
    const addressOffset = sectionOffsets.current["ADDRESS"] || 0;
    const educationOffset = sectionOffsets.current["EDUCATION"] || 0;
    const contactOffset = sectionOffsets.current["CONTACT"] || 0;

    let active: "BASIC" | "ADDRESS" | "EDUCATION" | "CONTACT" = "BASIC";
    if (scrollY >= contactOffset - 120) {
      active = "CONTACT";
    } else if (scrollY >= educationOffset - 120) {
      active = "EDUCATION";
    } else if (scrollY >= addressOffset - 120) {
      active = "ADDRESS";
    } else {
      active = "BASIC";
    }

    if (activeFormTab !== active) {
      setActiveFormTab(active);
    }
  };

  const handleSaveAndAddAnother = () => {
    const fullName = `${activeApplicant.firstName} ${activeApplicant.lastName}`.trim();
    if (!fullName) {
      Alert.alert("Error", "Please input applicant name before adding another.");
      return;
    }
    const nextId = applicants.length + 1;
    setApplicants((prev) => [...prev, initialExamApplicant(nextId)]);
    setCurrentApplicantIndex(applicants.length);
    setStep(3);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const validateBulkSubmit = (): boolean => {
    const errs: Record<string, string> = {};
    if (!bulkCompanyName) errs.companyName = "Company Name is required.";
    if (!bulkEmail) {
      errs.email = "Email Address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bulkEmail)) {
      errs.email = "Invalid email format.";
    }
    if (!bulkPhone) {
      errs.phone = "Phone Number is required.";
    } else if (!/^(09|\+639)\d{9}$/.test(bulkPhone) && !/^\d{10,11}$/.test(bulkPhone)) {
      errs.phone = "Invalid phone format.";
    }
    setBulkErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBulkSubmitChange = (field: "companyName" | "email" | "phone", value: string) => {
    if (field === "companyName") setBulkCompanyName(value);
    if (field === "email") setBulkEmail(value);
    if (field === "phone") setBulkPhone(value);

    setBulkTouched((prev) => ({ ...prev, [field]: true }));
    const errs = { ...bulkErrors };

    if (field === "companyName" && !value) {
      errs.companyName = "Company Name is required.";
    } else if (field === "companyName") {
      delete errs.companyName;
    }

    if (field === "email") {
      if (!value) {
        errs.email = "Email Address is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errs.email = "Invalid email format.";
      } else {
        delete errs.email;
      }
    }

    if (field === "phone") {
      if (!value) {
        errs.phone = "Phone Number is required.";
      } else if (!/^(09|\+639)\d{9}$/.test(value) && !/^\d{10,11}$/.test(value)) {
        errs.phone = "Invalid phone format.";
      } else {
        delete errs.phone;
      }
    }
    setBulkErrors(errs);
  };

  const submitApplicationPayload = async () => {
    const months: Record<string, string> = {
      January: "01", February: "02", March: "03", April: "04", May: "05", June: "06",
      July: "07", August: "08", September: "09", October: "10", November: "11", December: "12"
    };

    const mappedApplicants = applicants.map((app) => {
      const monthNum = months[app.birthMonth] || "01";
      const day = app.birthDay.padStart(2, '0');
      // Format: MM/DD/YYYY
      const birthDate = `${monthNum}/${day}/${app.birthYear}`;

      let examCat = "radio";
      if (app.examType === "RROC-Aircraft") examCat = "rroc";
      if (app.examType === "Amateur") examCat = "amateur";

      let examTaker = "first taker";
      if (app.examineeType === "Repeater") examTaker = "retaker";
      if (app.examineeType === "Upgrader") examTaker = "upgrade";

      const address = `${app.street}, ${app.barangay}, ${app.city}, ${app.province}, ${app.zipCode}`;

      const formFieldValues = [
        { fieldId: "f0100000-0000-0000-0000-000000000001", value: examCat },
        { fieldId: "f0100000-0000-0000-0000-000000000002", value: examTaker },
      ];

      return {
        firstName: app.firstName,
        lastName: app.lastName,
        email: app.email,
        contactNumber: app.contactNo,
        address: address,
        birthDate: birthDate,
        formFieldValues,
      };
    });

    const payload = {
      tenantId: selectedRegionId,
      submissionMode: appMode === "SINGLE" ? "Single" : "Bulk",
      serviceId: "f0100000-0000-0000-0000-000000000021",
      scheduleId: selectedScheduleId,
      fieldOfficeId: selectedOfficeId,
      applicants: mappedApplicants,
    };

    const token = await getToken();
    const headers = token !== null ? { Authorization: `Bearer ${token}` } : {};

    await apiClient.post(`/api/v2/tenants/${selectedRegionId}/applications`, payload, { headers });
  };

  const handleBulkFinalSubmit = async () => {
    const isValid = validateBulkSubmit();
    if (!isValid) {
      setBulkTouched({ companyName: true, email: true, phone: true });
      return;
    }
    setIsSubmitting(true);
    try {
      await submitApplicationPayload();
      setIsBulkSubmitOpen(false);
      onSuccess();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to submit applications.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgressIndicator = () => {
    const list: React.ReactNode[] = [];
    const activeSteps = appMode === "SINGLE" ? [1, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6];
    activeSteps.forEach((s) => {
      list.push(
        <View
          key={s}
          style={[
            styles.progressDash,
            step === s && styles.progressDashActive,
            step > s && { backgroundColor: COLORS.brand[500] },
          ]}
        />
      );
    });
    return <View style={styles.progressContainer}>{list}</View>;
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitApplicationPayload();
      setIsConfirmModalOpen(false);
      onSuccess();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to submit application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isNextDisabled = (): boolean => {
    if (step === 1) {
      return !selectedRegionId || !selectedOfficeId;
    }
    if (step === 2 && bulkMethod === "EXCEL") {
      return !isFileUploaded;
    }
    return false;
  };

  const renderReviewRow = (label: string, value: string) => (
    <View style={{ flexDirection: "row", paddingVertical: 8, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" }}>
      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[500], width: "30%", minWidth: 120 }}>
        {label}
      </Text>
      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[800], fontWeight: "600", flex: 1 }}>
        {value || "—"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Panel */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onToggleExpand}>
            <Icon name={isDetailsExpanded ? "minimize" : "maximize"} size={16} color={COLORS.brand[700]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>[{getStepTitle()}]</Text>
        </View>
        {step < 7 && renderProgressIndicator()}
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {/* STEP 1: Exam Schedule */}
        {step === 1 && (
          <View>
            <Text style={styles.stepSubtitle}>Select from which region you intend to apply:</Text>

            <Text style={styles.selectLabel}>Region</Text>
            <Select
              placeholder={loadingTenants ? "Loading Regions..." : "Region"}
              value={selectedRegionId}
              onValueChange={(val) => {
                setSelectedRegionId(val);
                setSelectedOfficeId("");
              }}
              options={tenants.map((t) => ({
                label: t.name,
                value: t.id,
              }))}
            />

            <Text style={styles.selectLabel}>Select Office:</Text>
            <Select
              placeholder={loadingOffices ? "Loading Offices..." : "Offices*"}
              value={selectedOfficeId}
              onValueChange={setSelectedOfficeId}
              options={officesList.map((o) => ({
                label: o.name,
                value: o.id,
              }))}
            />
            <Text style={styles.selectLabel}>Select how you would like to process your application:</Text>
            <Select
              placeholder="Application Mode"
              value={appMode}
              onValueChange={(val) => {
                setAppMode(val as "SINGLE" | "BULK");
              }}
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

            {/* Scheduled Dates Container */}
            <Text style={styles.scheduleTitle}>Scheduled Dates</Text>
            {loadingSchedules ? (
              <Text style={{ marginVertical: 10, color: COLORS.neutral[500] }}>Loading schedules...</Text>
            ) : schedules.length === 0 ? (
              <Text style={{ marginVertical: 10, color: COLORS.neutral[500] }}>No schedules available for the selected region.</Text>
            ) : (
              schedules.map((sched: any, index: number) => {
                const isSelected = selectedScheduleId === sched.id;
                const d = new Date(sched.scheduledDate);
                const dateStr = !isNaN(d.getTime()) 
                  ? d.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })
                  : sched.scheduledDate;
                
                return (
                  <TouchableOpacity
                    key={sched.id || index}
                    onPress={() => {
                      setSelectedScheduleId(sched.id);
                    }}
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
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* STEP 2: Filing Data Configuration (Bulk Only) */}
        {step === 2 && (
          <View>
            <Text style={styles.stepSubtitle}>SELECT YOUR BULK DATA ENTRY METHOD</Text>
            <Text style={[styles.infoDesc, { marginBottom: SPACING[16] }]}>
              Choose between manually entering profiles or importing a complete CSV spreadsheet.
            </Text>

            <View style={styles.cardsRow}>
              {/* Option A: Manual */}
              <TouchableOpacity
                onPress={() => {
                  setBulkMethod("MANUAL");
                }}
                style={[
                  styles.configCard,
                  bulkMethod === "MANUAL" && styles.configCardActive,
                ]}
              >
                <View style={[styles.badgeCircle, bulkMethod === "MANUAL" && styles.badgeCircleActive]}>
                  <Text style={[styles.badgeText, bulkMethod === "MANUAL" && styles.badgeTextActive]}>A</Text>
                </View>
                <Text style={styles.cardTitle}>MANUAL ENCODING BOARD</Text>
                <Text style={styles.cardDesc}>
                  Input each applicant's personal details, examinee categories, and radio class options directly within the NTC portal form.
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setBulkMethod("MANUAL");
                  }}
                  style={[styles.cardBtn, bulkMethod === "MANUAL" && styles.cardBtnActive]}
                >
                  <Text style={[styles.cardBtnText, bulkMethod === "MANUAL" && styles.cardBtnTextActive]}>
                    {bulkMethod === "MANUAL" ? "ACTIVE" : "SELECT MANUAL"}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>

              {/* Option B: Excel/CSV */}
              <TouchableOpacity
                onPress={() => {
                  setBulkMethod("EXCEL");
                }}
                style={[
                  styles.configCard,
                  bulkMethod === "EXCEL" && styles.configCardActive,
                ]}
              >
                <View style={[styles.badgeCircle, bulkMethod === "EXCEL" && styles.badgeCircleActive]}>
                  <Text style={[styles.badgeText, bulkMethod === "EXCEL" && styles.badgeTextActive]}>B</Text>
                </View>
                <Text style={styles.cardTitle}>EXCEL / CSV + INDIVIDUAL UPLOAD</Text>
                <Text style={styles.cardDesc}>
                  Download a pre-structured spreadsheet template. Once filled, import the file to automatically set up applicant entries.
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setBulkMethod("EXCEL");
                  }}
                  style={[styles.cardBtn, bulkMethod === "EXCEL" && styles.cardBtnActive]}
                >
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
                      <Text style={styles.tableCellHeader}>... 12 more columns</Text>
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
                    onPress={() => Alert.alert("Download Complete", "Radio_Operator_Template.csv downloaded successfully.")}
                    style={styles.downloadBtn}
                  >
                    <Icon name="download" size={16} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.downloadBtnText}>Download Template Spreadsheet (.csv)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleMockCSVUpload} style={styles.uploadBtn}>
                    <Icon name="upload" size={16} color={COLORS.neutral[700]} style={{ marginRight: 8 }} />
                    <Text style={styles.uploadBtnText}>
                      {isFileUploaded ? "Uploaded ✔" : "Upload Filled Excel/CSV"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* STEP 3: Application Type & Options Selection */}
        {step === 3 && (
          <View>
            <Text style={styles.stepSubtitle}>Specify your application concern and view the required documents:</Text>

            <Text style={styles.selectLabel}>Application type</Text>
            <Select
              placeholder="Select Application type"
              value={activeApplicant.examType}
              onValueChange={(val) => {
                const nextType = val as "Radiotelegraphy" | "RROC-Aircraft" | "Amateur";
                const defaultOption = getExamOptions(nextType)[0] || "";
                updateActiveApplicant({
                  examType: nextType,
                  selectedOption: defaultOption,
                });
              }}
              options={[
                { label: "Radiotelegraphy", value: "Radiotelegraphy" },
                { label: "RROC - Aircraft", value: "RROC-Aircraft" },
                { label: "Amateur", value: "Amateur" },
              ]}
            />

            <Text style={styles.selectLabel}>Examinee type</Text>
            <Select
              placeholder="Select Examinee type"
              value={activeApplicant.examineeType}
              onValueChange={(val) => updateActiveApplicant({ examineeType: val as any })}
              options={[
                { label: "First Taker", value: "First Taker" },
                { label: "Repeater", value: "Repeater" },
                { label: "Upgrader", value: "Upgrader" },
              ]}
            />

            {/* Radio Options List */}
            <View style={styles.radioGroup}>
              {getExamOptions(activeApplicant.examType).map((opt) => {
                const isSelected = activeApplicant.selectedOption === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => updateActiveApplicant({ selectedOption: opt })}
                    style={[styles.radioOption, isSelected && styles.radioOptionSelected]}
                  >
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioCircleInner} />}
                    </View>
                    <Text style={[styles.radioText, isSelected && styles.radioTextSelected]}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Requirements Box */}
            <View style={styles.reqBox}>
              <Text style={styles.reqTitle}>Requirements</Text>
              {getRequirementsList(activeApplicant.examType, activeApplicant.examineeType).map((req, idx) => (
                <Text key={idx} style={styles.reqItem}>
                  {idx + 1}. {req}*
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* STEP 4: Application Form with Tabs */}
        {step === 4 && (
          <View>
            <View style={styles.formHeaderTabs}>
              <TouchableOpacity
                onPress={() => handleScrollToSection("BASIC")}
                style={[styles.formTab, activeFormTab === "BASIC" && styles.formTabActive]}
              >
                <Text style={[styles.formTabText, activeFormTab === "BASIC" && styles.formTabTextActive]}>Basic Info</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleScrollToSection("ADDRESS")}
                style={[styles.formTab, activeFormTab === "ADDRESS" && styles.formTabActive]}
              >
                <Text style={[styles.formTabText, activeFormTab === "ADDRESS" && styles.formTabTextActive]}>Address</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleScrollToSection("EDUCATION")}
                style={[styles.formTab, activeFormTab === "EDUCATION" && styles.formTabActive]}
              >
                <Text style={[styles.formTabText, activeFormTab === "EDUCATION" && styles.formTabTextActive]}>Education</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleScrollToSection("CONTACT")}
                style={[styles.formTab, activeFormTab === "CONTACT" && styles.formTabActive]}
              >
                <Text style={[styles.formTabText, activeFormTab === "CONTACT" && styles.formTabTextActive]}>Contact</Text>
              </TouchableOpacity>
            </View>

            {/* Render fields sequentially with layout tracking */}
            <View
              onLayout={(event) => {
                sectionOffsets.current["BASIC"] = event.nativeEvent.layout.y;
              }}
              style={styles.formSection}
            >
              <Text style={styles.formSectionHeading}>Basic Info</Text>
              <ValidatedInput
                label="Last Name"
                placeholder="Last Name"
                value={activeApplicant.lastName}
                onChangeText={(val) => handleFieldChange("lastName", val)}
                error={errors.lastName}
                touched={touched.lastName}
                required
              />
              <ValidatedInput
                label="First Name"
                placeholder="First Name"
                value={activeApplicant.firstName}
                onChangeText={(val) => handleFieldChange("firstName", val)}
                error={errors.firstName}
                touched={touched.firstName}
                required
              />
              <ValidatedInput
                label="Middle Name"
                placeholder="Middle Name"
                value={activeApplicant.middleName}
                onChangeText={(val) => updateActiveApplicant({ middleName: val })}
              />
              <ValidatedInput
                label="Suffix"
                placeholder="Suffix (e.g. Jr., III)"
                value={activeApplicant.suffix}
                onChangeText={(val) => updateActiveApplicant({ suffix: val })}
              />

              <Text style={styles.selectLabel}>Date of Birth</Text>
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
                <View style={{ flex: 2 }}>
                  <Select
                    value={activeApplicant.birthMonth}
                    onValueChange={(val) => updateActiveApplicant({ birthMonth: val })}
                    options={[
                      { label: "January", value: "January" },
                      { label: "February", value: "February" },
                      { label: "March", value: "March" },
                      { label: "April", value: "April" },
                      { label: "May", value: "May" },
                      { label: "June", value: "June" },
                      { label: "July", value: "July" },
                      { label: "August", value: "August" },
                      { label: "September", value: "September" },
                      { label: "October", value: "October" },
                      { label: "November", value: "November" },
                      { label: "December", value: "December" },
                    ]}
                  />
                </View>
                <View style={{ flex: 1.2 }}>
                  <Select
                    value={activeApplicant.birthDay}
                    onValueChange={(val) => updateActiveApplicant({ birthDay: val })}
                    options={Array.from({ length: 31 }, (_, i) => ({
                      label: String(i + 1),
                      value: String(i + 1),
                    }))}
                  />
                </View>
                <View style={{ flex: 1.5 }}>
                  <Select
                    value={activeApplicant.birthYear}
                    onValueChange={(val) => updateActiveApplicant({ birthYear: val })}
                    options={Array.from({ length: 80 }, (_, i) => ({
                      label: String(2026 - i),
                      value: String(2026 - i),
                    }))}
                  />
                </View>
              </View>

              <Text style={styles.selectLabel}>Sex*</Text>
              <Select
                value={activeApplicant.sex}
                onValueChange={(val) => updateActiveApplicant({ sex: val })}
                options={[
                  { label: "Male", value: "Male" },
                  { label: "Female", value: "Female" },
                ]}
              />

              <Text style={styles.selectLabel}>Nationality*</Text>
              <Select
                value={activeApplicant.nationality}
                onValueChange={(val) => updateActiveApplicant({ nationality: val })}
                options={[
                  { label: "Filipino", value: "Filipino" },
                  { label: "Others", value: "Others" },
                ]}
              />
            </View>

            <View
              onLayout={(event) => {
                sectionOffsets.current["ADDRESS"] = event.nativeEvent.layout.y;
              }}
              style={styles.formSection}
            >
              <Text style={styles.formSectionHeading}>Address</Text>
              <Text style={styles.selectLabel}>Region*</Text>
              <Select
                value={activeApplicant.regionName}
                onValueChange={(val) => updateActiveApplicant({ regionName: val })}
                options={PHILIPPINE_REGIONS_WITH_OFFICES.map((r) => ({
                  label: r.name,
                  value: r.name,
                }))}
              />
              <ValidatedInput
                label="Province"
                placeholder="Province"
                value={activeApplicant.province}
                onChangeText={(val) => handleFieldChange("province", val)}
                error={errors.province}
                touched={touched.province}
                required
              />
              <ValidatedInput
                label="City"
                placeholder="City"
                value={activeApplicant.city}
                onChangeText={(val) => handleFieldChange("city", val)}
                error={errors.city}
                touched={touched.city}
                required
              />
              <ValidatedInput
                label="Barangay"
                placeholder="Barangay"
                value={activeApplicant.barangay}
                onChangeText={(val) => handleFieldChange("barangay", val)}
                error={errors.barangay}
                touched={touched.barangay}
                required
              />
              <ValidatedInput
                label="Street"
                placeholder="Street Address"
                value={activeApplicant.street}
                onChangeText={(val) => handleFieldChange("street", val)}
                error={errors.street}
                touched={touched.street}
                required
              />
              <ValidatedInput
                label="Zip Code"
                placeholder="Zip Code"
                value={activeApplicant.zipCode}
                onChangeText={(val) => handleFieldChange("zipCode", val)}
                error={errors.zipCode}
                touched={touched.zipCode}
                required
              />
            </View>

            <View
              onLayout={(event) => {
                sectionOffsets.current["EDUCATION"] = event.nativeEvent.layout.y;
              }}
              style={styles.formSection}
            >
              <Text style={styles.formSectionHeading}>Education</Text>
              <ValidatedInput
                label="School Name"
                placeholder="School / University Name"
                value={activeApplicant.schoolName}
                onChangeText={(val) => handleFieldChange("schoolName", val)}
                error={errors.schoolName}
                touched={touched.schoolName}
                required
              />
              <ValidatedInput
                label="Course / Degree"
                placeholder="Course / Degree"
                value={activeApplicant.courseDegree}
                onChangeText={(val) => handleFieldChange("courseDegree", val)}
                error={errors.courseDegree}
                touched={touched.courseDegree}
                required
              />
              <ValidatedInput
                label="Year Graduated"
                placeholder="YYYY"
                value={activeApplicant.yearGraduated}
                onChangeText={(val) => handleFieldChange("yearGraduated", val)}
                error={errors.yearGraduated}
                touched={touched.yearGraduated}
                required
              />
              <ValidatedInput
                label="Special Order (SO) Number"
                placeholder="SO Number (if applicable)"
                value={activeApplicant.specialOrderNo}
                onChangeText={(val) => updateActiveApplicant({ specialOrderNo: val })}
              />
            </View>

            <View
              onLayout={(event) => {
                sectionOffsets.current["CONTACT"] = event.nativeEvent.layout.y;
              }}
              style={styles.formSection}
            >
              <Text style={styles.formSectionHeading}>Contact Details</Text>
              <ValidatedInput
                label="Email Address"
                placeholder="email@example.com"
                value={activeApplicant.email}
                onChangeText={(val) => handleFieldChange("email", val)}
                error={errors.email}
                touched={touched.email}
                required
              />
              <ValidatedInput
                label="Contact Number"
                placeholder="09XXXXXXXXX"
                value={activeApplicant.contactNo}
                onChangeText={(val) => handleFieldChange("contactNo", val)}
                error={errors.contactNo}
                touched={touched.contactNo}
                required
              />
            </View>
          </View>
        )}

        {/* STEP 5: Upload Requirements */}
        {step === 5 && (
          <SharedDocumentUpload
            requirements={getRequirementsList(activeApplicant.examType, activeApplicant.examineeType).map((req, idx) => ({
              key: idx.toString(),
              label: req,
              required: true,
            }))}
            uploads={activeApplicant.uploads}
            onUpload={handleDocumentPick}
            onRemove={(key) => {
              const nextUploads = { ...activeApplicant.uploads };
              delete nextUploads[key];
              updateActiveApplicant({ uploads: nextUploads });
            }}
            isWeb={isWeb}
          />
        )}

        {/* STEP 6: Review & Submit */}
        {step === 6 && (
          <View>
            <Text style={styles.stepSubtitle}>Review your application details before final submission:</Text>

            <View style={{ backgroundColor: COLORS.neutral.white, borderWidth: 1, borderColor: COLORS.neutral[200], borderRadius: 12, overflow: "hidden" }}>
              <View style={{ backgroundColor: "#f1f5f9", paddingVertical: 6, paddingHorizontal: 12 }}>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: COLORS.neutral[600] }}>
                  EXAMINATION PATHWAYS
                </Text>
              </View>
              {renderReviewRow("Region", selectedRegionId)}
              {renderReviewRow("Application Mode", appMode)}
              {renderReviewRow("NTC Office", selectedOfficeId)}

              <View style={{ backgroundColor: "#f1f5f9", paddingVertical: 6, paddingHorizontal: 12, marginTop: 12 }}>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: COLORS.neutral[600] }}>
                  APPLICANT DETAILS (First Applicant / Upload List)
                </Text>
              </View>
              {renderReviewRow("Name", `${activeApplicant.firstName} ${activeApplicant.middleName} ${activeApplicant.lastName}`)}
              {renderReviewRow("Sex", activeApplicant.sex)}
              {renderReviewRow("Nationality", activeApplicant.nationality)}
              {renderReviewRow("Exam Type", activeApplicant.examType)}
              {renderReviewRow("Class Option", activeApplicant.selectedOption)}
              {renderReviewRow("Examinee Type", activeApplicant.examineeType)}
              {renderReviewRow("School", activeApplicant.schoolName)}
              {renderReviewRow("Course", activeApplicant.courseDegree)}
              {renderReviewRow("Email", activeApplicant.email)}
              {renderReviewRow("Contact No", activeApplicant.contactNo)}

              <View style={{ backgroundColor: "#f1f5f9", paddingVertical: 6, paddingHorizontal: 12, marginTop: 12 }}>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: COLORS.neutral[600] }}>
                  UPLOADED DOCUMENTS
                </Text>
              </View>
              {Object.keys(activeApplicant.uploads).map((key) => (
                <View key={key} style={{ flexDirection: "row", paddingVertical: 6, paddingHorizontal: 12 }}>
                  <Icon name="file" size={14} color={COLORS.semantic.success} style={{ marginRight: 6 }} />
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12.5, color: COLORS.neutral[700] }}>
                    {typeof activeApplicant.uploads[key] === "string" ? activeApplicant.uploads[key] : activeApplicant.uploads[key]?.name || ""}
                  </Text>
                </View>
              ))}
            </View>

            {/* Terms and Conditions */}
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 24, gap: 10 }}>
              <TouchableOpacity
                onPress={() => setIsAgreedToTerms((prev) => !prev)}
                style={{
                  width: 20,
                  height: 20,
                  borderWidth: 2,
                  borderColor: isAgreedToTerms ? COLORS.brand[600] : COLORS.neutral[300],
                  borderRadius: 4,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: isAgreedToTerms ? COLORS.brand[600] : COLORS.neutral.white,
                }}
              >
                {isAgreedToTerms && <Icon name="check" size={14} color="#ffffff" />}
              </TouchableOpacity>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], flex: 1 }}>
                I hereby certify that all information supplied here is true, complete, and correct to the best of my knowledge.
              </Text>
            </View>
          </View>
        )}

        {/* STEP 7: Application Confirmed & Add Another Applicant Prompt */}
        {step === 7 && (
          <View style={{ alignItems: "center", paddingVertical: 40, paddingHorizontal: 20 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: "#dcfce7",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Icon name="check-circle" size={36} color="#166534" />
            </View>

            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 20,
                fontWeight: "700",
                color: COLORS.neutral[900],
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Applicant Details Confirmed!
            </Text>

            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 14,
                color: COLORS.neutral[600],
                textAlign: "center",
                maxWidth: 480,
                lineHeight: 22,
                marginBottom: 28,
              }}
            >
              The applicant details have been saved to your batch list. You can click below to encode another applicant or click <Text style={{ fontWeight: "700" }}>SUBMIT</Text> on the left sidebar to submit the batch.
            </Text>

            <TouchableOpacity
              onPress={handleAddAnotherApplicant}
              style={[
                styles.btnPrimary,
                styles.btnPrimaryActive,
                { paddingHorizontal: 24, paddingVertical: 12, flexDirection: "row", alignItems: "center" },
              ]}
            >
              <Icon name="plus" size={16} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={[styles.btnPrimaryText, styles.btnPrimaryTextActive, { fontSize: 14 }]}>
                Add Another Applicant
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleBack} style={styles.btnSecondary}>
          <Text style={styles.btnSecondaryText}>Back</Text>
        </TouchableOpacity>

        {step <= 6 && (
          <TouchableOpacity
            disabled={
              isNextDisabled() ||
              (step === 6 && appMode === "SINGLE" && !isAgreedToTerms)
            }
            onPress={handleNext}
            style={[
              styles.btnPrimary,
              (!isNextDisabled() &&
                (step < 6 || appMode === "BULK" || isAgreedToTerms)) &&
                styles.btnPrimaryActive,
            ]}
          >
            <Text
              style={[
                styles.btnPrimaryText,
                (!isNextDisabled() &&
                  (step < 6 || appMode === "BULK" || isAgreedToTerms)) &&
                  styles.btnPrimaryTextActive,
              ]}
            >
              {getNextBtnText()}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* CSV Import Preview Modal */}
      <Modal visible={isPreviewModalOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 }}>
          <View style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 20, width: "100%", maxWidth: 600 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 16, fontWeight: "700", marginBottom: 12 }}>
              CSV IMPORT DATA INGESTION PREVIEW
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[500], marginBottom: 16 }}>
              Review parsed entries from uploaded spreadsheet:
            </Text>

            <View style={{ borderWidth: 1, borderColor: COLORS.neutral[200], borderRadius: 6, overflow: "hidden", marginBottom: 20 }}>
              <View style={{ flexDirection: "row", backgroundColor: COLORS.neutral[100], padding: 8 }}>
                <Text style={{ flex: 1, fontSize: 11, fontWeight: "700" }}>Name</Text>
                <Text style={{ flex: 1, fontSize: 11, fontWeight: "700" }}>Exam Type</Text>
                <Text style={{ flex: 1, fontSize: 11, fontWeight: "700" }}>Status</Text>
              </View>
              <View style={{ flexDirection: "row", padding: 8, borderTopWidth: 1, borderTopColor: COLORS.neutral[200] }}>
                <Text style={{ flex: 1, fontSize: 11, fontWeight: "600" }}>John Smith Doe Jr.</Text>
                <Text style={{ flex: 1, fontSize: 11 }}>Amateur (Class A)</Text>
                <Text style={{ flex: 1, fontSize: 11, color: "green", fontWeight: "600" }}>Valid</Text>
              </View>
              <View style={{ flexDirection: "row", padding: 8, borderTopWidth: 1, borderTopColor: COLORS.neutral[200] }}>
                <Text style={{ flex: 1, fontSize: 11, fontWeight: "600" }}>Maria Santos Reyes</Text>
                <Text style={{ flex: 1, fontSize: 11 }}>Amateur (Class B)</Text>
                <Text style={{ flex: 1, fontSize: 11, color: "green", fontWeight: "600" }}>Valid</Text>
              </View>
              <View style={{ flexDirection: "row", padding: 8, borderTopWidth: 1, borderTopColor: COLORS.neutral[200] }}>
                <Text style={{ flex: 1, fontSize: 11, fontWeight: "600" }}>Juan Dela Cruz</Text>
                <Text style={{ flex: 1, fontSize: 11 }}>Amateur (Class C)</Text>
                <Text style={{ flex: 1, fontSize: 11, color: "green", fontWeight: "600" }}>Valid</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
              <TouchableOpacity onPress={() => setIsPreviewModalOpen(false)} style={styles.btnSecondary}>
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmCSVImport} style={[styles.btnPrimary, styles.btnPrimaryActive]}>
                <Text style={[styles.btnPrimaryText, styles.btnPrimaryTextActive]}>Confirm Ingestion</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Submit Applications Bulk Modal */}
      <Modal visible={isBulkSubmitOpen} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 }}>
          <View style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 24, width: "100%", maxWidth: 440 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 18, fontWeight: "700", color: COLORS.neutral[900], marginBottom: 8 }}>
              Submit Applications
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13.5, color: COLORS.neutral[500], marginBottom: 20 }}>
              Please provide contact details to submit this batch of {applicants.length} applications:
            </Text>

            <ValidatedInput
              label="Company Name"
              placeholder="Enter Company Name"
              value={bulkCompanyName}
              onChangeText={(val) => handleBulkSubmitChange("companyName", val)}
              error={bulkErrors.companyName}
              touched={bulkTouched.companyName}
              required
            />

            <ValidatedInput
              label="Email Address"
              placeholder="company@domain.com"
              value={bulkEmail}
              onChangeText={(val) => handleBulkSubmitChange("email", val)}
              error={bulkErrors.email}
              touched={bulkTouched.email}
              required
            />

            <ValidatedInput
              label="Phone Number"
              placeholder="09XXXXXXXXX"
              value={bulkPhone}
              onChangeText={(val) => handleBulkSubmitChange("phone", val)}
              error={bulkErrors.phone}
              touched={bulkTouched.phone}
              required
            />

            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
              <TouchableOpacity disabled={isSubmitting} onPress={() => setIsBulkSubmitOpen(false)} style={styles.btnSecondary}>
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={isSubmitting} onPress={handleBulkFinalSubmit} style={[styles.btnPrimary, styles.btnPrimaryActive]}>
                <Text style={[styles.btnPrimaryText, styles.btnPrimaryTextActive]}>
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal visible={isConfirmModalOpen} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 24, width: "100%", maxWidth: 440 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 18, fontWeight: "700", color: COLORS.neutral[900], marginBottom: 12 }}>
              {appMode === "BULK" ? "Confirm Applicant Details?" : "Confirm Application Submission?"}
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, color: COLORS.neutral[600], lineHeight: 20, marginBottom: 24 }}>
              {appMode === "BULK"
                ? "Are you sure you want to confirm this applicant's details?"
                : "Are you sure you want to submit this examination application to the NTC? Once submitted, you cannot modify the details."}
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
              <TouchableOpacity disabled={isSubmitting} onPress={() => setIsConfirmModalOpen(false)} style={styles.btnSecondary}>
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={isSubmitting}
                onPress={() => {
                  setIsConfirmModalOpen(false);
                  if (appMode === "BULK") {
                    handleConfirmApplicantInBulk();
                  } else {
                    handleFinalSubmit();
                  }
                }}
                style={[styles.btnPrimary, styles.btnPrimaryActive]}
              >
                <Text style={[styles.btnPrimaryText, styles.btnPrimaryTextActive]}>
                  {appMode === "BULK" ? "Confirm" : isSubmitting ? "Submitting..." : "Yes, Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {showToast && (
        <View style={{
          position: "absolute",
          bottom: 100,
          left: "20%",
          right: "20%",
          backgroundColor: "#1e293b",
          borderRadius: 30,
          paddingVertical: 12,
          paddingHorizontal: 24,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
          <Icon name="check-circle" size={16} color="#10b981" style={{ marginRight: 8 }} />
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, color: "#ffffff", fontSize: 13.5, fontWeight: "600" }}>
            Application added to bulk list.
          </Text>
        </View>
      )}
    </View>
  );
}
