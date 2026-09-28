import { NTCService } from "../../data/servicesData";
import { GeneralApplicantData } from "../../shared/hooks/useGeneralServiceWizard";

/**
 * Static GUID registry — mirrors FastTrackSeederData.cs GetFieldsPool().
 * Keys are lowercase field-label slugs used by addField().
 * Values are the exact database GUIDs seeded at startup.
 *
 * When adding a new form field to the seeder, add a matching entry here
 * so that the serializer can resolve it without a live DB lookup.
 */
const FIELD_GUID_MAP: Record<string, string> = {
  // Core personal / applicant (fd000000-0000-0000-0000-0000000001xx)
  "full name / company name": "fd000000-0000-0000-0000-000000000001",
  "full name":                "fd000000-0000-0000-0000-000000000001",
  "birth date":               "fd000000-0000-0000-0000-000000000002",
  "address":                  "fd000000-0000-0000-0000-000000000003",
  "contact number":           "fd000000-0000-0000-0000-000000000004",
  "email address":            "fd000000-0000-0000-0000-000000000005",
  "education / school attended": "fd000000-0000-0000-0000-000000000006",

  // NTC 1-01 exam
  "exam category":            "fd000000-0000-0000-0000-000000000007",
  "examinee type":            "fd000000-0000-0000-0000-000000000008",
  "selected exam elements":   "fd000000-0000-0000-0000-000000000009",
  "special assistance details": "fd000000-0000-0000-0000-000000000010",
  "admission slip number":    "fd000000-0000-0000-0000-000000000011",

  // Core declarations & payment
  "applicant signature":      "fd000000-0000-0000-0000-000000000012",
  "i hereby declare":         "fd000000-0000-0000-0000-000000000013",
  "official receipt (or) number": "fd000000-0000-0000-0000-000000000021",
  "amount paid":              "fd000000-0000-0000-0000-000000000022",
  "payment date":             "fd000000-0000-0000-0000-000000000023",

  // NTC 1-02 certificate specific
  "type of certificate":      "fd000000-0000-0000-0000-000000000014",
  "weight (kg)":              "fd000000-0000-0000-0000-000000000015",
  "height (cm)":              "fd000000-0000-0000-0000-000000000016",
  "employment status":        "fd000000-0000-0000-0000-000000000017",
  "employment location":      "fd000000-0000-0000-0000-000000000018",
  "exam / seminar details":   "fd000000-0000-0000-0000-000000000019",

  // Permit / license / station
  "permit / license type":    "fd000000-0000-0000-0000-000000000024",
  "class of station":         "fd000000-0000-0000-0000-000000000025",
  "amateur club details":     "fd000000-0000-0000-0000-000000000026",
  "registration type":        "fd000000-0000-0000-0000-000000000045",

  // Technical vessel & station & equipment
  "vessel name":              "fd000000-0000-0000-0000-000000000027",
  "call sign":                "fd000000-0000-0000-0000-000000000028",
  "imo number / gross tonnage": "fd000000-0000-0000-0000-000000000029",
  "equipment technical details": "fd000000-0000-0000-0000-000000000030",
  "radio officers details":   "fd000000-0000-0000-0000-000000000031",
  "station location / coordinates": "fd000000-0000-0000-0000-000000000032",
  "antenna technical details": "fd000000-0000-0000-0000-000000000033",

  // Accreditations & regs
  "ece / technician personnel details": "fd000000-0000-0000-0000-000000000034",
  "registered devices details": "fd000000-0000-0000-0000-000000000035",
  "value-added services / category": "fd000000-0000-0000-0000-000000000036",
  "circumstances / reason for duplicate": "fd000000-0000-0000-0000-000000000037",
  "tvro / catv receiver & satellite details": "fd000000-0000-0000-0000-000000000038",

  // NTC 1-09 permit fields
  "station class":            "fd000000-0000-0000-0000-000000000101",
  "service area":             "fd000000-0000-0000-0000-000000000102",
  "frequency / frequencies":  "fd000000-0000-0000-0000-000000000103",
  "bandwidth":                "fd000000-0000-0000-0000-000000000104",
  "emission":                 "fd000000-0000-0000-0000-000000000105",
  "power output":             "fd000000-0000-0000-0000-000000000106",
  "hours of operation":       "fd000000-0000-0000-0000-000000000107",
  "configuration":            "fd000000-0000-0000-0000-000000000108",
  "data rate":                "fd000000-0000-0000-0000-000000000109",
  "remarks":                  "fd000000-0000-0000-0000-000000000110",
  "serial number":            "fd000000-0000-0000-0000-000000000111",
  "frequency range":          "fd000000-0000-0000-0000-000000000112",
  "antenna type":             "fd000000-0000-0000-0000-000000000113",
  "antenna height":           "fd000000-0000-0000-0000-000000000114",
  "antenna gain":             "fd000000-0000-0000-0000-000000000115",
  "antenna directivity":      "fd000000-0000-0000-0000-000000000116",
  "antenna diameter":         "fd000000-0000-0000-0000-000000000117",
  "antenna polarization":     "fd000000-0000-0000-0000-000000000118",
  "antenna beamwidth":        "fd000000-0000-0000-0000-000000000119",
  "dealer name":              "fd000000-0000-0000-0000-000000000120",
  "authorized seller / buyer": "fd000000-0000-0000-0000-000000000121",
  "or / invoice no":          "fd000000-0000-0000-0000-000000000122",
  "permit / rsl no":          "fd000000-0000-0000-0000-000000000123",
  "seller address":           "fd000000-0000-0000-0000-000000000124",
  "amateur license no":       "fd000000-0000-0000-0000-000000000125",
  "intended use type":        "fd000000-0000-0000-0000-000000000126",
  "specify details":          "fd000000-0000-0000-0000-000000000127",

  // NTC_AMA_LICENSES — Amateur Radio Station License specific
  "application type":         "fd000000-0000-0000-0000-000000000200",
  "number of years":          "fd000000-0000-0000-0000-000000000201",
  "existing license no":      "fd000000-0000-0000-0000-000000000202",
  "license expiry date":      "fd000000-0000-0000-0000-000000000203",
  "modification due to":      "fd000000-0000-0000-0000-000000000204",
  "place of exam / seminar":  "fd000000-0000-0000-0000-000000000205",
  "date of exam / seminar":   "fd000000-0000-0000-0000-000000000206",
  "ratings / exam score details": "fd000000-0000-0000-0000-000000000207",
  "particulars of radio equipment (json)": "fd000000-0000-0000-0000-000000000208",
  "station location / installation address": "fd000000-0000-0000-0000-000000000209",
  "middle name":              "fd000000-0000-0000-0000-000000000210",
  "suffix":                   "fd000000-0000-0000-0000-000000000211",

  // Company & Corporate Applicant Fields (NTC 1-19 and generic company filings)
  "company / business name":  "fd000000-0000-0000-0000-000000000081",
  "company name":             "fd000000-0000-0000-0000-000000000081",
  "company / corporation name": "fd000000-0000-0000-0000-000000000081",
  "authorized representative name": "fd000000-0000-0000-0000-000000000082",
  "representative name":      "fd000000-0000-0000-0000-000000000082",
  "representative":           "fd000000-0000-0000-0000-000000000082",
  "designation / position":   "fd000000-0000-0000-0000-000000000083",
  "representative position":  "fd000000-0000-0000-0000-000000000083",
  "position":                 "fd000000-0000-0000-0000-000000000083",
  "make / type / model":      "fd000000-0000-0000-0000-000000000084",
  "make/type/ model":         "fd000000-0000-0000-0000-000000000084",
  "device / equipment type":  "fd000000-0000-0000-0000-000000000085",
  "device type":              "fd000000-0000-0000-0000-000000000085",
  "sec / dti registration number": "fd000000-0000-0000-0000-000000000086",
  "sec/dti no":               "fd000000-0000-0000-0000-000000000086",
  // VAS Registration (NTC 1-20) specific fields
  "type of entity":                         "fd000000-0000-0000-0000-000000000230",
  "entity type":                             "fd000000-0000-0000-0000-000000000230",
  "cpcn / pa / ca no.":                      "fd000000-0000-0000-0000-000000000231",
  "cpcn / pa / ca no":                       "fd000000-0000-0000-0000-000000000231",
  "cpcn / pa / ca license no":               "fd000000-0000-0000-0000-000000000231",
  "cpcn/pa/ca license no":                   "fd000000-0000-0000-0000-000000000231",
  "cpcn / pa / ca no. date of expiry":       "fd000000-0000-0000-0000-000000000232",
  "cpcn / pa / ca date of expiry":           "fd000000-0000-0000-0000-000000000232",
  "cpcn date of expiry":                     "fd000000-0000-0000-0000-000000000232",
  "cpcn/pa/ca expiration date":              "fd000000-0000-0000-0000-000000000232",
  "cor / vas no.":                           "fd000000-0000-0000-0000-000000000233",
  "cor / vas no":                            "fd000000-0000-0000-0000-000000000233",
  "cor/vas certificate no":                  "fd000000-0000-0000-0000-000000000233",
  "cor / vas no. date of expiry":            "fd000000-0000-0000-0000-000000000238",
  "cor / vas no. expiry date":               "fd000000-0000-0000-0000-000000000238",
  "cor / vas date of expiry":                "fd000000-0000-0000-0000-000000000238",
  "cor/vas expiry date":                     "fd000000-0000-0000-0000-000000000238",
  "known by other name":                     "fd000000-0000-0000-0000-000000000234",
  "known by another name":                   "fd000000-0000-0000-0000-000000000234",
  "please specify":                          "fd000000-0000-0000-0000-000000000235",
  "other trade name":                        "fd000000-0000-0000-0000-000000000235",
  "operating trade name":                    "fd000000-0000-0000-0000-000000000235",
  "vas registration no. (assigned by ntc)":  "fd000000-0000-0000-0000-000000000236",
  "vas registration no":                     "fd000000-0000-0000-0000-000000000236",
  "vas registration":                        "fd000000-0000-0000-0000-000000000236",
};

