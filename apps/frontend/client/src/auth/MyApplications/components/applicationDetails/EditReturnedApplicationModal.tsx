import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Icon, COLORS, TYPOGRAPHY, SPACING } from "@edge/ui";
import { storageService } from "@edge/api";
import {
  Application,
  BulkApplicant,
  RawRequirement,
} from "../../data/applicationsData";
import {
  GeneralServiceWizard,
  GeneralApplicantData,
  initialGeneralApplicant,
} from "../../../Services/shared/GeneralServiceWizard";
import { NTCService } from "../../../Services/data/servicesData";

interface EditReturnedApplicationModalProps {
  visible: boolean;
  app: Application;
  onClose: () => void;
  onSuccess: () => void;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function parseBirthDateParts(rawDate?: string | null): {
  birthYear: string;
  birthMonth: string;
  birthDay: string;
} {
  if (!rawDate || typeof rawDate !== "string") {
    return { birthYear: "2000", birthMonth: "January", birthDay: "1" };
  }
  const trimmed = rawDate.trim();
  if (!trimmed) {
    return { birthYear: "2000", birthMonth: "January", birthDay: "1" };
  }

  // 1. ISO format YYYY-MM-DD
  const isoMatch = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(trimmed);
  if (isoMatch && isoMatch[1] && isoMatch[2] && isoMatch[3]) {
    const year = isoMatch[1];
    const mNum = parseInt(isoMatch[2], 10);
    const dNum = parseInt(isoMatch[3], 10);
    const month =
      !Number.isNaN(mNum) && mNum >= 1 && mNum <= 12
        ? MONTH_NAMES[mNum - 1] ?? "January"
        : "January";
    const day = !Number.isNaN(dNum) && dNum >= 1 && dNum <= 31 ? String(dNum) : "1";
    return { birthYear: year, birthMonth: month, birthDay: day };
  }

  // 2. Named month format "Month DD, YYYY"
  const namedMatch = /^([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})$/.exec(trimmed);
  if (namedMatch && namedMatch[1] && namedMatch[2] && namedMatch[3]) {
    const rawM = namedMatch[1].toLowerCase().slice(0, 3);
    const foundM =
      MONTH_NAMES.find((m) => m.toLowerCase().startsWith(rawM)) ?? "January";
    const dNum = parseInt(namedMatch[2], 10);
    const day = !Number.isNaN(dNum) && dNum >= 1 && dNum <= 31 ? String(dNum) : "1";
    return { birthYear: namedMatch[3], birthMonth: foundM, birthDay: day };
  }

  return { birthYear: "2000", birthMonth: "January", birthDay: "1" };
}

function buildExistingUploadsMap(
  app: Application,
  applicantObj: BulkApplicant | undefined,
  totalApplicants: number
): Record<
  string,
  { name: string; uri: string; type?: string; storedFileId?: string }
> {
  const uploadsMap: Record<
    string,
    { name: string; uri: string; type?: string; storedFileId?: string }
  > = {};

  const topReqs: RawRequirement[] =
    app.requirements ||
    app.Requirements ||
    app.applicationRequirements ||
    app.ApplicationRequirements ||
    app.documents ||
    app.Documents ||
    [];

  const applicantReqs: RawRequirement[] =
    applicantObj?.requirements ||
    applicantObj?.Requirements ||
    applicantObj?.applicationRequirements ||
    applicantObj?.ApplicationRequirements ||
    applicantObj?.documents ||
    applicantObj?.Documents ||
    [];

  const applicantId = applicantObj?.id || "";

  const matchedTopReqs = topReqs.filter((r) => {
    const rAppId = r.applicantId || "";
    return (
      (applicantId !== "" && rAppId === applicantId) ||
      (totalApplicants <= 1 &&
        (!rAppId ||
          rAppId === app.id ||
          rAppId === "00000000-0000-0000-0000-000000000000"))
    );
  });

  const combinedReqs: RawRequirement[] = [...applicantReqs];
  for (const r of matchedTopReqs) {
    const alreadyExists = combinedReqs.some(
      (existing) =>
        (r.id && existing.id === r.id) ||
        (r.storedFileId && existing.storedFileId === r.storedFileId) ||
        (r.requirementId && existing.requirementId === r.requirementId) ||
        (r.serviceVariantRequirementId &&
          existing.serviceVariantRequirementId === r.serviceVariantRequirementId)
    );
    if (!alreadyExists) {
      combinedReqs.push(r);
    }
  }

  combinedReqs.forEach((r, rIdx) => {
    const storedFileId =
      typeof r.storedFileId === "string" &&
      r.storedFileId.trim() !== "" &&
      r.storedFileId.trim().toLowerCase() !== "none" &&
      r.storedFileId.trim().toLowerCase() !== "null"
        ? r.storedFileId.trim()
        : undefined;
    const rawUrl =
      typeof r.url === "string" &&
      r.url.trim() !== "" &&
      r.url.trim().toLowerCase() !== "none" &&
      r.url.trim().toLowerCase() !== "null"
        ? r.url.trim()
        : "";

    if (!storedFileId && !rawUrl) return;

    const reqName = (r.requirementName || r.name || "").replace(/\*$/, "").trim();
    const fileName =
      (r.fileName && r.fileName.trim() !== "" ? r.fileName.trim() : "") ||
      reqName ||
      `Attachment_${rIdx + 1}.pdf`;
    const resolvedUri =
      rawUrl ||
      (storedFileId && app.tenantId
        ? `/api/v2/tenants/${app.tenantId}/storage/files/${storedFileId}`
        : "");

    const descriptor = {
      name: fileName,
      uri: resolvedUri,
      type: r.contentType || undefined,
      storedFileId,
    };

    const reqId = (r.requirementId || "").trim();
    const svrId = (r.serviceVariantRequirementId || "").trim();

    // Store exactly ONE canonical key per requirement so Object.entries(uploads) has 1 entry per attachment
    if (reqId) {
      uploadsMap[`req-${reqId}`] = descriptor;
    } else if (svrId) {
      uploadsMap[`req-${svrId}`] = descriptor;
    } else if (reqName) {
      uploadsMap[reqName] = descriptor;
    } else {
      uploadsMap[`req-${rIdx}`] = descriptor;
    }
  });

  return uploadsMap;
}

function mapApplicationToGeneralApplicants(
  app: Application
): GeneralApplicantData[] {
  const rawApplicants = app.applicants || app.Applicants || [];
  const totalCount = Math.max(1, rawApplicants.length);

  if (rawApplicants.length === 0) {
    const base = initialGeneralApplicant(1);
    const fullName = (app.applicantName || "").trim();
    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
    const birthParts = parseBirthDateParts(
      "birthDate" in app ? app.birthDate : undefined
    );

    return [
      {
        ...base,
        firstName,
        lastName,
        applicantType:
          ("applicantType" in app &&
          typeof app.applicantType === "string" &&
          app.applicantType.toLowerCase() === "company"
            ? "company"
            : "individual"),
        companyName: app.companyName || "",
        representativeName: app.representativeName || "",
        email: app.email && app.email !== "N/A" ? app.email : "",
        contactNo:
          app.mobileNumber && app.mobileNumber !== "N/A" ? app.mobileNumber : "",
        sex: app.sex || "Male",
        civilStatus: ("civilStatus" in app && app.civilStatus) || "",
        nationality: app.nationality || "Filipino",
        street:
          app.streetAddress && app.streetAddress !== "N/A"
            ? app.streetAddress
            : "",
        address:
          app.streetAddress && app.streetAddress !== "N/A"
            ? app.streetAddress
            : "",
        barangay: app.barangay && app.barangay !== "N/A" ? app.barangay : "",
        city:
          app.cityMunicipality && app.cityMunicipality !== "N/A"
            ? app.cityMunicipality
            : "",
        province: app.province && app.province !== "N/A" ? app.province : "",
        region: app.region && app.region !== "N/A" ? app.region : "",
        zipCode: app.zipCode && app.zipCode !== "N/A" ? app.zipCode : "",
        birthYear: birthParts.birthYear,
        birthMonth: birthParts.birthMonth,
        birthDay: birthParts.birthDay,
        selectedVariantId: app.serviceVariantId || "",
        selectedVariantName: app.serviceVariantName || "",
        element: typeof app.element === "string" ? app.element : undefined,
        elements: typeof app.element === "string" ? app.element : undefined,
        serviceId: app.serviceId,
        formFieldValues: app.formFieldValues || [],
        uploads: buildExistingUploadsMap(app, undefined, 1),
      },
    ];
  }

  return rawApplicants.map((ap, idx) => {
    const d = ap.details;
    const rawFvs = ap.formFieldValues || d?.formFieldValues || app.formFieldValues || [];
    const findFv = (predicate: (lbl: string, id: string) => boolean): string => {
      const match = rawFvs.find((fv) =>
        predicate(
          (fv.fieldLabel || "").toLowerCase(),
          (fv.fieldId || "").toLowerCase()
        )
      );
      return match?.value || "";
    };

    const rawFullName = (ap.name || "").trim();
    const nameParts = rawFullName.split(/\s+/).filter(Boolean);
    const fallbackFirst = nameParts[0] || "";
    const fallbackLast =
      nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    const firstName =
      d?.firstName ||
      ap.firstName ||
      findFv((l) => l === "first name" || l.includes("first name")) ||
      fallbackFirst;
    const middleName =
      d?.middleName ||
      findFv((l, id) => id.includes("0210") || l.includes("middle name")) ||
      "";
    const lastName =
      d?.lastName ||
      ap.lastName ||
      findFv((l) => l === "last name" || l.includes("last name") || l === "surname") ||
      fallbackLast;
    const suffix =
      d?.suffix ||
      findFv((l, id) => id.includes("0211") || l.includes("suffix")) ||
      "";

    const rawBirth =
      d?.birthDate ||
      ap.birthDate ||
      findFv((l, id) => id.includes("0002") || l.includes("birth"));
    const birthParts = parseBirthDateParts(rawBirth);

    const streetVal =
      (d?.streetAddress && d.streetAddress !== "N/A" ? d.streetAddress : "") ||
      (d?.address && d.address !== "N/A" ? d.address : "") ||
      (ap.streetAddress && ap.streetAddress !== "N/A" ? ap.streetAddress : "") ||
      findFv((l, id) => id.includes("0055") || l.includes("street"));

    const barangayVal =
      (d?.barangay && d.barangay !== "N/A" ? d.barangay : "") ||
      (ap.barangay && ap.barangay !== "N/A" ? ap.barangay : "") ||
      findFv((l, id) => id.includes("0054") || l.includes("barangay"));

    const cityVal =
      (d?.cityMunicipality && d.cityMunicipality !== "N/A"
        ? d.cityMunicipality
        : "") ||
      (ap.cityMunicipality && ap.cityMunicipality !== "N/A"
        ? ap.cityMunicipality
        : "") ||
      findFv(
        (l, id) =>
          id.includes("0053") || l.includes("city") || l.includes("municipality")
      );

    const provinceVal =
      (d?.province && d.province !== "N/A" ? d.province : "") ||
      (ap.province && ap.province !== "N/A" ? ap.province : "") ||
      findFv((l, id) => id.includes("0052") || l.includes("province"));

    const regionVal =
      (d?.region && d.region !== "N/A" ? d.region : "") ||
      (ap.region && ap.region !== "N/A" ? ap.region : "") ||
      findFv((l, id) => id.includes("0051") || l.includes("region"));

    const zipVal =
      (d?.zipCode && d.zipCode !== "N/A" ? d.zipCode : "") ||
      (ap.zipCode && ap.zipCode !== "N/A" ? ap.zipCode : "") ||
      findFv((l, id) => id.includes("0056") || l.includes("zip") || l.includes("postal"));

    const emailVal =
      (d?.emailAddress && d.emailAddress !== "N/A" ? d.emailAddress : "") ||
      (d?.email && d.email !== "N/A" ? d.email : "") ||
      (ap.email && ap.email !== "N/A" ? ap.email : "") ||
      findFv((l, id) => id.includes("0005") || l.includes("email"));

    const contactVal =
      (d?.contactNumber && d.contactNumber !== "N/A" ? d.contactNumber : "") ||
      (d?.mobileNumber && d.mobileNumber !== "N/A" ? d.mobileNumber : "") ||
      (ap.mobileNumber && ap.mobileNumber !== "N/A" ? ap.mobileNumber : "") ||
      findFv(
        (l, id) =>
          id.includes("0004") || l.includes("contact") || l.includes("mobile")
      );

    const sexVal =
      d?.sex ||
      ap.sex ||
      findFv((l, id) => id.includes("0041") || l === "sex" || l === "gender") ||
      "Male";

    const civilVal =
      d?.civilStatus ||
      ap.civilStatus ||
      findFv(
        (l, id) =>
          id.includes("0042") || l.includes("civil") || l.includes("marital")
      ) ||
      "";

    const natVal =
      d?.nationality ||
      ap.nationality ||
      findFv(
        (l, id) =>
          id.includes("0043") ||
          l.includes("nationality") ||
          l.includes("citizenship")
      ) ||
      "Filipino";

    const schoolVal =
      d?.schoolAttended ||
      d?.schoolName ||
      ap.schoolAttended ||
      ap.schoolName ||
      findFv(
        (l, id) =>
          id.includes("0061") || l.includes("school") || l.includes("university")
      ) ||
      "";

    const courseVal =
      d?.courseTaken ||
      d?.courseDegree ||
      ap.courseTaken ||
      ap.courseDegree ||
      findFv(
        (l, id) =>
          id.includes("0062") ||
          l.includes("course") ||
          l.includes("degree") ||
          l.includes("program")
      ) ||
      "";

    const yearGradVal =
      d?.yearGraduated ||
      ap.yearGraduated ||
      findFv((l, id) => id.includes("0063") || l.includes("graduat")) ||
      "";

    const sigVal =
      d?.eSignature ||
      d?.signatureUrl ||
      ap.eSignature ||
      ap.signatureUrl ||
      findFv((l, id) => id.includes("0012") || l.includes("signature")) ||
      "";

    const isCompany =
      (ap.applicantType || "").toLowerCase() === "company";

    const elementVal =
      ap.element ||
      d?.element ||
      (typeof app.element === "string" && app.element !== "New"
        ? app.element
        : "") ||
      findFv((l, id) => id.includes("0009") || l.includes("element"));

    return {
      ...initialGeneralApplicant(idx + 1),
      firstName,
      middleName,
      lastName,
      suffix,
      applicantType: isCompany ? "company" : "individual",
      companyName: d?.companyName || ap.companyName || app.companyName || "",
      representativeName:
        d?.representativeName ||
        ap.representativeName ||
        app.representativeName ||
        "",
      dtiSecRegistration: findFv(
        (l, id) =>
          id.includes("0086") ||
          l.includes("sec / dti") ||
          l.includes("registration number")
      ),
      email: emailVal,
      contactNo: contactVal,
      sex: sexVal,
      civilStatus: civilVal,
      nationality: natVal,
      street: streetVal,
      address: streetVal,
      barangay: barangayVal,
      city: cityVal,
      province: provinceVal,
      region: regionVal,
      zipCode: zipVal,
      schoolName: schoolVal,
      schoolAttended: schoolVal,
      courseDegree: courseVal,
      courseTaken: courseVal,
      yearGraduated: yearGradVal,
      specialOrderNo: d?.specialOrderNo || ap.specialOrderNo || "",
      birthYear: birthParts.birthYear,
      birthMonth: birthParts.birthMonth,
      birthDay: birthParts.birthDay,
      birthDate: rawBirth || undefined,
      notes: d?.notes || ap.notes || "",
      selectedVariantId: ap.serviceVariantId || app.serviceVariantId || "",
      selectedVariantName:
        ap.serviceVariantName || d?.serviceVariantName || app.serviceVariantName || "",
      selectedElementTitle: elementVal || undefined,
      element: elementVal || undefined,
      elements: elementVal || undefined,
      serviceId: ap.serviceId || app.serviceId,
      signatureUrl: sigVal || undefined,
      formFieldValues: rawFvs,
      uploads: buildExistingUploadsMap(app, ap, totalCount),
    };
  });
}

export function EditReturnedApplicationModal({
  visible,
  app,
  onClose,
  onSuccess,
}: EditReturnedApplicationModalProps) {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 992;

  const isBulkMode = app.mode === "BULK";
  const [step, setStep] = useState<number>(3);
  const [selectedRegionId, setSelectedRegionId] = useState<string>(
    app.tenantId || ""
  );
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>(
    app.office || ""
  );
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null
  );
  const [appMode, setAppMode] = useState<"SINGLE" | "BULK" | "">(
    isBulkMode ? "BULK" : "SINGLE"
  );
  const [applicants, setApplicants] = useState<GeneralApplicantData[]>(() =>
    mapApplicationToGeneralApplicants(app)
  );
  const [currentApplicantIndex, setCurrentApplicantIndex] = useState<number>(0);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState<boolean>(true);

