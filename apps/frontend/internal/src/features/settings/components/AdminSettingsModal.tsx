import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide, useTheme } from '@edge/ui';
import { fieldOfficeSchema } from '../schemas/fieldOffice.schema';

export type ModalType =
  | 'edit-config'
  | 'add-branch'
  | 'add-requirement'
  | 'edit-requirement'
  | 'add-fee'
  | 'edit-fee'
  | 'add-note'
  | 'edit-note'
  | 'add-form'
  | 'none';

export interface MappedDocInput {
  id: string;
  name: string;
  isRequired: boolean;
}

export interface FeeBreakdownItemInput {
  id: string;
  name: string;
  amount: number;
  calculationMode?: 'StandardMultiplier' | 'CustomFormula' | 'TieredMatrix';
  formula?: string;
  multiplyByValidityYears?: boolean;
  multiplyByUnits?: boolean;
  multiplyByChannels?: boolean;
  multiplyByPages?: boolean;
  applyLateRenewalSurcharge?: boolean;
  includeDst?: boolean;
  dstAmount?: number;
}

export interface ModalInitialData {
  id?: string;
  category?: string;
  title?: string;
  name?: string;
  subLabel?: string;
  code?: string;
  branchType?: 'Main Office' | 'Field Office';
  branchCategory?: 'Main' | 'Extension';
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  officerName?: string;
  officerEmail?: string;
  description?: string;
  isActive?: boolean;
  allowSpectrumInspection?: boolean;
  allowPermitIssuance?: boolean;
  allowComplaintReception?: boolean;
  amount?: number;
  instructions?: string;
  mappedDocuments?: MappedDocInput[];
  feeBreakdown?: FeeBreakdownItemInput[];
  status?: 'Published' | 'Draft';
  serviceType?: string;
  rcCodeSoa?: string;
  rcCodeOp?: string;
  fundCluster?: string;
  mfoPapCode?: string;
  requestAndComplaintRouting?: 'DirectToLegal' | 'DirectToEvaluator';
  allowManualSoaNumber?: boolean;
  allowManualOpNumber?: boolean;
}

interface AdminSettingsModalProps {
  visible: boolean;
  type: ModalType;
  initialData?: ModalInitialData;
  onClose: () => void;
  onSave: (data: {
    title: string;
    name: string;
    subLabel: string;
    code: string;
    branchType: 'Main Office' | 'Field Office';
    branchCategory?: 'Main' | 'Extension';
    address?: string;
    contactPhone?: string;
    contactEmail?: string;
    officerName?: string;
    officerEmail?: string;
    description?: string;
    isActive?: boolean;
    allowSpectrumInspection?: boolean;
    allowPermitIssuance?: boolean;
    allowComplaintReception?: boolean;
    amount: number;
    instructions: string;
    mappedDocuments?: MappedDocInput[];
    feeBreakdown?: FeeBreakdownItemInput[];
    status?: 'Published' | 'Draft';
    serviceType?: string;
    rcCodeSoa?: string;
    rcCodeOp?: string;
    fundCluster?: string;
    mfoPapCode?: string;
    requestAndComplaintRouting?: 'DirectToLegal' | 'DirectToEvaluator';
    allowManualSoaNumber?: boolean;
    allowManualOpNumber?: boolean;
  }) => void;
}

const SERVICE_TYPE_OPTIONS = [
  'Aeronautical Station Permit to POSSESS',
  'Amateur Radio Operator Certificate (NEW)',
  'Amateur Radio Operator Certificate (RENEWAL)',
  'Radiotelegraphy(NEW)',
  'Radiotelegraphy(RENEWAL)',
  'Aircraft Station License (MODIFICATION)',
  'Amateur Club Radio Station License (MODIFICATION)',
  'Amateur Radio Station License',
  'Ship Station License (NEW)',
];

const FEE_TYPE_OPTIONS = [
  'Filing Fee',
  'Permit Fee',
  'License Fee (3 Years)',
  'Modification License Fee',
  'Inspection Fee',
  'Processing Fee',
  'Documentary Stamp Tax',
  'Safety Certificate Fee',
  'Examination & Filing Fee',
  'Permit to Possess Fee',
];

