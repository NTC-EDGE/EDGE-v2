export {
  DEFAULT_EQUIPMENT_COLUMNS,
  DEFAULT_REQUEST_DEVICE_COLUMNS,
  DEFAULT_REQUEST_SIM_COLUMNS,
  DEFAULT_COMPLAINT_ATTACHMENT_COLUMNS,
  DEFAULT_STATION_PARTICULARS_COLUMNS,
  DEFAULT_DEVICE_REGISTRATION_COLUMNS,
  DEFAULT_TVRO_EQUIPMENT_COLUMNS,
  DEFAULT_TVRO_ANTENNA_COLUMNS,
  DEFAULT_TVRO_SIGNAL_COLUMNS,
  DEFAULT_OFFICER_REPEATER_COLUMNS,
  resolveDefaultRepeaterColumns,
} from "./utils/repeaterPresets";

export {
  generateId,
  isRecord,
  isFormSchema,
  getFieldIcon,
  getFieldLabel,
  createDefaultField,
  normalizeFieldType,
} from "./utils/fieldDefaults";

export {
  parseFieldVariantOverrides,
  parseFormMetadata,
  parseFieldOptions,
  parseRepeaterColumns,
  parseFieldCondition,
} from "./utils/fieldParsers";

export {
  deleteFieldWithSection,
  formatApplicationTypeLabel,
  formatServiceVariantDisplayName,
  inferApplicationTypeFromVariantName,
  findMatchingVariant,
  variantNamesMatch,
  getVariantEquivalentKey,
  isFieldApplicableForVariant,
  isFieldUnusedByAllVariants,
  getVariantsUsingField,
  getVariantsUsingSection,
  findVariantOverrideEntry,
  resolveFieldForVariant,
  applyVariantPropertyOverride,
  isExclusiveToVariant,
  excludeVariantFromField,
  deleteFieldOrSectionForVariant,
  resetVariantToBaseFields,
  detectSharedChangesImpact,
} from "./utils/variantConditionUtils";

export {
  type BackendFormDtoLike,
  convertBackendFormToSchema,
} from "./utils/schemaFromBackend";

export {
  type FormBackendMetadata,
  convertSchemaToBackendSections,
} from "./utils/schemaToBackend";

export {
  remapFieldDependenciesWithIdMap,
  cloneFormFieldsWithFreshIds,
  reorderFieldsWithSections,
  duplicateFieldWithSection,
} from "./utils/fieldOperations";
