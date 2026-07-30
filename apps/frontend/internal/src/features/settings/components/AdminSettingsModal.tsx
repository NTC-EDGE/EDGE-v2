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
            (type === 'add-branch' || isRequirementModal || isFeeModal || isNoteModal || isFormModal) && styles.modalCardWide,
            SHADOWS.modal,
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
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

              <Text style={styles.modalTitle}>{getModalTitle()}</Text>

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
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>FULL NAME</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Atty. Ella Blanca B. Lopez"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={nameInput}
                        onChangeText={setNameInput}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>TITLE</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Regional Commissioner"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={subLabelInput}
                        onChangeText={setSubLabelInput}
                      />
                    </View>

                    <View style={styles.switchRow}>
                      <Text style={styles.switchLabel}>Mark as Active Commissioner</Text>
                      <Switch
                        value={isActiveToggle}
                        onValueChange={setIsActiveToggle}
                        trackColor={{ false: COLORS.neutral[300], true: COLORS.brand.indigo400 }}
                        thumbColor={isActiveToggle ? COLORS.brand.indigo : COLORS.neutral.white}
                      />
                    </View>
                  </>
                )}

                {categoryName === 'Support Contact' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>HELPDESK NAME</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Main Helpdesk"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={nameInput}
                        onChangeText={setNameInput}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>EMAIL & PHONE DETAILS</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="ntc10@gov.ph · (02) 8-123-4567"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={subLabelInput}
                        onChangeText={setSubLabelInput}
                      />
                    </View>
                  </>
                )}

                {categoryName === 'Office Details' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>OFFICE NAME</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="NTC Region X"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={nameInput}
                        onChangeText={setNameInput}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>ROUTING KEYS / CODES</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="B5099 · 43A"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={subLabelInput}
                        onChangeText={setSubLabelInput}
                      />
                    </View>

                    <View style={styles.switchRow}>
                      <Text style={styles.switchLabel}>Mark as Primary Office</Text>
                      <Switch
                        value={isActiveToggle}
                        onValueChange={setIsActiveToggle}
                        trackColor={{ false: COLORS.neutral[300], true: COLORS.brand.indigo400 }}
                        thumbColor={isActiveToggle ? COLORS.brand.indigo : COLORS.neutral.white}
                      />
                    </View>
                  </>
                )}

                {categoryName === 'Region Summary' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>REGION NAME</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Region XIV"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={nameInput}
                        onChangeText={setNameInput}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>GLOBAL CONFIG & ALERTS</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="XIV · Alerts: off"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={subLabelInput}
                        onChangeText={setSubLabelInput}
                      />
                    </View>

                    <View style={styles.switchRow}>
                      <Text style={styles.switchLabel}>Mark as Active Region</Text>
                      <Switch
                        value={isActiveToggle}
                        onValueChange={setIsActiveToggle}
                        trackColor={{ false: COLORS.neutral[300], true: COLORS.brand.indigo400 }}
                        thumbColor={isActiveToggle ? COLORS.brand.indigo : COLORS.neutral.white}
                      />
                    </View>
                  </>
                )}
              </>
            )}

            {/* 2. Regional Field Office Modal Fields */}
            {type === 'add-branch' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>BRANCH NAME</Text>
                  <TextInput
                    style={[
                      styles.textInput,
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

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>BRANCH CODE</Text>
                  <TextInput
                    style={[
                      styles.textInput,
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

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>BRANCH CATEGORY</Text>
                  <View style={styles.radioContainer}>
                    <Pressable
                      style={[
                        styles.radioOption,
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
                      <Text style={[styles.radioText, branchCategory === 'Main' && styles.radioTextActive]}>
                        Main
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.radioOption,
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
                      <Text style={[styles.radioText, branchCategory === 'Extension' && styles.radioTextActive]}>
                        Extension
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>OFFICE ADDRESS</Text>
                  <TextInput
                    style={[
                      styles.textInput,
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
                    <Text style={styles.inputLabel}>CONTACT PHONE</Text>
                    <TextInput
                      style={[
                        styles.textInput,
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
                    <Text style={styles.inputLabel}>CONTACT EMAIL</Text>
                    <TextInput
                      style={[
                        styles.textInput,
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
                    <Text style={styles.inputLabel}>OFFICER IN CHARGE NAME</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Engr. Juan Dela Cruz"
                      placeholderTextColor={COLORS.neutral[400]}
                      value={officerNameInput}
                      onChangeText={setOfficerNameInput}
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>OFFICER EMAIL</Text>
                    <TextInput
                      style={[
                        styles.textInput,
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
                  <Text style={styles.inputLabel}>PERMIT & INSPECTION CAPABILITIES</Text>
                  <View style={{ gap: SPACING[10], marginTop: SPACING[4] }}>
                    <View style={styles.switchRow}>
                      <Text style={[styles.switchLabel, { color: colors.text }]}>Allow Permit Issuance</Text>
                      <Switch
                        value={allowPermitIssuanceToggle}
                        onValueChange={setAllowPermitIssuanceToggle}
                        trackColor={{ false: COLORS.neutral[300], true: COLORS.brand.indigo }}
                        thumbColor={COLORS.neutral.white}
                      />
                    </View>

                    <View style={styles.switchRow}>
                      <Text style={[styles.switchLabel, { color: colors.text }]}>Allow Spectrum Inspection</Text>
                      <Switch
                        value={allowSpectrumInspectionToggle}
                        onValueChange={setAllowSpectrumInspectionToggle}
                        trackColor={{ false: COLORS.neutral[300], true: COLORS.brand.indigo }}
                        thumbColor={COLORS.neutral.white}
                      />
                    </View>

                    <View style={styles.switchRow}>
                      <Text style={[styles.switchLabel, { color: colors.text }]}>Allow Complaint Reception</Text>
                      <Switch
                        value={allowComplaintReceptionToggle}
                        onValueChange={setAllowComplaintReceptionToggle}
                        trackColor={{ false: COLORS.neutral[300], true: COLORS.brand.indigo }}
                        thumbColor={COLORS.neutral.white}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>DESCRIPTION / REMARKS</Text>
                  <TextInput
                    style={[styles.textInput, styles.textAreaInput]}
                    placeholder="Provide additional details or notes regarding this field office..."
                    placeholderTextColor={COLORS.neutral[400]}
                    multiline
                    numberOfLines={3}
                    value={descriptionInput}
                    onChangeText={setDescriptionInput}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.switchRow}>
                    <View>
                      <Text style={[styles.switchLabel, { color: colors.text }]}>Active Status</Text>
                      <Text style={[styles.switchSubtext, { color: colors.textMuted }]}>
                        Field office is active and accessible for service assignments
                      </Text>
                    </View>
                    <Switch
                      value={isActiveToggle}
                      onValueChange={setIsActiveToggle}
                      trackColor={{ false: COLORS.neutral[300], true: COLORS.brand.indigo }}
                      thumbColor={COLORS.neutral.white}
                    />
                  </View>
                </View>
              </>
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

                      return (
                        <View
                          key={fb.id}
                          style={[styles.feeRowCard, { zIndex: rowZIndex }]}
                        >
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
});