/**
 * Resolves a field ID by checking:
 * 1. The static GUID registry (exact or partial key match)
 * 2. The live formFields array returned by the API
 * Guarantees a real GUID is always returned when the field is registered in the seeder.
 */
function resolveFieldId(label: string, formFields: Array<{ label?: string; fieldId?: string }>): string {
  const lowerLabel = label.toLowerCase();

  // 1. Exact match in static map
  const exactId = FIELD_GUID_MAP[lowerLabel];
  if (exactId !== undefined) return exactId;

  // 2. Partial match in static map (label contains a known key)
  for (const [key, id] of Object.entries(FIELD_GUID_MAP)) {
    if (lowerLabel.includes(key) || key.includes(lowerLabel)) return id;
  }

  // 3. Fallback to live formFields from API
  const matched = formFields.find(
    (f) => (f.label ?? "").toLowerCase().includes(lowerLabel)
  );
  if (matched !== undefined && matched.fieldId !== undefined) return matched.fieldId;

  // 4. Last resort — generate a deterministic slug (will be rejected by backend if form is DB-backed)
  return `f-${lowerLabel.replace(/\s+/g, "-")}`;
}

export interface FormFieldValuePayload {
  fieldId: string;
  fieldLabel?: string;
  value: string;
}

export interface SerializedApplicantPayload {
  applicantType?: string;
  companyName?: string;
  representativeName?: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  address: string;
  birthDate: string;
  formFieldValues: FormFieldValuePayload[];
}

