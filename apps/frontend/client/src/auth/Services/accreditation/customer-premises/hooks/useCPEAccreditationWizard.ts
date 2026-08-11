import React, { useState } from "react";
import { Alert } from "react-native";
import { useUser } from "@clerk/expo";
import { useApi } from "../../../../../shared/hooks/useApi";
import { NTCOffice } from "../data/mockRegionData";
import { ApplicantData } from "../types/cpeTypes";

interface UseCPEAccreditationWizardProps {
  selectedRegionId: string;
  setSelectedRegionId: (id: string) => void;
  setSelectedOfficeId: (id: string) => void;
  setAppMode: (mode: "SINGLE" | "BULK" | "") => void;
  setBulkMethod: (method: "MANUAL" | "EXCEL") => void;
  setIsFileUploaded: (val: boolean) => void;
  setUploadedFileName: (name: string) => void;
  applicants: ApplicantData[];
  setApplicants: React.Dispatch<React.SetStateAction<ApplicantData[]>>;
  currentApplicantIndex: number;
  serviceId?: string | null;
}

export function useCPEAccreditationWizard({
  selectedRegionId,
  setSelectedRegionId,
  setSelectedOfficeId,
  setAppMode,
  setBulkMethod,
  setIsFileUploaded,
  setUploadedFileName,
  applicants,
  setApplicants,
  currentApplicantIndex,
  serviceId,
}: UseCPEAccreditationWizardProps) {
  const [isUploadSheetOpen, setIsUploadSheetOpen] = useState(false);
  const [activeUploadSlot, setActiveUploadSlot] = useState<string | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [csvRows, setCsvRows] = useState<Array<{
    id: number;
    status: "Valid" | "Invalid";
    name: string;
    type: "NEW" | "RENEWAL" | "MODIFICATION";
    reason?: string;
  }>>([
    { id: 1, status: "Valid", name: "John Doe", type: "NEW" },
    { id: 2, status: "Invalid", name: "Maria Reyes", type: "NEW", reason: "Missing SEC registration document" },
    { id: 3, status: "Invalid", name: "Juan Cruz", type: "RENEWAL", reason: "Expired mayor's permit date" },
  ]);

  const api = useApi();
  const { user: clerkUser } = useUser();
  const USE_MOCKS = false;

  // Form fields schema mapping
  const [formFields, setFormFields] = useState<any[]>([]);

  // Auto-fill applicant with Clerk user details
  React.useEffect(() => {
    if (clerkUser && applicants.length === 1) {
      const firstApp = applicants[0];
      if (firstApp && firstApp.email === "" && firstApp.contactNo === "") {
        const email = clerkUser.primaryEmailAddress?.emailAddress || "";
        const phone = clerkUser.primaryPhoneNumber?.phoneNumber || "";

        setApplicants((prev) => prev.map((app, idx) => idx === 0 ? {
          ...app,
          email,
          contactNo: phone,
        } : app));
      }
    }
  }, [clerkUser, applicants, setApplicants]);

  const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);

  interface ApiResponseEnvelope<T> {
    succeeded?: boolean;
    data?: T;
    items?: T;
  }

  React.useEffect(() => {
    async function fetchTenants() {
      setLoadingTenants(true);
      try {
        const res = await api.get<ApiResponseEnvelope<Array<{ id: string; name: string }>> | Array<{ id: string; name: string }>>("/api/v2/tenants");
        if (res && !Array.isArray(res) && res.succeeded && Array.isArray(res.data)) {
          setTenants(res.data);
        } else if (Array.isArray(res)) {
          setTenants(res);
        } else if (res && !Array.isArray(res) && Array.isArray(res.items)) {
          setTenants(res.items);
        } else {
          setTenants([]);
        }
      } catch (err) {
        console.error("Failed to fetch tenants from API:", err);
        setTenants([]);
      } finally {
        setLoadingTenants(false);
      }
    }
    fetchTenants();
  }, []);

  const selectedTenant = tenants.find((t) => t.id === selectedRegionId);
  const activeRegionObj = selectedTenant 
    ? {
        id: selectedTenant.id,
        name: selectedTenant.name,
        offices: []
      }
    : undefined;

  const [offices, setOffices] = useState<NTCOffice[]>([]);
  const [loadingOffices, setLoadingOffices] = useState(false);

  React.useEffect(() => {
    async function fetchOffices() {
      if (!selectedRegionId) {
        setOffices([]);
        return;
      }
      setLoadingOffices(true);
      try {
        const res = await api.get<ApiResponseEnvelope<NTCOffice[]> | NTCOffice[]>(`/api/v2/tenants/${selectedRegionId}/field-offices`);
        if (res && !Array.isArray(res) && res.succeeded && Array.isArray(res.data)) {
          setOffices(res.data);
        } else if (Array.isArray(res)) {
          setOffices(res);
        } else if (res && !Array.isArray(res) && Array.isArray(res.items)) {
          setOffices(res.items);
        } else {
          setOffices([]);
        }
      } catch (err) {
        console.error("Failed to fetch offices from API:", err);
        setOffices([]);
      } finally {
        setLoadingOffices(false);
      }
    }
    fetchOffices();
  }, [selectedRegionId]);

  const handleMockFileUpload = () => {
    setIsFileUploaded(true);
    setUploadedFileName("CPE_Supplier_Import.csv");
    setIsPreviewModalOpen(true);
  };

  const handleConfirmCSVImport = () => {
    setIsPreviewModalOpen(false);
    setApplicants([
      {
        id: 1,
        appType: "NEW",
        years: "2",
        variation: "Non-Mobile",
        accreditationNo: "",
        businessName: "Imported CPE Supplier Inc.",
        entityType: "Corporation",
        dtiNo: "DTI-98274981",
        regionName: "National Capital Region",
        province: "Metro Manila",
        city: "Quezon City",
        barangay: "South Triangle",
        street: "Timog Avenue",
        zone: "Zone 1",
        unitBldgNo: "Bldg 45",
        zipCode: "1103",
        contactNo: "09177654321",
        email: "imported.cpe@domain.com",
        engineerName: "Engr. Clara Gomez",
        eceNo: "ECE-7890",
        technicianName: "Ramon Santos",
        ectNo: "ECT-5678",
        expiryMonth: "October",
        expiryDate: "15",
        expiryYear: "2028",
        uploads: {},
      },
    ]);
    Alert.alert("Success", "Imported 1 valid rows from CSV.");
  };

  const activeApplicant = applicants[currentApplicantIndex] || {
    id: 1,
    appType: "NEW",
    years: "1",
    variation: "Mobile",
    accreditationNo: "",
    businessName: "",
    entityType: "Corporation",
    dtiNo: "",
    regionName: "",
    province: "",
    city: "",
    barangay: "",
    street: "",
    zone: "",
    unitBldgNo: "",
    zipCode: "",
    contactNo: "",
    email: "",
    engineerName: "",
    eceNo: "",
    technicianName: "",
    ectNo: "",
    expiryMonth: "January",
    expiryDate: "1",
    expiryYear: "2026",
    uploads: {},
  };

  const updateActiveApplicant = (fields: Partial<ApplicantData>) => {
    setApplicants((prev) =>
      prev.map((app, idx) => (idx === currentApplicantIndex ? { ...app, ...fields } : app))
    );
  };

  const submitApplicationPayload = async (isDraft = false) => {
    if (!serviceId) {
      Alert.alert("Error", "Service identifier is missing.");
      return;
    }
    const months: Record<string, string> = {
      January: "01", February: "02", March: "03", April: "04", May: "05", June: "06",
      July: "07", August: "08", September: "09", October: "10", November: "11", December: "12"
    };
    const expiryMonthNum = months[activeApplicant.expiryMonth] || "01";
    const expiryDateStr = `${activeApplicant.expiryYear}-${expiryMonthNum}-${String(activeApplicant.expiryDate).padStart(2, "0")}`;
    const address = `${activeApplicant.unitBldgNo || ""}, ${activeApplicant.street}, ${activeApplicant.barangay}, ${activeApplicant.city}, ${activeApplicant.province}, ${activeApplicant.zipCode}`;

    if (formFields.length > 0) {
      const formFieldValues: Array<{ fieldId: string; value: string }> = [];
      const mappings = [
        { terms: ["application type", "app type", "type"], value: activeApplicant.appType },
        { terms: ["years", "no of years", "number of years"], value: activeApplicant.years },
        { terms: ["variation"], value: activeApplicant.variation },
        { terms: ["accreditation no", "accreditation number"], value: activeApplicant.accreditationNo || "N/A" },
        { terms: ["business name", "company name", "name"], value: activeApplicant.businessName },
        { terms: ["entity type", "business type"], value: activeApplicant.entityType },
        { terms: ["dti", "sec", "dti/sec"], value: activeApplicant.dtiNo },
        { terms: ["address", "street", "residence"], value: address },
        { terms: ["contact no", "contact number", "phone", "mobile"], value: activeApplicant.contactNo },
        { terms: ["email address", "email"], value: activeApplicant.email },
        { terms: ["engineer", "ece"], value: `${activeApplicant.engineerName} (ECE: ${activeApplicant.eceNo})` },
        { terms: ["technician", "ect"], value: `${activeApplicant.technicianName} (ECT: ${activeApplicant.ectNo})` },
        { terms: ["expiry", "expiration"], value: expiryDateStr },
      ];

      formFields.forEach((field: any) => {
        const labelLower = (field.label || "").toLowerCase();
        const id = field.fieldId;
        const match = mappings.find(m => m.terms.some(t => labelLower.includes(t)));
        if (match) {
          formFieldValues.push({
            fieldId: id,
            value: String(match.value)
          });
        } else {
          formFieldValues.push({
            fieldId: id,
            value: field.type === "checkbox" ? "false" : ""
          });
        }
      });

      const payload = {
        tenantId: selectedRegionId,
        submissionMode: "Single",
        serviceId: serviceId,
        scheduleId: null,
        fieldOfficeId: null,
        serviceVariantId: null,
        serviceVariantElementIds: [],
        isDraft: isDraft,
        applicants: [
          {
            firstName: "CPE Supplier",
            lastName: activeApplicant.businessName,
            email: activeApplicant.email,
            contactNumber: activeApplicant.contactNo,
            address: address,
            birthDate: "1990-01-01T00:00:00Z",
            formFieldValues: formFieldValues
          }
        ]
      };

      await api.post(`/api/v2/tenants/${selectedRegionId}/applications`, payload);
      return;
    }

    const payload = {
      applicationType: "CPE_SUPPLIER_ACCREDITATION",
      appType: activeApplicant.appType,
      years: parseInt(activeApplicant.years),
      variation: activeApplicant.variation,
      accreditationNo: activeApplicant.accreditationNo || null,
      businessName: activeApplicant.businessName,
      entityType: activeApplicant.entityType,
      dtiNo: activeApplicant.dtiNo,
      province: activeApplicant.province,
      city: activeApplicant.city,
      barangay: activeApplicant.barangay,
      street: activeApplicant.street,
      zone: activeApplicant.zone,
      unitBldgNo: activeApplicant.unitBldgNo,
      zipCode: activeApplicant.zipCode,
      contactNo: activeApplicant.contactNo,
      email: activeApplicant.email,
      engineerName: activeApplicant.engineerName,
      eceNo: activeApplicant.eceNo,
      technicianName: activeApplicant.technicianName,
      ectNo: activeApplicant.ectNo,
      expiryMonth: activeApplicant.expiryMonth,
      expiryDate: parseInt(activeApplicant.expiryDate),
      expiryYear: parseInt(activeApplicant.expiryYear),
      attachments: Object.keys(activeApplicant.uploads).map((key) => {
        const uploadObj = activeApplicant.uploads[key];
        const fileName = typeof uploadObj === "string"
          ? uploadObj
          : uploadObj !== null && uploadObj !== undefined
          ? uploadObj.name
          : "";
        return {
          requirementIndex: parseInt(key),
          fileName,
        };
      }),
    };

    await api.post(`/api/v2/tenants/${selectedRegionId}/applications`, payload);
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateForm = (app: ApplicantData) => {
    const newErrors: Record<string, string> = {};

    if (!app.years) newErrors.years = "No. of Years is required.";
    if (!app.variation) newErrors.variation = "Variation is required.";

    if ((app.appType === "RENEWAL" || app.appType === "MODIFICATION") && !app.accreditationNo) {
      newErrors.accreditationNo = "Accreditation Number is required.";
    } else if (app.accreditationNo && app.accreditationNo.length < 3) {
      newErrors.accreditationNo = "Accreditation Number must be at least 3 characters.";
    }

    if (!app.businessName) newErrors.businessName = "Business Name is required.";
    if (!app.entityType) newErrors.entityType = "Entity Type is required.";

    if (!app.dtiNo) {
      newErrors.dtiNo = "DTI/SEC Registration No. is required.";
    } else if (app.dtiNo.length < 3) {
      newErrors.dtiNo = "DTI/SEC No. must be at least 3 characters.";
    }

    if (!app.province) {
      newErrors.province = "Province is required.";
    } else if (app.province.length < 2) {
      newErrors.province = "Province name must be at least 2 characters.";
    }

    if (!app.city) {
      newErrors.city = "City is required.";
    } else if (app.city.length < 2) {
      newErrors.city = "City name must be at least 2 characters.";
    }

    if (!app.barangay) {
      newErrors.barangay = "Barangay is required.";
    } else if (app.barangay.length < 2) {
      newErrors.barangay = "Barangay name must be at least 2 characters.";
    }

    if (!app.street) {
      newErrors.street = "Street is required.";
    } else if (app.street.length < 2) {
      newErrors.street = "Street name must be at least 2 characters.";
    }

    if (!app.zone) newErrors.zone = "Zone is required.";
    if (!app.unitBldgNo) newErrors.unitBldgNo = "Unit/Bldg No is required.";

    if (!app.zipCode) {
      newErrors.zipCode = "Zip Code is required.";
    } else if (!/^\d{4}$/.test(app.zipCode)) {
      newErrors.zipCode = "Zip Code must be a 4-digit number (e.g., 1000).";
    }

    if (!app.contactNo) {
      newErrors.contactNo = "Contact Number is required.";
    } else if (!/^(09|\+639)\d{9}$/.test(app.contactNo) && !/^\d{10,11}$/.test(app.contactNo)) {
      newErrors.contactNo = "Invalid phone format (e.g., 09171234567).";
    }

    if (!app.email) {
      newErrors.email = "Email Address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(app.email)) {
      newErrors.email = "Invalid email address format (e.g., name@domain.com).";
    }

    if (!app.engineerName) {
      newErrors.engineerName = "Supervising Engineer Name is required.";
    } else if (app.engineerName.length < 2) {
      newErrors.engineerName = "Engineer Name must be at least 2 characters.";
    }

    if (!app.eceNo) {
      newErrors.eceNo = "ECE/PECE License No. is required.";
    } else if (app.eceNo.length < 3) {
      newErrors.eceNo = "License number must be at least 3 characters.";
    }

    if (!app.technicianName) {
      newErrors.technicianName = "Technician Name is required.";
    } else if (app.technicianName.length < 2) {
      newErrors.technicianName = "Technician Name must be at least 2 characters.";
    }

    if (!app.ectNo) {
      newErrors.ectNo = "ECT License No. is required.";
    } else if (app.ectNo.length < 3) {
      newErrors.ectNo = "License number must be at least 3 characters.";
    }

    if (!app.expiryMonth) newErrors.expiryMonth = "Expiry Month is required.";
    if (!app.expiryDate) newErrors.expiryDate = "Expiry Date is required.";
    if (!app.expiryYear) newErrors.expiryYear = "Expiry Year is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: keyof ApplicantData, value: string) => {
    updateActiveApplicant({ [field]: value });

    const updatedApplicant = { ...activeApplicant, [field]: value };
    const newErrors = { ...errors };

    if (field === "years" && !value) {
      newErrors.years = "No. of Years is required.";
    } else if (field === "years") {
      delete newErrors.years;
    }

    if (field === "variation" && !value) {
      newErrors.variation = "Variation is required.";
    } else if (field === "variation") {
      delete newErrors.variation;
    }

    if (field === "accreditationNo") {
      if (!value && (updatedApplicant.appType === "RENEWAL" || updatedApplicant.appType === "MODIFICATION")) {
        newErrors.accreditationNo = "Accreditation Number is required.";
      } else if (value && value.length < 3) {
        newErrors.accreditationNo = "Accreditation Number must be at least 3 characters.";
      } else {
        delete newErrors.accreditationNo;
      }
    }

    if (field === "businessName") {
      if (!value) newErrors.businessName = "Business Name is required.";
      else delete newErrors.businessName;
    }

    if (field === "entityType") {
      if (!value) newErrors.entityType = "Entity Type is required.";
      else delete newErrors.entityType;
    }

    if (field === "dtiNo") {
      if (!value) {
        newErrors.dtiNo = "DTI/SEC Registration No. is required.";
      } else if (value.length < 3) {
        newErrors.dtiNo = "DTI/SEC No. must be at least 3 characters.";
      } else {
        delete newErrors.dtiNo;
      }
    }

    if (field === "province") {
      if (!value) {
        newErrors.province = "Province is required.";
      } else if (value.length < 2) {
        newErrors.province = "Province name must be at least 2 characters.";
      } else {
        delete newErrors.province;
      }
    }

    if (field === "city") {
      if (!value) {
        newErrors.city = "City is required.";
      } else if (value.length < 2) {
        newErrors.city = "City name must be at least 2 characters.";
      } else {
        delete newErrors.city;
      }
    }

    if (field === "barangay") {
      if (!value) {
        newErrors.barangay = "Barangay is required.";
      } else if (value.length < 2) {
        newErrors.barangay = "Barangay name must be at least 2 characters.";
      } else {
        delete newErrors.barangay;
      }
    }

    if (field === "street") {
      if (!value) {
        newErrors.street = "Street is required.";
      } else if (value.length < 2) {
        newErrors.street = "Street name must be at least 2 characters.";
      } else {
        delete newErrors.street;
      }
    }

    if (field === "zone") {
      if (!value) newErrors.zone = "Zone is required.";
      else delete newErrors.zone;
    }

    if (field === "unitBldgNo") {
      if (!value) newErrors.unitBldgNo = "Unit/Bldg No is required.";
      else delete newErrors.unitBldgNo;
    }

    if (field === "zipCode") {
      if (!value) {
        newErrors.zipCode = "Zip Code is required.";
      } else if (!/^\d{4}$/.test(value)) {
        newErrors.zipCode = "Zip Code must be a 4-digit number (e.g., 1000).";
      } else {
        delete newErrors.zipCode;
      }
    }

    if (field === "contactNo") {
      if (!value) {
        newErrors.contactNo = "Contact Number is required.";
      } else if (!/^(09|\+639)\d{9}$/.test(value) && !/^\d{10,11}$/.test(value)) {
        newErrors.contactNo = "Invalid phone format (e.g., 09171234567).";
      } else {
        delete newErrors.contactNo;
      }
    }

    if (field === "email") {
      if (!value) {
        newErrors.email = "Email Address is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = "Invalid email address format (e.g., name@domain.com).";
      } else {
        delete newErrors.email;
      }
    }

    if (field === "engineerName") {
      if (!value) {
        newErrors.engineerName = "Supervising Engineer Name is required.";
      } else if (value.length < 2) {
        newErrors.engineerName = "Engineer Name must be at least 2 characters.";
      } else {
        delete newErrors.engineerName;
      }
    }

    if (field === "eceNo") {
      if (!value) {
        newErrors.eceNo = "ECE/PECE License No. is required.";
      } else if (value.length < 3) {
        newErrors.eceNo = "License number must be at least 3 characters.";
      } else {
        delete newErrors.eceNo;
      }
    }

    if (field === "technicianName") {
      if (!value) {
        newErrors.technicianName = "Technician Name is required.";
      } else if (value.length < 2) {
        newErrors.technicianName = "Technician Name must be at least 2 characters.";
      } else {
        delete newErrors.technicianName;
      }
    }

    if (field === "ectNo") {
      if (!value) {
        newErrors.ectNo = "ECT License No. is required.";
      } else if (value.length < 3) {
        newErrors.ectNo = "License number must be at least 3 characters.";
      } else {
        delete newErrors.ectNo;
      }
    }

    setErrors(newErrors);
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleDocumentPick = (fileKey: string, file: { name: string; uri: string }) => {
    const nextUploads = { ...activeApplicant.uploads };
    nextUploads[fileKey] = file;
    updateActiveApplicant({ uploads: nextUploads });
  };

  return {
    isUploadSheetOpen,
    setIsUploadSheetOpen,
    activeUploadSlot,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    isAgreedToTerms,
    setIsAgreedToTerms,
    isSubmitting,
    setIsSubmitting,
    isFeedbackModalOpen,
    setIsFeedbackModalOpen,
    feedbackRating,
    setFeedbackRating,
    feedbackComment,
    setFeedbackComment,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    csvRows,
    tenants,
    loadingTenants,
    officesList: offices,
    loadingOffices,
    activeRegionObj,
    activeApplicant,
    updateActiveApplicant,
    submitApplicationPayload,
    handleMockFileUpload,
    handleConfirmCSVImport,
    handleFieldChange,
    handleDocumentPick,
    validateForm,
    errors,
    touched,
    setTouched,
  };
}
