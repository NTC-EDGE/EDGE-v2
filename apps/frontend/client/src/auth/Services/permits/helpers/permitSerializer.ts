import { NTCService } from "../../data/servicesData";
import { AmateurPermitData } from "../types/permitTypes";

export interface FormFieldValuePayload {
  fieldId: string;
  fieldLabel?: string;
  value: string;
}

export interface SerializedPermitPayload {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  address: string;
  formFieldValues: FormFieldValuePayload[];
}

export function serializePermitData(
  data: AmateurPermitData,
  service?: NTCService,
  formFields: Array<{ fieldId: string; label?: string }> = []
): SerializedPermitPayload {
  const formFieldValues: FormFieldValuePayload[] = [];

  const addField = (label: string, val: string) => {
    const matched = formFields.find(
      (f) => (f.label || "").toLowerCase().includes(label.toLowerCase())
    );
    formFieldValues.push({
      fieldId: matched ? matched.fieldId : `f-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      fieldLabel: label,
      value: val || "N/A",
    });
  };

  const isPurchaseMode =
    data.applicationType === "Permit to Purchase" ||
    data.applicationType === "Purchase to Possess";

  const isSellTransferMode =
    data.applicationType === "Permit to Sell/Transfer";

  // 1. Application Type
  addField("Application Type", data.applicationType);

  // 2. Basic Info & Contact
  addField("Applicant Name", data.applicant);
  addField("Call Sign", data.callSign);
  addField("Contact Number", data.contactNo);
  addField("Email Address", data.email);

  // 3. Address
  addField("Region", data.region);
  addField("Province", data.province);
  addField("City / Municipality", data.city);
  addField("Barangay", data.barangay);
  addField("Street", data.street);
  addField("Room / Unit / Bldg", data.room);
  addField("Zip Code", data.zipCode);

  if (isPurchaseMode) {
    // Purchase / Purchase to Possess
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
    // Permit to Sell / Transfer
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
    // Possess for Storage
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

  // Intended Use of Equipment
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

  // Format full address
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
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return {
    firstName,
    lastName,
    email: data.email,
    contactNumber: data.contactNo,
    address: fullAddress,
    formFieldValues,
  };
}