export function isApplicantBiographicalOrSubmissionField(fieldIdOrLabel: string): boolean {
  const lower = (fieldIdOrLabel || "").toLowerCase().trim();
  return (
    lower.includes("first name") ||
    lower.includes("last name") ||
    lower.includes("middle name") ||
    lower.includes("full name") ||
    lower.includes("applicant name") ||
    lower.includes("birth date") ||
    lower.includes("date of birth") ||
    lower.includes("birth month") ||
    lower.includes("birth day") ||
    lower.includes("birth year") ||
    lower.includes("civil status") ||
    lower.includes("nationality") ||
    lower.includes("contact number") ||
    lower.includes("mobile") ||
    lower.includes("phone number") ||
    lower.includes("email address") ||
    lower.includes("email") ||
    lower.includes("street") ||
    lower.includes("barangay") ||
    lower.includes("city / municipality") ||
    lower.includes("province") ||
    lower.includes("region") ||
    lower.includes("zip code") ||
    lower.includes("postal code") ||
    lower.includes("applicant address") ||
    lower.includes("residential address") ||
    lower.includes("permanent address") ||
    lower.includes("declaration") ||
    lower.includes("i hereby declare") ||
    lower.includes("official receipt") ||
    lower.includes("amount paid") ||
    lower.includes("payment date") ||
    lower === "fd000000-0000-0000-0000-000000000001" ||
    lower === "fd000000-0000-0000-0000-000000000002" ||
    lower === "fd000000-0000-0000-0000-000000000003" ||
    lower === "fd000000-0000-0000-0000-000000000004" ||
    lower === "fd000000-0000-0000-0000-000000000005" ||
    lower === "fd000000-0000-0000-0000-000000000012" ||
    lower === "fd000000-0000-0000-0000-000000000013" ||
    lower === "fd000000-0000-0000-0000-000000000021" ||
    lower === "fd000000-0000-0000-0000-000000000022" ||
    lower === "fd000000-0000-0000-0000-000000000023"
  );
}