  useEffect(() => {
    if (!visible) return;

    setStep(3);
    setSelectedRegionId(app.tenantId || "");
    setSelectedOfficeId(app.office || "");
    setAppMode(app.mode === "BULK" ? "BULK" : "SINGLE");
    const initialApplicants = mapApplicationToGeneralApplicants(app);
    setApplicants(initialApplicants);
    setCurrentApplicantIndex(0);

    // Pre-fetch authenticated Blob object URLs for any storedFileId attachments so
    // inline thumbnails in Step 4 and "View" modal previews in Step 5 render immediately
    let isCancelled = false;
    (async () => {
      for (let aIdx = 0; aIdx < initialApplicants.length; aIdx++) {
        const ap = initialApplicants[aIdx];
        if (!ap || !ap.uploads) continue;
        const entries = Object.entries(ap.uploads);
        for (const [uKey, uVal] of entries) {
          if (isCancelled) return;
          if (!uVal || typeof uVal !== "object") continue;
          const rawUri = (uVal.uri || "").trim();
          const storedId =
            "storedFileId" in uVal && typeof uVal.storedFileId === "string"
              ? uVal.storedFileId.trim()
              : "";
          const downloadUrl =
            rawUri.startsWith("/api/") || rawUri.includes("/storage/files/")
              ? rawUri
              : storedId
              ? storageService.getFileDownloadUrl(storedId, app.tenantId || undefined)
              : "";
          if (!downloadUrl) continue;

          try {
            const [blobData, blobErr] = await storageService.downloadFileByUrl(downloadUrl);
            if (isCancelled) return;
            if (blobErr === null && blobData instanceof Blob && blobData.size > 0) {
              let mime = blobData.type || uVal.type || "";
              const fName = uVal.name || "Document";
              if (!mime || mime === "application/octet-stream") {
                const lowerN = fName.toLowerCase();
                if (lowerN.endsWith(".pdf")) mime = "application/pdf";
                else if (lowerN.endsWith(".png")) mime = "image/png";
                else if (lowerN.endsWith(".jpg") || lowerN.endsWith(".jpeg")) mime = "image/jpeg";
                else if (lowerN.endsWith(".webp")) mime = "image/webp";
              }
              const typedBlob = mime ? new Blob([blobData], { type: mime }) : blobData;
              if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
                const blobUrl = URL.createObjectURL(typedBlob);
                setApplicants((prev) =>
                  prev.map((item, idx) => {
                    if (idx !== aIdx) return item;
                    const currentEntry = item.uploads?.[uKey];
                    if (!currentEntry || typeof currentEntry !== "object") return item;
                    const currentStoredId =
                      "storedFileId" in currentEntry && typeof currentEntry.storedFileId === "string"
                        ? currentEntry.storedFileId.trim()
                        : "";
                    // Only update if user hasn't replaced this slot with a new local file
                    if (currentStoredId !== storedId) return item;
                    return {
                      ...item,
                      uploads: {
                        ...item.uploads,
                        [uKey]: {
                          ...currentEntry,
                          uri: blobUrl,
                          type: mime || currentEntry.type,
                        },
                      },
                    };
                  })
                );
              }
            }
          } catch {
            // keep original descriptor
          }
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [visible, app]);

  const serviceObj = useMemo<NTCService>(() => {
    const reqNames: string[] = [];
    const rawReqs =
      app.requirements ||
      app.Requirements ||
      app.applicationRequirements ||
      app.ApplicationRequirements ||
      [];
    rawReqs.forEach((r) => {
      const rName = (r.requirementName || r.name || "").trim();
      if (rName && !reqNames.includes(rName)) {
        reqNames.push(rName);
      }
    });

    return {
      id: app.serviceId || "50000000-0000-0000-0000-000000000001",
      title: app.serviceName || "NTC Service Application",
      category: app.serviceCategory || "General",
      description: app.serviceName || "NTC Service Application",
      requirements: reqNames,
      fee: "₱0.00",
      time: "3-5 Working Days",
    };
  }, [app]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.dialogContainer,
            {
              width: isDesktop ? Math.min(1120, width - 48) : width - 16,
              height: isDesktop ? Math.min(860, height - 48) : height - 24,
              maxWidth: 1120,
              alignSelf: "center",
            },
          ]}
        >
          {/* Dialog Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconBadge}>
                <Icon name="edit-3" size={18} color="#1D4ED8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  Edit & Update Application — #{app.referenceNumber}
                </Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {app.serviceName} • Existing uploaded documents are preserved unless you replace them.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <Icon name="x" size={18} color="#475569" />
            </TouchableOpacity>
          </View>

          {/* Evaluator Discrepancy Notice Banner inside Dialog */}
          {app.remarks ? (
            <View style={styles.noticeBanner}>
              <Icon name="alert-triangle" size={16} color="#DC2626" />
              <View style={{ flex: 1 }}>
                <Text style={styles.noticeTitle}>
                  Evaluator Discrepancy Notice:
                </Text>
                <Text style={styles.noticeText}>{app.remarks}</Text>
              </View>
            </View>
          ) : null}

          {/* Embedded Services Application Wizard */}
          <View style={styles.wizardBody}>
            <GeneralServiceWizard
              service={serviceObj}
              onClose={onClose}
              onSuccess={onSuccess}
              onApplyMore={onSuccess}
              isDetailsExpanded={isDetailsExpanded}
              onToggleExpand={() => setIsDetailsExpanded((p) => !p)}
              step={step}
              setStep={setStep}
              selectedRegionId={selectedRegionId}
              setSelectedRegionId={setSelectedRegionId}
              selectedOfficeId={selectedOfficeId}
              setSelectedOfficeId={setSelectedOfficeId}
              selectedScheduleId={selectedScheduleId}
              setSelectedScheduleId={setSelectedScheduleId}
              appMode={appMode}
              setAppMode={setAppMode}
              applicants={applicants}
              setApplicants={setApplicants}
              currentApplicantIndex={currentApplicantIndex}
              setCurrentApplicantIndex={setCurrentApplicantIndex}
              existingDraftId={app.id}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  dialogContainer: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING[20],
    paddingVertical: 14,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 12,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  noticeBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FEF2F2",
    borderBottomWidth: 1,
    borderBottomColor: "#FECACA",
    paddingHorizontal: SPACING[20],
    paddingVertical: 10,
  },
  noticeTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "700",
    color: "#991B1B",
  },
  noticeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#7F1D1D",
    marginTop: 1,
  },
  wizardBody: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
});
