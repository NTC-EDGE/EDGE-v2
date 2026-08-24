import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import {
  COLORS,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
  Icon as Lucide,
  SkeletonLoader,
  useTheme,
} from "@edge/ui";
import { toast } from "sonner";
import {
  ApplicantItem,
  ApplicationData,
  ApplicationFormAttachment,
} from "../../../../../types/application";
import {
  applicationService,
  storageService,
  ApplicantRequirementItemDto,
  useApplicationFormWithSubmission,
  useAdminServices,
  getServiceVariants,
  ServiceVariant,
} from "@edge/api";
import { isAllowedRequirementFileType } from "../../../../../utils/fileValidation";
import { SectionHeader } from "../common/SectionHeader";
import { InfoRow } from "../common/InfoRow";
import { RequirementDocumentPreviewModal } from "../../modals/RequirementDocumentPreviewModal";

export interface ApplicantRecordTabProps {
  app: ApplicationData;
  selectedApplicantIndex?: number;
  onSelectApplicantIndex?: (index: number) => void;
  updateApplication?: (id: string, patch: Partial<ApplicationData>) => void;
  isEditable?: boolean;
}

export function ApplicantRecordTab({
  app,
  selectedApplicantIndex,
  onSelectApplicantIndex,
  updateApplication,
  isEditable = false,
}: ApplicantRecordTabProps) {
  const { colors, isDark } = useTheme();
  const effectiveApplicants = useMemo(() => {
    if (app.applicantsList && app.applicantsList.length > 0) {
      return app.applicantsList;
    }
    return [
      {
        id: app.id,
        name:
          app.applicant ||
          `${app.basicInfo?.firstName ?? ""} ${app.basicInfo?.lastName ?? ""}`.trim() ||
          "Applicant 1",
        applicantType: "Individual" as const,
        status: "Complete" as const,
        evaluationRemarks: "",
        contactNumber: app.contactDetails?.contactNumber || "",
        email: app.contactDetails?.email || "",
        address:
          typeof app.address === "string"
            ? app.address
            : `${app.address?.city ?? ""}, ${app.address?.province ?? ""}`.trim(),
        barangay: "",
        city: "",
        province: "",
        zipCode: "",
        basicInfo: app.basicInfo
          ? {
              lastName: app.basicInfo.lastName,
              firstName: app.basicInfo.firstName,
              middleName: app.basicInfo.middleName,
              extensionName: app.basicInfo.extensionName,
              dob: app.basicInfo.dob,
              placeOfBirth: app.basicInfo.placeOfBirth,
              sex: app.basicInfo.sex,
              weight: app.basicInfo.weight,
              height: app.basicInfo.height,
              nationality: app.basicInfo.nationality,
              employmentStatus: app.basicInfo.employmentStatus,
              occupation: app.basicInfo.occupation,
            }
          : undefined,
        requirements: app.requirements,
      },
    ];
  }, [app]);

  const [localApplicants, setLocalApplicants] = useState<ApplicantItem[]>(
    effectiveApplicants
  );

  useEffect(() => {
    setLocalApplicants(effectiveApplicants);
  }, [effectiveApplicants]);

  const applicants =
    localApplicants.length > 0 &&
    localApplicants[0]?.id === effectiveApplicants[0]?.id
      ? localApplicants
      : effectiveApplicants;
  const activeIdx = Math.min(
    selectedApplicantIndex ?? 0,
    Math.max(0, applicants.length - 1)
  );
  const activeApplicant = applicants[activeIdx];
  const bi = activeApplicant?.basicInfo;

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingForm, setIsEditingForm] = useState(false);

  const [fnProfileDraft, setFnProfileDraft] = useState("");
  const [lnProfileDraft, setLnProfileDraft] = useState("");
  const [mnProfileDraft, setMnProfileDraft] = useState("");
  const [extProfileDraft, setExtProfileDraft] = useState("");
  const [typeDraft, setTypeDraft] = useState("");
  const [contactDraft, setContactDraft] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [addressDraft, setAddressDraft] = useState("");
  const [zipDraft, setZipDraft] = useState("");
  const [dobDraft, setDobDraft] = useState("");
  const [sexDraft, setSexDraft] = useState("");
  const [nationalityDraft, setNationalityDraft] = useState("");

  const [compNameProfileDraft, setCompNameProfileDraft] = useState("");
  const [compRegNoProfileDraft, setCompRegNoProfileDraft] = useState("");
  const [compAddressProfileDraft, setCompAddressProfileDraft] = useState("");
  const [compContactProfileDraft, setCompContactProfileDraft] = useState("");
  const [compEmailProfileDraft, setCompEmailProfileDraft] = useState("");

  const { services: availableServices = [] } = useAdminServices();
  const [availableVariants, setAvailableVariants] = useState<ServiceVariant[]>([]);
  const [isEditingService, setIsEditingService] = useState(false);
  const [serviceIdDraft, setServiceIdDraft] = useState("");
  const [serviceVariantIdDraft, setServiceVariantIdDraft] = useState("");

  const currentServiceId = isEditingService
    ? serviceIdDraft
    : isEditingProfile
    ? serviceIdDraft
    : activeApplicant?.serviceId;

  useEffect(() => {
    if (!currentServiceId) {
      setAvailableVariants([]);
      return;
    }
    let isMounted = true;
    getServiceVariants(currentServiceId).then((res) => {
      if (isMounted && res && res.data) {
        setAvailableVariants(res.data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentServiceId]);

  const {
    formData,
    isLoading: isLoadingForm,
    refetch: refetchForm,
  } = useApplicationFormWithSubmission(
    app.id,
    activeApplicant?.id,
    activeApplicant?.serviceVariantId
  );
  const [formDraftValues, setFormDraftValues] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (formData) {
      const initialDrafts: Record<string, string> = {};
      formData.sections.forEach((sec) => {
        sec.fields.forEach((f) => {
          initialDrafts[f.fieldId] = f.value ?? "";
        });
      });
      setFormDraftValues(initialDrafts);
    }
  }, [formData]);

  const handleSaveService = async () => {
    const updated = [...localApplicants];
    const currentItem = updated[activeIdx];
    if (currentItem !== undefined) {
      const selectedService = availableServices.find((s) => s.id === serviceIdDraft);
      const selectedVariant = availableVariants.find((v) => v.id === serviceVariantIdDraft);
      updated[activeIdx] = {
        ...currentItem,
        serviceId: serviceIdDraft || currentItem.serviceId,
        serviceName: selectedService?.name || currentItem.serviceName,
        serviceCode: selectedService?.code || currentItem.serviceCode,
        serviceVariantId: serviceVariantIdDraft || currentItem.serviceVariantId,
        serviceVariantName: selectedVariant?.type || currentItem.serviceVariantName,
      };
      setLocalApplicants(updated);
      if (activeApplicant?.id) {
        const [res, err] = await applicationService.adminUpdateApplicant(
          app.id,
          activeApplicant.id,
          {
            serviceId: serviceIdDraft || currentItem.serviceId || undefined,
            serviceVariantId:
              serviceVariantIdDraft || currentItem.serviceVariantId || undefined,
          }
        );

        if (err !== null || !res?.succeeded) {
          notifyError(
            "Update Failed",
            res?.message || "Failed to update service selection."
          );
        } else {
          notifySuccess("Success", "Service selection updated successfully.");
        }
      }
    }
    setIsEditingService(false);
  };

  const handleSaveProfile = async () => {
    const updated = [...localApplicants];
    const currentItem = updated[activeIdx];
    if (currentItem !== undefined) {
      const compiledName = [
        fnProfileDraft,
        mnProfileDraft,
        lnProfileDraft,
        extProfileDraft,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();
      const finalName = compiledName || currentItem.name;
      const selectedService = availableServices.find((s) => s.id === serviceIdDraft);
      const selectedVariant = availableVariants.find((v) => v.id === serviceVariantIdDraft);
      updated[activeIdx] = {
        ...currentItem,
        name: finalName,
        serviceId: serviceIdDraft || currentItem.serviceId,
        serviceName: selectedService?.name || currentItem.serviceName,
        serviceCode: selectedService?.code || currentItem.serviceCode,
        serviceVariantId: serviceVariantIdDraft || currentItem.serviceVariantId,
        serviceVariantName: selectedVariant?.type || currentItem.serviceVariantName,
        applicantType:
          (typeDraft as "Individual" | "Company") || currentItem.applicantType,
        contactNumber: contactDraft || currentItem.contactNumber,
        email: emailDraft || currentItem.email,
        address: addressDraft || currentItem.address,
        zipCode: zipDraft || currentItem.zipCode,
        companyDetails:
          typeDraft === "Company"
            ? {
                name: compNameProfileDraft,
                registrationNumber: compRegNoProfileDraft,
                address: compAddressProfileDraft,
                contactNumber: compContactProfileDraft,
                email: compEmailProfileDraft,
              }
            : currentItem.companyDetails,
        basicInfo: {
          ...(currentItem.basicInfo ?? {
            lastName: "",
            firstName: "",
            middleName: "",
            extensionName: "",
            dob: "",
            placeOfBirth: "",
            sex: "",
            weight: 0,
            height: 0,
            nationality: "",
            employmentStatus: "",
            occupation: "",
          }),
          firstName: fnProfileDraft,
          lastName: lnProfileDraft,
          middleName: mnProfileDraft,
          extensionName: extProfileDraft,
          dob: dobDraft,
          sex: sexDraft,
          nationality: nationalityDraft,
        },
      };
      setLocalApplicants(updated);
      if (activeApplicant?.id) {
        const [res, err] = await applicationService.adminUpdateApplicant(
          app.id,
          activeApplicant.id,
          {
            applicantType: typeDraft || currentItem.applicantType,
            serviceId: serviceIdDraft || currentItem.serviceId || undefined,
            serviceVariantId:
              serviceVariantIdDraft || currentItem.serviceVariantId || undefined,
            details: {
              firstName: fnProfileDraft,
              lastName: lnProfileDraft,
              middleName: mnProfileDraft,
              suffix: extProfileDraft,
              contactNumber: contactDraft || currentItem.contactNumber,
              emailAddress: emailDraft || currentItem.email,
              address: addressDraft || currentItem.address,
              zipCode: zipDraft || currentItem.zipCode,
              dob: dobDraft,
              sex: sexDraft,
              nationality: nationalityDraft,
            },
            company:
              typeDraft === "Company"
                ? {
                    name: compNameProfileDraft,
                    registrationNumber: compRegNoProfileDraft,
                    address: compAddressProfileDraft,
                    contactNumber: compContactProfileDraft,
                    email: compEmailProfileDraft,
                  }
                : undefined,
          }
        );

        if (err !== null || !res?.succeeded) {
          notifyError("Update Failed", res?.message || "Failed to update applicant details.");
        } else {
          notifySuccess("Success", "Applicant details updated successfully.");
        }
      }
    }
    setIsEditingProfile(false);
  };

  const handleSaveFormFields = async () => {
    if (!activeApplicant?.id || !formData) return;

    const payload = formData.sections.flatMap((sec) =>
      sec.fields.map((f) => ({
        fieldId: f.fieldId,
        fieldLabel: f.label,
        value: formDraftValues[f.fieldId] ?? (f.value || ""),
      }))
    );

    const [res] = await applicationService.adminUpdateFormValues(
      app.id,
      activeApplicant.id,
      payload,
      formData.submissionId ?? undefined
    );
    if (res && res.succeeded) {
      setIsEditingForm(false);
      refetchForm();
    }
  };

  const accountableForms = (app.forms || []).filter(
    (f) => f.section === "ACCOUNTABLE FORM"
  );
  const downloadForms = (app.forms || []).filter(
    (f) => f.section === "DOWNLOAD FORM"
  );

  const handleAction = (form: ApplicationFormAttachment, action: string) => {
    Alert.alert(
      `${action} Form`,
      `You are ${action.toLowerCase()}ing: ${form.name}`,
      [{ text: "OK" }]
    );
  };

  const [applicantRequirementsState, setApplicantRequirementsState] = useState<
    ApplicantRequirementItemDto[]
  >([]);
  const [isLoadingRequirements, setIsLoadingRequirements] =
    useState<boolean>(false);
  const [uploadingReqId, setUploadingReqId] = useState<string | null>(null);

  const fetchApplicantRequirements = useCallback(async () => {
    if (
      app?.id === undefined ||
      app?.id === null ||
      activeApplicant?.id === undefined ||
      activeApplicant?.id === null
    ) {
      return;
    }
    setIsLoadingRequirements(true);
    const [res] = await applicationService.getApplicantRequirements(
      app.id,
      activeApplicant.id
    );
    setIsLoadingRequirements(false);
    if (res !== null && res.data !== undefined && res.data !== null) {
      setApplicantRequirementsState(res.data);
    }
  }, [app?.id, activeApplicant?.id]);

  useEffect(() => {
    fetchApplicantRequirements();
  }, [fetchApplicantRequirements]);

  const [localRemarks, setLocalRemarks] = useState(
    activeApplicant?.evaluationRemarks ?? ""
  );

  useEffect(() => {
    setLocalRemarks(activeApplicant?.evaluationRemarks ?? "");
  }, [activeApplicant?.id, activeApplicant?.evaluationRemarks]);

  const handleSetStatus = async (
    idx: number,
    newStatus: "Complete" | "Incomplete" | "ForEndorsement"
  ) => {
    if (!isEditable) return;
    const updated = [...localApplicants];
    const item = updated[idx];
    if (item !== undefined) {
      updated[idx] = { ...item, status: newStatus };
      setLocalApplicants(updated);
      if (updateApplication) {
        updateApplication(app.id, { applicantsList: updated });
      }
      if (item.id) {
        await applicationService.adminUpdateApplicant(app.id, item.id, {
          status: newStatus,
        });
      }
    }
  };

  const handleSetRemarks = async (idx: number, text: string) => {
    if (!isEditable) return;
    const updated = [...localApplicants];
    const item = updated[idx];
    if (item !== undefined) {
      updated[idx] = { ...item, evaluationRemarks: text };
      setLocalApplicants(updated);
      if (updateApplication) {
        updateApplication(app.id, { applicantsList: updated });
      }
      if (item.id) {
        await applicationService.adminUpdateApplicant(app.id, item.id, {
          evaluationRemarks: text,
        });
      }
    }
  };

  const [previewDoc, setPreviewDoc] = useState<{
    visible: boolean;
    title: string;
    fileName?: string;
    fileUrl?: string;
    contentType?: string;
  }>({
    visible: false,
    title: "",
  });

  const handleViewRequirement = (
    label: string,
    fileUrl?: string,
    fileName?: string,
    contentType?: string
  ) => {
    if (fileUrl === undefined || fileUrl === null || fileUrl.trim() === "") {
      notifyError("Preview Unavailable", "No file URL found for this requirement.");
      return;
    }

    setPreviewDoc({
      visible: true,
      title: label,
      fileName,
      fileUrl,
      contentType,
    });
  };

  const notifyError = (title: string, msg: string) => {
    try {
      toast.error(`${title}: ${msg}`);
    } catch {
      // fallback
    }
    Alert.alert(title, msg);
  };

  const notifySuccess = (title: string, msg: string) => {
    try {
      toast.success(`${title}: ${msg}`);
    } catch {
      // fallback
    }
    Alert.alert(title, msg);
  };

  const uploadAndAttachRequirement = async (
    fileData: Blob | File,
    fileName: string,
    reqItem: ApplicantRequirementItemDto
  ) => {
    if (!app?.id || !activeApplicant?.id) return;

    const tenantId = app.tenantId;
    if (!tenantId?.trim()) {
      notifyError(
        "Upload Failed",
        "Tenant ID is missing on current application context."
      );
      return;
    }

    setUploadingReqId(reqItem.requirementId);
    try {
      const [storageRes, storageErr] = await storageService.uploadFile(
        fileData,
        fileName,
        "requirements",
        tenantId
      );

      if (storageErr !== null || !storageRes?.data) {
        const errText =
          typeof storageErr === "object" &&
          storageErr !== null &&
          "message" in storageErr
            ? String((storageErr as { message?: unknown }).message)
            : storageRes?.message ?? "Failed to upload document to storage.";
        notifyError("Upload Failed", errText);
        setUploadingReqId(null);
        return;
      }

      const storedFileId = storageRes.data.id;

      const [reqRes, reqErr] =
        await applicationService.uploadApplicantRequirement(
          app.id,
          activeApplicant.id,
          {
            requirementId: reqItem.requirementId,
            serviceVariantRequirementId:
              reqItem.serviceVariantRequirementId ?? undefined,
            storedFileId: storedFileId,
          }
        );

      setUploadingReqId(null);

      if (reqErr !== null || !reqRes?.succeeded) {
        const errText =
          typeof reqErr === "object" && reqErr !== null && "message" in reqErr
            ? String((reqErr as { message?: unknown }).message)
            : reqRes?.message ?? "Failed to save requirement attachment.";
        notifyError("Save Failed", errText);
        return;
      }

      notifySuccess(
        "Success",
        "Requirement document attached successfully."
      );
      await fetchApplicantRequirements();
    } catch (err: unknown) {
      setUploadingReqId(null);
      const errorMsg =
        err instanceof Error
          ? err.message
          : "An error occurred during file upload.";
      notifyError("Upload Error", errorMsg);
    }
  };

  const handleUploadOrReplaceRequirement = async (
    reqItem: ApplicantRequirementItemDto
  ) => {
    if (!app?.id || !activeApplicant?.id) return;

    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept =
        "image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,application/pdf";

      input.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const files = target.files;
        if (!files || files.length === 0) return;

        const selectedFile = files[0];
        if (!selectedFile) return;

        const fileName = selectedFile.name;
        const mimeType = selectedFile.type;

        if (!isAllowedRequirementFileType(fileName, mimeType)) {
          notifyError(
            "Invalid File Type",
            "Only image files (JPG, PNG, WEBP, GIF, BMP) and PDF documents are allowed."
          );
          return;
        }

        await uploadAndAttachRequirement(
          selectedFile,
          selectedFile.name,
          reqItem
        );
      };

      input.click();
    } else {
      try {
        const DocumentPicker = await import("expo-document-picker");
        const result = await DocumentPicker.getDocumentAsync({
          type: ["image/*", "application/pdf"],
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const selectedAsset = result.assets[0];
          if (!selectedAsset) return;

          const fileName = selectedAsset.name || `doc_${Date.now()}.pdf`;
          const mimeType = selectedAsset.mimeType || "";

          if (!isAllowedRequirementFileType(fileName, mimeType)) {
            notifyError(
              "Invalid File Type",
              "Only image files (JPG, PNG, WEBP, GIF, BMP) and PDF documents are allowed."
            );
            return;
          }

          const response = await fetch(selectedAsset.uri);
          const fileBlob = await response.blob();

          await uploadAndAttachRequirement(
            fileBlob,
            selectedAsset.name || fileName,
            reqItem
          );
        }
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "An error occurred during mobile document selection.";
        notifyError("Upload Error", errorMsg);
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Fixed Sticky Top Applicant Selector Bar for Bulk Applications */}
      {applicants.length > 0 && (
        <View
          style={[
            styles.applicantSelectorBar,
            {
              backgroundColor: isDark ? colors.neutral[900] : colors.brand[50],
              borderColor: isDark ? colors.neutral[700] : colors.brand[200],
              marginTop: SPACING[8],
              marginBottom: SPACING[4],
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 3,
              elevation: 3,
              zIndex: 10,
            },
          ]}
        >
          <Pressable
            disabled={activeIdx === 0}
            onPress={() => onSelectApplicantIndex?.(Math.max(0, activeIdx - 1))}
            style={[styles.selectorNavBtn, activeIdx === 0 && { opacity: 0.3 }]}
          >
            <Lucide
              name="chevron-left"
              size={14}
              color={isDark ? colors.brand[400] : colors.brand[800]}
            />
            <Text
              style={[
                styles.selectorNavBtnText,
                { color: isDark ? colors.brand[400] : colors.brand[800] },
              ]}
            >
              Previous
            </Text>
          </Pressable>

          <View style={styles.selectorCenter}>
            <Lucide
              name="user"
              size={14}
              color={isDark ? colors.brand[400] : colors.brand[800]}
            />
            <Text
              style={[
                styles.selectorTitleText,
                { color: isDark ? colors.neutral[300] : colors.neutral[700] },
              ]}
            >
              Applicant Record {activeIdx + 1} of {applicants.length}:
            </Text>
            <Text
              style={[
                styles.selectorNameText,
                { color: isDark ? colors.brand[300] : colors.brand[900] },
              ]}
            >
              {activeApplicant?.name}
            </Text>
          </View>

          <Pressable
            disabled={activeIdx >= applicants.length - 1}
            onPress={() =>
              onSelectApplicantIndex?.(
                Math.min(applicants.length - 1, activeIdx + 1)
              )
            }
            style={[
              styles.selectorNavBtn,
              activeIdx >= applicants.length - 1 && { opacity: 0.3 },
            ]}
          >
            <Text
              style={[
                styles.selectorNavBtnText,
                { color: isDark ? colors.brand[400] : colors.brand[800] },
              ]}
            >
              Next
            </Text>
            <Lucide
              name="chevron-right"
              size={14}
              color={isDark ? colors.brand[400] : colors.brand[800]}
            />
          </Pressable>
        </View>
      )}

      {/* Scrollable Content Area */}
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Section: Chosen Service & Variant */}
        <SectionHeader
          title="CHOSEN SERVICE & VARIANT"
          rightAction={
            isEditable && activeApplicant ? (
              <View
                style={{ flexDirection: "row", gap: 6, alignItems: "center" }}
              >
                {isEditingService ? (
                  <>
                    <Pressable
                      style={[
                        styles.inspectBtn,
                        {
                          backgroundColor: isDark
                            ? colors.neutral[700]
                            : colors.neutral[300],
                          paddingHorizontal: 10,
                        },
                      ]}
                      onPress={() => setIsEditingService(false)}
                    >
                      <Text
                        style={[
                          styles.inspectBtnText,
                          {
                            color: isDark
                              ? colors.neutral[200]
                              : colors.neutral[800],
                          },
                        ]}
                      >
                        Cancel
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.inspectBtn,
                        {
                          backgroundColor: isDark
                            ? colors.brand[500]
                            : colors.brand[700],
                          paddingHorizontal: 12,
                        },
                      ]}
                      onPress={handleSaveService}
                    >
                      <Text
                        style={[
                          styles.inspectBtnText,
                          { color: COLORS.neutral.white, fontWeight: "700" },
                        ]}
                      >
                        Save
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <Pressable
                    style={[
                      styles.inspectBtn,
                      {
                        backgroundColor: isDark
                          ? colors.brand[600]
                          : colors.brand[700],
                        paddingHorizontal: 10,
                      },
                    ]}
                    onPress={() => {
                      setServiceIdDraft(activeApplicant.serviceId || "");
                      setServiceVariantIdDraft(activeApplicant.serviceVariantId || "");
                      setIsEditingService(true);
                    }}
                  >
                    <Text
                      style={[
                        styles.inspectBtnText,
                        { color: COLORS.neutral.white },
                      ]}
                    >
                      Edit
                    </Text>
                  </Pressable>
                )}
              </View>
            ) : null
          }
        />
        <View style={styles.infoBlock}>
          {/* Chosen Service */}
          <View
            style={[
              styles.accountTypeRow,
              {
                borderBottomColor: isDark
                  ? colors.neutral[800]
                  : colors.neutral[100],
              },
            ]}
          >
            <Text
              style={[
                styles.accountTypeLabel,
                {
                  color: isDark ? colors.neutral[400] : colors.neutral[500],
                },
              ]}
            >
              Chosen Service:
            </Text>
            {isEditingService ? (
              <View style={{ flex: 1, maxWidth: 360 }}>
                {Platform.OS === "web" ? (
                  <View
                    style={[
                      styles.selectDropdownContainer,
                      {
                        borderColor: isDark
                          ? colors.neutral[700]
                          : colors.neutral[300],
                        backgroundColor: isDark
                          ? colors.neutral[900]
                          : colors.neutral[50],
                      },
                    ]}
                  >
                    <select
                      value={serviceIdDraft}
                      onChange={(e) => {
                        setServiceIdDraft(e.target.value);
                        setServiceVariantIdDraft("");
                      }}
                      style={{
                        width: "100%",
                        padding: "7px 30px 7px 10px",
                        fontSize: "13px",
                        fontFamily: "inherit",
                        color: isDark
                          ? colors.neutral[100]
                          : colors.neutral[900],
                        backgroundColor: "transparent",
                        border: "none",
                        outline: "none",
                        cursor: "pointer",
                        appearance: "none",
                        WebkitAppearance: "none",
                      }}
                    >
                      <option
                        value=""
                        style={{
                          backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                          color: isDark ? "#94A3B8" : "#64748B",
                        }}
                      >
                        -- Select Service --
                      </option>
                      {availableServices.map((svc) => (
                        <option
                          key={svc.id}
                          value={svc.id}
                          style={{
                            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                            color: isDark ? "#F8FAFC" : "#0F172A",
                          }}
                        >
                          {svc.code ? `[${svc.code}] ` : ""}{svc.name}
                        </option>
                      ))}
                    </select>
                    <View
                      pointerEvents="none"
                      style={styles.selectDropdownChevron}
                    >
                      <Lucide
                        name="chevron-down"
                        size={14}
                        color={
                          isDark ? colors.neutral[400] : colors.neutral[500]
                        }
                      />
                    </View>
                  </View>
                ) : (
                  <TextInput
                    style={[
                      styles.editInput,
                      {
                        color: isDark
                          ? colors.neutral[100]
                          : colors.neutral[900],
                        backgroundColor: isDark
                          ? colors.neutral[900]
                          : colors.neutral[50],
                        borderColor: colors.brand[500],
                        minWidth: 200,
                      },
                    ]}
                    value={serviceIdDraft}
                    placeholder="Service ID"
                    onChangeText={(val) => {
                      setServiceIdDraft(val);
                      setServiceVariantIdDraft("");
                    }}
                  />
                )}
              </View>
            ) : (
              <Text
                style={[
                  styles.accountTypeValue,
                  {
                    color: isDark
                      ? colors.neutral[100]
                      : colors.neutral[900],
                  },
                ]}
              >
                {activeApplicant?.serviceName ||
                  (activeApplicant?.serviceId
                    ? availableServices.find(
                        (s) => s.id === activeApplicant.serviceId
                      )?.name ?? activeApplicant.serviceId
                    : app.serviceName) ||
                  "—"}
              </Text>
            )}
          </View>

          {/* Chosen Service Variant */}
          <View
            style={[
              styles.accountTypeRow,
              {
                borderBottomColor: isDark
                  ? colors.neutral[800]
                  : colors.neutral[100],
              },
            ]}
          >
            <Text
              style={[
                styles.accountTypeLabel,
                {
                  color: isDark ? colors.neutral[400] : colors.neutral[500],
                },
              ]}
            >
              Chosen Variant:
            </Text>
            {isEditingService ? (
              <View style={{ flex: 1, maxWidth: 360 }}>
                {Platform.OS === "web" ? (
                  <View
                    style={[
                      styles.selectDropdownContainer,
                      {
                        borderColor: isDark
                          ? colors.neutral[700]
                          : colors.neutral[300],
                        backgroundColor: isDark
                          ? colors.neutral[900]
                          : colors.neutral[50],
                        opacity:
                          !serviceIdDraft && availableVariants.length === 0
                            ? 0.6
                            : 1,
                      },
                    ]}
                  >
                    <select
                      value={serviceVariantIdDraft}
                      onChange={(e) => setServiceVariantIdDraft(e.target.value)}
                      disabled={
                        !serviceIdDraft && availableVariants.length === 0
                      }
                      style={{
                        width: "100%",
                        padding: "7px 30px 7px 10px",
                        fontSize: "13px",
                        fontFamily: "inherit",
                        color: isDark
                          ? colors.neutral[100]
                          : colors.neutral[900],
                        backgroundColor: "transparent",
                        border: "none",
                        outline: "none",
                        cursor:
                          !serviceIdDraft && availableVariants.length === 0
                            ? "not-allowed"
                            : "pointer",
                        appearance: "none",
                        WebkitAppearance: "none",
                      }}
                    >
                      <option
                        value=""
                        style={{
                          backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                          color: isDark ? "#94A3B8" : "#64748B",
                        }}
                      >
                        {!serviceIdDraft
                          ? "-- Select a Service First --"
                          : availableVariants.length === 0
                          ? "-- No Variants Available --"
                          : "-- Select Variant --"}
                      </option>
                      {availableVariants.map((v) => (
                        <option
                          key={v.id}
                          value={v.id}
                          style={{
                            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                            color: isDark ? "#F8FAFC" : "#0F172A",
                          }}
                        >
                          {v.type}
                          {v.description ? ` (${v.description})` : ""}
                        </option>
                      ))}
                    </select>
                    <View
                      pointerEvents="none"
                      style={styles.selectDropdownChevron}
                    >
                      <Lucide
                        name="chevron-down"
                        size={14}
                        color={
                          isDark ? colors.neutral[400] : colors.neutral[500]
                        }
                      />
                    </View>
                  </View>
                ) : (
                  <TextInput
                    style={[
                      styles.editInput,
                      {
                        color: isDark
                          ? colors.neutral[100]
                          : colors.neutral[900],
                        backgroundColor: isDark
                          ? colors.neutral[900]
                          : colors.neutral[50],
                        borderColor: colors.brand[500],
                        minWidth: 200,
                      },
                    ]}
                    value={serviceVariantIdDraft}
                    placeholder="Variant ID"
                    onChangeText={setServiceVariantIdDraft}
                  />
                )}
              </View>
            ) : (
              <Text
                style={[
                  styles.accountTypeValue,
                  {
                    color: isDark
                      ? colors.neutral[100]
                      : colors.neutral[900],
                  },
                ]}
              >
                {activeApplicant?.serviceVariantName ||
                  (activeApplicant?.serviceVariantId
                    ? availableVariants.find(
                        (v) => v.id === activeApplicant.serviceVariantId
                      )?.type ?? activeApplicant.serviceVariantId
                    : app.applicationDetails?.formType) ||
                  "—"}
              </Text>
            )}
          </View>
        </View>

        {/* Section 1: Personal & Profile Info */}
        <SectionHeader
          title={
            activeApplicant
              ? `1. APPLICANT PROFILE DETAILS (${activeApplicant.name.toUpperCase()})`
              : "APPLICATION FORM"
          }
          rightAction={
            isEditable && activeApplicant ? (
              <View
                style={{ flexDirection: "row", gap: 6, alignItems: "center" }}
              >
                {isEditingProfile ? (
                  <>
                    <Pressable
                      style={[
                        styles.inspectBtn,
                        {
                          backgroundColor: isDark
                            ? colors.neutral[700]
                            : colors.neutral[300],
                          paddingHorizontal: 10,
                        },
                      ]}
                      onPress={() => setIsEditingProfile(false)}
                    >
                      <Text
                        style={[
                          styles.inspectBtnText,
                          {
                            color: isDark
                              ? colors.neutral[200]
                              : colors.neutral[800],
                          },
                        ]}
                      >
                        Cancel
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.inspectBtn,
                        {
                          backgroundColor: isDark
                            ? colors.brand[500]
                            : colors.brand[700],
                          paddingHorizontal: 12,
                        },
                      ]}
                      onPress={handleSaveProfile}
                    >
                      <Text
                        style={[
                          styles.inspectBtnText,
                          { color: COLORS.neutral.white, fontWeight: "700" },
                        ]}
                      >
                        Save
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <Pressable
                    style={[
                      styles.inspectBtn,
                      {
                        backgroundColor: isDark
                          ? colors.brand[600]
                          : colors.brand[700],
                        paddingHorizontal: 10,
                      },
                    ]}
                    onPress={() => {
                      const biData = activeApplicant.basicInfo;
                      if (biData?.firstName || biData?.lastName) {
                        setFnProfileDraft(biData.firstName || "");
                        setLnProfileDraft(biData.lastName || "");
                        setMnProfileDraft(biData.middleName || "");
                        setExtProfileDraft(biData.extensionName || "");
                      } else {
                        const parts = activeApplicant.name.trim().split(/\s+/);
                        const firstName = parts[0] || "";
                        const lastName =
                          parts.length > 1 ? parts.slice(1).join(" ") : "";
                        setFnProfileDraft(firstName);
                        setLnProfileDraft(lastName);
                        setMnProfileDraft("");
                        setExtProfileDraft("");
                      }
                      setTypeDraft(activeApplicant.applicantType);
                      setContactDraft(activeApplicant.contactNumber || "");
                      setEmailDraft(activeApplicant.email || "");
                      setAddressDraft(activeApplicant.address || "");
                      setZipDraft(activeApplicant.zipCode || "");
                      setDobDraft(biData?.dob || "");
                      setSexDraft(biData?.sex || "");
                      setNationalityDraft(biData?.nationality || "");
                      const compData = activeApplicant.companyDetails;
                      setCompNameProfileDraft(
                        compData?.name ||
                          app.companyDetails?.name ||
                          app.filingUser?.company?.name ||
                          ""
                      );
                      setCompRegNoProfileDraft(
                        compData?.registrationNumber ||
                          app.companyDetails?.registrationNumber ||
                          app.filingUser?.company?.registrationNumber ||
                          ""
                      );
                      setCompAddressProfileDraft(
                        compData?.address ||
                          app.companyDetails?.address ||
                          app.filingUser?.company?.address ||
                          ""
                      );
                      setCompContactProfileDraft(
                        compData?.contactNumber ||
                          app.companyDetails?.contactNumber ||
                          app.filingUser?.company?.contactNumber ||
                          ""
                      );
                      setCompEmailProfileDraft(
                        compData?.email ||
                          app.companyDetails?.email ||
                          app.filingUser?.company?.email ||
                          ""
                      );
                      setServiceIdDraft(activeApplicant.serviceId || "");
                      setServiceVariantIdDraft(activeApplicant.serviceVariantId || "");
                      setIsEditingProfile(true);
                    }}
                  >
                    <Text
                      style={[
                        styles.inspectBtnText,
                        { color: COLORS.neutral.white },
                      ]}
                    >
                      Edit
                    </Text>
                  </Pressable>
                )}
              </View>
            ) : null
          }
        />
        <View style={styles.infoBlock}>
          {activeApplicant ? (
            <>
              {isEditingProfile ? (
                <>
                  <InfoRow
                    label="First Name:"
                    value={bi?.firstName || ""}
                    isEditing={true}
                    editValue={fnProfileDraft}
                    onEditChange={setFnProfileDraft}
                  />
                  <InfoRow
                    label="Middle Name:"
                    value={bi?.middleName || ""}
                    isEditing={true}
                    editValue={mnProfileDraft}
                    onEditChange={setMnProfileDraft}
                  />
                  <InfoRow
                    label="Last Name:"
                    value={bi?.lastName || ""}
                    isEditing={true}
                    editValue={lnProfileDraft}
                    onEditChange={setLnProfileDraft}
                  />
                  <InfoRow
                    label="Suffix:"
                    value={bi?.extensionName || ""}
                    isEditing={true}
                    editValue={extProfileDraft}
                    onEditChange={setExtProfileDraft}
                  />
                </>
              ) : (
                <InfoRow
                  label="Full Name:"
                  value={activeApplicant.name}
                  isEditing={false}
                />
              )}
              <View
                style={[
                  styles.accountTypeRow,
                  {
                    borderBottomColor: isDark
                      ? colors.neutral[800]
                      : colors.neutral[100],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.accountTypeLabel,
                    {
                      color: isDark ? colors.neutral[400] : colors.neutral[500],
                    },
                  ]}
                >
                  Applicant Type:
                </Text>
                {isEditingProfile ? (
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <Pressable
                      style={{
                        backgroundColor:
                          typeDraft === "Individual"
                            ? isDark
                              ? colors.brand[500]
                              : colors.brand[700]
                            : isDark
                            ? colors.neutral[800]
                            : colors.neutral[100],
                        borderColor: isDark
                          ? colors.brand[500]
                          : colors.brand[600],
                        borderWidth: 1,
                        paddingHorizontal: 16,
                        paddingVertical: 6,
                        borderRadius: RADIUS.button,
                      }}
                      onPress={() => setTypeDraft("Individual")}
                    >
                      <Text
                        style={{
                          color:
                            typeDraft === "Individual"
                              ? COLORS.neutral.white
                              : isDark
                              ? colors.neutral[300]
                              : colors.neutral[700],
                          fontWeight: "600",
                          fontSize: TYPOGRAPHY.sizes.body,
                        }}
                      >
                        Individual
                      </Text>
                    </Pressable>
                    <Pressable
                      style={{
                        backgroundColor:
                          typeDraft === "Company"
                            ? isDark
                              ? colors.brand[500]
                              : colors.brand[700]
                            : isDark
                            ? colors.neutral[800]
                            : colors.neutral[100],
                        borderColor: isDark
                          ? colors.brand[500]
                          : colors.brand[600],
                        borderWidth: 1,
                        paddingHorizontal: 16,
                        paddingVertical: 6,
                        borderRadius: RADIUS.button,
                      }}
                      onPress={() => setTypeDraft("Company")}
                    >
                      <Text
                        style={{
                          color:
                            typeDraft === "Company"
                              ? COLORS.neutral.white
                              : isDark
                              ? colors.neutral[300]
                              : colors.neutral[700],
                          fontWeight: "600",
                          fontSize: TYPOGRAPHY.sizes.body,
                        }}
                      >
                        Company
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.accountTypeValue,
                      {
                        color: isDark
                          ? colors.neutral[100]
                          : colors.neutral[900],
                      },
                    ]}
                  >
                    {activeApplicant.applicantType}
                  </Text>
                )}
              </View>

              {(isEditingProfile
                ? typeDraft === "Company"
                : activeApplicant.applicantType === "Company") && (
                <>
                  <InfoRow
                    label="Company Name:"
                    value={
                      activeApplicant.companyDetails?.name ??
                      app.companyDetails?.name ??
                      app.filingUser?.company?.name ??
                      "—"
                    }
                    isEditing={isEditingProfile}
                    editValue={compNameProfileDraft}
                    onEditChange={setCompNameProfileDraft}
                  />
                  <InfoRow
                    label="Company Reg No:"
                    value={
                      activeApplicant.companyDetails?.registrationNumber ??
                      app.companyDetails?.registrationNumber ??
                      app.filingUser?.company?.registrationNumber ??
                      "—"
                    }
                    isEditing={isEditingProfile}
                    editValue={compRegNoProfileDraft}
                    onEditChange={setCompRegNoProfileDraft}
                  />
                  <InfoRow
                    label="Company Address:"
                    value={
                      activeApplicant.companyDetails?.address ??
                      app.companyDetails?.address ??
                      app.filingUser?.company?.address ??
                      "—"
                    }
                    isEditing={isEditingProfile}
                    editValue={compAddressProfileDraft}
                    onEditChange={setCompAddressProfileDraft}
                  />
                  <InfoRow
                    label="Company Contact:"
                    value={
                      activeApplicant.companyDetails?.contactNumber ??
                      app.companyDetails?.contactNumber ??
                      app.filingUser?.company?.contactNumber ??
                      "—"
                    }
                    isEditing={isEditingProfile}
                    editValue={compContactProfileDraft}
                    onEditChange={setCompContactProfileDraft}
                  />
                  <InfoRow
                    label="Company Email:"
                    value={
                      activeApplicant.companyDetails?.email ??
                      app.companyDetails?.email ??
                      app.filingUser?.company?.email ??
                      "—"
                    }
                    isEditing={isEditingProfile}
                    editValue={compEmailProfileDraft}
                    onEditChange={setCompEmailProfileDraft}
                  />
                </>
              )}
              <InfoRow
                label="Contact Number:"
                value={activeApplicant.contactNumber || "—"}
                isEditing={isEditingProfile}
                editValue={contactDraft}
                onEditChange={setContactDraft}
              />
              <InfoRow
                label="Email Address:"
                value={activeApplicant.email || "—"}
                isEditing={isEditingProfile}
                editValue={emailDraft}
                onEditChange={setEmailDraft}
              />
              <InfoRow
                label="Address / Barangay:"
                value={activeApplicant.address || "—"}
                isEditing={isEditingProfile}
                editValue={addressDraft}
                onEditChange={setAddressDraft}
              />
              <InfoRow
                label="Zip Code:"
                value={activeApplicant.zipCode || "—"}
                isEditing={isEditingProfile}
                editValue={zipDraft}
                onEditChange={setZipDraft}
              />
              <InfoRow
                label="Date of Birth:"
                value={bi?.dob || "—"}
                isEditing={isEditingProfile}
                editValue={dobDraft}
                onEditChange={setDobDraft}
              />
              <InfoRow
                label="Sex:"
                value={bi?.sex || "—"}
                isEditing={isEditingProfile}
                editValue={sexDraft}
                onEditChange={setSexDraft}
              />
              <InfoRow
                label="Nationality:"
                value={bi?.nationality || "—"}
                isEditing={isEditingProfile}
                editValue={nationalityDraft}
                onEditChange={setNationalityDraft}
              />
              {bi ? (
                <>
                  {bi.height > 0 ? (
                    <InfoRow label="Height:" value={`${bi.height} cm`} />
                  ) : null}
                  {bi.weight > 0 ? (
                    <InfoRow label="Weight:" value={`${bi.weight} kg`} />
                  ) : null}
                </>
              ) : null}
            </>
          ) : (
            <>
              <Text
                style={[
                  styles.submittedText,
                  {
                    color: isDark ? colors.neutral[500] : colors.neutral[400],
                  },
                ]}
              >
                {app.applicationDetails.submittedAt}
              </Text>
              <Text
                style={[
                  styles.permitCategoryText,
                  {
                    color: isDark ? colors.neutral[100] : colors.neutral[900],
                  },
                ]}
              >
                {app.serviceName}
              </Text>
              <Text
                style={[
                  styles.formTypeText,
                  {
                    color: isDark ? colors.neutral[400] : colors.neutral[500],
                  },
                ]}
              >
                {app.applicationDetails.formType}
              </Text>
            </>
          )}
        </View>

        {/* Section 2: Completed Service Form Submissions */}
        <SectionHeader
          title="2. COMPLETED SERVICE FORM SUBMISSIONS"
          rightAction={
            isEditable && formData && formData.sections.length > 0 ? (
              <View
                style={{ flexDirection: "row", gap: 6, alignItems: "center" }}
              >
                {isEditingForm ? (
                  <>
                    <Pressable
                      style={[
                        styles.inspectBtn,
                        {
                          backgroundColor: isDark
                            ? colors.neutral[700]
                            : colors.neutral[300],
                          paddingHorizontal: 10,
                        },
                      ]}
                      onPress={() => setIsEditingForm(false)}
                    >
                      <Text
                        style={[
                          styles.inspectBtnText,
                          {
                            color: isDark
                              ? colors.neutral[200]
                              : colors.neutral[800],
                          },
                        ]}
                      >
                        Cancel
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.inspectBtn,
                        {
                          backgroundColor: isDark
                            ? colors.brand[500]
                            : colors.brand[700],
                          paddingHorizontal: 12,
                        },
                      ]}
                      onPress={handleSaveFormFields}
                    >
                      <Text
                        style={[
                          styles.inspectBtnText,
                          { color: COLORS.neutral.white, fontWeight: "700" },
                        ]}
                      >
                        Save
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <Pressable
                    style={[
                      styles.inspectBtn,
                      {
                        backgroundColor: isDark
                          ? colors.brand[600]
                          : colors.brand[700],
                        paddingHorizontal: 10,
                      },
                    ]}
                    onPress={() => setIsEditingForm(true)}
                  >
                    <Text
                      style={[
                        styles.inspectBtnText,
                        { color: COLORS.neutral.white },
                      ]}
                    >
                      Edit
                    </Text>
                  </Pressable>
                )}
              </View>
            ) : null
          }
        />
        <View style={styles.infoBlock}>
          {isLoadingForm ? (
            <View style={{ padding: 16, alignItems: "center" }}>
              <Text
                style={{
                  color: isDark ? colors.neutral[400] : colors.neutral[600],
                  fontSize: 13,
                }}
              >
                Loading form submission...
              </Text>
            </View>
          ) : formData && formData.sections.length > 0 ? (
            formData.sections.map((sec) => (
              <View key={sec.key} style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: isDark ? colors.brand[400] : colors.brand[600],
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {sec.title}
                </Text>
                {sec.fields.map((ff) => (
                  <InfoRow
                    key={ff.fieldId}
                    label={`${ff.label}:`}
                    value={ff.value || "—"}
                    isEditing={isEditingForm}
                    editValue={formDraftValues[ff.fieldId] ?? ""}
                    onEditChange={(newVal) => {
                      setFormDraftValues((prev) => ({
                        ...prev,
                        [ff.fieldId]: newVal,
                      }));
                    }}
                  />
                ))}
              </View>
            ))
          ) : (
            <View style={styles.emptyReqs}>
              <Lucide
                name="file-text"
                size={24}
                color={isDark ? colors.neutral[600] : colors.neutral[300]}
              />
              <Text
                style={[
                  styles.emptyReqsText,
                  { color: isDark ? colors.neutral[500] : colors.neutral[400] },
                ]}
              >
                No service form field submissions recorded
              </Text>
            </View>
          )}
        </View>

        {/* Section 3: Requirements & Submitted Documents per Applicant */}
        <SectionHeader title="3. SUBMITTED REQUIREMENTS & DOCUMENT ATTACHMENTS" />
        <View style={styles.infoBlock}>
          {isLoadingRequirements ? (
            <View style={{ padding: SPACING[4] }}>
              <SkeletonLoader height={24} style={{ marginBottom: 8 }} />
              <SkeletonLoader height={24} style={{ marginBottom: 8 }} />
            </View>
          ) : applicantRequirementsState.length === 0 ? (
            <View style={styles.emptyReqs}>
              <Lucide
                name="folder"
                size={24}
                color={isDark ? colors.neutral[600] : colors.neutral[300]}
              />
              <Text
                style={[
                  styles.emptyReqsText,
                  { color: isDark ? colors.neutral[500] : colors.neutral[400] },
                ]}
              >
                No requirement documents configured or submitted
              </Text>
            </View>
          ) : (
            applicantRequirementsState.map((reqItem) => {
              const isAttached =
                reqItem.submittedRequirementId !== undefined &&
                reqItem.submittedRequirementId !== null;
              const isUploading = uploadingReqId === reqItem.requirementId;

              return (
                <View
                  key={reqItem.requirementId}
                  style={[
                    styles.reqItem,
                    {
                      borderBottomColor: isDark
                        ? colors.neutral[800]
                        : colors.neutral[100],
                    },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={[
                        styles.reqLabel,
                        {
                          color: isDark
                            ? colors.neutral[100]
                            : colors.neutral[900],
                        },
                      ]}
                    >
                      {reqItem.requirementName}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 6 }}>
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 4,
                          backgroundColor: reqItem.isRequired
                            ? isDark
                              ? "rgba(239, 68, 68, 0.2)"
                              : "#FEE2E2"
                            : isDark
                            ? colors.neutral[800]
                            : colors.neutral[100],
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "700",
                            color: reqItem.isRequired
                              ? "#EF4444"
                              : isDark
                              ? colors.neutral[400]
                              : colors.neutral[600],
                          }}
                        >
                          {reqItem.isRequired ? "REQUIRED" : "OPTIONAL"}
                        </Text>
                      </View>
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 4,
                          backgroundColor: isAttached
                            ? isDark
                              ? "rgba(34, 197, 94, 0.2)"
                              : "#DCFCE7"
                            : isDark
                            ? "rgba(234, 179, 8, 0.2)"
                            : "#FEF9C3",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "700",
                            color: isAttached
                              ? "#22C55E"
                              : isDark
                              ? "#EAB308"
                              : "#CA8A04",
                          }}
                        >
                          {isAttached ? "ATTACHED" : "PENDING"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {reqItem.description !== undefined &&
                    reqItem.description !== null &&
                    reqItem.description.length > 0 && (
                      <Text
                        style={[
                          styles.reqNote,
                          {
                            color: isDark
                              ? colors.neutral[400]
                              : colors.neutral[500],
                            marginBottom: 8,
                          },
                        ]}
                      >
                        {reqItem.description}
                      </Text>
                    )}

                  <View style={styles.reqFileRow}>
                    <Lucide
                      name={
                        reqItem.contentType?.includes("pdf") ||
                        reqItem.fileName?.endsWith(".pdf")
                          ? "file-text"
                          : "image"
                      }
                      size={14}
                      color={isDark ? colors.brand[400] : colors.brand[700]}
                    />
                    <Text
                      style={[
                        styles.reqFilename,
                        {
                          color: isDark
                            ? colors.neutral[300]
                            : colors.neutral[700],
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {reqItem.fileName || "No document file attached"}
                    </Text>
                    {isAttached &&
                      reqItem.url !== undefined &&
                      reqItem.url !== null && (
                        <Pressable
                          onPress={() =>
                            handleViewRequirement(
                              reqItem.requirementName,
                              reqItem.url ?? undefined,
                              reqItem.fileName ?? undefined,
                              reqItem.contentType ?? undefined
                            )
                          }
                        >
                          <Text
                            style={[
                              styles.reqViewLink,
                              {
                                color: isDark
                                  ? colors.brand[400]
                                  : colors.brand[700],
                              },
                            ]}
                          >
                            View Document
                          </Text>
                        </Pressable>
                      )}
                    {isEditable && (
                      <Pressable
                        disabled={isUploading}
                        onPress={() =>
                          handleUploadOrReplaceRequirement(reqItem)
                        }
                        style={{
                          marginLeft: 12,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: RADIUS.sm,
                          backgroundColor: isDark
                            ? colors.brand[900]
                            : colors.brand[50],
                          borderWidth: 1,
                          borderColor: isDark
                            ? colors.brand[700]
                            : colors.brand[200],
                          opacity: isUploading ? 0.6 : 1,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: isDark
                              ? colors.brand[300]
                              : colors.brand[700],
                          }}
                        >
                          {isUploading
                            ? "Uploading..."
                            : isAttached
                            ? "Replace File"
                            : "Upload File"}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Accountable Form */}
        {accountableForms.length > 0 && (
          <>
            <SectionHeader title="ACCOUNTABLE FORM" />
            <View style={styles.infoBlock}>
              {accountableForms.map((form) => (
                <View
                  key={form.name}
                  style={[
                    styles.formCard,
                    {
                      borderBottomColor: isDark
                        ? colors.neutral[800]
                        : colors.neutral[100],
                      borderLeftColor: isDark
                        ? colors.brand[500]
                        : colors.brand[700],
                      backgroundColor: isDark
                        ? colors.neutral[800]
                        : COLORS.neutral.white,
                    },
                  ]}
                >
                  <View style={styles.formCardLeft}>
                    <View
                      style={[
                        styles.formDocIcon,
                        {
                          backgroundColor: isDark
                            ? colors.neutral[800]
                            : "#EFF6FF",
                        },
                      ]}
                    >
                      <Lucide
                        name="file-text"
                        size={18}
                        color={isDark ? colors.brand[500] : COLORS.brand[700]}
                      />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.formDocLabel,
                          {
                            color: isDark
                              ? colors.neutral[500]
                              : colors.neutral[400],
                          },
                        ]}
                      >
                        DOCUMENT ATTACHMENT
                      </Text>
                      <Text
                        style={[
                          styles.formDocName,
                          {
                            color: isDark
                              ? colors.neutral[100]
                              : colors.neutral[900],
                          },
                        ]}
                      >
                        {form.name}
                      </Text>
                      <View style={styles.formActions}>
                        {form.canView && (
                          <Pressable onPress={() => handleAction(form, "View")}>
                            <Text
                              style={[
                                styles.formActionLink,
                                {
                                  color: isDark
                                    ? colors.brand[500]
                                    : colors.brand[700],
                                },
                              ]}
                            >
                              View
                            </Text>
                          </Pressable>
                        )}
                        {form.canPrint && (
                          <Pressable
                            onPress={() => handleAction(form, "Print")}
                          >
                            <Text
                              style={[
                                styles.formActionLink,
                                {
                                  color: isDark
                                    ? colors.brand[500]
                                    : colors.brand[700],
                                },
                              ]}
                            >
                              Print
                            </Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </View>
                  {form.canDownload && (
                    <Pressable
                      style={[
                        styles.downloadBtn,
                        {
                          borderColor: isDark
                            ? colors.neutral[700]
                            : colors.neutral[200],
                        },
                      ]}
                      onPress={() => handleAction(form, "Download")}
                    >
                      <Lucide
                        name="download"
                        size={14}
                        color={
                          isDark ? colors.neutral[400] : colors.neutral[600]
                        }
                      />
                      <Text
                        style={[
                          styles.downloadBtnText,
                          {
                            color: isDark
                              ? colors.neutral[300]
                              : colors.neutral[600],
                          },
                        ]}
                      >
                        Download
                      </Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Download Form */}
        {downloadForms.length > 0 && (
          <>
            <SectionHeader title="DOWNLOAD FORM" />
            <View style={styles.infoBlock}>
              {downloadForms.map((form) => (
                <View
                  key={form.name}
                  style={[
                    styles.formCard,
                    {
                      borderBottomColor: isDark
                        ? colors.neutral[800]
                        : colors.neutral[100],
                      borderLeftColor: isDark
                        ? colors.brand[500]
                        : colors.brand[700],
                      backgroundColor: isDark
                        ? colors.neutral[800]
                        : COLORS.neutral.white,
                    },
                  ]}
                >
                  <View style={styles.formCardLeft}>
                    <View
                      style={[
                        styles.formDocIcon,
                        {
                          backgroundColor: isDark
                            ? colors.neutral[800]
                            : "#EFF6FF",
                        },
                      ]}
                    >
                      <Lucide
                        name="file-text"
                        size={18}
                        color={isDark ? colors.brand[500] : COLORS.brand[700]}
                      />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.formDocLabel,
                          {
                            color: isDark
                              ? colors.neutral[500]
                              : colors.neutral[400],
                          },
                        ]}
                      >
                        DOCUMENT ATTACHMENT
                      </Text>
                      <Text
                        style={[
                          styles.formDocName,
                          {
                            color: isDark
                              ? colors.neutral[100]
                              : colors.neutral[900],
                          },
                        ]}
                      >
                        {form.name}
                      </Text>
                      <View style={styles.formActions}>
                        {form.canView && (
                          <Pressable onPress={() => handleAction(form, "View")}>
                            <Text
                              style={[
                                styles.formActionLink,
                                {
                                  color: isDark
                                    ? colors.brand[500]
                                    : colors.brand[700],
                                },
                              ]}
                            >
                              View
                            </Text>
                          </Pressable>
                        )}
                        {form.canPrint && (
                          <Pressable
                            onPress={() => handleAction(form, "Print")}
                          >
                            <Text
                              style={[
                                styles.formActionLink,
                                {
                                  color: isDark
                                    ? colors.brand[500]
                                    : colors.brand[700],
                                },
                              ]}
                            >
                              Print
                            </Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.formBtnGroup}>
                    {form.canDownload && (
                      <Pressable
                        style={[
                          styles.downloadBtn,
                          {
                            borderColor: isDark
                              ? colors.neutral[700]
                              : colors.neutral[200],
                          },
                        ]}
                        onPress={() => handleAction(form, "Download")}
                      >
                        <Lucide
                          name="download"
                          size={14}
                          color={
                            isDark ? colors.neutral[400] : colors.neutral[600]
                          }
                        />
                        <Text
                          style={[
                            styles.downloadBtnText,
                            {
                              color: isDark
                                ? colors.neutral[300]
                                : colors.neutral[600],
                            },
                          ]}
                        >
                          Download
                        </Text>
                      </Pressable>
                    )}
                    {form.canRefresh && (
                      <Pressable
                        style={[
                          styles.refreshBtn,
                          {
                            borderColor: isDark
                              ? colors.neutral[700]
                              : colors.neutral[200],
                          },
                        ]}
                        onPress={() => handleAction(form, "Refresh")}
                      >
                        <Lucide
                          name="refresh-cw"
                          size={14}
                          color={
                            isDark ? colors.neutral[400] : colors.neutral[600]
                          }
                        />
                        <Text
                          style={[
                            styles.downloadBtnText,
                            {
                              color: isDark
                                ? colors.neutral[300]
                                : colors.neutral[600],
                            },
                          ]}
                        >
                          Refresh
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Fixed Sticky Bottom Dock — Evaluator Panel */}
      {activeApplicant && (
        <View
          style={[
            styles.evaluatorControlBoxSticky,
            {
              backgroundColor: isDark
                ? colors.neutral[900]
                : COLORS.neutral.white,
              borderTopColor: isDark
                ? colors.neutral[700]
                : colors.neutral[200],
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: isDark ? 0.3 : 0.07,
              shadowRadius: 8,
              elevation: 10,
            },
          ]}
        >
          {/* Accent stripe at top */}
          <View
            pointerEvents="none"
            style={[
              styles.evalAccentStripe,
              {
                backgroundColor:
                  activeApplicant.status === "Incomplete"
                    ? "#EF4444"
                    : activeApplicant.status === "ForEndorsement"
                    ? "#A855F7"
                    : "#22C55E",
              },
            ]}
          />

          <View style={styles.evalDockRow}>
            {/* Left — Verdict chips */}
            <View style={styles.evalDockLeft}>
              <Text
                style={[
                  styles.evalDockLabel,
                  { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                ]}
              >
                VERDICT — {activeApplicant.name.split(" ")[0]?.toUpperCase() ?? "APPLICANT"}
              </Text>
              <View style={styles.evalChipRow}>
                {/* Complete chip */}
                <Pressable
                  disabled={!isEditable}
                  style={[
                    styles.evalChip,
                    {
                      backgroundColor:
                        activeApplicant.status === "Complete" ||
                        !activeApplicant.status
                          ? isDark
                            ? "#14532D"
                            : "#DCFCE7"
                          : isDark
                          ? colors.neutral[800]
                          : colors.neutral[100],
                      borderColor:
                        activeApplicant.status === "Complete" ||
                        !activeApplicant.status
                          ? "#22C55E"
                          : isDark
                          ? colors.neutral[700]
                          : colors.neutral[200],
                    },
                    !isEditable && { opacity: 0.5 },
                    Platform.select({
                      web: {
                        cursor: isEditable ? "pointer" : "not-allowed",
                      } as object,
                    }),
                  ]}
                  onPress={() => handleSetStatus(activeIdx, "Complete")}
                >
                  <Lucide
                    name="check-circle"
                    size={13}
                    color={
                      activeApplicant.status === "Complete" ||
                      !activeApplicant.status
                        ? "#22C55E"
                        : isDark
                        ? colors.neutral[500]
                        : colors.neutral[400]
                    }
                  />
                  <Text
                    style={[
                      styles.evalChipText,
                      {
                        color:
                          activeApplicant.status === "Complete" ||
                          !activeApplicant.status
                            ? "#16A34A"
                            : isDark
                            ? colors.neutral[400]
                            : colors.neutral[500],
                        fontWeight:
                          activeApplicant.status === "Complete" ||
                          !activeApplicant.status
                            ? TYPOGRAPHY.weights.bold
                            : TYPOGRAPHY.weights.medium,
                      },
                    ]}
                  >
                    Complete
                  </Text>
                </Pressable>

                {/* Incomplete chip */}
                <Pressable
                  disabled={!isEditable}
                  style={[
                    styles.evalChip,
                    {
                      backgroundColor:
                        activeApplicant.status === "Incomplete"
                          ? isDark
                            ? "#7F1D1D"
                            : "#FEE2E2"
                          : isDark
                          ? colors.neutral[800]
                          : colors.neutral[100],
                      borderColor:
                        activeApplicant.status === "Incomplete"
                          ? "#EF4444"
                          : isDark
                          ? colors.neutral[700]
                          : colors.neutral[200],
                    },
                    !isEditable && { opacity: 0.5 },
                    Platform.select({
                      web: {
                        cursor: isEditable ? "pointer" : "not-allowed",
                      } as object,
                    }),
                  ]}
                  onPress={() => handleSetStatus(activeIdx, "Incomplete")}
                >
                  <Lucide
                    name="x-circle"
                    size={13}
                    color={
                      activeApplicant.status === "Incomplete"
                        ? "#EF4444"
                        : isDark
                        ? colors.neutral[500]
                        : colors.neutral[400]
                    }
                  />
                  <Text
                    style={[
                      styles.evalChipText,
                      {
                        color:
                          activeApplicant.status === "Incomplete"
                            ? "#DC2626"
                            : isDark
                            ? colors.neutral[400]
                            : colors.neutral[500],
                        fontWeight:
                          activeApplicant.status === "Incomplete"
                            ? TYPOGRAPHY.weights.bold
                            : TYPOGRAPHY.weights.medium,
                      },
                    ]}
                  >
                    Incomplete
                  </Text>
                </Pressable>

                {/* For Endorsement chip */}
                <Pressable
                  disabled={!isEditable}
                  style={[
                    styles.evalChip,
                    {
                      backgroundColor:
                        activeApplicant.status === "ForEndorsement"
                          ? isDark
                            ? "#3B0764"
                            : "#F3E8FF"
                          : isDark
                          ? colors.neutral[800]
                          : colors.neutral[100],
                      borderColor:
                        activeApplicant.status === "ForEndorsement"
                          ? "#A855F7"
                          : isDark
                          ? colors.neutral[700]
                          : colors.neutral[200],
                    },
                    !isEditable && { opacity: 0.5 },
                    Platform.select({
                      web: {
                        cursor: isEditable ? "pointer" : "not-allowed",
                      } as object,
                    }),
                  ]}
                  onPress={() => handleSetStatus(activeIdx, "ForEndorsement")}
                >
                  <Lucide
                    name="send"
                    size={12}
                    color={
                      activeApplicant.status === "ForEndorsement"
                        ? "#A855F7"
                        : isDark
                        ? colors.neutral[500]
                        : colors.neutral[400]
                    }
                  />
                  <Text
                    style={[
                      styles.evalChipText,
                      {
                        color:
                          activeApplicant.status === "ForEndorsement"
                            ? "#9333EA"
                            : isDark
                            ? colors.neutral[400]
                            : colors.neutral[500],
                        fontWeight:
                          activeApplicant.status === "ForEndorsement"
                            ? TYPOGRAPHY.weights.bold
                            : TYPOGRAPHY.weights.medium,
                      },
                    ]}
                  >
                    For Endorsement
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Divider */}
            <View
              style={[
                styles.evalDockDivider,
                {
                  backgroundColor: isDark
                    ? colors.neutral[700]
                    : colors.neutral[200],
                },
              ]}
            />

            {/* Right — Remarks */}
            <View style={styles.evalDockRight}>
              <Text
                style={[
                  styles.evalDockLabel,
                  { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                ]}
              >
                REMARKS
              </Text>
              <TextInput
                editable={isEditable}
                style={[
                  styles.remarksInputCompact,
                  {
                    color: isDark ? colors.neutral[100] : colors.neutral[900],
                    backgroundColor: isDark
                      ? colors.neutral[800]
                      : isEditable
                      ? colors.neutral[50]
                      : colors.neutral[100],
                    borderColor: isDark
                      ? colors.neutral[700]
                      : colors.neutral[200],
                  },
                  !isEditable && { opacity: 0.6 },
                ]}
                placeholder="Add notes or remarks..."
                placeholderTextColor={
                  isDark ? colors.neutral[600] : colors.neutral[400]
                }
                value={localRemarks}
                onChangeText={(text) => {
                  setLocalRemarks(text);
                  handleSetRemarks(activeIdx, text);
                }}
                multiline
                numberOfLines={2}
              />
            </View>
          </View>
        </View>
      )}

      <RequirementDocumentPreviewModal
        visible={previewDoc.visible}
        title={previewDoc.title}
        fileName={previewDoc.fileName}
        fileUrl={previewDoc.fileUrl}
        contentType={previewDoc.contentType}
        onClose={() =>
          setPreviewDoc((prev) => ({ ...prev, visible: false }))
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    padding: SPACING[16],
  },
  infoBlock: {
    marginBottom: SPACING[16],
  },
  applicantSelectorBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.card,
    borderWidth: 1,
  },
  selectorNavBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[4],
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
  },
  selectorNavBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  selectorCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[6],
  },
  selectorTitleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  selectorNameText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  inspectBtn: {
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.button,
  },
  inspectBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  accountTypeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
  },
  accountTypeLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    width: 160,
    flexShrink: 0,
  },
  accountTypeValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.medium,
    flex: 1,
  },
  submittedText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    marginBottom: SPACING[4],
  },
  permitCategoryText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.heading,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING[2],
  },
  formTypeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
  },
  emptyReqs: {
    alignItems: "center",
    paddingVertical: SPACING[24],
    gap: SPACING[8],
  },
  emptyReqsText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  reqItem: {
    paddingVertical: SPACING[12],
    borderBottomWidth: 1,
  },
  reqLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  reqNote: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  reqFileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[6],
    marginTop: SPACING[4],
  },
  reqFilename: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    flex: 1,
  },
  reqViewLink: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  formCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING[12],
    borderBottomWidth: 1,
    borderLeftWidth: 3,
    borderRadius: RADIUS.card,
    marginBottom: SPACING[8],
  },
  formCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[12],
    flex: 1,
  },
  formDocIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.button,
    alignItems: "center",
    justifyContent: "center",
  },
  formDocLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    letterSpacing: 0.5,
  },
  formDocName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  formActions: {
    flexDirection: "row",
    gap: SPACING[12],
    marginTop: SPACING[4],
  },
  formActionLink: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  formBtnGroup: {
    flexDirection: "row",
    gap: SPACING[8],
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[4],
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    borderWidth: 1,
    borderRadius: RADIUS.button,
  },
  downloadBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  refreshBtn: {
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    borderWidth: 1,
    borderRadius: RADIUS.button,
  },
  evaluatorControlBoxSticky: {
    borderTopWidth: 1,
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[10],
    position: "relative",
  },
  evalAccentStripe: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  evalDockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[16],
  },
  evalDockLeft: {
    flex: 1,
  },
  evalDockLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
    marginBottom: SPACING[4],
  },
  evalChipRow: {
    flexDirection: "row",
    gap: SPACING[8],
  },
  evalChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[4],
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    borderWidth: 1,
    borderRadius: RADIUS.button,
  },
  evalChipText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  evalDockDivider: {
    width: 1,
    height: 36,
  },
  evalDockRight: {
    flex: 1,
  },
  remarksInputCompact: {
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    height: 36,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    height: 34,
  },
  selectDropdownContainer: {
    position: "relative",
    borderRadius: RADIUS.input,
    borderWidth: 1,
    overflow: "hidden",
  },
  selectDropdownChevron: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: [{ translateY: -7 }],
  },
});
