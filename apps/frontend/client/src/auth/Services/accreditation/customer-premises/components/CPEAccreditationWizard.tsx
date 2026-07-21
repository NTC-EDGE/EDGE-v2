import React, { useState, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Modal,
} from "react-native";
import { Icon, SPACING, TYPOGRAPHY } from "@edge/ui";
import { COLORS } from "@edge/ui";
import { styles } from "./CPEAccreditationWizard.styles";
import { PHILIPPINE_REGIONS_WITH_OFFICES, NTCRegion, NTCOffice } from "../data/mockRegionData";
import { Select } from "../../../../../shared/components/Select";
import { ValidatedInput } from "../../../../../shared/components/ValidatedInput";

interface CPEAccreditationWizardProps {
  onClose: () => void;
  onSuccess: () => void;
  isDetailsExpanded: boolean;
  onToggleExpand: () => void;
}

interface ApplicantData {
  id: number;
  appType: "NEW" | "RENEWAL" | "MODIFICATION";
  years: string;
  variation: string;
  accreditationNo: string;
  businessName: string;
  entityType: string;
  dtiNo: string;
  regionName: string;
  province: string;
  city: string;
  barangay: string;
  street: string;
  zone: string;
  unitBldgNo: string;
  zipCode: string;
  contactNo: string;
  email: string;
  engineerName: string;
  eceNo: string;
  technicianName: string;
  ectNo: string;
  expiryMonth: string;
  expiryDate: string;
  expiryYear: string;
  uploads: Record<string, string>; // Maps requirement index to filename
}

const initialApplicant = (id: number): ApplicantData => ({
  id,
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
});