export function AdminSettingsModal({
  visible,
  type,
  initialData,
  onClose,
  onSave,
}: AdminSettingsModalProps) {
  const { colors, isDark } = useTheme();
  const [titleInput, setTitleInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [subLabelInput, setSubLabelInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [branchType, setBranchType] = useState<'Main Office' | 'Field Office'>('Main Office');
  const [branchCategory, setBranchCategory] = useState<'Main' | 'Extension'>('Main');
  const [addressInput, setAddressInput] = useState('');
  const [contactPhoneInput, setContactPhoneInput] = useState('');
  const [contactEmailInput, setContactEmailInput] = useState('');
  const [officerNameInput, setOfficerNameInput] = useState('');
  const [officerEmailInput, setOfficerEmailInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [allowSpectrumInspectionToggle, setAllowSpectrumInspectionToggle] = useState(true);
  const [allowPermitIssuanceToggle, setAllowPermitIssuanceToggle] = useState(true);
  const [allowComplaintReceptionToggle, setAllowComplaintReceptionToggle] = useState(true);
  const [isActiveToggle, setIsActiveToggle] = useState(true);
  const [formStatus, setFormStatus] = useState<'Published' | 'Draft'>('Draft');
  const [rcCodeSoaInput, setRcCodeSoaInput] = useState('');
  const [rcCodeOpInput, setRcCodeOpInput] = useState('');
  const [fundClusterInput, setFundClusterInput] = useState('01');
  const [mfoPapCodeInput, setMfoPapCodeInput] = useState('');
  const [routingInput, setRoutingInput] = useState<'DirectToLegal' | 'DirectToEvaluator'>('DirectToLegal');
  const [allowManualSoaNumberToggle, setAllowManualSoaNumberToggle] = useState(false);
  const [allowManualOpNumberToggle, setAllowManualOpNumberToggle] = useState(false);

  // Error & Loading States
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Validation Satisfaction Check via Zod
  const isFormSatisfied = useMemo(() => {
    if (type === 'add-branch') {
      const parsed = fieldOfficeSchema.safeParse({
        name: nameInput,
        code: codeInput,
        category: branchCategory,
        address: addressInput,
        contactPhone: contactPhoneInput,
        contactEmail: contactEmailInput,
        officerName: officerNameInput,
        officerEmail: officerEmailInput,
        description: descriptionInput,
        isActive: isActiveToggle,
        allowSpectrumInspection: allowSpectrumInspectionToggle,
        allowPermitIssuance: allowPermitIssuanceToggle,
        allowComplaintReception: allowComplaintReceptionToggle,
      });
      return parsed.success;
    }
    if (type === 'edit-config') {
      return nameInput.trim().length > 0 || titleInput.trim().length > 0;
    }
    return true;
  }, [
    type,
    nameInput,
    codeInput,
    branchCategory,
    addressInput,
    contactPhoneInput,
    contactEmailInput,
    officerNameInput,
    officerEmailInput,
    descriptionInput,
    isActiveToggle,
    allowSpectrumInspectionToggle,
    allowPermitIssuanceToggle,
    allowComplaintReceptionToggle,
    titleInput,
  ]);

  const isSaveDisabled = isSubmitting || !isFormSatisfied;

  // On Blur Validation Handler for individual fields
  const handleBlur = (fieldName: string) => {
    if (type !== 'add-branch') return;
    const parsed = fieldOfficeSchema.safeParse({
      name: nameInput,
      code: codeInput,
      category: branchCategory,
      address: addressInput,
      contactPhone: contactPhoneInput,
      contactEmail: contactEmailInput,
      officerName: officerNameInput,
      officerEmail: officerEmailInput,
      description: descriptionInput,
      isActive: isActiveToggle,
      allowSpectrumInspection: allowSpectrumInspectionToggle,
      allowPermitIssuance: allowPermitIssuanceToggle,
      allowComplaintReception: allowComplaintReceptionToggle,
    });

    if (!parsed.success) {
      const issue = parsed.error.issues.find((i) => String(i.path[0]) === fieldName);
      if (issue) {
        setFieldErrors((prev) => ({ ...prev, [fieldName]: issue.message }));
      } else {
        setFieldErrors((prev) => ({ ...prev, [fieldName]: '' }));
      }
    } else {
      setFieldErrors((prev) => ({ ...prev, [fieldName]: '' }));
    }
  };
  const [amountInput, setAmountInput] = useState('');
  const [instructionsInput, setInstructionsInput] = useState('');

  // Dropdown visibility states
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isServiceTypeDropdownOpen, setIsServiceTypeDropdownOpen] = useState(false);
  const [isFormStatusDropdownOpen, setIsFormStatusDropdownOpen] = useState(false);
  const [activeFeeDropdownId, setActiveFeeDropdownId] = useState<string | null>(null);

  // Mapped Documents State
  const [mappedDocs, setMappedDocs] = useState<MappedDocInput[]>([]);

  // Fee Breakdown Items State
  const [feeBreakdowns, setFeeBreakdowns] = useState<FeeBreakdownItemInput[]>([]);

  useEffect(() => {
    setErrorMessage(null);
    setFieldErrors({});
    setIsSubmitting(false);
    if (visible && initialData !== undefined && initialData !== null) {
      setTitleInput(initialData.serviceType ?? initialData.title ?? 'Aeronautical Station Permit to POSSESS');
      setNameInput(initialData.name ?? initialData.title ?? '');
      setSubLabelInput(initialData.subLabel ?? '');
      setCodeInput(initialData.code ?? 'ZC-001');
      setBranchType(initialData.branchType === 'Field Office' ? 'Field Office' : 'Main Office');
      setBranchCategory(initialData.branchCategory === 'Extension' || initialData.branchType === 'Field Office' ? 'Extension' : 'Main');
      setAddressInput(initialData.address ?? '');
      setContactPhoneInput(initialData.contactPhone ?? '');
      setContactEmailInput(initialData.contactEmail ?? '');
      setOfficerNameInput(initialData.officerName ?? '');
      setOfficerEmailInput(initialData.officerEmail ?? '');
      setDescriptionInput(initialData.description ?? '');
      setAllowSpectrumInspectionToggle(initialData.allowSpectrumInspection ?? true);
      setAllowPermitIssuanceToggle(initialData.allowPermitIssuance ?? true);
      setAllowComplaintReceptionToggle(initialData.allowComplaintReception ?? true);
      setFormStatus(initialData.status === 'Published' ? 'Published' : 'Draft');
      setAmountInput(initialData.amount !== undefined ? String(initialData.amount) : '');
      setInstructionsInput(initialData.instructions ?? '1.\n2.\n3.');
      setIsActiveToggle(initialData.isActive ?? true);
      setRcCodeSoaInput(initialData.rcCodeSoa ?? '');
      setRcCodeOpInput(initialData.rcCodeOp ?? '');
      setFundClusterInput(initialData.fundCluster ?? '01');
      setMfoPapCodeInput(initialData.mfoPapCode ?? '');
      setRoutingInput(initialData.requestAndComplaintRouting === 'DirectToEvaluator' ? 'DirectToEvaluator' : 'DirectToLegal');
      setAllowManualSoaNumberToggle(initialData.allowManualSoaNumber === true);
      setAllowManualOpNumberToggle(initialData.allowManualOpNumber === true);
      setMappedDocs(
        initialData.mappedDocuments && initialData.mappedDocuments.length > 0
          ? initialData.mappedDocuments
          : [
            { id: 'doc-1', name: 'Valid Government Issued ID', isRequired: true },
            { id: 'doc-2', name: 'Barangay Clearance', isRequired: true },
          ]
      );
      setFeeBreakdowns(
        initialData.feeBreakdown && initialData.feeBreakdown.length > 0
          ? initialData.feeBreakdown
          : [
            { id: 'fb-1', name: 'Filing Fee', amount: 0 },
          ]
      );
    } else {
      setTitleInput('Aeronautical Station Permit to POSSESS');
      setNameInput('');
      setSubLabelInput('');
      setCodeInput('');
      setBranchType('Main Office');
      setBranchCategory('Main');
      setAddressInput('');
      setContactPhoneInput('');
      setContactEmailInput('');
      setOfficerNameInput('');
      setOfficerEmailInput('');
      setDescriptionInput('');
      setAllowSpectrumInspectionToggle(true);
      setAllowPermitIssuanceToggle(true);
      setAllowComplaintReceptionToggle(true);
      setFormStatus('Draft');
      setAmountInput('');
      setInstructionsInput('1.\n2.\n3.');
      setIsActiveToggle(true);
      setRcCodeSoaInput('');
      setRcCodeOpInput('');
      setFundClusterInput('01');
      setMfoPapCodeInput('');
      setRoutingInput('DirectToLegal');
      setAllowManualSoaNumberToggle(false);
      setAllowManualOpNumberToggle(false);
      setMappedDocs([
        { id: 'doc-1', name: 'Valid Government Issued ID', isRequired: true },
        { id: 'doc-2', name: 'Barangay Clearance', isRequired: true },
      ]);
      setFeeBreakdowns([
        { id: 'fb-1', name: 'Filing Fee', amount: 0 },
      ]);
    }
    setIsCategoryDropdownOpen(false);
    setIsServiceTypeDropdownOpen(false);
    setIsFormStatusDropdownOpen(false);
    setActiveFeeDropdownId(null);
  }, [visible, initialData]);

  if (!visible || type === 'none') return null;

  const categoryName = initialData?.category ?? '';
  const isRequirementModal = type === 'add-requirement' || type === 'edit-requirement';
  const isFeeModal = type === 'add-fee' || type === 'edit-fee';
  const isNoteModal = type === 'add-note' || type === 'edit-note';
  const isFormModal = type === 'add-form';

  const getModalTitle = () => {
    switch (type) {
      case 'edit-config':
        if (categoryName === 'Commissioner') return 'Edit Commissioner';
        if (categoryName === 'Support Contact') return 'Edit Support Contact';
        if (categoryName === 'Office Details') return 'Edit Office Details';
        if (categoryName === 'Region Summary') return 'Edit Region Summary';
        return 'Edit Regional Configuration';
      case 'add-branch':
        return initialData?.id ? 'Edit Regional Field Office' : 'Add Regional Field Office';
      case 'add-requirement':
        return 'Add Service Requirements Checklist';
      case 'edit-requirement':
        return 'Edit Service Requirements Checklist';
      case 'add-fee':
        return 'Add Mapped Surcharges / Fees';
      case 'edit-fee':
        return 'Edit Mapped Surcharges / Fees';
      case 'add-note':
        return 'Add Service Instruction Notes';
      case 'edit-note':
        return 'Edit Service Instruction Notes';
      case 'add-form':
        return initialData?.id ? 'Edit Form Template' : 'Add New Form Template';
      default:
        return 'Admin Settings';
    }
  };

  const getSaveButtonText = () => {
    if (isRequirementModal || isFeeModal) return 'Save Configuration';
    if (isNoteModal) return 'Save Notes';
    if (isFormModal) return 'Save Form';
    return 'Save Changes';
  };

  // Requirement Handlers
  const handleAddDocumentItem = () => {
    const newItem: MappedDocInput = {
      id: `doc-${Date.now()}`,
      name: `New Document Proof #${mappedDocs.length + 1}`,
      isRequired: true,
    };
    setMappedDocs((prev) => [...prev, newItem]);
  };

  const handleToggleRequired = (id: string, isReq: boolean) => {
    setMappedDocs((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, isRequired: isReq } : doc))
    );
  };

  const handleUpdateDocName = (id: string, newName: string) => {
    setMappedDocs((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, name: newName } : doc))
    );
  };

  const handleDeleteDocItem = (id: string) => {
    setMappedDocs((prev) => prev.filter((doc) => doc.id !== id));
  };

  // Fee Handlers
  const handleAddFeeItem = () => {
    const newFeeItem: FeeBreakdownItemInput = {
      id: `fb-${Date.now()}`,
      name: 'Filing Fee',
      amount: 0,
      calculationMode: 'StandardMultiplier',
      formula: '{RATE}',
      multiplyByValidityYears: false,
      multiplyByUnits: false,
      multiplyByChannels: false,
      multiplyByPages: false,
      applyLateRenewalSurcharge: false,
      includeDst: true,
      dstAmount: 30.00,
    };
    setFeeBreakdowns((prev) => [...prev, newFeeItem]);
  };

  const handleUpdateFeeName = (id: string, name: string) => {
    setFeeBreakdowns((prev) =>
      prev.map((fb) => (fb.id === id ? { ...fb, name } : fb))
    );
  };

  const handleUpdateFeeAmount = (id: string, val: string) => {
    const parsed = parseFloat(val);
    setFeeBreakdowns((prev) =>
      prev.map((fb) => (fb.id === id ? { ...fb, amount: isNaN(parsed) ? 0 : parsed } : fb))
    );
  };

  const handleUpdateFeeMode = (id: string, mode: 'StandardMultiplier' | 'CustomFormula') => {
    setFeeBreakdowns((prev) =>
      prev.map((fb) => (fb.id === id ? { ...fb, calculationMode: mode } : fb))
    );
  };

  const handleUpdateFeeFormula = (id: string, formula: string) => {
    setFeeBreakdowns((prev) =>
      prev.map((fb) => (fb.id === id ? { ...fb, formula } : fb))
    );
  };

  const handleToggleFeeMultiplier = (
    id: string,
    field: 'years' | 'units' | 'channels' | 'pages' | 'surcharge' | 'dst'
  ) => {
    setFeeBreakdowns((prev) =>
      prev.map((fb) => {
        if (fb.id !== id) return fb;
        switch (field) {
          case 'years':
            return { ...fb, multiplyByValidityYears: !fb.multiplyByValidityYears };
          case 'units':
            return { ...fb, multiplyByUnits: !fb.multiplyByUnits };
          case 'channels':
            return { ...fb, multiplyByChannels: !fb.multiplyByChannels };
          case 'pages':
            return { ...fb, multiplyByPages: !fb.multiplyByPages };
          case 'surcharge':
            return { ...fb, applyLateRenewalSurcharge: !fb.applyLateRenewalSurcharge };
          case 'dst':
            return { ...fb, includeDst: !fb.includeDst };
          default:
            return fb;
        }
      })
    );
  };

  const handleDeleteFeeItem = (id: string) => {
    setFeeBreakdowns((prev) => prev.filter((fb) => fb.id !== id));
  };

  const handleSave = async () => {
    if (type === 'add-branch') {
      const zodResult = fieldOfficeSchema.safeParse({
        name: nameInput,
        code: codeInput,
        category: branchCategory,
        address: addressInput,
        contactPhone: contactPhoneInput,
        contactEmail: contactEmailInput,
        officerName: officerNameInput,
        officerEmail: officerEmailInput,
        description: descriptionInput,
        isActive: isActiveToggle,
        allowSpectrumInspection: allowSpectrumInspectionToggle,
        allowPermitIssuance: allowPermitIssuanceToggle,
        allowComplaintReception: allowComplaintReceptionToggle,
      });

      if (!zodResult.success) {
        const errors: Record<string, string> = {};
        for (const issue of zodResult.error.issues) {
          const pathKey = String(issue.path[0]);
          if (pathKey && !errors[pathKey]) {
            errors[pathKey] = issue.message;
          }
        }
        setFieldErrors(errors);
        setErrorMessage('Please fix the highlighted errors below before saving.');
        return;
      }
    }

    setErrorMessage(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const totalFromBreakdowns = feeBreakdowns.reduce((acc, curr) => acc + curr.amount, 0);
      const parsedAmount = parseFloat(amountInput);
      const finalAmount = totalFromBreakdowns > 0 ? totalFromBreakdowns : (isNaN(parsedAmount) ? 0 : parsedAmount);

      await onSave({
        title: nameInput || titleInput,
        name: nameInput,
        subLabel: subLabelInput,
        code: codeInput,
        branchType: branchCategory === 'Extension' ? 'Field Office' : 'Main Office',
        branchCategory,
        address: addressInput,
        contactPhone: contactPhoneInput,
        contactEmail: contactEmailInput,
        officerName: officerNameInput,
        officerEmail: officerEmailInput,
        description: descriptionInput,
        isActive: isActiveToggle,
        allowSpectrumInspection: allowSpectrumInspectionToggle,
        allowPermitIssuance: allowPermitIssuanceToggle,
        allowComplaintReception: allowComplaintReceptionToggle,
        amount: finalAmount,
        instructions: instructionsInput,
        mappedDocuments: mappedDocs,
        feeBreakdown: feeBreakdowns,
        status: formStatus,
        serviceType: titleInput,
        rcCodeSoa: rcCodeSoaInput.trim(),
        rcCodeOp: rcCodeOpInput.trim(),
        fundCluster: fundClusterInput.trim(),
        mfoPapCode: mfoPapCodeInput.trim(),
        requestAndComplaintRouting: routingInput,
        allowManualSoaNumber: allowManualSoaNumberToggle,
        allowManualOpNumber: allowManualOpNumberToggle,
      });
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save. Please check your inputs.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modalCard,
            { backgroundColor: colors.cardBg, borderColor: colors.border },
            (type === 'edit-config' || type === 'add-branch' || isRequirementModal || isFeeModal || isNoteModal || isFormModal) && styles.modalCardWide,
            SHADOWS.modal,
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              {type === 'edit-config' && (
                <Text style={styles.topBadgeText}>
                  REGIONAL OFFICE GOVERNANCE &amp; NUMBERING STUDIO
                </Text>
              )}
              {type === 'add-branch' && (
                <Text style={styles.topBadgeText}>
                  {initialData?.id ? 'EDIT REGIONAL FIELD OFFICE' : 'REGISTER NEW REGIONAL FIELD OFFICE'}
                </Text>
              )}
              {isRequirementModal && (
                <Text style={styles.topBadgeText}>
                  {type === 'add-requirement'
                    ? 'CREATE NEW REQUIREMENT CONFIGURATION'
                    : 'EDIT REQUIREMENT CONFIGURATION'}
                </Text>
              )}
              {isFeeModal && (
                <Text style={styles.topBadgeText}>
                  {type === 'add-fee'
                    ? 'CONFIGURE NEW APPLICATION FEES'
                    : 'EDIT APPLICATION FEES'}
                </Text>
              )}
              {isNoteModal && (
                <Text style={styles.topBadgeText}>
                  {type === 'add-note'
                    ? 'CREATE NEW NOTES CONFIGURATION'
                    : 'EDIT NOTES CONFIGURATION'}
                </Text>
              )}
              {isFormModal && (
                <Text style={styles.topBadgeText}>
                  {initialData?.id ? 'EDIT FORM TEMPLATE' : 'CREATE FORM TEMPLATE'}
                </Text>
              )}

              <Text style={[styles.modalTitle, { color: colors.text }]}>{getModalTitle()}</Text>

              {type === 'edit-config' && (
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  Configure regional identity, accounting responsibility center codes, transition manual numbering controls, and workflow routing.
                </Text>
              )}
              {type === 'add-branch' && (
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  Configure branch identity, physical address, officer-in-charge contact details, and field operational capabilities.
                </Text>
              )}

              {isRequirementModal && (
                <Text style={styles.modalSubtitle}>
                  Customize the precise set of files and document proofs clients will upload when applying.
                </Text>
              )}
              {isFeeModal && (
                <Text style={styles.modalSubtitle}>
                  Configure several processing fees and corresponding rates assigned to this specific application type.
                </Text>
              )}
              {isNoteModal && (
                <Text style={styles.modalSubtitle}>
                  Input guidelines, penalties, and reminders directly. You can manually format the list using prefix counters such as 1., 2., 3.
                </Text>
              )}
              {isFormModal && (
                <Text style={styles.modalSubtitle}>
                  Set the service type, form title, form code, status, and short description.
                </Text>
              )}
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Lucide name="x" size={18} color={COLORS.neutral[400]} />
            </Pressable>
          </View>

          {/* Inline Error Banner */}
          {errorMessage !== null && (
            <View style={styles.errorBanner}>
              <View style={styles.errorBannerLeft}>
                <Lucide name="alert-circle" size={16} color={COLORS.semantic.error} />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
              <Pressable onPress={() => setErrorMessage(null)} style={styles.errorDismissBtn}>
                <Lucide name="x" size={14} color={COLORS.semantic.error} />
              </Pressable>
            </View>
          )}

          {/* Form Content */}
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
            {/* 1. Regional Config Modal Fields */}
            {type === 'edit-config' && (
              <>
                {categoryName === 'Commissioner' && (
                  <View
                    style={[
                      styles.featureSectionCard,
                      {
                        backgroundColor: isDark ? colors.neutral[900] : '#F8FAFC',
                        borderColor: isDark ? colors.neutral[700] : '#E2E8F0',
                        borderLeftColor: COLORS.brand.indigo,
                      },
                    ]}
                  >
                    <View style={styles.featureSectionHeader}>
                      <View style={[styles.featureSectionIconBox, { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF' }]}>
                        <Lucide name="award" size={16} color={COLORS.brand.indigo} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.featureSectionTitle, { color: colors.text }]}>
                          Commissioner &amp; Executive Signatory
                        </Text>
                        <Text style={[styles.featureSectionSubtitle, { color: colors.textMuted }]}>
                          Configure the official signatory name and title for accountable forms and certificates.
                        </Text>
                      </View>
                    </View>

                    <View style={styles.featureSectionDivider} />

                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: colors.textMuted }]}>FULL NAME</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          {
                            backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                            borderColor: isDark ? colors.neutral[700] : '#CBD5E1',
                            borderWidth: 1,
                            color: colors.text,
                          },
                        ]}
                        placeholder="Atty. Ella Blanca B. Lopez"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={nameInput}
                        onChangeText={setNameInput}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: colors.textMuted }]}>OFFICIAL TITLE</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          {
                            backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                            borderColor: isDark ? colors.neutral[700] : '#CBD5E1',
                            borderWidth: 1,
                            color: colors.text,
                          },
                        ]}
                        placeholder="Regional Commissioner"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={subLabelInput}
                        onChangeText={setSubLabelInput}
                      />
                    </View>

                    <Pressable
                      onPress={() => setIsActiveToggle((prev) => !prev)}
                      style={[
                        styles.aliveToggleCard,
                        {
                          backgroundColor: isActiveToggle
                            ? (isDark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5')
                            : (isDark ? colors.neutral[800] : COLORS.neutral.white),
                          borderColor: isActiveToggle ? '#10B981' : (isDark ? colors.neutral[700] : '#CBD5E1'),
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.aliveToggleIconCircle,
                          {
                            backgroundColor: isActiveToggle
                              ? (isDark ? 'rgba(16, 185, 129, 0.25)' : '#D1FAE5')
                              : (isDark ? colors.neutral[700] : '#F1F5F9'),
                          },
                        ]}
                      >
                        <Lucide
                          name={isActiveToggle ? 'check-circle' : 'slash'}
                          size={16}
                          color={isActiveToggle ? '#059669' : COLORS.neutral[400]}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.aliveToggleTitleRow}>
                          <Text style={[styles.aliveToggleTitle, { color: colors.text }]}>
                            Active Commissioner Signatory
                          </Text>
                          <View style={[styles.aliveStateBadge, { backgroundColor: isActiveToggle ? '#10B981' : COLORS.neutral[400] }]}>
                            <Text style={styles.aliveStateBadgeText}>{isActiveToggle ? 'ACTIVE' : 'INACTIVE'}</Text>
                          </View>
                        </View>
                        <Text style={[styles.aliveToggleSubtitle, { color: colors.textMuted }]}>
                          Use this signatory on issued regional permits and certificates.
                        </Text>
                      </View>
                      <View style={[styles.aliveSliderTrack, isActiveToggle ? styles.aliveSliderTrackGreen : styles.aliveSliderTrackOff]}>
                        <Text style={[styles.aliveSliderTrackText, isActiveToggle ? styles.aliveSliderTrackTextLeft : styles.aliveSliderTrackTextRight]}>
                          {isActiveToggle ? 'ON' : 'OFF'}
                        </Text>
                        <View style={styles.aliveSliderThumb}>
                          <Lucide name={isActiveToggle ? 'check' : 'x'} size={11} color={isActiveToggle ? '#059669' : COLORS.neutral[400]} />
                        </View>
                      </View>
                    </Pressable>
                  </View>
                )}

                {categoryName === 'Support Contact' && (
                  <View
                    style={[
                      styles.featureSectionCard,
                      {
                        backgroundColor: isDark ? colors.neutral[900] : '#F8FAFC',
                        borderColor: isDark ? colors.neutral[700] : '#E2E8F0',
                        borderLeftColor: '#0284C7',
                      },
                    ]}
                  >
                    <View style={styles.featureSectionHeader}>
                      <View style={[styles.featureSectionIconBox, { backgroundColor: isDark ? '#0C4A6E' : '#E0F2FE' }]}>
                        <Lucide name="phone" size={16} color="#0284C7" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.featureSectionTitle, { color: colors.text }]}>
                          Regional Helpdesk &amp; Support Contact
                        </Text>
                        <Text style={[styles.featureSectionSubtitle, { color: colors.textMuted }]}>
                          Public assistance contact details displayed to applicants and regional clients.
                        </Text>
                      </View>
                    </View>

                    <View style={styles.featureSectionDivider} />

                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: colors.textMuted }]}>HELPDESK NAME</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          {
                            backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                            borderColor: isDark ? colors.neutral[700] : '#CBD5E1',
                            borderWidth: 1,
                            color: colors.text,
                          },
                        ]}
                        placeholder="Main Helpdesk"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={nameInput}
                        onChangeText={setNameInput}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: colors.textMuted }]}>EMAIL &amp; PHONE DETAILS</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          {
                            backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                            borderColor: isDark ? colors.neutral[700] : '#CBD5E1',
                            borderWidth: 1,
                            color: colors.text,
                          },
                        ]}
                        placeholder="ntc10@gov.ph · (02) 8-123-4567"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={subLabelInput}
                        onChangeText={setSubLabelInput}
                      />
                    </View>
                  </View>
                )}

                {categoryName === 'Office Details' && (
                  <View
                    style={[
                      styles.featureSectionCard,
                      {
                        backgroundColor: isDark ? colors.neutral[900] : '#F8FAFC',
                        borderColor: isDark ? colors.neutral[700] : '#E2E8F0',
                        borderLeftColor: COLORS.brand.indigo,
                      },
                    ]}
                  >
                    <View style={styles.featureSectionHeader}>
                      <View style={[styles.featureSectionIconBox, { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF' }]}>
                        <Lucide name="map-pin" size={16} color={COLORS.brand.indigo} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.featureSectionTitle, { color: colors.text }]}>
                          Regional Office Details &amp; Routing Keys
                        </Text>
                        <Text style={[styles.featureSectionSubtitle, { color: colors.textMuted }]}>
                          Configure office display name, internal routing codes, and primary office designation.
                        </Text>
                      </View>
                    </View>

                    <View style={styles.featureSectionDivider} />

                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: colors.textMuted }]}>OFFICE NAME</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          {
                            backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                            borderColor: isDark ? colors.neutral[700] : '#CBD5E1',
                            borderWidth: 1,
                            color: colors.text,
                          },
                        ]}
                        placeholder="NTC Region X"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={nameInput}
                        onChangeText={setNameInput}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: colors.textMuted }]}>ROUTING KEYS / CODES</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          {
                            backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                            borderColor: isDark ? colors.neutral[700] : '#CBD5E1',
                            borderWidth: 1,
                            color: colors.text,
                          },
                        ]}
                        placeholder="B5099 · 43A"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={subLabelInput}
                        onChangeText={setSubLabelInput}
                      />
                    </View>

                    <Pressable
                      onPress={() => setIsActiveToggle((prev) => !prev)}
                      style={[
                        styles.aliveToggleCard,
                        {
                          backgroundColor: isActiveToggle
                            ? (isDark ? 'rgba(79, 70, 229, 0.14)' : '#EEF2FF')
                            : (isDark ? colors.neutral[800] : COLORS.neutral.white),
                          borderColor: isActiveToggle ? COLORS.brand.indigo : (isDark ? colors.neutral[700] : '#CBD5E1'),
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.aliveToggleIconCircle,
                          {
                            backgroundColor: isActiveToggle
                              ? (isDark ? '#312E81' : '#E0E7FF')
                              : (isDark ? colors.neutral[700] : '#F1F5F9'),
                          },
                        ]}
                      >
                        <Lucide
                          name={isActiveToggle ? 'star' : 'circle'}
                          size={16}
                          color={isActiveToggle ? COLORS.brand.indigo : COLORS.neutral[400]}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.aliveToggleTitleRow}>
                          <Text style={[styles.aliveToggleTitle, { color: colors.text }]}>
                            Primary Regional Office
                          </Text>
                          <View style={[styles.aliveStateBadge, { backgroundColor: isActiveToggle ? COLORS.brand.indigo : COLORS.neutral[400] }]}>
                            <Text style={styles.aliveStateBadgeText}>{isActiveToggle ? 'PRIMARY' : 'SECONDARY'}</Text>
                          </View>
                        </View>
                        <Text style={[styles.aliveToggleSubtitle, { color: colors.textMuted }]}>
                          Designates this office as the main regional headquarters for default application routing.
                        </Text>
                      </View>
                      <View style={[styles.aliveSliderTrack, isActiveToggle ? styles.aliveSliderTrackIndigo : styles.aliveSliderTrackOff]}>
                        <Text style={[styles.aliveSliderTrackText, isActiveToggle ? styles.aliveSliderTrackTextLeft : styles.aliveSliderTrackTextRight]}>
                          {isActiveToggle ? 'ON' : 'OFF'}
                        </Text>
                        <View style={styles.aliveSliderThumb}>
                          <Lucide name={isActiveToggle ? 'check' : 'x'} size={11} color={isActiveToggle ? COLORS.brand.indigo : COLORS.neutral[400]} />
                        </View>
                      </View>
                    </Pressable>
                  </View>
                )}

                {categoryName !== 'Commissioner' && categoryName !== 'Support Contact' && categoryName !== 'Office Details' && (
                  <View style={styles.regionalSectionsStack}>
                    {/* ── SECTION 1: REGIONAL IDENTITY & HELPDESK CONTACTS ── */}
                    <View
                      style={[
                        styles.featureSectionCard,
                        {
                          backgroundColor: isDark ? colors.neutral[900] : '#F8FAFC',
                          borderColor: isDark ? colors.neutral[700] : '#E2E8F0',
                          borderLeftColor: COLORS.brand.indigo,
                        },
                      ]}
                    >
                      <View style={styles.featureSectionHeader}>
                        <View style={[styles.featureSectionIconBox, { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF' }]}>
                          <Lucide name="shield" size={16} color={COLORS.brand.indigo} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.featureSectionTitleRow}>
                            <Text style={[styles.featureSectionTitle, { color: colors.text }]}>
                              1. Regional Identity &amp; Helpdesk Contacts
                            </Text>
                            <View style={[styles.sectionPillBadge, { backgroundColor: isDark ? '#1E1B4B' : '#E0E7FF' }]}>
                              <Text style={[styles.sectionPillBadgeText, { color: COLORS.brand.indigo }]}>PROFILE</Text>
                            </View>
                          </View>
                          <Text style={[styles.featureSectionSubtitle, { color: colors.textMuted }]}>
                            Official regional designation and public support contact channels shown on accountable forms.
                          </Text>
                        </View>
                      </View>

                      <View style={styles.featureSectionDivider} />

                      <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.textMuted }]}>REGION / OFFICE NAME</Text>
                        <TextInput
                          style={[
                            styles.textInput,
                            {
                              backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                              borderColor: isDark ? colors.neutral[700] : '#CBD5E1',
                              borderWidth: 1,
                              color: colors.text,
                            },
                          ]}
                          placeholder="Region X - Northern Mindanao"
                          placeholderTextColor={COLORS.neutral[400]}
                          value={nameInput}
                          onChangeText={setNameInput}
                        />
                      </View>

                      <View style={styles.twoColumnRow}>
                        <View style={[styles.inputGroup, styles.flexColumn]}>
                          <Text style={[styles.inputLabel, { color: colors.textMuted }]}>SUPPORT EMAIL</Text>
                          <TextInput
                            style={[
                              styles.textInput,
                              {
                                backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                                borderColor: isDark ? colors.neutral[700] : '#CBD5E1',
                                borderWidth: 1,
                                color: colors.text,
                              },
                            ]}
                            placeholder="region10@ntc.gov.ph"
                            placeholderTextColor={COLORS.neutral[400]}
                            value={contactEmailInput}
                            onChangeText={setContactEmailInput}
                            autoCapitalize="none"
                            keyboardType="email-address"
                          />
                        </View>
                        <View style={[styles.inputGroup, styles.flexColumn]}>
                          <Text style={[styles.inputLabel, { color: colors.textMuted }]}>SUPPORT PHONE</Text>
                          <TextInput
                            style={[
                              styles.textInput,
                              {
                                backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                                borderColor: isDark ? colors.neutral[700] : '#CBD5E1',
                                borderWidth: 1,
                                color: colors.text,
                              },
                            ]}
                            placeholder="(088) 856-1234"
                            placeholderTextColor={COLORS.neutral[400]}
                            value={contactPhoneInput}
                            onChangeText={setContactPhoneInput}
                          />
                        </View>
                      </View>

                      {/* Active Region Interactive Slider Card */}
                      <Pressable
                        onPress={() => setIsActiveToggle((prev) => !prev)}
                        style={[
                          styles.aliveToggleCard,
                          {
                            backgroundColor: isActiveToggle
                              ? (isDark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5')
                              : (isDark ? colors.neutral[800] : COLORS.neutral.white),
                            borderColor: isActiveToggle ? '#10B981' : (isDark ? colors.neutral[700] : '#CBD5E1'),
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.aliveToggleIconCircle,
                            {
                              backgroundColor: isActiveToggle
                                ? (isDark ? 'rgba(16, 185, 129, 0.25)' : '#D1FAE5')
                                : (isDark ? colors.neutral[700] : '#F1F5F9'),
                            },
                          ]}
                        >
                          <Lucide
                            name={isActiveToggle ? 'check-circle' : 'slash'}
                            size={16}
                            color={isActiveToggle ? '#059669' : COLORS.neutral[400]}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.aliveToggleTitleRow}>
                            <Text style={[styles.aliveToggleTitle, { color: colors.text }]}>
                              Active Regional Office Status
                            </Text>
                            <View
                              style={[
                                styles.aliveStateBadge,
                                {
                                  backgroundColor: isActiveToggle ? '#10B981' : COLORS.neutral[300],
                                },
                              ]}
                            >
                              <Text style={styles.aliveStateBadgeText}>
                                {isActiveToggle ? 'OPERATIONAL' : 'INACTIVE'}
                              </Text>
                            </View>
                          </View>
                          <Text style={[styles.aliveToggleSubtitle, { color: colors.textMuted }]}>
                            Enables client intake, regional evaluation queues, and statutory billing for this region.
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.aliveSliderTrack,
                            isActiveToggle ? styles.aliveSliderTrackGreen : styles.aliveSliderTrackOff,
                          ]}
                        >
                          <Text
                            style={[
                              styles.aliveSliderTrackText,
                              isActiveToggle ? styles.aliveSliderTrackTextLeft : styles.aliveSliderTrackTextRight,
                            ]}
                          >
                            {isActiveToggle ? 'ON' : 'OFF'}
                          </Text>
                          <View
                            style={[
                              styles.aliveSliderThumb,
                              isActiveToggle ? styles.aliveSliderThumbOn : styles.aliveSliderThumbOff,
                            ]}
                          >
                            <Lucide
                              name={isActiveToggle ? 'check' : 'x'}
                              size={11}
                              color={isActiveToggle ? '#059669' : COLORS.neutral[400]}
                            />
                          </View>
                        </View>
                      </Pressable>
                    </View>

                    {/* ── SECTION 2: ACCOUNTING & RESPONSIBILITY CENTER SERIES ── */}
                    <View
                      style={[
                        styles.featureSectionCard,
                        {
                          backgroundColor: isDark ? colors.neutral[900] : '#F8FAFC',
                          borderColor: isDark ? colors.neutral[700] : '#E2E8F0',
                          borderLeftColor: '#7C3AED',
                        },
                      ]}
                    >
                      <View style={styles.featureSectionHeader}>
                        <View style={[styles.featureSectionIconBox, { backgroundColor: isDark ? '#2E1065' : '#F3E8FF' }]}>
                          <Lucide name="database" size={16} color="#7C3AED" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.featureSectionTitleRow}>
                            <Text style={[styles.featureSectionTitle, { color: colors.text }]}>
                              2. Accounting &amp; Responsibility Center Series
                            </Text>
                            <View style={[styles.sectionPillBadge, { backgroundColor: isDark ? '#2E1065' : '#F3E8FF' }]}>
                              <Text style={[styles.sectionPillBadgeText, { color: '#7C3AED' }]}>COA / SERIES</Text>
                            </View>
                          </View>
                          <Text style={[styles.featureSectionSubtitle, { color: colors.textMuted }]}>
                            Defines the prefix codes and fund cluster printed on Statements of Account and Orders of Payment.
                          </Text>
                        </View>
                      </View>

                      <View style={styles.featureSectionDivider} />

                      <View style={styles.twoColumnRow}>
                        <View style={[styles.inputGroup, styles.flexColumn]}>
                          <Text style={[styles.inputLabel, { color: colors.textMuted }]}>RC CODE (SOA)</Text>
                          <TextInput
                            style={[
                              styles.textInput,
                              {
                                backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                                borderColor: isDark ? colors.neutral[700] : '#CBD5E1',
                                borderWidth: 1,
                                color: colors.text,
                              },
                            ]}
                            placeholder="e.g. 61"
                            placeholderTextColor={COLORS.neutral[400]}
                            value={rcCodeSoaInput}
                            onChangeText={setRcCodeSoaInput}
                          />
                        </View>
                        <View style={[styles.inputGroup, styles.flexColumn]}>
                          <Text style={[styles.inputLabel, { color: colors.textMuted }]}>RC CODE (OP)</Text>
                          <TextInput
                            style={[
                              styles.textInput,
                              {
                                backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                                borderColor: isDark ? colors.neutral[700] : '#CBD5E1',
                                borderWidth: 1,
                                color: colors.text,
                              },
                            ]}
                            placeholder="e.g. 61"
                            placeholderTextColor={COLORS.neutral[400]}
                            value={rcCodeOpInput}
                            onChangeText={setRcCodeOpInput}
                          />
                        </View>
                        <View style={[styles.inputGroup, styles.flexColumn]}>
                          <Text style={[styles.inputLabel, { color: colors.textMuted }]}>FUND CLUSTER</Text>
                          <TextInput
                            style={[
                              styles.textInput,
                              {
                                backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                                borderColor: isDark ? colors.neutral[700] : '#CBD5E1',
                                borderWidth: 1,
                                color: colors.text,
                              },
                            ]}
                            placeholder="01"
                            placeholderTextColor={COLORS.neutral[400]}
                            value={fundClusterInput}
                            onChangeText={setFundClusterInput}
                          />
                        </View>
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.textMuted }]}>MFO / PAP CODE (COA GAM VOL. II)</Text>
                        <TextInput
                          style={[
                            styles.textInput,
                            {
                              backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                              borderColor: isDark ? colors.neutral[700] : '#CBD5E1',
                              borderWidth: 1,
                              color: colors.text,
                            },
                          ]}
                          placeholder="e.g. 310100100001000 (leave blank if N/A)"
                          placeholderTextColor={COLORS.neutral[400]}
                          value={mfoPapCodeInput}
                          onChangeText={setMfoPapCodeInput}
                        />
                      </View>

                      {/* Live Series Format Preview Banner */}
                      <View
                        style={[
                          styles.seriesPreviewBox,
                          {
                            backgroundColor: isDark ? '#1E1B4B' : '#F5F3FF',
                            borderColor: isDark ? '#4C1D95' : '#DDD6FE',
                          },
                        ]}
                      >
                        <View style={styles.seriesPreviewHeader}>
                          <Lucide name="eye" size={13} color="#7C3AED" />
                          <Text style={[styles.seriesPreviewLabel, { color: isDark ? '#C4B5FD' : '#5B21B6' }]}>
                            LIVE AUTO-NUMBERING SERIES PREVIEW
                          </Text>
                        </View>
                        <View style={styles.seriesPreviewPillsRow}>
                          <View style={[styles.seriesPreviewPill, { backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white, borderColor: isDark ? '#4C1D95' : '#DDD6FE' }]}>
                            <Text style={[styles.seriesPreviewPillTitle, { color: colors.textMuted }]}>SOA:</Text>
                            <Text style={[styles.seriesPreviewPillValue, { color: isDark ? '#A78BFA' : '#6D28D9' }]}>
                              {(rcCodeSoaInput.trim() || 'RC')}-{new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, '0')}-0001
                            </Text>
                          </View>
                          <View style={[styles.seriesPreviewPill, { backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white, borderColor: isDark ? '#4C1D95' : '#DDD6FE' }]}>
                            <Text style={[styles.seriesPreviewPillTitle, { color: colors.textMuted }]}>OP:</Text>
                            <Text style={[styles.seriesPreviewPillValue, { color: isDark ? '#A78BFA' : '#6D28D9' }]}>
                              {(rcCodeOpInput.trim() || 'RC')}-{new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, '0')}-0001
                            </Text>
                          </View>
                          <View style={[styles.seriesPreviewPill, { backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white, borderColor: isDark ? '#4C1D95' : '#DDD6FE' }]}>
                            <Text style={[styles.seriesPreviewPillTitle, { color: colors.textMuted }]}>Fund:</Text>
                            <Text style={[styles.seriesPreviewPillValue, { color: isDark ? '#A78BFA' : '#6D28D9' }]}>
                              Cluster {(fundClusterInput.trim() || '—')}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* ── SECTION 3: TRANSITION NUMBERING MODE (SOA & OP MANUAL CONTROLS) ── */}
                    <View
                      style={[
                        styles.featureSectionCard,
                        {
                          backgroundColor: isDark ? colors.neutral[900] : '#F8FAFC',
                          borderColor: isDark ? colors.neutral[700] : '#E2E8F0',
                          borderLeftColor: '#059669',
                        },
                      ]}
                    >
                      <View style={styles.featureSectionHeader}>
                        <View style={[styles.featureSectionIconBox, { backgroundColor: isDark ? '#064E3B' : '#DCFCE7' }]}>
                          <Lucide name="sliders" size={16} color="#059669" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.featureSectionTitleRow}>
                            <Text style={[styles.featureSectionTitle, { color: colors.text }]}>
                              3. Transition Numbering Controls (Manual Entry &amp; Edit)
                            </Text>
                            <View style={[styles.sectionPillBadge, { backgroundColor: isDark ? '#064E3B' : '#DCFCE7' }]}>
                              <Text style={[styles.sectionPillBadgeText, { color: '#059669' }]}>TRANSITION MODE</Text>
                            </View>
                          </View>
                          <Text style={[styles.featureSectionSubtitle, { color: colors.textMuted }]}>
                            Toggle whether regional staff can manually input or override SOA and OP numbers during system transition.
                          </Text>
                        </View>
                      </View>

                      <View style={styles.featureSectionDivider} />

                      {/* Toggle 1: Allow Manual SOA Number */}
                      <Pressable
                        onPress={() => setAllowManualSoaNumberToggle((prev) => !prev)}
                        style={[
                          styles.aliveToggleCard,
                          {
                            backgroundColor: allowManualSoaNumberToggle
                              ? (isDark ? 'rgba(79, 70, 229, 0.14)' : '#EEF2FF')
                              : (isDark ? colors.neutral[800] : COLORS.neutral.white),
                            borderColor: allowManualSoaNumberToggle
                              ? COLORS.brand.indigo
                              : (isDark ? colors.neutral[700] : '#CBD5E1'),
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.aliveToggleIconCircle,
                            {
                              backgroundColor: allowManualSoaNumberToggle
                                ? (isDark ? '#312E81' : '#E0E7FF')
                                : (isDark ? colors.neutral[700] : '#F1F5F9'),
                            },
                          ]}
                        >
                          <Lucide
                            name={allowManualSoaNumberToggle ? 'edit-3' : 'lock'}
                            size={16}
                            color={allowManualSoaNumberToggle ? COLORS.brand.indigo : COLORS.neutral[400]}
                          />
                        </View>

                        <View style={{ flex: 1 }}>
                          <View style={styles.aliveToggleTitleRow}>
                            <Text style={[styles.aliveToggleTitle, { color: colors.text }]}>
                              Manual SOA Number Entry &amp; Editing
                            </Text>
                            <View
                              style={[
                                styles.aliveStateBadge,
                                {
                                  backgroundColor: allowManualSoaNumberToggle ? COLORS.brand.indigo : COLORS.neutral[400],
                                },
                              ]}
                            >
                              <Text style={styles.aliveStateBadgeText}>
                                {allowManualSoaNumberToggle ? 'MANUAL + EDITABLE' : 'AUTO-GENERATED ONLY'}
                              </Text>
                            </View>
                          </View>
                          <Text style={[styles.aliveToggleSubtitle, { color: colors.textMuted }]}>
                            {allowManualSoaNumberToggle
                              ? 'Evaluators and Admins can enter custom SOA numbers on creation and edit existing SOA numbers inline.'
                              : 'System strictly auto-generates sequential SOA numbers; manual SOA number overrides are locked.'}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.aliveSliderTrack,
                            allowManualSoaNumberToggle ? styles.aliveSliderTrackIndigo : styles.aliveSliderTrackOff,
                          ]}
                        >
                          <Text
                            style={[
                              styles.aliveSliderTrackText,
                              allowManualSoaNumberToggle ? styles.aliveSliderTrackTextLeft : styles.aliveSliderTrackTextRight,
                            ]}
                          >
                            {allowManualSoaNumberToggle ? 'ON' : 'OFF'}
                          </Text>
                          <View
                            style={[
                              styles.aliveSliderThumb,
                              allowManualSoaNumberToggle ? styles.aliveSliderThumbOn : styles.aliveSliderThumbOff,
                            ]}
                          >
                            <Lucide
                              name={allowManualSoaNumberToggle ? 'check' : 'lock'}
                              size={11}
                              color={allowManualSoaNumberToggle ? COLORS.brand.indigo : COLORS.neutral[400]}
                            />
                          </View>
                        </View>
                      </Pressable>

                      {/* Toggle 2: Allow Manual OP Number */}
                      <Pressable
                        onPress={() => setAllowManualOpNumberToggle((prev) => !prev)}
                        style={[
                          styles.aliveToggleCard,
                          {
                            backgroundColor: allowManualOpNumberToggle
                              ? (isDark ? 'rgba(79, 70, 229, 0.14)' : '#EEF2FF')
                              : (isDark ? colors.neutral[800] : COLORS.neutral.white),
                            borderColor: allowManualOpNumberToggle
                              ? COLORS.brand.indigo
                              : (isDark ? colors.neutral[700] : '#CBD5E1'),
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.aliveToggleIconCircle,
                            {
                              backgroundColor: allowManualOpNumberToggle
                                ? (isDark ? '#312E81' : '#E0E7FF')
                                : (isDark ? colors.neutral[700] : '#F1F5F9'),
                            },
                          ]}
                        >
                          <Lucide
                            name={allowManualOpNumberToggle ? 'edit-3' : 'lock'}
                            size={16}
                            color={allowManualOpNumberToggle ? COLORS.brand.indigo : COLORS.neutral[400]}
                          />
                        </View>

                        <View style={{ flex: 1 }}>
                          <View style={styles.aliveToggleTitleRow}>
                            <Text style={[styles.aliveToggleTitle, { color: colors.text }]}>
                              Manual OP Number Entry &amp; Editing
                            </Text>
                            <View
                              style={[
                                styles.aliveStateBadge,
                                {
                                  backgroundColor: allowManualOpNumberToggle ? COLORS.brand.indigo : COLORS.neutral[400],
                                },
                              ]}
                            >
                              <Text style={styles.aliveStateBadgeText}>
                                {allowManualOpNumberToggle ? 'MANUAL + EDITABLE' : 'AUTO-GENERATED ONLY'}
                              </Text>
                            </View>
                          </View>
                          <Text style={[styles.aliveToggleSubtitle, { color: colors.textMuted }]}>
                            {allowManualOpNumberToggle
                              ? 'Accountants and Admins can specify custom Order of Payment numbers upon approval and edit existing OP numbers.'
                              : 'System strictly auto-generates sequential OP numbers upon Accountant approval; manual OP edits are locked.'}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.aliveSliderTrack,
                            allowManualOpNumberToggle ? styles.aliveSliderTrackIndigo : styles.aliveSliderTrackOff,
                          ]}
                        >
                          <Text
                            style={[
                              styles.aliveSliderTrackText,
                              allowManualOpNumberToggle ? styles.aliveSliderTrackTextLeft : styles.aliveSliderTrackTextRight,
                            ]}
                          >
                            {allowManualOpNumberToggle ? 'ON' : 'OFF'}
                          </Text>
                          <View
                            style={[
                              styles.aliveSliderThumb,
                              allowManualOpNumberToggle ? styles.aliveSliderThumbOn : styles.aliveSliderThumbOff,
                            ]}
                          >
                            <Lucide
                              name={allowManualOpNumberToggle ? 'check' : 'lock'}
                              size={11}
                              color={allowManualOpNumberToggle ? COLORS.brand.indigo : COLORS.neutral[400]}
                            />
                          </View>
                        </View>
                      </Pressable>
                    </View>

                    {/* ── SECTION 4: REQUESTS & COMPLAINTS WORKFLOW ROUTING ── */}
                    <View
                      style={[
                        styles.featureSectionCard,
                        {
                          backgroundColor: isDark ? colors.neutral[900] : '#F8FAFC',
                          borderColor: isDark ? colors.neutral[700] : '#E2E8F0',
                          borderLeftColor: '#0284C7',
                        },
                      ]}
                    >
                      <View style={styles.featureSectionHeader}>
                        <View style={[styles.featureSectionIconBox, { backgroundColor: isDark ? '#0C4A6E' : '#E0F2FE' }]}>
                          <Lucide name="compass" size={16} color="#0284C7" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.featureSectionTitleRow}>
                            <Text style={[styles.featureSectionTitle, { color: colors.text }]}>
                              4. Requests &amp; Complaints Workflow Routing
                            </Text>
                            <View style={[styles.sectionPillBadge, { backgroundColor: isDark ? '#0C4A6E' : '#E0F2FE' }]}>
                              <Text style={[styles.sectionPillBadgeText, { color: '#0284C7' }]}>ROUTING</Text>
                            </View>
                          </View>
                          <Text style={[styles.featureSectionSubtitle, { color: colors.textMuted }]}>
                            Choose which unit receives newly filed client requests and complaints first.
                          </Text>
                        </View>
                      </View>

                      <View style={styles.featureSectionDivider} />

                      <View style={styles.routingOptionsRow}>
                        <Pressable
                          style={[
                            styles.routingOptionCard,
                            {
                              backgroundColor:
                                routingInput === 'DirectToLegal'
                                  ? (isDark ? 'rgba(79, 70, 229, 0.15)' : '#EEF2FF')
                                  : (isDark ? colors.neutral[800] : COLORS.neutral.white),
                              borderColor:
                                routingInput === 'DirectToLegal'
                                  ? COLORS.brand.indigo
                                  : (isDark ? colors.neutral[700] : '#CBD5E1'),
                            },
                          ]}
                          onPress={() => setRoutingInput('DirectToLegal')}
                        >
                          <View
                            style={[
                              styles.aliveToggleIconCircle,
                              {
                                backgroundColor:
                                  routingInput === 'DirectToLegal'
                                    ? (isDark ? '#312E81' : '#E0E7FF')
                                    : (isDark ? colors.neutral[700] : '#F1F5F9'),
                              },
                            ]}
                          >
                            <Lucide
                              name="shield"
                              size={16}
                              color={routingInput === 'DirectToLegal' ? COLORS.brand.indigo : COLORS.neutral[400]}
                            />
                          </View>
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Text
                                style={[
                                  styles.routingOptionTitle,
                                  { color: colors.text },
                                  routingInput === 'DirectToLegal' && styles.routingOptionTitleActive,
                                ]}
                              >
                                Direct to Legal
                              </Text>
                              {routingInput === 'DirectToLegal' && (
                                <Lucide name="check-circle" size={15} color={COLORS.brand.indigo} />
                              )}
                            </View>
                            <Text style={[styles.routingOptionSub, { color: colors.textMuted }]}>
                              Complaints &amp; requests appear directly in Legal Officer pending queue
                            </Text>
                          </View>
                        </Pressable>

                        <Pressable
                          style={[
                            styles.routingOptionCard,
                            {
                              backgroundColor:
                                routingInput === 'DirectToEvaluator'
                                  ? (isDark ? 'rgba(79, 70, 229, 0.15)' : '#EEF2FF')
                                  : (isDark ? colors.neutral[800] : COLORS.neutral.white),
                              borderColor:
                                routingInput === 'DirectToEvaluator'
                                  ? COLORS.brand.indigo
                                  : (isDark ? colors.neutral[700] : '#CBD5E1'),
                            },
                          ]}
                          onPress={() => setRoutingInput('DirectToEvaluator')}
                        >
                          <View
                            style={[
                              styles.aliveToggleIconCircle,
                              {
                                backgroundColor:
                                  routingInput === 'DirectToEvaluator'
                                    ? (isDark ? '#312E81' : '#E0E7FF')
                                    : (isDark ? colors.neutral[700] : '#F1F5F9'),
                              },
                            ]}
                          >
                            <Lucide
                              name="users"
                              size={16}
                              color={routingInput === 'DirectToEvaluator' ? COLORS.brand.indigo : COLORS.neutral[400]}
                            />
                          </View>
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Text
                                style={[
                                  styles.routingOptionTitle,
                                  { color: colors.text },
                                  routingInput === 'DirectToEvaluator' && styles.routingOptionTitleActive,
                                ]}
                              >
                                Direct to Evaluator
                              </Text>
                              {routingInput === 'DirectToEvaluator' && (
                                <Lucide name="check-circle" size={15} color={COLORS.brand.indigo} />
                              )}
                            </View>
                            <Text style={[styles.routingOptionSub, { color: colors.textMuted }]}>
                              Evaluator reviews &amp; endorses to Legal Officer
                            </Text>
                          </View>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                )}
              </>
            )}

            {/* 2. Regional Field Office Modal Fields */}
            {type === 'add-branch' && (
              <View style={styles.regionalSectionsStack}>
                {/* ── SECTION 1: FIELD OFFICE IDENTITY & CLASSIFICATION ── */}
                <View
                  style={[
                    styles.featureSectionCard,
                    {
                      backgroundColor: isDark ? colors.neutral[900] : '#F8FAFC',
                      borderColor: isDark ? colors.neutral[700] : '#E2E8F0',
                      borderLeftColor: COLORS.brand.indigo,
                    },
                  ]}
                >
                  <View style={styles.featureSectionHeader}>
                    <View style={[styles.featureSectionIconBox, { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF' }]}>
                      <Lucide name="map-pin" size={16} color={COLORS.brand.indigo} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.featureSectionTitleRow}>
                        <Text style={[styles.featureSectionTitle, { color: colors.text }]}>
                          1. Field Office Identity &amp; Classification
                        </Text>
                        <View style={[styles.sectionPillBadge, { backgroundColor: isDark ? '#1E1B4B' : '#E0E7FF' }]}>
                          <Text style={[styles.sectionPillBadgeText, { color: COLORS.brand.indigo }]}>BRANCH PROFILE</Text>
                        </View>
                      </View>
                      <Text style={[styles.featureSectionSubtitle, { color: colors.textMuted }]}>
                        Specify the official branch name, routing code, and whether it operates as a Main or Extension office.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.featureSectionDivider} />

                  <View style={styles.rowTwoInputs}>
                    <View style={[styles.inputGroup, { flex: 2 }]}>
                      <Text style={[styles.inputLabel, { color: colors.textMuted }]}>BRANCH NAME *</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          {
                            backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                            borderColor: isDark ? colors.neutral[700] : '#CBD5E1',
                            borderWidth: 1,
                            color: colors.text,
                          },
                          fieldErrors.name !== undefined && fieldErrors.name !== '' && styles.textInputError,
                        ]}
                        placeholder="Zamboanga City Main Office"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={nameInput}
                        onChangeText={(val) => {
                          setNameInput(val);
                          if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: '' }));
                        }}
                        onBlur={() => handleBlur('name')}
                      />
                      {fieldErrors.name ? <Text style={styles.fieldErrorText}>{fieldErrors.name}</Text> : null}
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={[styles.inputLabel, { color: colors.textMuted }]}>BRANCH CODE *</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          {
                            backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                            borderColor: isDark ? colors.neutral[700] : '#CBD5E1',
                            borderWidth: 1,
                            color: colors.text,
                          },
                          fieldErrors.code !== undefined && fieldErrors.code !== '' && styles.textInputError,
                        ]}
                        placeholder="ZC-001"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={codeInput}
                        onChangeText={(val) => {
                          setCodeInput(val);
                          if (fieldErrors.code) setFieldErrors((prev) => ({ ...prev, code: '' }));
                        }}
                        onBlur={() => handleBlur('code')}
                      />
                      {fieldErrors.code ? <Text style={styles.fieldErrorText}>{fieldErrors.code}</Text> : null}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>BRANCH CATEGORY</Text>
                    <View style={styles.radioContainer}>
                      <Pressable
                        style={[
                          styles.radioOption,
                          {
                            backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                            borderColor: branchCategory === 'Main' ? COLORS.brand.indigo : (isDark ? colors.neutral[700] : '#CBD5E1'),
                          },
                          branchCategory === 'Main' && styles.radioOptionActive,
                        ]}
                        onPress={() => {
                          setBranchCategory('Main');
                          setBranchType('Main Office');
                        }}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: branchCategory === 'Main' }}
                      >
                        <View style={[styles.radioCircle, branchCategory === 'Main' && styles.radioCircleActive]}>
                          {branchCategory === 'Main' && <View style={styles.radioDot} />}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.radioText, { color: colors.text }, branchCategory === 'Main' && styles.radioTextActive]}>
                            Main Office
                          </Text>
                          <Text style={[styles.routingOptionSub, { color: colors.textMuted }]}>
                            Regional headquarters or primary processing hub
                          </Text>
                        </View>
                      </Pressable>

                      <Pressable
                        style={[
                          styles.radioOption,
                          {
                            backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                            borderColor: branchCategory === 'Extension' ? COLORS.brand.indigo : (isDark ? colors.neutral[700] : '#CBD5E1'),
                          },
                          branchCategory === 'Extension' && styles.radioOptionActive,
                        ]}
                        onPress={() => {
                          setBranchCategory('Extension');
                          setBranchType('Field Office');
                        }}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: branchCategory === 'Extension' }}
                      >
                        <View style={[styles.radioCircle, branchCategory === 'Extension' && styles.radioCircleActive]}>
                          {branchCategory === 'Extension' && <View style={styles.radioDot} />}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.radioText, { color: colors.text }, branchCategory === 'Extension' && styles.radioTextActive]}>
                            Extension / Field Office
                          </Text>
                          <Text style={[styles.routingOptionSub, { color: colors.textMuted }]}>
                            Satellite or provincial field extension unit
                          </Text>
                        </View>
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* ── SECTION 2: LOCATION, CONTACTS & OFFICER-IN-CHARGE ── */}
                <View
                  style={[
                    styles.featureSectionCard,
                    {
                      backgroundColor: isDark ? colors.neutral[900] : '#F8FAFC',
                      borderColor: isDark ? colors.neutral[700] : '#E2E8F0',
                      borderLeftColor: '#0284C7',
                    },
                  ]}
                >
                  <View style={styles.featureSectionHeader}>
                    <View style={[styles.featureSectionIconBox, { backgroundColor: isDark ? '#0C4A6E' : '#E0F2FE' }]}>
                      <Lucide name="users" size={16} color="#0284C7" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.featureSectionTitleRow}>
                        <Text style={[styles.featureSectionTitle, { color: colors.text }]}>
                          2. Location, Contacts &amp; Officer-in-Charge
                        </Text>
                        <View style={[styles.sectionPillBadge, { backgroundColor: isDark ? '#0C4A6E' : '#E0F2FE' }]}>
                          <Text style={[styles.sectionPillBadgeText, { color: '#0284C7' }]}>DIRECTORY</Text>
                        </View>
                      </View>
                      <Text style={[styles.featureSectionSubtitle, { color: colors.textMuted }]}>
                        Physical address, public contact lines, and designated Officer-in-Charge for this branch.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.featureSectionDivider} />

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>OFFICE ADDRESS *</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                          borderColor: isDark ? colors.neutral[700] : '#CBD5E1',
                          borderWidth: 1,
                          color: colors.text,
                        },
                        fieldErrors.address !== undefined && fieldErrors.address !== '' && styles.textInputError,
                      ]}
                      placeholder="Pasonanca, Zamboanga City"
                      placeholderTextColor={COLORS.neutral[400]}
                      value={addressInput}
                      onChangeText={(val) => {
                        setAddressInput(val);
                        if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: '' }));
                      }}
                      onBlur={() => handleBlur('address')}
                    />
                    {fieldErrors.address ? <Text style={styles.fieldErrorText}>{fieldErrors.address}</Text> : null}
                  </View>

                  <View style={styles.rowTwoInputs}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={[styles.inputLabel, { color: colors.textMuted }]}>CONTACT PHONE *</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          {
                            backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                            borderColor: isDark ? colors.neutral[700] : '#CBD5E1',
                            borderWidth: 1,
                            color: colors.text,
                          },
                          fieldErrors.contactPhone !== undefined && fieldErrors.contactPhone !== '' && styles.textInputError,
                        ]}
                        placeholder="(062) 991-1234"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={contactPhoneInput}
                        onChangeText={(val) => {
                          setContactPhoneInput(val);
                          if (fieldErrors.contactPhone) setFieldErrors((prev) => ({ ...prev, contactPhone: '' }));
                        }}
                        onBlur={() => handleBlur('contactPhone')}
                      />
                      {fieldErrors.contactPhone ? <Text style={styles.fieldErrorText}>{fieldErrors.contactPhone}</Text> : null}
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={[styles.inputLabel, { color: colors.textMuted }]}>CONTACT EMAIL</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          {
                            backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                            borderColor: isDark ? colors.neutral[700] : '#CBD5E1',
                            borderWidth: 1,
                            color: colors.text,
                          },
                          fieldErrors.contactEmail !== undefined && fieldErrors.contactEmail !== '' && styles.textInputError,
                        ]}
                        placeholder="zamboanga@ntc.gov.ph"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={contactEmailInput}
                        onChangeText={(val) => {
                          setContactEmailInput(val);
                          if (fieldErrors.contactEmail) setFieldErrors((prev) => ({ ...prev, contactEmail: '' }));
                        }}
                        onBlur={() => handleBlur('contactEmail')}
                      />
                      {fieldErrors.contactEmail ? <Text style={styles.fieldErrorText}>{fieldErrors.contactEmail}</Text> : null}
                    </View>
                  </View>

                  <View style={styles.rowTwoInputs}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={[styles.inputLabel, { color: colors.textMuted }]}>OFFICER IN CHARGE NAME</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          {
                            backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                            borderColor: isDark ? colors.neutral[700] : '#CBD5E1',
                            borderWidth: 1,
                            color: colors.text,
                          },
                        ]}
                        placeholder="Engr. Juan Dela Cruz"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={officerNameInput}
                        onChangeText={setOfficerNameInput}
                      />
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={[styles.inputLabel, { color: colors.textMuted }]}>OFFICER EMAIL</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          {
                            backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                            borderColor: isDark ? colors.neutral[700] : '#CBD5E1',
                            borderWidth: 1,
                            color: colors.text,
                          },
                          fieldErrors.officerEmail !== undefined && fieldErrors.officerEmail !== '' && styles.textInputError,
                        ]}
                        placeholder="officer@ntc.gov.ph"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={officerEmailInput}
                        onChangeText={(val) => {
                          setOfficerEmailInput(val);
                          if (fieldErrors.officerEmail) setFieldErrors((prev) => ({ ...prev, officerEmail: '' }));
                        }}
                        onBlur={() => handleBlur('officerEmail')}
                      />
                      {fieldErrors.officerEmail ? <Text style={styles.fieldErrorText}>{fieldErrors.officerEmail}</Text> : null}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>DESCRIPTION / REMARKS</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        styles.textAreaInput,
                        {
                          backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                          borderColor: isDark ? colors.neutral[700] : '#CBD5E1',
                          borderWidth: 1,
                          color: colors.text,
                        },
                      ]}
                      placeholder="Provide additional details or notes regarding this field office..."
                      placeholderTextColor={COLORS.neutral[400]}
                      multiline
                      numberOfLines={3}
                      value={descriptionInput}
                      onChangeText={setDescriptionInput}
                    />
                  </View>
                </View>

                {/* ── SECTION 3: OPERATIONAL CAPABILITIES & BRANCH STATUS ── */}
                <View
                  style={[
                    styles.featureSectionCard,
                    {
                      backgroundColor: isDark ? colors.neutral[900] : '#F8FAFC',
                      borderColor: isDark ? colors.neutral[700] : '#E2E8F0',
                      borderLeftColor: '#059669',
                    },
                  ]}
                >
                  <View style={styles.featureSectionHeader}>
                    <View style={[styles.featureSectionIconBox, { backgroundColor: isDark ? '#064E3B' : '#DCFCE7' }]}>
                      <Lucide name="sliders" size={16} color="#059669" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.featureSectionTitleRow}>
                        <Text style={[styles.featureSectionTitle, { color: colors.text }]}>
                          3. Permit, Inspection Capabilities &amp; Branch Status
                        </Text>
                        <View style={[styles.sectionPillBadge, { backgroundColor: isDark ? '#064E3B' : '#DCFCE7' }]}>
                          <Text style={[styles.sectionPillBadgeText, { color: '#059669' }]}>CAPABILITIES</Text>
                        </View>
                      </View>
                      <Text style={[styles.featureSectionSubtitle, { color: colors.textMuted }]}>
                        Configure which regulatory services and client intake queues are enabled at this field office.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.featureSectionDivider} />

                  {/* Capability 1: Allow Permit Issuance */}
                  <Pressable
                    onPress={() => setAllowPermitIssuanceToggle((prev) => !prev)}
                    style={[
                      styles.aliveToggleCard,
                      {
                        backgroundColor: allowPermitIssuanceToggle
                          ? (isDark ? 'rgba(79, 70, 229, 0.14)' : '#EEF2FF')
                          : (isDark ? colors.neutral[800] : COLORS.neutral.white),
                        borderColor: allowPermitIssuanceToggle ? COLORS.brand.indigo : (isDark ? colors.neutral[700] : '#CBD5E1'),
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.aliveToggleIconCircle,
                        {
                          backgroundColor: allowPermitIssuanceToggle
                            ? (isDark ? '#312E81' : '#E0E7FF')
                            : (isDark ? colors.neutral[700] : '#F1F5F9'),
                        },
                      ]}
                    >
                      <Lucide
                        name="file-text"
                        size={16}
                        color={allowPermitIssuanceToggle ? COLORS.brand.indigo : COLORS.neutral[400]}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.aliveToggleTitleRow}>
                        <Text style={[styles.aliveToggleTitle, { color: colors.text }]}>Allow Permit Issuance</Text>
                        <View style={[styles.aliveStateBadge, { backgroundColor: allowPermitIssuanceToggle ? COLORS.brand.indigo : COLORS.neutral[400] }]}>
                          <Text style={styles.aliveStateBadgeText}>{allowPermitIssuanceToggle ? 'ENABLED' : 'DISABLED'}</Text>
                        </View>
                      </View>
                      <Text style={[styles.aliveToggleSubtitle, { color: colors.textMuted }]}>
                        Authorizes this branch to process and release permits, certificates, and licenses.
                      </Text>
                    </View>
                    <View style={[styles.aliveSliderTrack, allowPermitIssuanceToggle ? styles.aliveSliderTrackIndigo : styles.aliveSliderTrackOff]}>
                      <Text style={[styles.aliveSliderTrackText, allowPermitIssuanceToggle ? styles.aliveSliderTrackTextLeft : styles.aliveSliderTrackTextRight]}>
                        {allowPermitIssuanceToggle ? 'ON' : 'OFF'}
                      </Text>
                      <View style={styles.aliveSliderThumb}>
                        <Lucide name={allowPermitIssuanceToggle ? 'check' : 'x'} size={11} color={allowPermitIssuanceToggle ? COLORS.brand.indigo : COLORS.neutral[400]} />
                      </View>
                    </View>
                  </Pressable>

                  {/* Capability 2: Allow Spectrum Inspection */}
                  <Pressable
                    onPress={() => setAllowSpectrumInspectionToggle((prev) => !prev)}
                    style={[
                      styles.aliveToggleCard,
                      {
                        backgroundColor: allowSpectrumInspectionToggle
                          ? (isDark ? 'rgba(79, 70, 229, 0.14)' : '#EEF2FF')
                          : (isDark ? colors.neutral[800] : COLORS.neutral.white),
                        borderColor: allowSpectrumInspectionToggle ? COLORS.brand.indigo : (isDark ? colors.neutral[700] : '#CBD5E1'),
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.aliveToggleIconCircle,
                        {
                          backgroundColor: allowSpectrumInspectionToggle
                            ? (isDark ? '#312E81' : '#E0E7FF')
                            : (isDark ? colors.neutral[700] : '#F1F5F9'),
                        },
                      ]}
                    >
                      <Lucide
                        name="radio"
                        size={16}
                        color={allowSpectrumInspectionToggle ? COLORS.brand.indigo : COLORS.neutral[400]}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.aliveToggleTitleRow}>
                        <Text style={[styles.aliveToggleTitle, { color: colors.text }]}>Allow Spectrum Inspection</Text>
                        <View style={[styles.aliveStateBadge, { backgroundColor: allowSpectrumInspectionToggle ? COLORS.brand.indigo : COLORS.neutral[400] }]}>
                          <Text style={styles.aliveStateBadgeText}>{allowSpectrumInspectionToggle ? 'ENABLED' : 'DISABLED'}</Text>
                        </View>
                      </View>
                      <Text style={[styles.aliveToggleSubtitle, { color: colors.textMuted }]}>
                        Enables technical radio spectrum monitoring and station inspection assignments.
                      </Text>
                    </View>
                    <View style={[styles.aliveSliderTrack, allowSpectrumInspectionToggle ? styles.aliveSliderTrackIndigo : styles.aliveSliderTrackOff]}>
                      <Text style={[styles.aliveSliderTrackText, allowSpectrumInspectionToggle ? styles.aliveSliderTrackTextLeft : styles.aliveSliderTrackTextRight]}>
                        {allowSpectrumInspectionToggle ? 'ON' : 'OFF'}
                      </Text>
                      <View style={styles.aliveSliderThumb}>
                        <Lucide name={allowSpectrumInspectionToggle ? 'check' : 'x'} size={11} color={allowSpectrumInspectionToggle ? COLORS.brand.indigo : COLORS.neutral[400]} />
                      </View>
                    </View>
                  </Pressable>

                  {/* Capability 3: Allow Complaint Reception */}
                  <Pressable
                    onPress={() => setAllowComplaintReceptionToggle((prev) => !prev)}
                    style={[
                      styles.aliveToggleCard,
                      {
                        backgroundColor: allowComplaintReceptionToggle
                          ? (isDark ? 'rgba(79, 70, 229, 0.14)' : '#EEF2FF')
                          : (isDark ? colors.neutral[800] : COLORS.neutral.white),
                        borderColor: allowComplaintReceptionToggle ? COLORS.brand.indigo : (isDark ? colors.neutral[700] : '#CBD5E1'),
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.aliveToggleIconCircle,
                        {
                          backgroundColor: allowComplaintReceptionToggle
                            ? (isDark ? '#312E81' : '#E0E7FF')
                            : (isDark ? colors.neutral[700] : '#F1F5F9'),
                        },
                      ]}
                    >
                      <Lucide
                        name="shield"
                        size={16}
                        color={allowComplaintReceptionToggle ? COLORS.brand.indigo : COLORS.neutral[400]}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.aliveToggleTitleRow}>
                        <Text style={[styles.aliveToggleTitle, { color: colors.text }]}>Allow Complaint Reception</Text>
                        <View style={[styles.aliveStateBadge, { backgroundColor: allowComplaintReceptionToggle ? COLORS.brand.indigo : COLORS.neutral[400] }]}>
                          <Text style={styles.aliveStateBadgeText}>{allowComplaintReceptionToggle ? 'ENABLED' : 'DISABLED'}</Text>
                        </View>
                      </View>
                      <Text style={[styles.aliveToggleSubtitle, { color: colors.textMuted }]}>
                        Allows this branch to receive and process public consumer complaints and blocking requests.
                      </Text>
                    </View>
                    <View style={[styles.aliveSliderTrack, allowComplaintReceptionToggle ? styles.aliveSliderTrackIndigo : styles.aliveSliderTrackOff]}>
                      <Text style={[styles.aliveSliderTrackText, allowComplaintReceptionToggle ? styles.aliveSliderTrackTextLeft : styles.aliveSliderTrackTextRight]}>
                        {allowComplaintReceptionToggle ? 'ON' : 'OFF'}
                      </Text>
                      <View style={styles.aliveSliderThumb}>
                        <Lucide name={allowComplaintReceptionToggle ? 'check' : 'x'} size={11} color={allowComplaintReceptionToggle ? COLORS.brand.indigo : COLORS.neutral[400]} />
                      </View>
                    </View>
                  </Pressable>

                  {/* Capability 4: Active Status */}
                  <Pressable
                    onPress={() => setIsActiveToggle((prev) => !prev)}
                    style={[
                      styles.aliveToggleCard,
                      {
                        backgroundColor: isActiveToggle
                          ? (isDark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5')
                          : (isDark ? colors.neutral[800] : COLORS.neutral.white),
                        borderColor: isActiveToggle ? '#10B981' : (isDark ? colors.neutral[700] : '#CBD5E1'),
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.aliveToggleIconCircle,
                        {
                          backgroundColor: isActiveToggle
                            ? (isDark ? 'rgba(16, 185, 129, 0.25)' : '#D1FAE5')
                            : (isDark ? colors.neutral[700] : '#F1F5F9'),
                        },
                      ]}
                    >
                      <Lucide
                        name={isActiveToggle ? 'check-circle' : 'slash'}
                        size={16}
                        color={isActiveToggle ? '#059669' : COLORS.neutral[400]}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.aliveToggleTitleRow}>
                        <Text style={[styles.aliveToggleTitle, { color: colors.text }]}>Active Field Office Status</Text>
                        <View style={[styles.aliveStateBadge, { backgroundColor: isActiveToggle ? '#10B981' : COLORS.neutral[400] }]}>
                          <Text style={styles.aliveStateBadgeText}>{isActiveToggle ? 'ACTIVE' : 'INACTIVE'}</Text>
                        </View>
                      </View>
                      <Text style={[styles.aliveToggleSubtitle, { color: colors.textMuted }]}>
                        Field office is active and selectable by applicants and regional staff.
                      </Text>
                    </View>
                    <View style={[styles.aliveSliderTrack, isActiveToggle ? styles.aliveSliderTrackGreen : styles.aliveSliderTrackOff]}>
                      <Text style={[styles.aliveSliderTrackText, isActiveToggle ? styles.aliveSliderTrackTextLeft : styles.aliveSliderTrackTextRight]}>
                        {isActiveToggle ? 'ON' : 'OFF'}
                      </Text>
                      <View style={styles.aliveSliderThumb}>
                        <Lucide name={isActiveToggle ? 'check' : 'x'} size={11} color={isActiveToggle ? '#059669' : COLORS.neutral[400]} />
                      </View>
                    </View>
                  </Pressable>
                </View>
              </View>
            )}

            {/* 3. Application Requirements Checklist Modal */}
            {isRequirementModal && (
              <>
                {/* Application / Service Type Dropdown */}
                <View style={[styles.inputGroup, isServiceTypeDropdownOpen && { zIndex: 10000 }]}>
                  <Text style={styles.inputLabel}>APPLICATION / SERVICE TYPE</Text>
                  <Pressable
                    style={styles.dropdownTrigger}
                    onPress={() => setIsServiceTypeDropdownOpen(!isServiceTypeDropdownOpen)}
                  >
                    <Text style={styles.dropdownTriggerText}>
                      {titleInput || 'Select Service Type'}
                    </Text>
                    <Lucide
                      name={isServiceTypeDropdownOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={COLORS.neutral[400]}
                    />
                  </Pressable>

                  {isServiceTypeDropdownOpen && (
                    <View style={styles.dropdownMenu}>
                      {SERVICE_TYPE_OPTIONS.map((option) => (
                        <Pressable
                          key={option}
                          style={[
                            styles.dropdownOption,
                            titleInput === option && styles.dropdownOptionActive,
                          ]}
                          onPress={() => {
                            setTitleInput(option);
                            setIsServiceTypeDropdownOpen(false);
                          }}
                        >
                          <Text style={styles.dropdownOptionText}>{option}</Text>
                          {titleInput === option && (
                            <Lucide name="check" size={16} color={COLORS.brand.indigo} />
                          )}
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                {/* Required Checklist Documents Section */}
                <View style={styles.checklistSection}>
                  <View style={styles.checklistHeaderRow}>
                    <Text style={styles.inputLabel}>REQUIRED CHECKLIST DOCUMENTS</Text>
                    <Pressable style={styles.addItemBtn} onPress={handleAddDocumentItem}>
                      <Lucide name="plus" size={14} color={COLORS.brand.indigo} />
                      <Text style={styles.addItemBtnText}>Add Item</Text>
                    </Pressable>
                  </View>

                  <View style={styles.docListContainer}>
                    {mappedDocs.map((doc, idx) => (
                      <View key={doc.id} style={styles.docRowCard}>
                        <Text style={styles.docIndexText}>#{idx + 1}</Text>
                        <TextInput
                          style={styles.docNameInput}
                          value={doc.name}
                          onChangeText={(val) => handleUpdateDocName(doc.id, val)}
                          placeholder="Document Name"
                          placeholderTextColor={COLORS.neutral[400]}
                        />

                        {/* Toggle Required / Optional Pill Buttons */}
                        <View style={styles.pillToggleGroup}>
                          <Pressable
                            style={[
                              styles.pillToggleBtn,
                              doc.isRequired ? styles.pillRequiredActive : styles.pillInactive,
                            ]}
                            onPress={() => handleToggleRequired(doc.id, true)}
                          >
                            <Text
                              style={[
                                styles.pillToggleText,
                                doc.isRequired ? styles.pillRequiredTextActive : styles.pillTextInactive,
                              ]}
                            >
                              Required *
                            </Text>
                          </Pressable>

                          <Pressable
                            style={[
                              styles.pillToggleBtn,
                              !doc.isRequired ? styles.pillOptionalActive : styles.pillInactive,
                            ]}
                            onPress={() => handleToggleRequired(doc.id, false)}
                          >
                            <Text
                              style={[
                                styles.pillToggleText,
                                !doc.isRequired ? styles.pillOptionalTextActive : styles.pillTextInactive,
                              ]}
                            >
                              Optional
                            </Text>
                          </Pressable>
                        </View>

                        {/* Delete Row Trash Icon */}
                        <Pressable
                          style={styles.docDeleteBtn}
                          onPress={() => handleDeleteDocItem(doc.id)}
                        >
                          <Lucide name="trash-2" size={14} color={COLORS.semantic.error} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}

            {/* 4. Fees and Payments Modal */}
            {isFeeModal && (
              <>
                {/* Application / Service Type Dropdown */}
                <View style={[styles.inputGroup, isServiceTypeDropdownOpen && { zIndex: 10000 }]}>
                  <Text style={styles.inputLabel}>APPLICATION / SERVICE TYPE</Text>
                  <Pressable
                    style={styles.dropdownTrigger}
                    onPress={() => setIsServiceTypeDropdownOpen(!isServiceTypeDropdownOpen)}
                  >
                    <Text style={styles.dropdownTriggerText}>
                      {titleInput || 'Aeronautical Station Permit to POSSESS'}
                    </Text>
                    <Lucide
                      name={isServiceTypeDropdownOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={COLORS.neutral[400]}
                    />
                  </Pressable>

                  {isServiceTypeDropdownOpen && (
                    <View style={styles.dropdownMenu}>
                      {SERVICE_TYPE_OPTIONS.map((option) => (
                        <Pressable
                          key={option}
                          style={[
                            styles.dropdownOption,
                            titleInput === option && styles.dropdownOptionActive,
                          ]}
                          onPress={() => {
                            setTitleInput(option);
                            setIsServiceTypeDropdownOpen(false);
                          }}
                        >
                          <Text style={styles.dropdownOptionText}>{option}</Text>
                          {titleInput === option && (
                            <Lucide name="check" size={16} color={COLORS.brand.indigo} />
                          )}
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                {/* Allocated Costs Breakdown List Section */}
                <View style={styles.checklistSection}>
                  <View style={styles.checklistHeaderRow}>
                    <Text style={styles.inputLabel}>ALLOCATED COSTS BREAKDOWN LIST</Text>
                    <Pressable style={styles.addItemBtn} onPress={handleAddFeeItem}>
                      <Lucide name="plus" size={14} color={COLORS.brand.indigo} />
                      <Text style={styles.addItemBtnText}>Add Fee Item</Text>
                    </Pressable>
                  </View>

                  <View style={styles.docListContainer}>
                    {feeBreakdowns.map((fb, idx) => {
                      const isDropdownOpen = activeFeeDropdownId === fb.id;
                      const rowZIndex = isDropdownOpen ? 9999 : (feeBreakdowns.length - idx) * 10;
                      const isCustom = fb.calculationMode === 'CustomFormula';

                      return (
                        <View
                          key={fb.id}
                          style={[styles.feeRowCard, { zIndex: rowZIndex }]}
                        >
                          {/* Top Row: Fee Name & Base Amount */}
                          <View style={styles.feeTopRow}>
                            <Text style={styles.docIndexText}>#{idx + 1}</Text>

                            {/* Fee Name Dropdown / Input */}
                            <View style={styles.feeTypeBox}>
                              <Pressable
                                style={styles.feeTypeTrigger}
                                onPress={() =>
                                  setActiveFeeDropdownId(
                                    activeFeeDropdownId === fb.id ? null : fb.id
                                  )
                                }
                              >
                                <Text style={styles.feeTypeTriggerText}>{fb.name}</Text>
                                <Lucide
                                  name={activeFeeDropdownId === fb.id ? 'chevron-up' : 'chevron-down'}
                                  size={16}
                                  color={COLORS.neutral[400]}
                                />
                              </Pressable>

                              {activeFeeDropdownId === fb.id && (
                                <View style={styles.feeDropdownMenu}>
                                  {FEE_TYPE_OPTIONS.map((opt) => (
                                    <Pressable
                                      key={opt}
                                      style={[
                                        styles.dropdownOption,
                                        fb.name === opt && styles.dropdownOptionActive,
                                      ]}
                                      onPress={() => {
                                        handleUpdateFeeName(fb.id, opt);
                                        setActiveFeeDropdownId(null);
                                      }}
                                    >
                                      <Text style={styles.dropdownOptionText}>{opt}</Text>
                                      {fb.name === opt && (
                                        <Lucide name="check" size={14} color={COLORS.brand.indigo} />
                                      )}
                                    </Pressable>
                                  ))}
                                </View>
                              )}
                            </View>

                            {/* Peso Currency Prefix & Amount Input */}
                            <View style={styles.amountInputBox}>
                              <Text style={styles.currencySymbol}>₱</Text>
                              <TextInput
                                style={styles.feeAmountInput}
                                value={String(fb.amount)}
                                onChangeText={(val) => handleUpdateFeeAmount(fb.id, val)}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={COLORS.neutral[400]}
                              />
                            </View>

                            {/* Delete Row Trash Icon */}
                            <Pressable
                              style={styles.docDeleteBtn}
                              onPress={() => handleDeleteFeeItem(fb.id)}
                            >
                              <Lucide name="trash-2" size={14} color={COLORS.semantic.error} />
                            </Pressable>
                          </View>

                          {/* Middle Row: Calculation Mode Toggle */}
                          <View style={styles.calculationModeRow}>
                            <Pressable
                              style={[
                                styles.calcModeBtn,
                                !isCustom && styles.calcModeBtnActive,
                              ]}
                              onPress={() => handleUpdateFeeMode(fb.id, 'StandardMultiplier')}
                            >
                              <Lucide
                                name="sliders"
                                size={12}
                                color={!isCustom ? COLORS.brand.indigo : COLORS.neutral[500]}
                              />
                              <Text
                                style={[
                                  styles.calcModeBtnText,
                                  !isCustom && styles.calcModeBtnTextActive,
                                ]}
                              >
                                Standard Multipliers
                              </Text>
                            </Pressable>

                            <Pressable
                              style={[
                                styles.calcModeBtn,
                                isCustom && styles.calcModeBtnActive,
                              ]}
                              onPress={() => handleUpdateFeeMode(fb.id, 'CustomFormula')}
                            >
                              <Lucide
                                name="code"
                                size={12}
                                color={isCustom ? COLORS.brand.indigo : COLORS.neutral[500]}
                              />
                              <Text
                                style={[
                                  styles.calcModeBtnText,
                                  isCustom && styles.calcModeBtnTextActive,
                                ]}
                              >
                                Custom Formula
                              </Text>
                            </Pressable>
                          </View>

                          {/* Bottom Settings: Standard Multiplier Chips OR Custom Formula Input */}
                          {!isCustom ? (
                            <View style={styles.multipliersContainer}>
                              <Text style={styles.multiplierSectionLabel}>Active Multipliers & Taxes:</Text>
                              <View style={styles.multiplierChipsRow}>
                                <Pressable
                                  style={[
                                    styles.multiplierChip,
                                    fb.multiplyByValidityYears && styles.multiplierChipActive,
                                  ]}
                                  onPress={() => handleToggleFeeMultiplier(fb.id, 'years')}
                                >
                                  <Text
                                    style={[
                                      styles.multiplierChipText,
                                      fb.multiplyByValidityYears && styles.multiplierChipTextActive,
                                    ]}
                                  >
                                    × Validity Years
                                  </Text>
                                </Pressable>

                                <Pressable
                                  style={[
                                    styles.multiplierChip,
                                    fb.multiplyByUnits && styles.multiplierChipActive,
                                  ]}
                                  onPress={() => handleToggleFeeMultiplier(fb.id, 'units')}
                                >
                                  <Text
                                    style={[
                                      styles.multiplierChipText,
                                      fb.multiplyByUnits && styles.multiplierChipTextActive,
                                    ]}
                                  >
                                    × Units / Stations
                                  </Text>
                                </Pressable>

                                <Pressable
                                  style={[
                                    styles.multiplierChip,
                                    fb.multiplyByChannels && styles.multiplierChipActive,
                                  ]}
                                  onPress={() => handleToggleFeeMultiplier(fb.id, 'channels')}
                                >
                                  <Text
                                    style={[
                                      styles.multiplierChipText,
                                      fb.multiplyByChannels && styles.multiplierChipTextActive,
                                    ]}
                                  >
                                    × Channels
                                  </Text>
                                </Pressable>

                                <Pressable
                                  style={[
                                    styles.multiplierChip,
                                    fb.multiplyByPages && styles.multiplierChipActive,
                                  ]}
                                  onPress={() => handleToggleFeeMultiplier(fb.id, 'pages')}
                                >
                                  <Text
                                    style={[
                                      styles.multiplierChipText,
                                      fb.multiplyByPages && styles.multiplierChipTextActive,
                                    ]}
                                  >
                                    × Pages / Copies
                                  </Text>
                                </Pressable>

                                <Pressable
                                  style={[
                                    styles.multiplierChip,
                                    fb.applyLateRenewalSurcharge && styles.multiplierChipActive,
                                  ]}
                                  onPress={() => handleToggleFeeMultiplier(fb.id, 'surcharge')}
                                >
                                  <Text
                                    style={[
                                      styles.multiplierChipText,
                                      fb.applyLateRenewalSurcharge && styles.multiplierChipTextActive,
                                    ]}
                                  >
                                    + Late Surcharge
                                  </Text>
                                </Pressable>

                                <Pressable
                                  style={[
                                    styles.multiplierChip,
                                    fb.includeDst && styles.multiplierChipActive,
                                  ]}
                                  onPress={() => handleToggleFeeMultiplier(fb.id, 'dst')}
                                >
                                  <Text
                                    style={[
                                      styles.multiplierChipText,
                                      fb.includeDst && styles.multiplierChipTextActive,
                                    ]}
                                  >
                                    + DST (₱30)
                                  </Text>
                                </Pressable>
                              </View>
                            </View>
                          ) : (
                            <View style={styles.customFormulaContainer}>
                              <Text style={styles.multiplierSectionLabel}>Formula Expression:</Text>
                              <TextInput
                                style={styles.formulaInput}
                                value={fb.formula ?? '{RATE} * {YEARS} * {UNITS}'}
                                onChangeText={(val) => handleUpdateFeeFormula(fb.id, val)}
                                placeholder="{RATE} * {YEARS} * {UNITS}"
                                placeholderTextColor={COLORS.neutral[400]}
                              />
                              <View style={styles.formulaTokensRow}>
                                <Text style={styles.tokenHintLabel}>Insert Token:</Text>
                                {['{RATE}', '{YEARS}', '{UNITS}', '{CHANNELS}', '{PAGES}', 'DST', 'SUR'].map((tok) => (
                                  <Pressable
                                    key={tok}
                                    style={styles.formulaTokenBadge}
                                    onPress={() => {
                                      const currentFormula = fb.formula ?? '{RATE}';
                                      handleUpdateFeeFormula(fb.id, `${currentFormula} * ${tok}`);
                                    }}
                                  >
                                    <Text style={styles.formulaTokenBadgeText}>{tok}</Text>
                                  </Pressable>
                                ))}
                              </View>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              </>
            )}

            {/* 5. Guidance Notes Modal */}
            {isNoteModal && (
              <>
                {/* Application / Service Type Dropdown */}
                <View style={[styles.inputGroup, isServiceTypeDropdownOpen && { zIndex: 10000 }]}>
                  <Text style={styles.inputLabel}>APPLICATION / SERVICE TYPE</Text>
                  <Pressable
                    style={styles.dropdownTrigger}
                    onPress={() => setIsServiceTypeDropdownOpen(!isServiceTypeDropdownOpen)}
                  >
                    <Text style={styles.dropdownTriggerText}>
                      {titleInput || 'Aeronautical Station Permit to POSSESS'}
                    </Text>
                    <Lucide
                      name={isServiceTypeDropdownOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={COLORS.neutral[400]}
                    />
                  </Pressable>

                  {isServiceTypeDropdownOpen && (
                    <View style={styles.dropdownMenu}>
                      {SERVICE_TYPE_OPTIONS.map((option) => (
                        <Pressable
                          key={option}
                          style={[
                            styles.dropdownOption,
                            titleInput === option && styles.dropdownOptionActive,
                          ]}
                          onPress={() => {
                            setTitleInput(option);
                            setIsServiceTypeDropdownOpen(false);
                          }}
                        >
                          <Text style={styles.dropdownOptionText}>{option}</Text>
                          {titleInput === option && (
                            <Lucide name="check" size={16} color={COLORS.brand.indigo} />
                          )}
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                {/* Service Guideline Notes Content */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>SERVICE GUIDELINE NOTES CONTENT</Text>
                  <TextInput
                    style={[styles.textInput, styles.notesTextArea]}
                    placeholder={`1.\n2.\n3.`}
                    placeholderTextColor={COLORS.neutral[400]}
                    multiline
                    numberOfLines={7}
                    value={instructionsInput}
                    onChangeText={setInstructionsInput}
                  />
                  <Text style={styles.notesHelperText}>
                    Preserves line-breaks exactly as written above.
                  </Text>
                </View>
              </>
            )}

            {/* 6. Form Builder Modal (Matching Screenshot 2) */}
            {isFormModal && (
              <>
                {/* Application / Service Type Dropdown */}
                <View style={[styles.inputGroup, isServiceTypeDropdownOpen && { zIndex: 10000 }]}>
                  <Text style={styles.inputLabel}>APPLICATION / SERVICE TYPE</Text>
                  <Pressable
                    style={styles.dropdownTrigger}
                    onPress={() => setIsServiceTypeDropdownOpen(!isServiceTypeDropdownOpen)}
                  >
                    <Text style={styles.dropdownTriggerText}>
                      {titleInput || 'Aeronautical Station Permit to POSSESS'}
                    </Text>
                    <Lucide
                      name={isServiceTypeDropdownOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={COLORS.neutral[400]}
                    />
                  </Pressable>

                  {isServiceTypeDropdownOpen && (
                    <View style={styles.dropdownMenu}>
                      {SERVICE_TYPE_OPTIONS.map((option) => (
                        <Pressable
                          key={option}
                          style={[
                            styles.dropdownOption,
                            titleInput === option && styles.dropdownOptionActive,
                          ]}
                          onPress={() => {
                            setTitleInput(option);
                            setIsServiceTypeDropdownOpen(false);
                          }}
                        >
                          <Text style={styles.dropdownOptionText}>{option}</Text>
                          {titleInput === option && (
                            <Lucide name="check" size={16} color={COLORS.brand.indigo} />
                          )}
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                {/* Form Title */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>FORM TITLE</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Example: Radio Station License Certificate"
                    placeholderTextColor={COLORS.neutral[400]}
                    value={nameInput}
                    onChangeText={setNameInput}
                  />
                </View>

                {/* Form Code & Status 2-Column Row */}
                <View style={styles.twoColumnRow}>
                  {/* Form Code Column */}
                  <View style={[styles.inputGroup, styles.flexColumn]}>
                    <Text style={styles.inputLabel}>FORM CODE</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Example: RSL-CERT-001"
                      placeholderTextColor={COLORS.neutral[400]}
                      value={codeInput}
                      onChangeText={setCodeInput}
                    />
                  </View>

                  {/* Status Dropdown Column */}
                  <View
                    style={[
                      styles.inputGroup,
                      styles.flexColumn,
                      isFormStatusDropdownOpen && { zIndex: 10000 },
                    ]}
                  >
                    <Text style={styles.inputLabel}>STATUS</Text>
                    <Pressable
                      style={styles.dropdownTrigger}
                      onPress={() => setIsFormStatusDropdownOpen(!isFormStatusDropdownOpen)}
                    >
                      <Text style={styles.dropdownTriggerText}>{formStatus}</Text>
                      <Lucide
                        name={isFormStatusDropdownOpen ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={COLORS.neutral[400]}
                      />
                    </Pressable>

                    {isFormStatusDropdownOpen && (
                      <View style={styles.dropdownMenu}>
                        <Pressable
                          style={[
                            styles.dropdownOption,
                            formStatus === 'Draft' && styles.dropdownOptionActive,
                          ]}
                          onPress={() => {
                            setFormStatus('Draft');
                            setIsFormStatusDropdownOpen(false);
                          }}
                        >
                          <Text style={styles.dropdownOptionText}>Draft</Text>
                          {formStatus === 'Draft' && (
                            <Lucide name="check" size={16} color={COLORS.brand.indigo} />
                          )}
                        </Pressable>

                        <Pressable
                          style={[
                            styles.dropdownOption,
                            formStatus === 'Published' && styles.dropdownOptionActive,
                          ]}
                          onPress={() => {
                            setFormStatus('Published');
                            setIsFormStatusDropdownOpen(false);
                          }}
                        >
                          <Text style={styles.dropdownOptionText}>Published</Text>
                          {formStatus === 'Published' && (
                            <Lucide name="check" size={16} color={COLORS.brand.indigo} />
                          )}
                        </Pressable>
                      </View>
                    )}
                  </View>
                </View>

                {/* Short Description */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>DESCRIPTION</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Short purpose of this form template"
                    placeholderTextColor={COLORS.neutral[400]}
                    multiline
                    numberOfLines={4}
                    value={subLabelInput}
                    onChangeText={setSubLabelInput}
                  />
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer Buttons (Exact Match to Screenshots) */}
          <View style={styles.modalFooter}>
            <Pressable style={styles.cancelBtn} onPress={onClose} disabled={isSubmitting}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                styles.saveBtn,
                isSaveDisabled && styles.saveBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={isSaveDisabled}
            >
              <Text style={[styles.saveBtnText, isSaveDisabled && styles.saveBtnTextDisabled]}>
                {isSubmitting ? 'Saving...' : getSaveButtonText()}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '88%',
    flexDirection: 'column',
    backgroundColor: COLORS.neutral.white,
    borderRadius: 20,
    padding: SPACING[24],
    overflow: 'hidden',
    zIndex: 1000,
  },
  modalCardWide: {
    maxWidth: 640,
  },
  modalScroll: {
    flex: 1,
    flexShrink: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING[16],
    zIndex: 10,
  },
  modalTitleContainer: {
    flex: 1,
    paddingRight: SPACING[12],
  },
  topBadgeText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.brand.indigoHover,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  modalSubtitle: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[500],
    marginTop: 4,
    lineHeight: 18,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.circle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    gap: SPACING[16],
    overflow: 'visible',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: SPACING[12],
  },
  flexColumn: {
    flex: 1,
  },
  inputGroup: {
    gap: 6,
    position: 'relative',
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    backgroundColor: COLORS.neutral[50],
    borderRadius: 10,
    paddingHorizontal: SPACING[16],
    height: 48,
    color: COLORS.neutral[900],
  },
  textArea: {
    height: 100,
    paddingTop: SPACING[12],
    textAlignVertical: 'top',
  },
  notesTextArea: {
    height: 160,
    paddingTop: SPACING[12],
    paddingHorizontal: SPACING[16],
    textAlignVertical: 'top',
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
    lineHeight: 22,
  },
  notesHelperText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontStyle: 'italic',
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
  },
  switchLabel: {
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.neutral[50],
    borderRadius: 10,
    paddingHorizontal: SPACING[16],
    height: 48,
  },
  dropdownTriggerText: {
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  dropdownMenu: {
    position: 'absolute',
    top: 74,
    left: 0,
    right: 0,
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 4,
    maxHeight: 220,
    zIndex: 99999,
    ...SHADOWS.modal,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[16],
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  dropdownOptionActive: {
    backgroundColor: COLORS.neutral[50],
  },
  dropdownOptionText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '600',
    color: COLORS.neutral[900],
  },

  // Checklist & Fees Section
  checklistSection: {
    gap: 8,
    marginTop: 4,
  },
  checklistHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addItemBtnText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.brand.indigo,
  },
  docListContainer: {
    gap: 10,
  },
  docRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  feeRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    position: 'relative',
  },
  docIndexText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[400],
  },
  docNameInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  feeTypeBox: {
    flex: 1,
    position: 'relative',
    zIndex: 999,
  },
  feeTypeTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
  },
  feeTypeTriggerText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  feeDropdownMenu: {
    position: 'absolute',
    top: 42,
    left: 0,
    right: 0,
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    borderRadius: 8,
    zIndex: 99999,
    maxHeight: 180,
    ...SHADOWS.modal,
  },
  amountInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    width: 90,
  },
  currencySymbol: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[400],
    marginRight: 4,
  },
  feeAmountInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  pillToggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pillRequiredActive: {
    backgroundColor: COLORS.semantic.error,
  },
  pillOptionalActive: {
    backgroundColor: COLORS.neutral[100],
    borderColor: COLORS.neutral[300],
    borderWidth: 1,
  },
  pillInactive: {
    backgroundColor: COLORS.neutral[100],
  },
  pillToggleText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
  },
  pillRequiredTextActive: {
    color: COLORS.neutral.white,
  },
  pillOptionalTextActive: {
    color: COLORS.neutral[700],
  },
  pillTextInactive: {
    color: COLORS.neutral[400],
  },
  docDeleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.semantic.errorBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: COLORS.semantic.errorBorder,
    borderWidth: 1,
  },

  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING[12],
    marginTop: SPACING[24],
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.neutral[100],
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[700],
    fontWeight: '700',
  },
  saveBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.brand.indigo,
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral.white,
    fontWeight: '700',
  },
  saveBtnDisabled: {
    backgroundColor: COLORS.neutral[200],
    opacity: 0.6,
  },
  saveBtnTextDisabled: {
    color: COLORS.neutral[400],
  },
  radioContainer: {
    flexDirection: 'row',
    gap: SPACING[12],
    marginTop: SPACING[4],
  },
  radioOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral[50],
  },
  radioOptionActive: {
    borderColor: COLORS.brand.indigo,
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: COLORS.brand.indigo,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.brand.indigo,
  },
  radioText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '600',
    color: COLORS.neutral[700],
  },
  radioTextActive: {
    color: COLORS.brand.indigo,
    fontWeight: '700',
  },
  rowTwoInputs: {
    flexDirection: 'row',
    gap: SPACING[12],
  },
  textAreaInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  switchSubtext: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  textInputError: {
    borderColor: COLORS.semantic.error,
    borderWidth: 1.5,
    backgroundColor: 'rgba(239, 68, 68, 0.04)',
  },
  fieldErrorText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '600',
    color: COLORS.semantic.error,
    marginTop: 3,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.semantic.errorBg,
    borderColor: COLORS.semantic.errorBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: SPACING[12],
  },
  errorBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  errorBannerText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '600',
    color: COLORS.semantic.error,
    flex: 1,
  },
  errorDismissBtn: {
    padding: 2,
  },
  feeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  calculationModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
  },
  calcModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  calcModeBtnActive: {
    backgroundColor: COLORS.brand.indigoLight,
    borderColor: COLORS.brand.indigo,
  },
  calcModeBtnText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '600',
    color: COLORS.neutral[600],
  },
  calcModeBtnTextActive: {
    color: COLORS.brand.indigo,
    fontWeight: '700',
  },
  multipliersContainer: {
    gap: 4,
    marginTop: 4,
  },
  multiplierSectionLabel: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[500],
    textTransform: 'uppercase',
  },
  multiplierChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  multiplierChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  multiplierChipActive: {
    backgroundColor: COLORS.brand[600],
    borderColor: COLORS.brand[600],
  },
  multiplierChipText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '600',
    color: COLORS.neutral[600],
  },
  multiplierChipTextActive: {
    color: COLORS.neutral.white,
    fontWeight: '700',
  },
  customFormulaContainer: {
    gap: 6,
    marginTop: 4,
  },
  formulaInput: {
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontFamily: 'monospace',
    color: COLORS.brand.indigo,
    fontWeight: '700',
  },
  formulaTokensRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  tokenHintLabel: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '600',
    color: COLORS.neutral[400],
  },
  formulaTokenBadge: {
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
  },
  formulaTokenBadgeText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: COLORS.brand.indigo,
  },
  routingOptionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  routingOptionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1.5,
    borderColor: COLORS.neutral[200],
    borderRadius: 8,
    padding: 10,
  },
  routingOptionCardActive: {
    borderColor: COLORS.brand.indigo,
    backgroundColor: '#EEF2FF',
  },
  routingOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.neutral[700],
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  routingOptionTitleActive: {
    color: COLORS.brand.indigo,
  },
  routingOptionSub: {
    fontSize: 11,
    color: COLORS.neutral[500],
    marginTop: 2,
    fontFamily: TYPOGRAPHY.fonts.primary,
    lineHeight: 15,
  },
  regionalSectionsStack: {
    gap: 16,
    paddingBottom: 4,
  },
  featureSectionCard: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  featureSectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureSectionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  featureSectionSubtitle: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fonts.primary,
    marginTop: 2,
    lineHeight: 16,
  },
  sectionPillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sectionPillBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fonts.primary,
    letterSpacing: 0.5,
  },
  featureSectionDivider: {
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    marginVertical: 2,
  },
  aliveToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  aliveToggleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aliveToggleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  aliveToggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  aliveToggleSubtitle: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    marginTop: 3,
    lineHeight: 15,
  },
  aliveStateBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aliveStateBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.neutral.white,
    fontFamily: TYPOGRAPHY.fonts.primary,
    letterSpacing: 0.4,
  },
  aliveSliderTrack: {
    width: 56,
    height: 30,
    borderRadius: 15,
    padding: 3,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  aliveSliderTrackIndigo: {
    backgroundColor: COLORS.brand.indigo,
    justifyContent: 'flex-end',
  },
  aliveSliderTrackGreen: {
    backgroundColor: '#10B981',
    justifyContent: 'flex-end',
  },
  aliveSliderTrackOff: {
    backgroundColor: '#CBD5E1',
    justifyContent: 'flex-start',
  },
  aliveSliderTrackText: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fonts.primary,
    letterSpacing: 0.4,
  },
  aliveSliderTrackTextLeft: {
    left: 8,
    color: COLORS.neutral.white,
  },
  aliveSliderTrackTextRight: {
    right: 7,
    color: '#475569',
  },
  aliveSliderThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  aliveSliderThumbOn: {
    backgroundColor: COLORS.neutral.white,
  },
  aliveSliderThumbOff: {
    backgroundColor: COLORS.neutral.white,
  },
  seriesPreviewBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  seriesPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seriesPreviewLabel: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fonts.primary,
    letterSpacing: 0.5,
  },
  seriesPreviewPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  seriesPreviewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  seriesPreviewPillTitle: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  seriesPreviewPillValue: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fonts.mono,
  },
});
