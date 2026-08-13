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

  // 4. Station & Technical Equipment
  addField("Service Area", data.serviceArea);
  addField("Assigned Frequency", data.frequency);
  addField("Bandwidth", `${data.bandwidth} ${data.unit}`.trim());
  addField("Bandwidth Value", data.bandwidth);
  addField("Bandwidth Unit", data.unit);
  addField("Emission", data.emission);
  addField("Power Output", data.powerOutput);
  addField("Hours of Operation", data.hoursOfOperation);

  // 5. Class of Station & Location Particulars
  addField("Station Class", data.stationClass);
  addField("Exact Location", data.exactLocation);
  addField("Longitude", data.longitude);
  addField("Latitude", data.latitude);
  addField("Configuration", data.configuration);
  addField("Data Rate", data.dataRate);
  addField("Remarks", data.remarks);

  // 6. Particulars of Equipment
  addField(
    "Particulars of Equipment",
    JSON.stringify(
      data.equipments.map((eq) => ({
        SerialNumber: eq.serialNumber,
        FrequencyRange: eq.frequencyRange,
      }))
    )
  );

  // 7. Source of Equipment
  addField("Name of Dealer", data.nameOfDealer);
  addField("Authorized Seller / Buyer", data.authorizedSellerBuyer);
  addField("OR / Invoice No", data.orInvoiceNo);
  addField("Permit / RSL No", data.permitRslNo);

  // 8. Intended Use of Equipment
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