export function CPEAccreditationWizard({
  onClose,
  onSuccess,
  isDetailsExpanded,
  onToggleExpand,
}: CPEAccreditationWizardProps) {
  // Stepper State (Step index 1-7, success screen is step 8)
  const [step, setStep] = useState(1);

  // Initial Configuration State (Defaults to BULK manual encoding board per requests)
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [selectedOfficeId, setSelectedOfficeId] = useState("");
  const [appMode, setAppMode] = useState<"SINGLE" | "BULK">("BULK");

  // Bulk Data Setup States
  const [bulkMethod, setBulkMethod] = useState<"MANUAL" | "EXCEL">("MANUAL");
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  // Upload action sheet states
  const [isUploadSheetOpen, setIsUploadSheetOpen] = useState(false);
  const [activeUploadSlot, setActiveUploadSlot] = useState<string | null>(null);

  // Array of applicants currently being processed
  const [applicants, setApplicants] = useState<ApplicantData[]>([initialApplicant(1)]);
  const [currentApplicantIndex, setCurrentApplicantIndex] = useState(0);

  // Scroll ref for jump-links in Form Step
  const scrollViewRef = useRef<ScrollView | null>(null);

  // Dynamic values mapped based on chosen region
  const activeRegionObj = PHILIPPINE_REGIONS_WITH_OFFICES.find((r) => r.id === selectedRegionId);
  const officesList = activeRegionObj ? activeRegionObj.offices : [];

  // Stepper titles and counts
  const totalSteps = appMode === "SINGLE" ? 7 : 7;
  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Information";
      case 2:
        return "Region";
      case 3:
        return "Filing Data Configuration";
      case 4:
        return "Application Type";
      case 5:
        return "Application Form";
      case 6:
        return "Upload Requirements";
      case 7:
        return "Review & Submit";
      default:
        return "Filing Wizard";
    }
  };

  const getNextBtnText = () => {
    if (step === 6) return "Review";
    if (step === 7) return "Submit";
    return "Next";
  };

  // Helper to retrieve requirements for step 4 & step 6
  const getRequirementsList = (type: "NEW" | "RENEWAL" | "MODIFICATION"): string[] => {
    if (type === "NEW") {
      return [
        "SEC / DTI Registration or Business/Mayor's Permit (Note: purpose must include CPE supplier accreditation related details)",
        "Proof of Paid-Up Capital (Minimum of PHP 250,000.00 certified by Treasurer/Partners/Owner)",
        "Distributorship or Representation Agreement on products to be sold",
        "Type Approval Certificate or copy of Grant of Equipment Conformity for CPE to be sold",
        "Certificate of Employment & valid ROC/license of two (2) qualified radio technicians (i.e. RCT/ECT) full-time",
        "Certificate of Employment and copy of valid license of supervising Electronics Engineer (ECE) or PECE",
      ];
    } else if (type === "RENEWAL") {
      return [
        "CPE Supplier Accreditation Certificate",
        "Business / Mayor's Permit",
        "Distributorship or Representation Agreement on products to be sold",
        "Certificate of Employment & valid ROC/license of two (2) qualified radio technicians (i.e. RCT/ECT) full-time",
        "Certificate of Employment and copy of valid license of supervising Electronics Engineer (ECE) or PECE",
      ];
    } else {
      return [
        "CPE Supplier Accreditation Certificate",
        "For equipment not previously indicated: Copy of Type Approval Certificate or Copy of Grant of Equipment Conformity",
      ];
    }
  };

  const activeApplicant = applicants[currentApplicantIndex] || initialApplicant(1);

  // Function to update the currently active applicant form details
  const updateActiveApplicant = (fields: Partial<ApplicantData>) => {
    setApplicants((prev) =>
      prev.map((app, idx) => (idx === currentApplicantIndex ? { ...app, ...fields } : app))
    );
  };

  const renderCPERequirementItem = (idx: number, type: "NEW" | "RENEWAL" | "MODIFICATION") => {
    const fileKey = idx.toString();
    const hasFile = activeApplicant.uploads[fileKey] !== undefined;

    let content: React.ReactNode = null;

    if (type === "NEW") {
      if (idx === 0) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 6 }}>
              1. Copy of ANY of the following:<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 4 }}>• SEC Registration</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 4 }}>• DTI Registration</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 12 }}>• Business/Mayor's Permit</Text>
            <View style={{ backgroundColor: "#fef8e8", padding: 12, borderRadius: 8, borderColor: "#fdf0cd", borderWidth: 1, marginBottom: 12 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#a16207", fontStyle: "italic", lineHeight: 16 }}>
                Note : The purpose of the company as indicated in its registration document must include information related to the accreditation applied for.
              </Text>
            </View>
          </View>
        );
      } else if (idx === 1) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 6 }}>
              2. Proof of Paid-Up Capital<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 12, lineHeight: 18 }}>
              Minimum of PHP 250,000.00, duly certified by the Treasurer of the Corporation or by the partners in a partnership or by the owner in a sole proprietorship
            </Text>
          </View>
        );
      } else if (idx === 2) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 12 }}>
              3. Distributorship OR Representation Agreement on products to be sold<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
          </View>
        );
      } else if (idx === 3) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 12 }}>
              4. Type Approval Certificate OR Copy of Grant of Equipment Conformity for CPE to be sold<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
          </View>
        );
      } else if (idx === 4) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 6 }}>
              5. Copy of the following:<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 12, lineHeight: 18 }}>
              Certificate of Employment AND copy of valid ROC/license of two (2) qualified radio technicians (i.e. Radio Communications Technician OR Electronics Technician) employed on a full-time basis
            </Text>
          </View>
        );
      } else if (idx === 5) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 6 }}>
              6. Copy of the following:<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 12, lineHeight: 18 }}>
              Certificate of Employment and copy of valid license of supervising Electronics Engineer (ECE) OR Professional Electronics Engineer (PECE)
            </Text>
          </View>
        );
      }
    } else if (type === "RENEWAL") {
      if (idx === 0) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 12 }}>
              1. CPE Supplier Accreditation<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
          </View>
        );
      } else if (idx === 1) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 12 }}>
              2. Business/Mayor's Permit<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
          </View>
        );
      } else if (idx === 2) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 12 }}>
              3. Distributorship OR Representation Agreement on products to be sold<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
          </View>
        );
      } else if (idx === 3) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 6 }}>
              4. Copy of the following:<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 12, lineHeight: 18 }}>
              Certificate of Employment AND copy of valid ROC/license of two (2) qualified radio technicians (i.e. Radio Communications Technician OR Electronics Technician) employed on a full-time basis
            </Text>
          </View>
        );
      } else if (idx === 4) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 6 }}>
              5. Copy of the following:<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 12, lineHeight: 18 }}>
              Certificate of Employment and copy of valid license of supervising Electronics Engineer (ECE) OR Professional Electronics Engineer (PECE)
            </Text>
          </View>
        );
      }
    } else if (type === "MODIFICATION") {
      if (idx === 0) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 12 }}>
              1. CPE Supplier Accreditation<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
          </View>
        );
      } else if (idx === 1) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 6 }}>
              2. For equipment not previously indicated in the CPE Supplier Accreditation:
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 12, lineHeight: 18 }}>
              Copy of Type Approval Certificate OR Copy of Grant of Equipment Conformity for CPE to be sold
            </Text>
          </View>
        );
      }
    }

    return (
      <View key={idx} style={{ marginBottom: 24 }}>
        {content}
        <View style={{
          backgroundColor: COLORS.neutral.white,
          borderColor: COLORS.neutral[200],
          borderWidth: 1,
          borderRadius: 12,
          padding: 16,
          minHeight: 72,
          justifyContent: "center",
          marginBottom: 16,
        }}>
          {hasFile ? (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.semantic.success, fontWeight: "600" }}>
                {activeApplicant.uploads[fileKey]} ✔
              </Text>
              <TouchableOpacity onPress={() => {
                const nextUploads = { ...activeApplicant.uploads };
                delete nextUploads[fileKey];
                updateActiveApplicant({ uploads: nextUploads });
              }}>
                <Icon name="trash" size={16} color={COLORS.semantic.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setActiveUploadSlot(fileKey);
                setIsUploadSheetOpen(true);
              }}
              style={styles.uploadButton}
            >
              <Icon name="upload" size={14} color={COLORS.neutral[700]} style={{ marginRight: 8 }} />
              <Text style={styles.uploadButtonText}>Upload a file..</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderReviewSectionHeader = (title: string) => (
    <View style={{ backgroundColor: "#f1f5f9", paddingVertical: 6, paddingHorizontal: 12, marginVertical: 8 }}>
      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: COLORS.neutral[600], letterSpacing: 0.5 }}>
        {title}
      </Text>
    </View>
  );

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

  const renderReviewRequirementText = (idx: number, type: "NEW" | "RENEWAL" | "MODIFICATION") => {
    if (type === "NEW") {
      if (idx === 0) {
        return (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800], marginBottom: 4 }}>
              1. Copy of ANY of the following:
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 2 }}>• SEC Registration</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 2 }}>• DTI Registration</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 6 }}>• Business/Mayor's Permit</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: COLORS.neutral[400], fontStyle: "italic", marginLeft: 12 }}>
              Note : The purpose of the company as indicated in its registration document must include information related to the accreditation applied for.
            </Text>
          </View>
        );
      } else if (idx === 1) {
        return (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800], marginBottom: 4 }}>
              2. Proof of Paid-Up Capital
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[600], marginLeft: 12 }}>
              Minimum of PHP 250,000.00, duly certified by the Treasurer of the Corporation or by the partners in a partnership or by the owner in a sole proprietorship
            </Text>
          </View>
        );
      } else if (idx === 2) {
        return (
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800] }}>
            3. Distributorship OR Representation Agreement on products to be sold
          </Text>
        );
      } else if (idx === 3) {
        return (
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800] }}>
            4. Type Approval Certificate OR Copy of Grant of Equipment Conformity for CPE to be sold
          </Text>
        );
      } else if (idx === 4) {
        return (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800], marginBottom: 4 }}>
              5. Copy of the following:
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[600], marginLeft: 12 }}>
              Certificate of Employment AND copy of valid ROC/license of two (2) qualified radio technicians (i.e. Radio Communications Technician OR Electronics Technician) employed on a full-time basis
            </Text>
          </View>
        );
      } else if (idx === 5) {
        return (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800], marginBottom: 4 }}>
              6. Copy of the following:
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[600], marginLeft: 12 }}>
              Certificate of Employment and copy of valid license of supervising Electronics Engineer (ECE) OR Professional Electronics Engineer (PECE)
            </Text>
          </View>
        );
      }
    } else if (type === "RENEWAL") {
      if (idx === 0) {
        return (
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800] }}>
            1. CPE Supplier Accreditation
          </Text>
        );
      } else if (idx === 1) {
        return (
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800] }}>
            2. Business/Mayor's Permit
          </Text>
        );
      } else if (idx === 2) {
        return (
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800] }}>
            3. Distributorship OR Representation Agreement on products to be sold
          </Text>
        );
      } else if (idx === 3) {
        return (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800], marginBottom: 4 }}>
              4. Copy of the following:
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[600], marginLeft: 12 }}>
              Certificate of Employment AND copy of valid ROC/license of two (2) qualified radio technicians (i.e. Radio Communications Technician OR Electronics Technician) employed on a full-time basis
            </Text>
          </View>
        );
      } else if (idx === 4) {
        return (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800], marginBottom: 4 }}>
              5. Copy of the following:
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[600], marginLeft: 12 }}>
              Certificate of Employment and copy of valid license of supervising Electronics Engineer (ECE) OR Professional Electronics Engineer (PECE)
            </Text>
          </View>
        );
      }
    } else if (type === "MODIFICATION") {
      if (idx === 0) {
        return (
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800] }}>
            1. CPE Supplier Accreditation
          </Text>
        );
      } else if (idx === 1) {
        return (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800], marginBottom: 4 }}>
              2. For equipment not previously indicated in the CPE Supplier Accreditation:
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[600], marginLeft: 12 }}>
              Copy of Type Approval Certificate OR Copy of Grant of Equipment Conformity for CPE to be sold
            </Text>
          </View>
        );
      }
    }
    return null;
  };

  // Form validation errors and touched states
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
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Stepper Logic Flow
  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!selectedRegionId || !selectedOfficeId) {
        Alert.alert("Error", "Please select region and office.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (appMode === "BULK" && bulkMethod === "EXCEL" && !isFileUploaded) {
        Alert.alert("Error", "Please upload the CSV/Excel file to proceed.");
        return;
      }
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    } else if (step === 5) {
      const isValid = validateForm(activeApplicant);
      if (!isValid) {
        // Touch all fields to show validation redmarks
        const fields = [
          "years", "variation", "accreditationNo", "businessName", "entityType", "dtiNo",
          "province", "city", "barangay", "street", "zone", "unitBldgNo", "zipCode",
          "contactNo", "email", "engineerName", "eceNo", "technicianName", "ectNo",
          "expiryMonth", "expiryDate", "expiryYear"
        ];
        const nextTouched: Record<string, boolean> = {};
        fields.forEach((f) => nextTouched[f] = true);
        setTouched(nextTouched);

        Alert.alert("Validation Error", "Please fill in all required fields marked with *.");
        return;
      }
      setStep(6);
    } else if (step === 6) {
      // Validate all required files uploaded
      const reqList = getRequirementsList(activeApplicant.appType);
      const allUploaded = reqList.every((_, idx) => activeApplicant.uploads[idx.toString()]);
      if (!allUploaded) {
        Alert.alert("Error", "Please upload all mandatory supporting documents.");
        return;
      }

      // If BULK manual and there are more applicants to encode, or we want to loop
      if (appMode === "BULK" && bulkMethod === "MANUAL" && currentApplicantIndex < applicants.length - 1) {
        setCurrentApplicantIndex((prev) => prev + 1);
        setStep(4); // Loop back to configuration step for next applicant
      } else {
        setStep(7);
      }
    } else if (step === 7) {
      setStep(8); // Success Screen
    }
  };

  const handleBack = () => {
    if (step === 1) {
      onClose();
    } else {
      setStep((prev) => prev - 1);
    }
  };

  // Stepper Jump Links scroll handler
  const handleScrollToSection = (yOffset: number) => {
    if (scrollViewRef.current !== null) {
      scrollViewRef.current.scrollTo({ y: yOffset, animated: true });
    }
  };

  // Mock excel file upload trigger
  const handleMockFileUpload = () => {
    setIsFileUploaded(true);
    setUploadedFileName("CPE_Supplier_Applicants_Template_2026.csv");
    // Pre-populate list of applicants representing parsed CSV rows
    setApplicants([
      {
        ...initialApplicant(1),
        businessName: "Apex Telecom Group",
        appType: "NEW",
        contactNo: "09171234567",
        email: "contact@apex.com",
      },
      {
        ...initialApplicant(2),
        businessName: "MetroWave WiFi Corp",
        appType: "RENEWAL",
        contactNo: "09187654321",
        email: "support@metrowave.com",
      },
    ]);
    setCurrentApplicantIndex(0);
  };

  // Add another manual applicant
  const handleSaveAndAddAnother = () => {
    if (!activeApplicant.businessName) {
      Alert.alert("Error", "Please input Business Name before adding another.");
      return;
    }
    const nextId = applicants.length + 1;
    setApplicants((prev) => [...prev, initialApplicant(nextId)]);
    setCurrentApplicantIndex(applicants.length);
    setStep(4); // Start applicant details setup
  };

  // Render horizontal indicators
  const renderProgressIndicator = () => {
    const list: React.ReactNode[] = [];
    for (let i = 1; i <= totalSteps; i++) {
      list.push(
        <View
          key={i}
          style={[
            styles.progressDash,
            step === i && styles.progressDashActive,
          ]}
        />
      );
    }
    return <View style={styles.progressContainer}>{list}</View>;
  };

  // Check if next button is disabled
  const isNextDisabled = () => {
    if (step === 2) {
      return !selectedRegionId || !selectedOfficeId;
    }
    if (step === 3 && appMode === "BULK" && bulkMethod === "EXCEL") {
      return !isFileUploaded;
    }
    return false;
  };

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
        {step < 8 && renderProgressIndicator()}
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* STEP 1: Information */}
        {step === 1 && (
          <View>
            <Text style={styles.infoTitle}>Customer Premises Equipment Supplier Accreditation</Text>
            <Text style={styles.infoDesc}>
              An Accreditation for Customer Premises Equipment Supplier is a written authority issued by the Commission to a person, firm, company, association or corporation authorizing the holder thereof to engage in the acquisition, servicing, maintenance, purchase or sale of equipment located in the premises of a customer which is not part of but connected to the system or network of a public telecommunications entity.
            </Text>
            <View style={styles.availCard}>
              <Text style={styles.availHeading}>WHO MAY AVAIL:</Text>
              <Text style={styles.availItem}>1. Individuals and Private Entities</Text>
            </View>
          </View>
        )}

        {/* STEP 2: Region Selection */}
        {step === 2 && (
          <View>
            <Text style={styles.stepSubtitle}>Select from which region you intend to apply:</Text>

            <Text style={styles.selectLabel}>Region</Text>
            <Select
              placeholder="Region"
              value={selectedRegionId}
              onValueChange={(val) => {
                setSelectedRegionId(val);
                setSelectedOfficeId("");
              }}
              options={PHILIPPINE_REGIONS_WITH_OFFICES.map((r) => ({
                label: r.name,
                value: r.id,
              }))}
            />

            <Text style={styles.selectLabel}>Select Office:</Text>
            <Select
              placeholder="Offices*"
              value={selectedOfficeId}
              onValueChange={setSelectedOfficeId}
              options={officesList.map((o) => ({
                label: o.name,
                value: o.id,
              }))}
            />
          </View>
        )}

        {/* STEP 3: Filing Data Configuration */}
        {step === 3 && (
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
        )}

        {/* STEP 4: Application Type & Requirements */}
        {step === 4 && (
          <View>
            {appMode === "BULK" && (
              <Text style={{ color: COLORS.brand[700], fontWeight: "700", marginBottom: 8 }}>
                [Applicant {currentApplicantIndex + 1} of {applicants.length}]
              </Text>
            )}
            <Text style={styles.stepSubtitle}>Select Application Type:</Text>
            <Select
              placeholder="Application Type"
              value={activeApplicant.appType}
              onValueChange={(val) => updateActiveApplicant({ appType: val as any })}
              options={[
                { label: "NEW", value: "NEW" },
                { label: "RENEWAL", value: "RENEWAL" },
                { label: "MODIFICATION", value: "MODIFICATION" },
              ]}
            />

            <View style={styles.reqContainer}>
              <Text style={styles.reqTitle}>Requirements checklist for {activeApplicant.appType}</Text>
              {getRequirementsList(activeApplicant.appType).map((req, idx) => (
                <View key={idx} style={styles.reqItemRow}>
                  <Text style={{ marginRight: 8, color: COLORS.neutral[500], fontWeight: "bold" }}>•</Text>
                  <Text style={styles.reqItemText}>{req}</Text>
                </View>
              ))}
              {activeApplicant.appType === "NEW" && (
                <View style={styles.reqNoteBox}>
                  <Text style={styles.reqNoteText}>
                    Note: The purpose of the company as indicated in its registration document must include information related to the accreditation applied for.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* STEP 5: Application Form */}
        {step === 5 && (
          <View>
            {/* Sticky/Header Section Navigation bar */}
            <View style={styles.formHeaderTabs}>
              <TouchableOpacity onPress={() => handleScrollToSection(0)} style={[styles.formTab, styles.formTabActive]}>
                <Text style={[styles.formTabText, styles.formTabTextActive]}>Details</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleScrollToSection(150)} style={styles.formTab}>
                <Text style={styles.formTabText}>Basic Info</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleScrollToSection(300)} style={styles.formTab}>
                <Text style={styles.formTabText}>Business</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleScrollToSection(480)} style={styles.formTab}>
                <Text style={styles.formTabText}>Address</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleScrollToSection(750)} style={styles.formTab}>
                <Text style={styles.formTabText}>Contact</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleScrollToSection(900)} style={styles.formTab}>
                <Text style={styles.formTabText}>Supervising Engineer</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleScrollToSection(1050)} style={styles.formTab}>
                <Text style={styles.formTabText}>Technician</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleScrollToSection(1200)} style={styles.formTab}>
                <Text style={styles.formTabText}>Date of Expiry</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 20 }}>
              {/* Details Section */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionHeading}>Details</Text>
                <View style={styles.formGrid}>
                  <View style={styles.formCol6}>
                    <Text style={styles.selectLabel}>No. of Years*</Text>
                    <Select
                      value={activeApplicant.years}
                      onValueChange={(val) => updateActiveApplicant({ years: val })}
                      options={[
                        { label: "1 Year", value: "1" },
                        { label: "2 Years", value: "2" },
                        { label: "3 Years", value: "3" },
                      ]}
                    />
                  </View>
                  <View style={styles.formCol6}>
                    <Text style={styles.selectLabel}>Variation (mobile/non-mobile)*</Text>
                    <Select
                      value={activeApplicant.variation}
                      onValueChange={(val) => updateActiveApplicant({ variation: val })}
                      options={[
                        { label: "Mobile", value: "Mobile" },
                        { label: "Non-Mobile", value: "Non-Mobile" },
                      ]}
                    />
                  </View>
                  {(activeApplicant.appType === "RENEWAL" || activeApplicant.appType === "MODIFICATION") && (
                    <View style={styles.formCol12}>
                      <ValidatedInput
                        label="Accreditation No."
                        placeholder="Accreditation Number"
                        value={activeApplicant.accreditationNo}
                        onChangeText={(val) => handleFieldChange("accreditationNo", val)}
                        error={errors.accreditationNo}
                        touched={touched.accreditationNo}
                        required
                      />
                    </View>
                  )}
                </View>
              </View>

              {/* Basic Info Section */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionHeading}>Basic Info</Text>
                <ValidatedInput
                  label="Application (Business Name)"
                  placeholder="Enter business / sole owner name"
                  value={activeApplicant.businessName}
                  onChangeText={(val) => handleFieldChange("businessName", val)}
                  error={errors.businessName}
                  touched={touched.businessName}
                  required
                />
              </View>

              {/* Business Section */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionHeading}>Business Details</Text>
                <View style={styles.formGrid}>
                  <View style={styles.formCol6}>
                    <Select
                      value={activeApplicant.entityType}
                      onValueChange={(val) => updateActiveApplicant({ entityType: val })}
                      options={[
                        { label: "Corporation", value: "Corporation" },
                        { label: "Partnership", value: "Partnership" },
                        { label: "Single Proprietorship", value: "Single Proprietorship" },
                      ]}
                      label="Type of Entity"
                    />
                  </View>
                  <View style={styles.formCol6}>
                    <ValidatedInput
                      label="DTI/SEC Registration No."
                      placeholder="Registration Number"
                      value={activeApplicant.dtiNo}
                      onChangeText={(val) => handleFieldChange("dtiNo", val)}
                      error={errors.dtiNo}
                      touched={touched.dtiNo}
                      required
                    />
                  </View>
                </View>
              </View>

              {/* Address Section */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionHeading}>Address</Text>
                <View style={styles.formGrid}>
                  <View style={styles.formCol6}>
                    <ValidatedInput
                      label="Province"
                      placeholder="Province"
                      value={activeApplicant.province}
                      onChangeText={(val) => handleFieldChange("province", val)}
                      error={errors.province}
                      touched={touched.province}
                      required
                    />
                  </View>
                  <View style={styles.formCol6}>
                    <ValidatedInput
                      label="City"
                      placeholder="City"
                      value={activeApplicant.city}
                      onChangeText={(val) => handleFieldChange("city", val)}
                      error={errors.city}
                      touched={touched.city}
                      required
                    />
                  </View>
                  <View style={styles.formCol6}>
                    <ValidatedInput
                      label="Barangay"
                      placeholder="Barangay"
                      value={activeApplicant.barangay}
                      onChangeText={(val) => handleFieldChange("barangay", val)}
                      error={errors.barangay}
                      touched={touched.barangay}
                      required
                    />
                  </View>
                  <View style={styles.formCol6}>
                    <ValidatedInput
                      label="Street"
                      placeholder="Street"
                      value={activeApplicant.street}
                      onChangeText={(val) => handleFieldChange("street", val)}
                      error={errors.street}
                      touched={touched.street}
                      required
                    />
                  </View>
                  <View style={styles.formCol6}>
                    <ValidatedInput
                      label="Zone / Code"
                      placeholder="Zone"
                      value={activeApplicant.zone}
                      onChangeText={(val) => handleFieldChange("zone", val)}
                      error={errors.zone}
                      touched={touched.zone}
                      required
                    />
                  </View>
                  <View style={styles.formCol6}>
                    <ValidatedInput
                      label="Unit/Bldg No."
                      placeholder="Bldg No"
                      value={activeApplicant.unitBldgNo}
                      onChangeText={(val) => handleFieldChange("unitBldgNo", val)}
                      error={errors.unitBldgNo}
                      touched={touched.unitBldgNo}
                      required
                    />
                  </View>
                  <View style={styles.formCol12}>
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
                </View>
              </View>

              {/* Contact Section */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionHeading}>Contact Details</Text>
                <View style={styles.formGrid}>
                  <View style={styles.formCol6}>
                    <ValidatedInput
                      label="Contact Number"
                      placeholder="e.g. 09171234567"
                      value={activeApplicant.contactNo}
                      onChangeText={(val) => handleFieldChange("contactNo", val)}
                      error={errors.contactNo}
                      touched={touched.contactNo}
                      required
                    />
                  </View>
                  <View style={styles.formCol6}>
                    <ValidatedInput
                      label="Email Address"
                      placeholder="e.g. support@domain.com"
                      value={activeApplicant.email}
                      onChangeText={(val) => handleFieldChange("email", val)}
                      error={errors.email}
                      touched={touched.email}
                      required
                    />
                  </View>
                </View>
              </View>

              {/* Supervising Engineer Section */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionHeading}>Supervising Engineer</Text>
                <View style={styles.formGrid}>
                  <View style={styles.formCol6}>
                    <ValidatedInput
                      label="Engineer Full Name"
                      placeholder="Supervising Engineer Name"
                      value={activeApplicant.engineerName}
                      onChangeText={(val) => handleFieldChange("engineerName", val)}
                      error={errors.engineerName}
                      touched={touched.engineerName}
                      required
                    />
                  </View>
                  <View style={styles.formCol6}>
                    <ValidatedInput
                      label="ECE/PECE License No."
                      placeholder="ECE License Number"
                      value={activeApplicant.eceNo}
                      onChangeText={(val) => handleFieldChange("eceNo", val)}
                      error={errors.eceNo}
                      touched={touched.eceNo}
                      required
                    />
                  </View>
                </View>
              </View>

              {/* Technician Section */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionHeading}>Technician Details</Text>
                <View style={styles.formGrid}>
                  <View style={styles.formCol6}>
                    <ValidatedInput
                      label="Radio Technician Name"
                      placeholder="Technician Name"
                      value={activeApplicant.technicianName}
                      onChangeText={(val) => handleFieldChange("technicianName", val)}
                      error={errors.technicianName}
                      touched={touched.technicianName}
                      required
                    />
                  </View>
                  <View style={styles.formCol6}>
                    <ValidatedInput
                      label="RCT/ECT License No."
                      placeholder="ECT License Number"
                      value={activeApplicant.ectNo}
                      onChangeText={(val) => handleFieldChange("ectNo", val)}
                      error={errors.ectNo}
                      touched={touched.ectNo}
                      required
                    />
                  </View>
                </View>
              </View>

              {/* Expiry Date Section */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionHeading}>Date of Expiry</Text>
                <View style={styles.formGrid}>
                  <View style={styles.formCol6}>
                    <Text style={styles.selectLabel}>Month</Text>
                    <Select
                      value={activeApplicant.expiryMonth}
                      onValueChange={(val) => updateActiveApplicant({ expiryMonth: val })}
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
                  <View style={styles.formCol6}>
                    <Text style={styles.selectLabel}>Date</Text>
                    <Select
                      value={activeApplicant.expiryDate}
                      onValueChange={(val) => updateActiveApplicant({ expiryDate: val })}
                      options={Array.from({ length: 31 }, (_, i) => ({
                        label: (i + 1).toString(),
                        value: (i + 1).toString(),
                      }))}
                    />
                  </View>
                  <View style={styles.formCol12}>
                    <Text style={styles.selectLabel}>Year</Text>
                    <Select
                      value={activeApplicant.expiryYear}
                      onValueChange={(val) => updateActiveApplicant({ expiryYear: val })}
                      options={[
                        { label: "2026", value: "2026" },
                        { label: "2027", value: "2027" },
                        { label: "2028", value: "2028" },
                        { label: "2029", value: "2029" },
                        { label: "2030", value: "2030" },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* STEP 6: Upload Dynamic Requirements */}
        {step === 6 && (
          <View>
            <Text style={[styles.stepSubtitle, { marginBottom: 20 }]}>Upload Mandatory Supporting Documents:</Text>
            {getRequirementsList(activeApplicant.appType).map((_, idx) =>
              renderCPERequirementItem(idx, activeApplicant.appType)
            )}
          </View>
        )}

        {/* STEP 7: Review & Submit */}
        {step === 7 && (
          <View style={{ backgroundColor: COLORS.neutral.white, borderRadius: 12, padding: 16 }}>
            {/* Header: APPLICATION */}
            <View style={{ backgroundColor: "#e2e8f0", paddingVertical: 8, paddingHorizontal: 12, marginBottom: 8, borderRadius: 4 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: COLORS.neutral[700], letterSpacing: 0.5 }}>
                APPLICATION
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginBottom: 4 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 16, fontWeight: "700", color: COLORS.neutral[900] }}>
                Customer Premises Equipment Supplier Accreditation
              </Text>
              <View style={{ backgroundColor: "#dbeafe", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginLeft: 8 }}>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "700", color: COLORS.brand[700] }}>
                  {appMode}
                </Text>
              </View>
            </View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "750", color: COLORS.brand[800], paddingHorizontal: 12, marginBottom: 16 }}>
              {activeApplicant.appType}
            </Text>

            {applicants.map((app, idx) => (
              <View key={app.id} style={{ marginBottom: 24 }}>
                {appMode === "BULK" && (
                  <Text style={{ color: COLORS.brand[700], fontWeight: "750", fontSize: 15, marginHorizontal: 12, marginBottom: 8 }}>
                    Applicant {idx + 1} Details:
                  </Text>
                )}

                {/* Section DETAILS */}
                {renderReviewSectionHeader("DETAILS")}
                {renderReviewRow("No. of years", app.years)}
                {renderReviewRow("Variation", app.variation)}

                {/* Section BASIC INFO */}
                {renderReviewSectionHeader("BASIC INFO")}
                {renderReviewRow("Applicant (Business name)", app.businessName)}

                {/* Section BUSINESS */}
                {renderReviewSectionHeader("BUSINESS")}
                {renderReviewRow("Type of Entity", app.entityType)}
                {renderReviewRow("SEC/DTI Registration No.", app.dtiNo)}

                {/* Section ADDRESS */}
                {renderReviewSectionHeader("ADDRESS")}
                {renderReviewRow("Region", activeRegionObj ? activeRegionObj.name : "N/A")}
                {renderReviewRow("Province", app.province)}
                {renderReviewRow("City", app.city)}
                {renderReviewRow("Barangay", app.barangay)}
                {renderReviewRow("Street/Zone", app.street || app.zone)}
                {renderReviewRow("Unit/Rm/House/Bldg No.", app.unitBldgNo)}
                {renderReviewRow("Zip Code", app.zipCode)}

                {/* Section CONTACT */}
                {renderReviewSectionHeader("CONTACT")}
                {renderReviewRow("Contact Number", app.contactNo)}
                {renderReviewRow("Email Address", app.email)}

                {/* Section SUPERVISING ENGINEER */}
                {renderReviewSectionHeader("SUPERVISING ENGINEER")}
                {renderReviewRow("Name", app.engineerName)}
                {renderReviewRow("PECE/ECE No.", app.eceNo)}
                {renderReviewRow("Date of Expiry", `${app.expiryMonth} ${app.expiryDate}, ${app.expiryYear}`)}

                {/* Section TECHNICIAN */}
                {renderReviewSectionHeader("TECHNICIAN")}
                {renderReviewRow("Name", app.technicianName)}
                {renderReviewRow("Certificate/ECT No.", app.ectNo)}
                {renderReviewRow("Date of Expiry", `${app.expiryMonth} ${app.expiryDate}, ${app.expiryYear}`)}

                {/* Section REGION */}
                {renderReviewSectionHeader("REGION")}
                {renderReviewRow("Region:", activeRegionObj ? activeRegionObj.name : "N/A")}

                {/* Section DOCUMENTS UPLOADED */}
                {renderReviewSectionHeader("DOCUMENTS UPLOADED")}
                {getRequirementsList(app.appType).map((req, reqIdx) => {
                  const fileKey = reqIdx.toString();
                  const filename = app.uploads[fileKey];

                  return (
                    <View key={reqIdx} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingVertical: 12, paddingHorizontal: 12 }}>
                      <View style={{ flex: 1, paddingRight: 24 }}>
                        {renderReviewRequirementText(reqIdx, app.appType)}
                        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "600", color: filename ? COLORS.brand[700] : COLORS.neutral[400], marginTop: 6 }}>
                          {filename || "Not Uploaded"}
                        </Text>
                      </View>

                      {/* Slick Document Icon on right */}
                      <View style={{ width: 40, height: 50, borderWidth: 2, borderColor: filename ? COLORS.brand[700] : COLORS.neutral[300], borderRadius: 6, justifyContent: "center", alignItems: "center", position: "relative", backgroundColor: COLORS.neutral.white }}>
                        <View style={{ position: "absolute", top: -2, right: -2, width: 10, height: 10, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: filename ? COLORS.brand[700] : COLORS.neutral[300], backgroundColor: COLORS.neutral.white, transform: [{ rotate: "45deg" }] }} />
                        <Icon name="file-text" size={16} color={filename ? COLORS.brand[700] : COLORS.neutral[300]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {/* STEP 8: Success View */}
        {step === 8 && (
          <View style={styles.successContainer}>
            <Icon name="check-circle" size={64} color={COLORS.semantic.success} style={styles.successIcon} />
            <Text style={styles.successTitle}>Application Submitted!</Text>
            <Text style={styles.successDesc}>
              Your CPE Supplier Accreditation request has been successfully filed. We will review your attachments and notify you within 3-5 working days.
            </Text>
            <TouchableOpacity onPress={onSuccess} style={styles.successBtn}>
              <Text style={styles.successBtnText}>I'm done!</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Footer controls row */}
      {step < 8 && (
        <View style={styles.footerControls}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>
              {step === 1 ? "Cancel" : "Back"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            disabled={isNextDisabled()}
            style={[
              styles.nextButton,
              isNextDisabled() && styles.nextButtonDisabled,
            ]}
          >
            <Text style={[styles.nextButtonText, isNextDisabled() && styles.nextButtonTextDisabled]}>
              {getNextBtnText()}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Upload Choice Mock Bottom Sheet */}
      <Modal
        visible={isUploadSheetOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsUploadSheetOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: COLORS.neutral.white, width: "90%", maxWidth: 360, borderRadius: 16, overflow: "hidden", padding: 20 }}>

            {/* Upload Icon Header */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <Icon name="upload-cloud" size={32} color={COLORS.brand[700]} />
            </View>

            {/* Option 1: Photo */}
            <TouchableOpacity
              onPress={() => {
                if (activeUploadSlot !== null) {
                  const nextUploads = { ...activeApplicant.uploads };
                  nextUploads[activeUploadSlot] = `Attachment_Photo_${parseInt(activeUploadSlot) + 1}.png`;
                  updateActiveApplicant({ uploads: nextUploads });
                }
                setIsUploadSheetOpen(false);
              }}
              style={{ paddingVertical: 14, alignItems: "center", borderBottomWidth: 1, borderBottomColor: COLORS.neutral[100] }}
            >
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 15, fontWeight: "600", color: COLORS.neutral[800] }}>
                Upload a photo
              </Text>
            </TouchableOpacity>

            {/* Option 2: File */}
            <TouchableOpacity
              onPress={() => {
                if (activeUploadSlot !== null) {
                  const nextUploads = { ...activeApplicant.uploads };
                  nextUploads[activeUploadSlot] = `Attachment_Doc_${parseInt(activeUploadSlot) + 1}.pdf`;
                  updateActiveApplicant({ uploads: nextUploads });
                }
                setIsUploadSheetOpen(false);
              }}
              style={{ paddingVertical: 14, alignItems: "center", borderBottomWidth: 1, borderBottomColor: COLORS.neutral[100] }}
            >
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 15, fontWeight: "600", color: COLORS.neutral[800] }}>
                Upload a file
              </Text>
            </TouchableOpacity>

            {/* Option 3: Cancel */}
            <TouchableOpacity
              onPress={() => setIsUploadSheetOpen(false)}
              style={{ paddingVertical: 14, alignItems: "center", marginTop: 8 }}
            >
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 15, fontWeight: "750", color: COLORS.semantic.error }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