export function serializeCertificateApplicant(
  app: GeneralApplicantData,
  service: NTCService,
  formFields: Array<{ label?: string; fieldId?: string }> = []
): SerializedApplicantPayload {
  const serviceCode = (service.code || "").toUpperCase();
  const serviceTitle = (service.title || "").toUpperCase();

  const monthMap: Record<string, string> = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };

  const birthDate = `${app.birthYear}-${monthMap[app.birthMonth] || "01"}-${app.birthDay.padStart(2, "0")}`;

  // If the applicant has dynamic form field values, rely on them fully and bypass legacy hardcoded serialization
  if (app.formFieldValues && app.formFieldValues.length > 0) {
    const fnFromFields = app.formFieldValues.find(fv => {
      const l = (fv.fieldLabel || "").toLowerCase();
      return l.includes("first name") || l === "fname";
    })?.value?.trim();

    const lnFromFields = app.formFieldValues.find(fv => {
      const l = (fv.fieldLabel || "").toLowerCase();
      return l.includes("last name") || l.includes("surname") || l === "lname";
    })?.value?.trim();

    const fullNameField = app.formFieldValues.find(fv => {
      const l = (fv.fieldLabel || "").toLowerCase();
      return l.includes("full name") || l.includes("applicant name") || l === "name" || l.includes("company name");
    })?.value?.trim() || "";

    const addressField = app.formFieldValues.find(fv => {
      const l = (fv.fieldLabel || "").toLowerCase();
      return (l.includes("address") || l.includes("street")) && !l.includes("email");
    })?.value?.trim() || "";

    const contactNoField = app.formFieldValues.find(fv => {
      const l = (fv.fieldLabel || "").toLowerCase();
      return l.includes("contact number") || l.includes("mobile") || l.includes("phone");
    })?.value?.trim() || "";

    const emailField = app.formFieldValues.find(fv => {
      const l = (fv.fieldLabel || "").toLowerCase();
      return l.includes("email");
    })?.value?.trim() || "";

    let finalFirstName = app.firstName?.trim() || fnFromFields || "";
    let finalLastName = app.lastName?.trim() || lnFromFields || "";

    if (!finalFirstName && fullNameField) {
      const parts = fullNameField.split(/\s+/);
      finalFirstName = parts[0] || "Applicant";
      finalLastName = parts.slice(1).join(" ") || "Detail";
    }

    const validFieldIdSet = new Set(
      formFields.map((f) => f.fieldId).filter((id): id is string => Boolean(id))
    );

    // Filter out both unknown IDs and applicant/biographical/submission fields
    const filteredFieldValues = app.formFieldValues
      .filter((fv) => {
        if (validFieldIdSet.size > 0 && fv.fieldId && !validFieldIdSet.has(fv.fieldId)) {
          return false;
        }
        if (isApplicantBiographicalOrSubmissionField(fv.fieldLabel || fv.fieldId)) {
          return false;
        }
        return true;
      });

    return {
      applicantType: app.applicantType || "individual",
      companyName: app.companyName || undefined,
      representativeName: app.representativeName || undefined,
      firstName: finalFirstName || "Applicant",
      lastName: finalLastName || "Detail",
      email: emailField || app.email || "applicant@example.com",
      contactNumber: contactNoField || app.contactNo || "",
      address: addressField || app.address || "N/A",
      birthDate,
      formFieldValues: filteredFieldValues.map(fv => ({
        fieldId: fv.fieldId,
        fieldLabel: fv.fieldLabel,
        value: fv.value
      }))
    };
  }

  const formFieldValues: FormFieldValuePayload[] = [];

  // Append dynamic form field values if present
  if (app.formFieldValues && Array.isArray(app.formFieldValues)) {
    app.formFieldValues.forEach((fv) => {
      if (!isApplicantBiographicalOrSubmissionField(fv.fieldLabel || fv.fieldId)) {
        formFieldValues.push({
          fieldId: fv.fieldId,
          fieldLabel: fv.fieldLabel,
          value: fv.value,
        });
      }
    });
  }

  // Helper to append a field — always resolves to a real seeder GUID when available
  const addField = (label: string, val: string) => {
    if (isApplicantBiographicalOrSubmissionField(label)) return;
    formFieldValues.push({
      fieldId: resolveFieldId(label, formFields),
      fieldLabel: label,
      value: val || "N/A",
    });
  };

  // 0. NTC 1-09: Permits in the Amateur Service
  if (
    serviceCode === "NTC_1_09" ||
    serviceTitle.includes("PERMITS IN THE AMATEUR SERVICE") ||
    (serviceTitle.includes("PERMIT") && serviceTitle.includes("AMATEUR"))
  ) {
    const data = app.permitData;
    if (data) {
      const isPurchaseMode =
        data.applicationType === "Permit to Purchase" ||
        data.applicationType === "Purchase to Possess";
      const isSellTransferMode =
        data.applicationType === "Permit to Sell/Transfer";

      addField("Application Type", data.applicationType);
      addField("Applicant Name", data.applicant);
      addField("Call Sign", data.callSign);
      addField("Contact Number", data.contactNo);
      addField("Email Address", data.email);
      addField("Region", data.region);
      addField("Province", data.province);
      addField("City / Municipality", data.city);
      addField("Barangay", data.barangay);
      addField("Street", data.street);
      addField("Room / Unit / Bldg", data.room);
      addField("Zip Code", data.zipCode);

      if (isPurchaseMode) {
        addField("Frequency(ies)", data.frequency);
        addField(
          "Particulars of Equipment",
          JSON.stringify(
            data.purchaseEquipments.map((peq) => ({
              ClassOfStation: peq.classOfStation,
            }))
          )
        );
      } else if (isSellTransferMode) {
        addField("Frequency (Within Authorized Amateur Band)", data.frequency);
        addField("Bandwidth", `${data.bandwidth} ${data.unit}`.trim());
        addField("Bandwidth Value", data.bandwidth);
        addField("Bandwidth Unit", data.unit);
        addField("Emission", data.emission);
        addField("Power Output (Watts)", data.powerOutput);
        addField("Hours of Operation", data.hoursOfOperation);

        addField(
          "Particulars of Station, Equipment & Antenna",
          JSON.stringify(
            data.stationParticulars.map((sp) => ({
              StationClass: sp.stationClass,
              ExactLocation: sp.exactLocation,
              Longitude: sp.longitude,
              Latitude: sp.latitude,
              Configuration: sp.configuration,
              DataRate: sp.dataRate,
              Remarks: sp.remarks,
              Equipments: sp.equipments.map((eq) => ({
                SerialNumber: eq.serialNumber,
                FrequencyRange: eq.frequencyRange,
              })),
              Antenna: {
                Type: sp.antenna.type,
                HeightCm: sp.antenna.heightCm,
                GainDb: sp.antenna.gainDb,
                Directivity: sp.antenna.directivity,
                Diameter: sp.antenna.diameter,
                Polarization: sp.antenna.polarization,
                Beamwidth: sp.antenna.beamwidth,
                Remarks: sp.antenna.remarks,
              },
            }))
          )
        );

        addField("Name of Dealer / Seller", data.nameOfDealerOrSeller);
        addField(
          "Amateur License No. / Permit to Possess No.",
          data.amateurLicenseNoOrPermitToPossessNo
        );
        addField("Seller Address", data.sellerAddress);
      } else {
        addField("Service Area", data.serviceArea);
        addField("Assigned Frequency", data.frequency);
        addField("Bandwidth", `${data.bandwidth} ${data.unit}`.trim());
        addField("Bandwidth Value", data.bandwidth);
        addField("Bandwidth Unit", data.unit);
        addField("Emission", data.emission);
        addField("Power Output", data.powerOutput);
        addField("Hours of Operation", data.hoursOfOperation);
        addField("Station Class", data.stationClass);
        addField("Exact Location", data.exactLocation);
        addField("Longitude", data.longitude);
        addField("Latitude", data.latitude);
        addField("Configuration", data.configuration);
        addField("Data Rate", data.dataRate);
        addField("Remarks", data.remarks);
        addField(
          "Particulars of Equipment",
          JSON.stringify(
            data.equipments.map((eq) => ({
              SerialNumber: eq.serialNumber,
              FrequencyRange: eq.frequencyRange,
            }))
          )
        );
        addField("Name of Dealer", data.nameOfDealer);
        addField("Authorized Seller / Buyer", data.authorizedSellerBuyer);
        addField("OR / Invoice No", data.orInvoiceNo);
        addField("Permit / RSL No", data.permitRslNo);
      }

      const intendedUses: string[] = [];
      if (data.intendedUseStorageAt) {
        intendedUses.push(`Storage At (${data.storageAtSpecify || "Specified Location"})`);
      }
      if (data.intendedUseAdditionalRadioEquipment) {
        intendedUses.push("Additional Radio Equipment");
      }
      if (data.intendedUseNewRadioStation) {
        intendedUses.push(`New Radio Station (${data.newRadioStationSpecify || "Specified Details"})`);
      }
      if (data.intendedUseChangeOfEquipment) {
        intendedUses.push("Change of Equipment");
      }
      if (data.intendedUseOthers) {
        intendedUses.push(`Others (${data.othersSpecify || "Specified Details"})`);
      }
      addField("Intended Use", intendedUses.join(", ") || "Storage");
      addField("Storage Location Details", data.storageAtSpecify);
      addField("New Station Details", data.newRadioStationSpecify);
      addField("Other Intended Use Details", data.othersSpecify);

      const fullAddress = [
        data.room,
        data.street,
        data.barangay,
        data.city,
        data.province,
        data.region,
        data.zipCode,
      ]
        .filter(Boolean)
        .join(", ");

      const nameParts = data.applicant.trim().split(" ");
      const firstName = nameParts[0] || app.firstName;
      const lastName = nameParts.slice(1).join(" ") || app.lastName;

      return {
        applicantType: app.applicantType || "individual",
        companyName: app.companyName || undefined,
        representativeName: app.representativeName || undefined,
        firstName,
        lastName,
        email: data.email || app.email,
        contactNumber: data.contactNo || app.contactNo,
        address: fullAddress || app.address,
        birthDate: birthDate,
        formFieldValues,
      };
    }
  }

  // 1. Lifetime Amateur Radio Station License for Class A
  if (serviceTitle.includes("LIFETIME AMATEUR") || serviceCode.includes("LIFETIME")) {
    const data = app.lifetimeLicenseData;
    if (data) {
      addField("Application Type", "LIFETIME");
      addField("Call Sign", data.callSign);
      addField("Years of Active Service", data.yearsOfAmateurService);
      addField("Existing Class A License No", data.existingClassALicenseNo);
      addField("License Expiry Date", data.licenseExpiryDate);
      addField("Registered Amateur Club", data.memberClubName);
      addField("Cert of Good Standing Control No", data.certOfGoodStandingNo);
      addField("Station Location", data.location);

      return {
        applicantType: app.applicantType || "individual",
        companyName: app.companyName || undefined,
        representativeName: app.representativeName || undefined,
        firstName: data.firstName || app.firstName,
        lastName: data.lastName || app.lastName,
        email: data.email || app.email,
        contactNumber: data.contactNo || app.contactNo,
        address: data.address || app.address,
        birthDate: birthDate,
        formFieldValues,
      };
    }
  }

  // 2. Amateur Radio Station License (NEW / RENEWAL / MODIFICATION)
  if (
    serviceTitle.includes("AMATEUR RADIO STATION LICENSE") ||
    serviceTitle.includes("STATION LICENSE") ||
    serviceCode === "NTC_AMA_STATION_LICENSE"
  ) {
    const data = app.amateurLicenseData;
    if (data) {
      addField("Application Type", data.appType);
      addField("Class of Station", data.classOfStation);
      addField("Number of Years", data.noOfYears);
      if (data.appType === "RENEWAL" || data.appType === "MODIFICATION") {
        addField("Existing License No", data.licenseNo);
        addField("License Expiry Date", data.dateOfExpiry);
      }
      if (data.appType === "MODIFICATION") {
        addField("Modification Due To", data.modificationDueTo);
      }
      addField("Call Sign", data.callSign);
      addField("Station Location", data.location);
      addField("Place of Exam/Seminar", data.placeOfExamSeminar);
      addField("Date of Exam/Seminar", data.dateOfExamSeminar);
      addField("Ratings", data.ratings);
      addField("Particulars of Equipment", JSON.stringify(data.particularsEquipment));

      return {
        applicantType: app.applicantType || "individual",
        companyName: app.companyName || undefined,
        representativeName: app.representativeName || undefined,
        firstName: data.firstName || app.firstName,
        lastName: data.lastName || app.lastName,
        email: data.email || app.email,
        contactNumber: data.contactNo || app.contactNo,
        address: data.address || app.address,
        birthDate: birthDate,
        formFieldValues,
      };
    }
  }

  // 3. Radio Operator Certificates (NTC 1-02 / 1-03)
  if (
    serviceCode === "NTC_1_02" ||
    serviceCode === "NTC_1_03" ||
    serviceCode === "NTC_AMA_LICENSES" ||
    serviceTitle.includes("RADIO OPERATOR") ||
    serviceTitle.includes("AMATEUR SERVICE")
  ) {
    const data = app.radioCertData;
    if (data) {
      const isAmateurServiceCert = serviceCode === "NTC_1_03" || serviceTitle.includes("AMATEUR");
      addField("Application Type", data.appType);
      addField("Number of Years", data.years);
      if (!isAmateurServiceCert || data.classOfStation) {
        addField("Type of Certificate", data.typeOfCertificate || data.classOfStation);
      }
      if (data.appType === "RENEWAL" || data.appType === "MODIFICATION") {
        addField("Certificate Number", data.certificateNo);
        addField("Date of Expiry", data.dateOfExpiry);
      }
      if (data.appType === "MODIFICATION") {
        addField("Modification Due To", data.modificationDueTo);
      }
      addField("Applicant Name", data.applicantName || `${app.firstName} ${app.lastName}`);
      if (!isAmateurServiceCert) {
        addField("Employment Status", data.employmentStatus);
        addField("Type", data.employmentType);
        addField("Employment Location", data.employmentLocation);
        addField("Weight (kg)", data.weightKg);
        addField("Height (cm)", data.heightCm);
      }
      if (data.placeOfExamSeminar) addField("Exam Seminar Place", data.placeOfExamSeminar);
      if (data.examDate) addField("Exam Seminar Date", data.examDate);
      if (data.ratings) addField("Ratings", data.ratings);

      return {
        applicantType: app.applicantType || "individual",
        companyName: app.companyName || undefined,
        representativeName: app.representativeName || undefined,
        firstName: data.applicantName ? data.applicantName.split(" ")[0] || app.firstName : app.firstName,
        lastName: data.applicantName ? data.applicantName.split(" ").slice(1).join(" ") || app.lastName : app.lastName,
        email: data.email || app.email,
        contactNumber: data.contactNo || app.contactNo,
        address: data.address || app.address,
        birthDate: birthDate,
        formFieldValues,
      };
    }
  }

  // 2. RFID, SRD, WDN Devices (NTC 1-19)
  if (serviceCode === "NTC_1_19" || serviceTitle.includes("RFID") || serviceTitle.includes("WDN")) {
    const data = app.deviceRegData;
    const compName = app.companyName || (data ? data.businessName : "");
    const repName = app.representativeName || (app.firstName ? `${app.firstName} ${app.lastName}`.trim() : "");
    if (data) {
      addField("Registration Type", data.registrationType);
      if (data.registrationType === "Non-Dealers" || (data.invoiceNo && data.invoiceNo.trim() !== "")) {
        addField("Invoice Number", data.invoiceNo);
      }
      addField("Company Name", compName || "N/A");
      addField("Representative Name", repName || "N/A");
      addField("Business Name", data.businessName || compName);
      addField("Entity Type", data.entityType);
      addField("SEC/DTI No", data.dtiSecNo);
      addField("Device Particulars JSON", JSON.stringify(data.particulars));

      return {
        applicantType: "company",
        companyName: compName || undefined,
        representativeName: repName || undefined,
        firstName: app.firstName || compName || repName || "Applicant",
        lastName: app.lastName || "",
        email: app.email || data.email,
        contactNumber: app.contactNo || data.contactNo,
        address: app.address || data.address,
        birthDate: birthDate,
        formFieldValues,
      };
    }
  }

  // 3. TVRO Registration Certificate (NTC 1-22)
  if (serviceCode === "NTC_1_22" || serviceCode === "NTC_TVRO_CATV_LICENSES" || serviceTitle.includes("TVRO")) {
    const data = app.tvroRegData;
    const compName = app.companyName || data?.applicantName || "";
    const repName = app.representativeName || (app.firstName ? `${app.firstName} ${app.lastName}`.trim() : "");
    if (data) {
      addField("Classification", data.classification);
      addField("Applicant Name", data.applicantName);
      if (data.serviceArea) addField("Service Area", data.serviceArea);
      if (data.exactLocation) addField("Exact Location of TVRO System", data.exactLocation);
      if (data.longitude) addField("Longitude (deg-min-sec)", data.longitude);
      if (data.latitude) addField("Latitude (deg-min-sec)", data.latitude);
      addField("Particulars of Equipment", JSON.stringify(data.particularsEquipment));
      addField("Particulars of Antenna System", JSON.stringify(data.particularsOfAntennaSystem));
      addField("Particulars of Signal to be Received", JSON.stringify(data.particularsOfSignalToBeReceived));
      addField("BSD No.", data.bsdNumber || "TO BE ASSIGNED BY NTC");

      return {
        applicantType: "company",
        companyName: compName || undefined,
        representativeName: repName || undefined,
        firstName: data.applicantName || app.firstName,
        lastName: "",
        email: data.email || app.email,
        contactNumber: data.contactNo || app.contactNo,
        address: data.address || app.address,
        birthDate: birthDate,
        formFieldValues,
      };
    }
  }

  // 4. VAS Provider Registration (NTC 1-20)
  if (serviceCode === "NTC_1_20" || serviceTitle.includes("VALUE-ADDED") || serviceTitle.includes("VAS")) {
    const data = app.vasData;
    const compName = app.companyName || data?.businessName || "";
    const repName = app.representativeName || (app.firstName ? `${app.firstName} ${app.lastName}`.trim() : "");
    if (data) {
      addField("Application Type", data.appType);
      addField("Number of Years", data.years);
      addField("Company Name", data.businessName);
      addField("Business Entity Type", data.serviceType);
      addField("CPCN / PA / CA No.", data.serviceNo);
      addField("CPCN / PA / CA No. Date of Expiry", data.cpcnPaCaDateOfExpiry);
      addField("COR / VAS No.", data.certificateNumber);
      addField("COR / VAS No. Date of Expiry", data.expiryDate);
      addField("Operating Trade Name", data.isKnownByOtherName ? data.otherTradeName : "N/A");
      addField("Value-Added Services Scope", JSON.stringify(data.valueAddedServices));

      return {
        applicantType: "company",
        companyName: compName || undefined,
        representativeName: repName || undefined,
        firstName: data.businessName || app.firstName,
        lastName: "",
        email: data.email || app.email,
        contactNumber: data.contactNo || app.contactNo,
        address: data.address || app.address,
        birthDate: birthDate,
        formFieldValues,
      };
    }
  }

  // 5. Copy of Certificates (NTC 1-21)
  if (serviceCode === "NTC_1_21" || serviceTitle.includes("COPY OF CERTIFICATES") || serviceTitle.includes("COPY OF LICENSES")) {
    const data = app.copyOfCertData;
    const isCtc = data?.copyType === "CERTIFIED_TRUE_COPY" || (app.selectedVariantId && !app.selectedVariantId.endsWith("50"));
    const targetServiceVal = data?.targetService || app.formFieldValues?.find(fv => (fv.fieldLabel || "").toLowerCase().includes("service"))?.value || "";
    const targetTypeVal = data?.targetCertificateType || app.formFieldValues?.find(fv => (fv.fieldLabel || "").toLowerCase() === "type")?.value || "";
    const certNoVal = data?.certificateNo || app.formFieldValues?.find(fv => (fv.fieldLabel || "").toLowerCase().includes("certificate number"))?.value || "";
    const copiesVal = data?.numberOfCopies || app.formFieldValues?.find(fv => (fv.fieldLabel || "").toLowerCase().includes("copies"))?.value || "1";

    addField("Copy Type", isCtc ? "Certified True Copy" : "Duplicate Copy");
    if (targetServiceVal) addField("Service", targetServiceVal);
    if (targetTypeVal) addField("Type", targetTypeVal);
    if (certNoVal) addField("Certificate Number", certNoVal);
    if (isCtc) {
      addField("Number of Copies", copiesVal);
    } else {
      if (data?.applicantName) addField("Applicant Name", data.applicantName);
    }

    return {
      applicantType: app.applicantType || "individual",
      companyName: app.companyName || undefined,
      representativeName: app.representativeName || undefined,
      firstName: (data?.applicantName ? data.applicantName.split(" ")[0] : app.firstName) || app.firstName || "Applicant",
      lastName: (data?.applicantName ? data.applicantName.split(" ").slice(1).join(" ") : app.lastName) || app.lastName || "Applicant",
      email: data?.email || app.email || "applicant@example.com",
      contactNumber: data?.contactNo || app.contactNo || "09170000000",
      address: data?.address || app.address || "Philippines",
      birthDate: birthDate,
      formFieldValues,
    };
  }

  // Default Generic Serialization
  if (app.notes) addField("Filing Notes", app.notes);

  return {
    applicantType: app.applicantType || "individual",
    companyName: app.companyName || undefined,
    representativeName: app.representativeName || undefined,
    firstName: app.firstName,
    lastName: app.lastName,
    email: app.email,
    contactNumber: app.contactNo,
    address: app.address || "N/A",
    birthDate: birthDate,
    formFieldValues,
  };
}
