import { NTCService } from "../../data/servicesData";
import { GeneralApplicantData } from "../../shared/hooks/useGeneralServiceWizard";

export interface FormFieldValuePayload {
  fieldId: string;
  fieldLabel?: string;
  value: string;
}

export interface SerializedApplicantPayload {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  address: string;
  birthDate: string;
  formFieldValues: FormFieldValuePayload[];
}

export function serializeCertificateApplicant(
  app: GeneralApplicantData,
  service: NTCService,
  formFields: any[] = []
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
  const formFieldValues: FormFieldValuePayload[] = [];

  // Append dynamic form field values if present
  if (app.formFieldValues && Array.isArray(app.formFieldValues)) {
    app.formFieldValues.forEach((fv) => {
      formFieldValues.push({
        fieldId: fv.fieldId,
        fieldLabel: fv.fieldLabel,
        value: fv.value,
      });
    });
  }

  // Helper to append field
  const addField = (label: string, val: string) => {
    const matched = formFields.find(
      (f) => (f.label || "").toLowerCase().includes(label.toLowerCase())
    );
    formFieldValues.push({
      fieldId: matched ? matched.fieldId : `f-${label.toLowerCase().replace(/\s+/g, "-")}`,
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
      addField("Application Type", data.appType);
      addField("Number of Years", data.years);
      addField("Type of Certificate", data.typeOfCertificate || data.classOfStation);
      if (data.appType === "RENEWAL" || data.appType === "MODIFICATION") {
        addField("Existing Certificate No", data.certificateNo);
        addField("Date of Expiry", data.dateOfExpiry);
      }
      if (data.appType === "MODIFICATION") {
        addField("Modification Details", data.modificationDueTo);
      }
      addField("Applicant Name", data.applicantName || `${app.firstName} ${app.lastName}`);
      addField("Employment Status", data.employmentStatus);
      addField("Employment Location", data.employmentLocation);
      addField("Weight (kg)", data.weightKg);
      addField("Height (cm)", data.heightCm);
      addField("Exam Seminar Place", data.placeOfExamSeminar);
      addField("Exam Seminar Date", data.examDate);
      addField("Ratings", data.ratings);

      return {
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
    if (data) {
      addField("Registration Type", data.registrationType);
      if (data.registrationType === "Non-Dealers") {
        addField("Commercial Invoice No", data.invoiceNo);
      }
      addField("Business Name", data.businessName);
      addField("Entity Type", data.entityType);
      addField("SEC/DTI No", data.dtiSecNo);
      addField("Device Particulars JSON", JSON.stringify(data.particulars));

      return {
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

  // 3. TVRO Registration Certificate (NTC 1-22)
  if (serviceCode === "NTC_1_22" || serviceCode === "NTC_TVRO_CATV_LICENSES" || serviceTitle.includes("TVRO")) {
    const data = app.tvroRegData;
    if (data) {
      addField("Classification", data.classification);
      addField("Number of Years", data.years);
      addField("Applicant Name", data.applicantName);
      addField("Particulars of Equipment", JSON.stringify(data.particularsEquipment));
      addField("Particulars of Antenna System", JSON.stringify(data.particularsOfAntennaSystem));
      addField("Particulars of Signal to be Received", JSON.stringify(data.particularsOfSignalToBeReceived));

      return {
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
    if (data) {
      addField("Application Type", data.appType);
      addField("Number of Years", data.years);
      addField("Company Name", data.businessName);
      addField("Business Entity Type", data.serviceType);
      if (data.appType === "RENEWAL" || data.appType === "MODIFICATION") {
        addField("COR/VAS Certificate No", data.certificateNumber);
        addField("COR/VAS Expiry Date", data.expiryDate);
      }
      addField("CPCN/PA/CA License No", data.serviceNo);
      addField("CPCN/PA/CA Expiration Date", data.cpcnPaCaDateOfExpiry);
      addField("Operating Trade Name", data.isKnownByOtherName ? data.otherTradeName : "N/A");
      addField("Value-Added Services Scope", JSON.stringify(data.valueAddedServices));

      return {
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
    if (data) {
      addField("Copy Type", data.copyType);
      addField("Target Service", data.targetService);
      addField("Original Certificate No", data.certificateNo);
      if (data.copyType === "CERTIFIED_TRUE_COPY") {
        addField("Number of Copies", data.numberOfCopies);
      } else {
        addField("Applicant Name", data.applicantName);
        addField("Circumstances of Loss", data.circumstancesOfLoss);
      }

      return {
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

  // Default Generic Serialization
  addField("Full Name", `${app.firstName} ${app.lastName}`.trim());
  addField("Email", app.email);
  addField("Contact Number", app.contactNo);
  addField("Address", app.address);
  addField("Filing Notes", app.notes);

  return {
    firstName: app.firstName,
    lastName: app.lastName,
    email: app.email,
    contactNumber: app.contactNo,
    address: app.address || "N/A",
    birthDate: birthDate,
    formFieldValues,
  };
}
