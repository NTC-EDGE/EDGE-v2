import { StructuredNameData } from "../ApplicantNameField";

export interface FieldDto {
  id?: string;
  fieldId?: string;
  label: string;
  fieldType?: string;
  type?: string;
  isRequired?: boolean;
  isCompact?: boolean;
  options?: Array<{ label: string; value: string } | string>;
  placeholder?: string;
  orderIndex?: number;
  validationRules?: string;
  visibilityCondition?: string;
  repeaterColumns?: unknown[];
}

export interface FormSectionDto {
  id?: string;
  key?: string;
  title: string;
  description?: string;
  orderIndex?: number;
  visibilityCondition?: string;
  fields: FieldDto[];
}

export interface FormDto {
  id?: string;
  formId?: string;
  version: string;
  serviceId?: string;
  serviceName?: string;
  serviceCode?: string;
  name?: string;
  description?: string;
  sections: FormSectionDto[];
}

export interface DynamicFormRendererProps {
  form: FormDto;
  values: Record<string, string>;
  onChange: (fieldId: string, label: string, value: string) => void;
  onStructuredNameChange?: (data: StructuredNameData) => void;
  structuredNameData?: Partial<StructuredNameData>;
  applicantName?: string;
  allowCompany?: boolean;
  applicantType?: "individual" | "company";
  serviceCategory?: string;
  serviceTitle?: string;
  selectedVariantId?: string;
  onVariantChange?: (variantId: string, variantName: string) => void;
  selectedElementId?: string;
  onElementChange?: (elementId: string, elementTitle: string) => void;
  noOfYears?: string;
  onNoOfYearsChange?: (years: string) => void;
  showApplicationTypeSection?: boolean;
  variants?: Array<{ id: string; name?: string; type?: string; description?: string; isIndividual?: boolean; [key: string]: unknown }>;
  variantElements?: Array<{ id: string; code?: string; name?: string; description?: string; [key: string]: unknown }>;
  errors?: Record<string, string>;
  hideSections?: string[];
  isBulk?: boolean;
  appMode?: "SINGLE" | "BULK" | "";
}

export interface FormVariantFlags {
  catLower: string;
  titLower: string;
  varDesc: string;
  varType: string;
  isVas: boolean;
  isDuplicateCopy: boolean;
  isCertifiedTrueCopy: boolean;
  isCopyOfCert: boolean;
  isAmateurPermitService: boolean;
  isAeroService: boolean;
  isAeroStationPurchase: boolean;
  isAeroStationPossess: boolean;
  isAmateurPurchaseVariant: boolean;
  isAmateurPurchasePossessVariant: boolean;
  isAmateurStorageVariant: boolean;
  isAmateurSellTransfer: boolean;
  isAmateurCert: boolean;
  isCpeAccreditation: boolean;
  isRocService: boolean;
  isModification: boolean;
  isRenewal: boolean;
  isRenewalOrMod: boolean;
  isLifetimeSupplementary: boolean;
  isVanity: boolean;
  isVanityRen: boolean;
  isVanityNew: boolean;
  isSpecialEvent: boolean;
  isForeignVisitor: boolean;
  isVanityOrSpecialEvent: boolean;
  isNonIndividualEntity: boolean;
  isIndividualVar: boolean;
  showElements: boolean;
  showNumberOfYears: boolean;
  isPermitService: boolean;
}
