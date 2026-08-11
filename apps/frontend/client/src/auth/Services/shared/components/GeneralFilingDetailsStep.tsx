import React from "react";
import { View, Text, TextInput } from "react-native";
import { COLORS, TYPOGRAPHY } from "@edge/ui";
import { NTCService } from "../../data/servicesData";
import { GeneralApplicantData } from "../hooks/useGeneralServiceWizard";
import { ValidatedInput } from "../../../../shared/components/ValidatedInput";
import { Select } from "../../../../shared/components/Select";
import {
  RadioOperatorCertForm,
  DeviceRegistrationForm,
  TVRORegistrationForm,
  VASProviderForm,
  CopyOfCertificateForm,
  initialRadioOperatorCertData,
  initialDeviceRegistrationData,
  initialTVRORegistrationData,
  initialVASProviderData,
  initialCopyOfCertificateData,
} from "../../certificates";
import {
  AmateurRadioStationLicenseForm,
  LifetimeAmateurLicenseForm,
  initialAmateurRadioStationLicenseData,
  initialLifetimeAmateurLicenseData,
} from "../../licenses";

interface GeneralFilingDetailsStepProps {
  service: NTCService;
  activeApplicant: GeneralApplicantData;
  updateActiveApplicant: (fields: Partial<GeneralApplicantData>) => void;
}

