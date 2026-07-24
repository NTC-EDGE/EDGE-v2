import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';

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
  amount?: number;
  instructions?: string;
  isActive?: boolean;
  mappedDocuments?: MappedDocInput[];
  feeBreakdown?: FeeBreakdownItemInput[];
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
    amount: number;
    instructions: string;
    isActive: boolean;
    mappedDocuments?: MappedDocInput[];
    feeBreakdown?: FeeBreakdownItemInput[];
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
  const [titleInput, setTitleInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [subLabelInput, setSubLabelInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [branchType, setBranchType] = useState<'Main Office' | 'Field Office'>('Main Office');
  const [amountInput, setAmountInput] = useState('');
  const [instructionsInput, setInstructionsInput] = useState('');
  const [isActiveToggle, setIsActiveToggle] = useState(true);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isServiceTypeDropdownOpen, setIsServiceTypeDropdownOpen] = useState(false);
  const [activeFeeDropdownId, setActiveFeeDropdownId] = useState<string | null>(null);

  // Mapped Documents State
  const [mappedDocs, setMappedDocs] = useState<MappedDocInput[]>([]);

  // Fee Breakdown Items State
  const [feeBreakdowns, setFeeBreakdowns] = useState<FeeBreakdownItemInput[]>([]);

  useEffect(() => {
    if (visible && initialData !== undefined && initialData !== null) {
      setTitleInput(initialData.title ?? 'Aeronautical Station Permit to POSSESS');
      setNameInput(initialData.name ?? '');
      setSubLabelInput(initialData.subLabel ?? '');
      setCodeInput(initialData.code ?? 'ZC-001');
      setBranchType(initialData.branchType === 'Field Office' ? 'Field Office' : 'Main Office');
      setAmountInput(initialData.amount !== undefined ? String(initialData.amount) : '');
      setInstructionsInput(initialData.instructions ?? '');
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
      setAmountInput('');
      setInstructionsInput('');
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
    setActiveFeeDropdownId(null);
  }, [visible, initialData]);

  if (!visible || type === 'none') return null;

  const categoryName = initialData?.category ?? '';
  const isRequirementModal = type === 'add-requirement' || type === 'edit-requirement';
  const isFeeModal = type === 'add-fee' || type === 'edit-fee';

  const getModalTitle = () => {
    switch (type) {
      case 'edit-config':
        if (categoryName === 'Commissioner') return 'Edit Commissioner';
        if (categoryName === 'Support Contact') return 'Edit Support Contact';
        if (categoryName === 'Office Details') return 'Edit Office Details';
        if (categoryName === 'Region Summary') return 'Edit Region Summary';
        return 'Edit Regional Configuration';
      case 'add-branch':
        return initialData?.id ? 'Edit Regional Branch Office' : 'Add Regional Branch Office';
      case 'add-requirement':
        return 'Add Service Requirements Checklist';
      case 'edit-requirement':
        return 'Edit Service Requirements Checklist';
      case 'add-fee':
        return 'Add Mapped Surcharges / Fees';
      case 'edit-fee':
        return 'Edit Mapped Surcharges / Fees';
      case 'add-note':
        return 'Add Guidance Note';
      case 'edit-note':
        return 'Edit Guidance Note';
      case 'add-form':
        return 'Build New Form';
      default:
        return 'Admin Settings';
    }
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

  const handleSave = () => {
    const totalFromBreakdowns = feeBreakdowns.reduce((acc, curr) => acc + curr.amount, 0);
    const parsedAmount = parseFloat(amountInput);
    const finalAmount = totalFromBreakdowns > 0 ? totalFromBreakdowns : (isNaN(parsedAmount) ? 0 : parsedAmount);

    onSave({
      title: titleInput,
      name: nameInput,
      subLabel: subLabelInput,
      code: codeInput,
      branchType,
      amount: finalAmount,
      instructions: instructionsInput,
      isActive: isActiveToggle,
      mappedDocuments: mappedDocs,
      feeBreakdown: feeBreakdowns,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modalCard,
            (isRequirementModal || isFeeModal) && styles.modalCardWide,
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
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Lucide name="x" size={18} color="#94A3B8" />
            </Pressable>
          </View>

          {/* Form Content */}
          <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
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
                        trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
                        thumbColor={isActiveToggle ? '#4F46E5' : '#FFFFFF'}
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
                        trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
                        thumbColor={isActiveToggle ? '#4F46E5' : '#FFFFFF'}
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
                        trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
                        thumbColor={isActiveToggle ? '#4F46E5' : '#FFFFFF'}
                      />
                    </View>
                  </>
                )}
              </>
            )}

            {/* 2. Regional Branch Office Modal Fields */}
            {type === 'add-branch' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>BRANCH NAME</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Zamboanga City Main Office"
                    placeholderTextColor={COLORS.neutral[400]}
                    value={nameInput}
                    onChangeText={setNameInput}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>BRANCH CODE</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="ZC-001"
                    placeholderTextColor={COLORS.neutral[400]}
                    value={codeInput}
                    onChangeText={setCodeInput}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>BRANCH CATEGORY</Text>
                  <Pressable
                    style={styles.dropdownTrigger}
                    onPress={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  >
                    <Text style={styles.dropdownTriggerText}>{branchType}</Text>
                    <Lucide
                      name={isCategoryDropdownOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#94A3B8"
                    />
                  </Pressable>

                  {isCategoryDropdownOpen && (
                    <View style={styles.dropdownMenu}>
                      <Pressable
                        style={[
                          styles.dropdownOption,
                          branchType === 'Main Office' && styles.dropdownOptionActive,
                        ]}
                        onPress={() => {
                          setBranchType('Main Office');
                          setIsCategoryDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownOptionText}>Main Office</Text>
                        {branchType === 'Main Office' && (
                          <Lucide name="check" size={16} color="#4F46E5" />
                        )}
                      </Pressable>

                      <Pressable
                        style={[
                          styles.dropdownOption,
                          branchType === 'Field Office' && styles.dropdownOptionActive,
                        ]}
                        onPress={() => {
                          setBranchType('Field Office');
                          setIsCategoryDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownOptionText}>Field Office</Text>
                        {branchType === 'Field Office' && (
                          <Lucide name="check" size={16} color="#4F46E5" />
                        )}
                      </Pressable>
                    </View>
                  )}
                </View>
              </>
            )}

            {/* 3. Application Requirements Checklist Modal */}
            {isRequirementModal && (
              <>
                {/* Application / Service Type Dropdown */}
                <View style={styles.inputGroup}>
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
                      color="#94A3B8"
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
                            <Lucide name="check" size={16} color="#4F46E5" />
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
                      <Lucide name="plus" size={14} color="#4F46E5" />
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
                          <Lucide name="trash-2" size={14} color="#EF4444" />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}

            {/* 4. Fees and Payments Modal (Matching User Screenshot) */}
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
                      color="#94A3B8"
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
                            <Lucide name="check" size={16} color="#4F46E5" />
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
                      <Lucide name="plus" size={14} color="#4F46E5" />
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
                                color="#94A3B8"
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
                                      <Lucide name="check" size={14} color="#4F46E5" />
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
                          <Lucide name="trash-2" size={14} color="#EF4444" />
                        </Pressable>
                      </View>
                    );
                  })}
                  </View>
                </View>
              </>
            )}

            {(type === 'add-note' || type === 'edit-note') && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>SERVICE / APPLICATION TITLE</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Amateur Radio Operator Certificate (NEW)"
                    placeholderTextColor={COLORS.neutral[400]}
                    value={titleInput}
                    onChangeText={setTitleInput}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>INSTRUCTION REMARKS / GUIDANCE TEXT</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Enter detailed guidance remarks shown to clients..."
                    placeholderTextColor={COLORS.neutral[400]}
                    multiline
                    numberOfLines={4}
                    value={instructionsInput}
                    onChangeText={setInstructionsInput}
                  />
                </View>
              </>
            )}

            {type === 'add-form' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>SERVICE / APPLICATION TITLE</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Amateur Application Form v2.1"
                  placeholderTextColor={COLORS.neutral[400]}
                  value={titleInput}
                  onChangeText={setTitleInput}
                />
              </View>
            )}
          </ScrollView>

          {/* Footer Buttons (Exact Match to Screenshots) */}
          <View style={styles.modalFooter}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>
                {(isRequirementModal || isFeeModal) ? 'Save Configuration' : 'Save Changes'}
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
    backgroundColor: COLORS.neutral.white,
    borderRadius: 20,
    padding: SPACING[24],
    overflow: 'visible',
    zIndex: 1000,
  },
  modalCardWide: {
    maxWidth: 580,
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
    color: '#6366F1',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: '#64748B',
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
  inputGroup: {
    gap: 6,
    position: 'relative',
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: SPACING[16],
    height: 48,
    color: '#0F172A',
  },
  textArea: {
    height: 100,
    paddingTop: SPACING[12],
    textAlignVertical: 'top',
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
    color: '#0F172A',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: SPACING[16],
    height: 48,
  },
  dropdownTriggerText: {
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#0F172A',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 74,
    left: 0,
    right: 0,
    backgroundColor: COLORS.neutral.white,
    borderColor: '#E2E8F0',
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
    borderBottomColor: '#F1F5F9',
  },
  dropdownOptionActive: {
    backgroundColor: '#F8FAFC',
  },
  dropdownOptionText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '600',
    color: '#0F172A',
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
    color: '#4F46E5',
  },
  docListContainer: {
    gap: 10,
  },
  docRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  feeRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
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
    color: '#94A3B8',
  },
  docNameInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#0F172A',
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
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
  },
  feeTypeTriggerText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#0F172A',
  },
  feeDropdownMenu: {
    position: 'absolute',
    top: 42,
    left: 0,
    right: 0,
    backgroundColor: COLORS.neutral.white,
    borderColor: '#E2E8F0',
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
    borderColor: '#E2E8F0',
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
    color: '#94A3B8',
    marginRight: 4,
  },
  feeAmountInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#0F172A',
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
    backgroundColor: '#EF4444',
  },
  pillOptionalActive: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    borderWidth: 1,
  },
  pillInactive: {
    backgroundColor: '#F1F5F9',
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
    color: '#334155',
  },
  pillTextInactive: {
    color: '#94A3B8',
  },
  docDeleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#FCA5A5',
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
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: '#334155',
    fontWeight: '700',
  },
  saveBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral.white,
    fontWeight: '700',
  },
});
