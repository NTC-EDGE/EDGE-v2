import {
  CERTIFICATE_SERVICES_OPTIONS,
  ROC_TYPE_OPTIONS,
  AMATEUR_CERT_TYPE_OPTIONS,
  DEVICE_REG_TYPE_OPTIONS,
  VAS_TYPE_OPTIONS,
  TVRO_TYPE_OPTIONS,
} from "./dynamicFormConstants";

export function useCertificateServicesQuery() {
  const serviceOptions = CERTIFICATE_SERVICES_OPTIONS;

  function getTypesForService(serviceName: string): Array<{ label: string; value: string }> {
    const sn = (serviceName || "").toLowerCase();
    if (sn.includes("operator") || sn.includes("roc") || sn.includes("1-02")) return ROC_TYPE_OPTIONS;
    if (sn.includes("amateur") || sn.includes("1-03")) return AMATEUR_CERT_TYPE_OPTIONS;
    if (sn.includes("rfid") || sn.includes("srd") || sn.includes("wdn") || sn.includes("1-19")) return DEVICE_REG_TYPE_OPTIONS;
    if (sn.includes("value-added") || sn.includes("vas") || sn.includes("1-20")) return VAS_TYPE_OPTIONS;
    if (sn.includes("tvro") || sn.includes("catv") || sn.includes("1-22")) return TVRO_TYPE_OPTIONS;
    return ROC_TYPE_OPTIONS;
  }

  return {
    serviceOptions,
    getTypesForService,
  };
}