export function GeneralFilingDetailsStep({
  service,
  activeApplicant,
  updateActiveApplicant,
}: GeneralFilingDetailsStepProps) {
  const serviceCode = (service.code || "").toUpperCase();
  const serviceTitle = (service.title || "").toUpperCase();
  const serviceCategory = (service.category || "").toUpperCase();

  // 1. Lifetime Amateur Radio Station License for Class A
  if (
    serviceTitle.includes("LIFETIME") ||
    serviceCode.includes("LIFETIME") ||
    (activeApplicant.selectedVariantId && activeApplicant.selectedVariantId.toLowerCase().includes("life"))
  ) {
    const lifetimeData = activeApplicant.lifetimeLicenseData || initialLifetimeAmateurLicenseData(activeApplicant.id);
    return (
      <LifetimeAmateurLicenseForm
        data={lifetimeData}
        onChange={(fields) =>
          updateActiveApplicant({
            lifetimeLicenseData: { ...lifetimeData, ...fields },
            firstName: fields.firstName !== undefined ? fields.firstName : activeApplicant.firstName,
            lastName: fields.lastName !== undefined ? fields.lastName : activeApplicant.lastName,
            email: fields.email !== undefined ? fields.email : activeApplicant.email,
            contactNo: fields.contactNo !== undefined ? fields.contactNo : activeApplicant.contactNo,
            address: fields.address !== undefined ? fields.address : activeApplicant.address,
          })
        }
      />
    );
  }

  // 2. Amateur Radio Station License (NEW, RENEWAL, MODIFICATION)
  if (
    serviceTitle.includes("AMATEUR") ||
    serviceTitle.includes("STATION") ||
    serviceTitle.includes("LICENSE") ||
    serviceCategory.includes("LICENSE") ||
    serviceCode.includes("LICENSE") ||
    serviceCode === "NTC_AMA_STATION_LICENSE"
  ) {
    const amateurData = activeApplicant.amateurLicenseData || initialAmateurRadioStationLicenseData(activeApplicant.id);
    return (
      <AmateurRadioStationLicenseForm
        data={amateurData}
        onChange={(fields) =>
          updateActiveApplicant({
            amateurLicenseData: { ...amateurData, ...fields },
            firstName: fields.firstName !== undefined ? fields.firstName : activeApplicant.firstName,
            lastName: fields.lastName !== undefined ? fields.lastName : activeApplicant.lastName,
            email: fields.email !== undefined ? fields.email : activeApplicant.email,
            contactNo: fields.contactNo !== undefined ? fields.contactNo : activeApplicant.contactNo,
            address: fields.address !== undefined ? fields.address : activeApplicant.address,
          })
        }
      />
    );
  }

  // 3. NTC 1-02: Commercial Radio Operator Certificates
  if (serviceCode === "NTC_1_02" || serviceTitle.includes("RADIO OPERATOR CERTIFICATES (ROC)")) {
    const radioData = activeApplicant.radioCertData || initialRadioOperatorCertData(activeApplicant.id);
    return (
      <RadioOperatorCertForm
        data={radioData}
        onChange={(fields) =>
          updateActiveApplicant({
            radioCertData: { ...radioData, ...fields },
            firstName: fields.applicantName !== undefined ? fields.applicantName.split(" ")[0] || "" : activeApplicant.firstName,
            lastName: fields.applicantName !== undefined ? fields.applicantName.split(" ").slice(1).join(" ") : activeApplicant.lastName,
            email: fields.email !== undefined ? fields.email : activeApplicant.email,
            contactNo: fields.contactNo !== undefined ? fields.contactNo : activeApplicant.contactNo,
            address: fields.address !== undefined ? fields.address : activeApplicant.address,
          })
        }
        isAmateurService={false}
      />
    );
  }

  // 4. NTC 1-03: Certificates in the Amateur Service
  if (serviceCode === "NTC_1_03" || serviceCode === "NTC_AMA_LICENSES" || serviceTitle.includes("CERTIFICATES IN THE AMATEUR SERVICE")) {
    const radioData = activeApplicant.radioCertData || initialRadioOperatorCertData(activeApplicant.id);
    return (
      <RadioOperatorCertForm
        data={radioData}
        onChange={(fields) =>
          updateActiveApplicant({
            radioCertData: { ...radioData, ...fields },
            firstName: fields.applicantName !== undefined ? fields.applicantName.split(" ")[0] || "" : activeApplicant.firstName,
            lastName: fields.applicantName !== undefined ? fields.applicantName.split(" ").slice(1).join(" ") : activeApplicant.lastName,
            email: fields.email !== undefined ? fields.email : activeApplicant.email,
            contactNo: fields.contactNo !== undefined ? fields.contactNo : activeApplicant.contactNo,
            address: fields.address !== undefined ? fields.address : activeApplicant.address,
          })
        }
        isAmateurService={true}
      />
    );
  }

  // 5. NTC 1-19: RFID, SRD, WDN Devices - Indoor
  if (serviceCode === "NTC_1_19" || serviceTitle.includes("RFID") || serviceTitle.includes("WDN")) {
    const deviceData = activeApplicant.deviceRegData || initialDeviceRegistrationData(activeApplicant.id);
    return (
      <DeviceRegistrationForm
        data={deviceData}
        onChange={(fields) =>
          updateActiveApplicant({
            deviceRegData: { ...deviceData, ...fields },
            firstName: fields.businessName !== undefined ? fields.businessName : activeApplicant.firstName,
            email: fields.email !== undefined ? fields.email : activeApplicant.email,
            contactNo: fields.contactNo !== undefined ? fields.contactNo : activeApplicant.contactNo,
            address: fields.address !== undefined ? fields.address : activeApplicant.address,
          })
        }
      />
    );
  }

  // 6. NTC 1-22: TVRO Registration Certificate
  if (serviceCode === "NTC_1_22" || serviceCode === "NTC_TVRO_CATV_LICENSES" || serviceTitle.includes("TVRO")) {
    const tvroData = activeApplicant.tvroRegData || initialTVRORegistrationData(activeApplicant.id);
    return (
      <TVRORegistrationForm
        data={tvroData}
        onChange={(fields) =>
          updateActiveApplicant({
            tvroRegData: { ...tvroData, ...fields },
            firstName: fields.applicantName !== undefined ? fields.applicantName : activeApplicant.firstName,
            email: fields.email !== undefined ? fields.email : activeApplicant.email,
            contactNo: fields.contactNo !== undefined ? fields.contactNo : activeApplicant.contactNo,
            address: fields.address !== undefined ? fields.address : activeApplicant.address,
          })
        }
      />
    );
  }

  // 7. NTC 1-20: VAS Provider Registration
  if (serviceCode === "NTC_1_20" || serviceTitle.includes("VALUE-ADDED") || serviceTitle.includes("VAS")) {
    const vasData = activeApplicant.vasData || initialVASProviderData(activeApplicant.id);
    return (
      <VASProviderForm
        data={vasData}
        onChange={(fields) =>
          updateActiveApplicant({
            vasData: { ...vasData, ...fields },
            firstName: fields.businessName !== undefined ? fields.businessName : activeApplicant.firstName,
            email: fields.email !== undefined ? fields.email : activeApplicant.email,
            contactNo: fields.contactNo !== undefined ? fields.contactNo : activeApplicant.contactNo,
            address: fields.address !== undefined ? fields.address : activeApplicant.address,
          })
        }
      />
    );
  }

  // 8. NTC 1-21: Copy of Certificates / Licenses
  if (serviceCode === "NTC_1_21" || serviceTitle.includes("COPY OF CERTIFICATES")) {
    const copyData = activeApplicant.copyOfCertData || initialCopyOfCertificateData(activeApplicant.id);
    return (
      <CopyOfCertificateForm
        data={copyData}
        onChange={(fields) =>
          updateActiveApplicant({
            copyOfCertData: { ...copyData, ...fields },
            firstName: fields.applicantName !== undefined ? fields.applicantName.split(" ")[0] || "" : activeApplicant.firstName,
            lastName: fields.applicantName !== undefined ? fields.applicantName.split(" ").slice(1).join(" ") : activeApplicant.lastName,
            email: fields.email !== undefined ? fields.email : activeApplicant.email,
            contactNo: fields.contactNo !== undefined ? fields.contactNo : activeApplicant.contactNo,
            address: fields.address !== undefined ? fields.address : activeApplicant.address,
          })
        }
      />
    );
  }

  // Generic Fallback Form with Amateur Station License structure
  const fallbackAmateurData = activeApplicant.amateurLicenseData || initialAmateurRadioStationLicenseData(activeApplicant.id);
  return (
    <AmateurRadioStationLicenseForm
      data={fallbackAmateurData}
      onChange={(fields) =>
        updateActiveApplicant({
          amateurLicenseData: { ...fallbackAmateurData, ...fields },
          firstName: fields.firstName !== undefined ? fields.firstName : activeApplicant.firstName,
          lastName: fields.lastName !== undefined ? fields.lastName : activeApplicant.lastName,
          email: fields.email !== undefined ? fields.email : activeApplicant.email,
          contactNo: fields.contactNo !== undefined ? fields.contactNo : activeApplicant.contactNo,
          address: fields.address !== undefined ? fields.address : activeApplicant.address,
        })
      }
    />
  );
}
