// Premium 3-Level Service & Prerequisites Configuration Studio
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide, SkeletonLoader } from '@edge/ui';
import {
  useAdminServices,
  useAdminNotes,
  useAdminRequirements,
  useAdminFees,
} from '@edge/api';

export interface ServiceVariant {
  id: string;
  name: string;
  code: string;
  isEnabled: boolean;
}

export interface FeeItem {
  id: string;
  name: string;
  amount: number;
  feeType: string;
}

export interface ServiceElement {
  id: string;
  name: string;
  code: string;
  description: string;
  fees: FeeItem[];
}

export interface ServiceCatalogItem {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  isActive: boolean;
  variants: ServiceVariant[];
}

const DEFAULT_SERVICES: ServiceCatalogItem[] = [
  {
    id: 'srv-1',
    name: 'Radio Station License',
    code: 'RSL-001',
    category: 'Broadcasting & Mobile Services',
    description: 'Authorization and licensing for commercial, amateur, and private radio stations.',
    isActive: true,
    variants: [
      { id: 'v-new', name: 'New Application', code: 'NEW', isEnabled: true },
      { id: 'v-renew', name: 'Renewal Application', code: 'RENEW', isEnabled: true },
      { id: 'v-modify', name: 'Modification', code: 'MODIFY', isEnabled: true },
      { id: 'v-dup', name: 'Duplicate License', code: 'DUP', isEnabled: false },
    ],
  },
  {
    id: 'srv-2',
    name: 'Permit to Purchase / Import',
    code: 'PPI-002',
    category: 'Equipment Importation',
    description: 'Permit for purchasing, importing, or selling radio communications equipment.',
    isActive: true,
    variants: [
      { id: 'v-new', name: 'New Application', code: 'NEW', isEnabled: true },
      { id: 'v-renew', name: 'Renewal Application', code: 'RENEW', isEnabled: false },
      { id: 'v-modify', name: 'Modification', code: 'MODIFY', isEnabled: true },
    ],
  },
  {
    id: 'srv-3',
    name: 'Dealer Certificate of Registration',
    code: 'DCR-003',
    category: 'Dealers & Suppliers',
    description: 'Registration and certification for radio equipment dealers and service centers.',
    isActive: false,
    variants: [
      { id: 'v-new', name: 'New Application', code: 'NEW', isEnabled: true },
      { id: 'v-renew', name: 'Renewal Application', code: 'RENEW', isEnabled: true },
    ],
  },
  {
    id: 'srv-4',
    name: 'Value Added Service (VAS) Provider License',
    code: 'VAS-004',
    category: 'Telecommunications',
    description: 'License for offering value-added telecommunications services to the public.',
    isActive: true,
    variants: [
      { id: 'v-new', name: 'New Application', code: 'NEW', isEnabled: true },
      { id: 'v-renew', name: 'Renewal Application', code: 'RENEW', isEnabled: true },
      { id: 'v-modify', name: 'Modification', code: 'MODIFY', isEnabled: true },
    ],
  },
];

const DEFAULT_ELEMENTS: Record<string, ServiceElement[]> = {
  'srv-1_v-new': [
    {
      id: 'el-1',
      name: 'Transmitter & Antenna Base Unit',
      code: 'ELEM-TX',
      description: 'Physical RF transmitter and tower antenna infrastructure.',
      fees: [
        { id: 'f-1', name: 'Filing Fee', amount: 500.0, feeType: 'Fixed' },
        { id: 'f-2', name: 'Inspection & Engineering Fee', amount: 1500.0, feeType: 'Fixed' },
        { id: 'f-3', name: 'License Rights Fee', amount: 3000.0, feeType: 'Annual' },
      ],
    },
    {
      id: 'el-2',
      name: 'Frequency Channel Spectrum Assignment',
      code: 'ELEM-FREQ',
      description: 'Allocated frequency spectrum channel bandwidth.',
      fees: [
        { id: 'f-4', name: 'Spectrum Allocation Fee', amount: 2500.0, feeType: 'Per MHz' },
        { id: 'f-5', name: 'Supervisory Fee', amount: 800.0, feeType: 'Annual' },
      ],
    },
  ],
  'srv-1_v-renew': [
    {
      id: 'el-3',
      name: 'Renewal Station Audit & License Rights',
      code: 'ELEM-REN',
      description: 'Regular renewal audit and continued license rights.',
      fees: [
        { id: 'f-6', name: 'Renewal Filing Fee', amount: 400.0, feeType: 'Fixed' },
        { id: 'f-7', name: 'Annual License Renewal Fee', amount: 2800.0, feeType: 'Annual' },
      ],
    },
  ],
};

const DEFAULT_NOTES_MAP: Record<string, string[]> = {
  'srv-1_v-new': [
    'Applicants must submit notarized engineering plans signed by a registered PECE.',
    'Proof of land ownership or lease agreement for tower installation site is mandatory.',
  ],
  'srv-1_v-renew': [
    'Submit official receipt of previous year license payment together with filing form.',
  ],
};

const DEFAULT_REQUIREMENTS_MAP: Record<string, { id: string; name: string; isRequired: boolean }[]> = {
  'srv-1_v-new': [
    { id: 'req-1', name: 'SEC / DTI Registration Certificate', isRequired: true },
    { id: 'req-2', name: 'Notarized Application Form (NTC Form 101)', isRequired: true },
    { id: 'req-3', name: 'PECE Signed Engineering Plans & Diagrams', isRequired: true },
    { id: 'req-4', name: 'Environmental Compliance Certificate (ECC)', isRequired: false },
  ],
  'srv-1_v-renew': [
    { id: 'req-5', name: 'Original Copy of Previous License', isRequired: true },
    { id: 'req-6', name: 'Proof of Payment (Official Receipt)', isRequired: true },
  ],
};

export function ServiceTreeConfigTab() {
  // Live Backend SWR API Hooks
  const { services: apiServices, isLoading: isServicesLoading } = useAdminServices();
  const { notes: apiNotes } = useAdminNotes();
  const { requirements: apiRequirements } = useAdminRequirements();
  const { fees: apiFees } = useAdminFees();

  // Level 1: Services Catalog State
  const [services, setServices] = useState<ServiceCatalogItem[]>(DEFAULT_SERVICES);

  // Active Drilling Navigation State
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('v-new');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [variantWorkspaceTab, setVariantWorkspaceTab] = useState<'notes' | 'requirements' | 'elements'>('requirements');

  // Dynamic Data Store States
  const [elementsMap, setElementsMap] = useState<Record<string, ServiceElement[]>>(DEFAULT_ELEMENTS);
  const [notesMap, setNotesMap] = useState<Record<string, string[]>>(DEFAULT_NOTES_MAP);
  const [requirementsMap, setRequirementsMap] = useState<Record<string, { id: string; name: string; isRequired: boolean }[]>>(DEFAULT_REQUIREMENTS_MAP);

  // Modal Dialog Form States
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantCode, setNewVariantCode] = useState('');

  const [isAddingElement, setIsAddingElement] = useState(false);
  const [newElementName, setNewElementName] = useState('');
  const [newElementDesc, setNewElementDesc] = useState('');

  const [isAddingFee, setIsAddingFee] = useState(false);
  const [newFeeName, setNewFeeName] = useState('');
  const [newFeeAmount, setNewFeeAmount] = useState('');

  const [isAddingReq, setIsAddingReq] = useState(false);
  const [newReqName, setNewReqName] = useState('');
  const [newReqMandatory, setNewReqMandatory] = useState(true);

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  // Sync API Services
  useEffect(() => {
    if (apiServices && apiServices.length > 0) {
      const mappedServices: ServiceCatalogItem[] = apiServices.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code || `SRV-${s.id.slice(-4)}`,
        category: s.serviceCategoryType || s.serviceCategoryCode || 'General Service',
        description: s.description || 'System service configured by system administrator.',
        isActive: true,
        variants: [
          { id: 'v-new', name: 'New Application', code: 'NEW', isEnabled: true },
          { id: 'v-renew', name: 'Renewal Application', code: 'RENEW', isEnabled: true },
          { id: 'v-modify', name: 'Modification', code: 'MODIFY', isEnabled: true },
        ],
      }));
      setServices(mappedServices);
    }
  }, [apiServices]);

  // Derived Active Contexts
  const activeService = services.find((s) => s.id === selectedServiceId) || null;
  const activeVariant = activeService?.variants.find((v) => v.id === selectedVariantId) || activeService?.variants[0] || null;
  const variantContextKey = selectedServiceId && activeVariant ? `${selectedServiceId}_${activeVariant.id}` : '';
  const currentElements = variantContextKey ? elementsMap[variantContextKey] || [] : [];
  const activeElement = currentElements.find((e) => e.id === selectedElementId) || null;

  // Handlers
  const handleAddVariant = (serviceId: string) => {
    if (!newVariantName.trim()) return;
    const newVariant: ServiceVariant = {
      id: `var-${Date.now()}`,
      name: newVariantName.trim(),
      code: newVariantCode.trim() || `VAR-${Date.now().toString().slice(-4)}`,
      isEnabled: true,
    };

    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId ? { ...s, variants: [...s.variants, newVariant] } : s
      )
    );
    setSelectedVariantId(newVariant.id);
    setNewVariantName('');
    setNewVariantCode('');
    setIsAddingVariant(false);
  };

  const handleDeleteVariant = (serviceId: string, variantId: string) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === serviceId) {
          const updatedVariants = s.variants.filter((v) => v.id !== variantId);
          if (selectedVariantId === variantId && updatedVariants.length > 0) {
            setSelectedVariantId(updatedVariants[0].id);
          }
          return { ...s, variants: updatedVariants };
        }
        return s;
      })
    );
  };

  const handleToggleServiceActive = (serviceId: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleToggleVariantEnabled = (serviceId: string, variantId: string) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === serviceId) {
          return {
            ...s,
            variants: s.variants.map((v) =>
              v.id === variantId ? { ...v, isEnabled: !v.isEnabled } : v
            ),
          };
        }
        return s;
      })
    );
  };

  const handleAddNote = () => {
    if (!newNoteText.trim() || !variantContextKey) return;
    setNotesMap((prev) => ({
      ...prev,
      [variantContextKey]: [...(prev[variantContextKey] || []), newNoteText.trim()],
    }));
    setNewNoteText('');
    setIsAddingNote(false);
  };

  const handleDeleteNote = (idx: number) => {
    if (!variantContextKey) return;
    setNotesMap((prev) => ({
      ...prev,
      [variantContextKey]: (prev[variantContextKey] || []).filter((_, i) => i !== idx),
    }));
  };

  const handleAddRequirement = () => {
    if (!newReqName.trim() || !variantContextKey) return;
    const newItem = {
      id: `req-${Date.now()}`,
      name: newReqName.trim(),
      isRequired: newReqMandatory,
    };
    setRequirementsMap((prev) => ({
      ...prev,
      [variantContextKey]: [...(prev[variantContextKey] || []), newItem],
    }));
    setNewReqName('');
    setIsAddingReq(false);
  };

  const handleDeleteRequirement = (reqId: string) => {
    if (!variantContextKey) return;
    setRequirementsMap((prev) => ({
      ...prev,
      [variantContextKey]: (prev[variantContextKey] || []).filter((r) => r.id !== reqId),
    }));
  };

  const handleAddElement = () => {
    if (!newElementName.trim() || !variantContextKey) return;
    const newEl: ServiceElement = {
      id: `el-${Date.now()}`,
      name: newElementName.trim(),
      code: `ELEM-${Date.now().toString().slice(-4)}`,
      description: newElementDesc.trim() || 'Configured element under selected service variant.',
      fees: [],
    };
    setElementsMap((prev) => ({
      ...prev,
      [variantContextKey]: [...(prev[variantContextKey] || []), newEl],
    }));
    setNewElementName('');
    setNewElementDesc('');
    setIsAddingElement(false);
  };

  const handleAddFeeItem = () => {
    if (!newFeeName.trim() || !newFeeAmount || !variantContextKey || !selectedElementId) return;
    const amountNum = parseFloat(newFeeAmount) || 0;
    const newFee: FeeItem = {
      id: `fee-${Date.now()}`,
      name: newFeeName.trim(),
      amount: amountNum,
      feeType: 'Standard Fee',
    };

    setElementsMap((prev) => ({
      ...prev,
      [variantContextKey]: (prev[variantContextKey] || []).map((el) =>
        el.id === selectedElementId ? { ...el, fees: [...el.fees, newFee] } : el
      ),
    }));
    setNewFeeName('');
    setNewFeeAmount('');
    setIsAddingFee(false);
  };

  const handleDeleteFeeItem = (feeId: string) => {
    if (!variantContextKey || !selectedElementId) return;
    setElementsMap((prev) => ({
      ...prev,
      [variantContextKey]: (prev[variantContextKey] || []).map((el) =>
        el.id === selectedElementId
          ? { ...el, fees: el.fees.filter((f) => f.id !== feeId) }
          : el
      ),
    }));
  };

  // =======================================================
  // LEVEL 3: ELEMENT FEES STUDIO (SERVICE + VARIANT + ELEMENT)
  // =======================================================
  if (selectedServiceId && activeService && activeVariant && selectedElementId && activeElement) {
    const totalFees = activeElement.fees.reduce((acc, f) => acc + f.amount, 0);

    return (
      <View style={styles.container}>
        {/* Breadcrumb Navigation Header */}
        <View style={styles.breadcrumbBar}>
          <Pressable style={styles.backBtn} onPress={() => setSelectedElementId(null)}>
            <Lucide name="arrow-left" size={16} color={COLORS.brand[700]} />
            <Text style={styles.backBtnText}>Back to Variant Studio ({activeVariant.name})</Text>
          </Pressable>
          <Text style={styles.breadcrumbDivider}>/</Text>
          <Text style={styles.breadcrumbCurrent}>Element: {activeElement.name}</Text>
        </View>

        {/* Element Header Banner */}
        <View style={styles.elementBanner}>
          <View style={styles.elementBannerMain}>
            <View style={styles.elementIconBox}>
              <Lucide name="box" size={24} color={COLORS.neutral.white} />
            </View>

            <View style={styles.elementBannerContent}>
              <Text style={styles.elementBannerTag}>Level 3: Element Fees & Payments Configuration</Text>
              <Text style={styles.elementBannerTitle}>{activeElement.name}</Text>
              <Text style={styles.elementBannerSub}>
                Service: {activeService.name} · Variant: {activeVariant.name} · Code: {activeElement.code}
              </Text>
            </View>

            <View style={styles.totalFeeCard}>
              <Text style={styles.totalFeeLabel}>Total Element Fee</Text>
              <Text style={styles.totalFeeAmount}>
                ₱{totalFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>

        {/* Fees & Payments Table Section */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderTitleRow}>
              <Lucide name="dollar-sign" size={18} color={COLORS.brand[600]} />
              <Text style={styles.cardTitle}>Fees & Payments Items (1-to-Many)</Text>
            </View>
            <Pressable style={styles.addSmallBtn} onPress={() => setIsAddingFee(true)}>
              <Lucide name="plus" size={14} color={COLORS.brand[700]} />
              <Text style={styles.addSmallBtnText}>Add Fee Item</Text>
            </Pressable>
          </View>

          {activeElement.fees.length === 0 ? (
            <View style={styles.emptyState}>
              <Lucide name="dollar-sign" size={24} color={COLORS.neutral[300]} />
              <Text style={styles.emptyText}>No fee breakdown items configured for this element yet.</Text>
            </View>
          ) : (
            <View style={styles.feeItemsTable}>
              {activeElement.fees.map((fee, idx) => (
                <View key={fee.id} style={styles.feeTableRow}>
                  <View style={styles.feeRowInfo}>
                    <View style={styles.feeIndexBadge}>
                      <Text style={styles.feeIndexText}>{idx + 1}</Text>
                    </View>
                    <View>
                      <Text style={styles.feeNameText}>{fee.name}</Text>
                      <Text style={styles.feeTypeText}>{fee.feeType}</Text>
                    </View>
                  </View>

                  <View style={styles.feeRowActions}>
                    <Text style={styles.feeAmountText}>
                      ₱{fee.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                    <Pressable
                      style={styles.deleteIconBtn}
                      onPress={() => handleDeleteFeeItem(fee.id)}
                    >
                      <Lucide name="trash-2" size={14} color={COLORS.semantic.error} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* MODAL DIALOG: ATTACH FEE ITEM */}
        <Modal
          visible={isAddingFee}
          transparent
          animationType="fade"
          onRequestClose={() => setIsAddingFee(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Attach Fee Item</Text>
                <Pressable onPress={() => setIsAddingFee(false)}>
                  <Lucide name="x" size={20} color={COLORS.neutral[500]} />
                </Pressable>
              </View>
              <Text style={styles.modalSubtext}>
                Add a new fee or payment item under "{activeElement.name}".
              </Text>

              <View style={styles.modalForm}>
                <Text style={styles.modalLabel}>Fee Item Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Filing Fee, Inspection Fee, License Rights..."
                  value={newFeeName}
                  onChangeText={setNewFeeName}
                />

                <Text style={styles.modalLabel}>Amount (₱) *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 1500.00"
                  keyboardType="numeric"
                  value={newFeeAmount}
                  onChangeText={setNewFeeAmount}
                />
              </View>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setIsAddingFee(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalSubmitBtn} onPress={handleAddFeeItem}>
                  <Text style={styles.modalSubmitBtnText}>Attach Fee Item</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // =======================================================
  // LEVEL 2: SERVICE + VARIANTS STUDIO (SERVICE + VARIANT)
  // =======================================================
  if (selectedServiceId && activeService) {
    const activeNotes = variantContextKey ? notesMap[variantContextKey] || [] : [];
    const activeRequirements = variantContextKey ? requirementsMap[variantContextKey] || [] : [];

    return (
      <View style={styles.container}>
        {/* Breadcrumb Header */}
        <View style={styles.breadcrumbBar}>
          <Pressable style={styles.backBtn} onPress={() => setSelectedServiceId(null)}>
            <Lucide name="arrow-left" size={16} color={COLORS.brand[700]} />
            <Text style={styles.backBtnText}>Back to Services Catalog</Text>
          </Pressable>
          <Text style={styles.breadcrumbDivider}>/</Text>
          <Text style={styles.breadcrumbCurrent}>{activeService.name}</Text>
        </View>

        {/* Service Details Banner */}
        <View style={styles.serviceBanner}>
          <View style={styles.serviceBannerMain}>
            <View style={styles.bannerIconBox}>
              <Lucide name="layers" size={24} color={COLORS.neutral.white} />
            </View>
            <View style={styles.bannerTitleBox}>
              <Text style={styles.bannerCategory}>Level 2: Service & Variant Configurations</Text>
              <Text style={styles.bannerTitle}>{activeService.name}</Text>
              <Text style={styles.bannerSubtext}>Code: {activeService.code} · Regional Activation: Active</Text>
            </View>
          </View>
        </View>

        {/* VARIANTS SELECTOR TABS STRIP */}
        <View style={styles.variantsCard}>
          <View style={styles.cardHeaderNoBorder}>
            <View style={styles.variantsHeader}>
              <Text style={styles.variantsTitle}>Service Variants Studio</Text>
              <Text style={styles.variantsSubtitle}>
                Create custom transaction variants (e.g. New Application, Renewal, Modification) for {activeService.name}. Each variant has its own guidance notes, document requirements, and element fee structures.
              </Text>
            </View>
            <Pressable style={styles.addSmallBtn} onPress={() => setIsAddingVariant(true)}>
              <Lucide name="plus" size={14} color={COLORS.brand[700]} />
              <Text style={styles.addSmallBtnText}>Create Variant</Text>
            </Pressable>
          </View>

          {activeService.variants.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No variants created for this service yet. Click "Create Variant" above to add one.</Text>
            </View>
          ) : (
            <View style={styles.variantList}>
              {activeService.variants.map((variant) => {
                const isSelected = selectedVariantId === variant.id;
                return (
                  <View
                    key={variant.id}
                    style={[
                      styles.variantPill,
                      isSelected ? styles.variantPillSelected : styles.variantPillUnselected,
                    ]}
                  >
                    <Pressable
                      style={styles.variantSelectClick}
                      onPress={() => setSelectedVariantId(variant.id)}
                    >
                      <Lucide
                        name={isSelected ? 'check-circle' : 'circle'}
                        size={16}
                        color={isSelected ? COLORS.brand[600] : COLORS.neutral[400]}
                      />
                      <Text
                        style={[
                          styles.variantPillText,
                          isSelected ? styles.variantPillTextSelected : styles.variantPillTextUnselected,
                        ]}
                      >
                        {variant.name}
                      </Text>
                    </Pressable>

                    <View style={styles.variantToggleBox}>
                      <Text style={styles.variantToggleLabel}>
                        {variant.isEnabled ? 'Enabled' : 'Disabled'}
                      </Text>
                      <Switch
                        value={variant.isEnabled}
                        onValueChange={() => handleToggleVariantEnabled(activeService.id, variant.id)}
                        trackColor={{ false: COLORS.neutral[200], true: COLORS.brand[500] }}
                        thumbColor={variant.isEnabled ? COLORS.brand[600] : COLORS.neutral[400]}
                      />
                      {activeService.variants.length > 1 && (
                        <Pressable
                          style={styles.deleteIconBtn}
                          onPress={() => handleDeleteVariant(activeService.id, variant.id)}
                        >
                          <Lucide name="trash-2" size={13} color={COLORS.semantic.error} />
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* SUB-NAVIGATION TABS FOR SELECTED VARIANT WORKSPACE */}
        <View style={styles.workspaceTabBar}>
          <Pressable
            style={[
              styles.workspaceTabItem,
              variantWorkspaceTab === 'requirements' && styles.workspaceTabActive,
            ]}
            onPress={() => setVariantWorkspaceTab('requirements')}
          >
            <Lucide
              name="check-square"
              size={16}
              color={variantWorkspaceTab === 'requirements' ? COLORS.brand[700] : COLORS.neutral[500]}
            />
            <Text
              style={[
                styles.workspaceTabText,
                variantWorkspaceTab === 'requirements' && styles.workspaceTabTextActive,
              ]}
            >
              Application Requirements ({activeRequirements.length})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.workspaceTabItem,
              variantWorkspaceTab === 'notes' && styles.workspaceTabActive,
            ]}
            onPress={() => setVariantWorkspaceTab('notes')}
          >
            <Lucide
              name="file-text"
              size={16}
              color={variantWorkspaceTab === 'notes' ? COLORS.brand[700] : COLORS.neutral[500]}
            />
            <Text
              style={[
                styles.workspaceTabText,
                variantWorkspaceTab === 'notes' && styles.workspaceTabTextActive,
              ]}
            >
              Guidance Notes ({activeNotes.length})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.workspaceTabItem,
              variantWorkspaceTab === 'elements' && styles.workspaceTabActive,
            ]}
            onPress={() => setVariantWorkspaceTab('elements')}
          >
            <Lucide
              name="box"
              size={16}
              color={variantWorkspaceTab === 'elements' ? COLORS.brand[700] : COLORS.neutral[500]}
            />
            <Text
              style={[
                styles.workspaceTabText,
                variantWorkspaceTab === 'elements' && styles.workspaceTabTextActive,
              ]}
            >
              Service Elements & Fees ({currentElements.length})
            </Text>
          </Pressable>
        </View>

        {/* WORKSPACE TAB 1: APPLICATION REQUIREMENTS (1-TO-MANY) */}
        {variantWorkspaceTab === 'requirements' && (
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderTitleRow}>
                <Lucide name="check-square" size={18} color={COLORS.brand[600]} />
                <Text style={styles.cardTitle}>
                  Application Requirements for {activeService.name} ({activeVariant?.name})
                </Text>
              </View>
              <Pressable style={styles.addSmallBtn} onPress={() => setIsAddingReq(true)}>
                <Lucide name="plus" size={14} color={COLORS.brand[700]} />
                <Text style={styles.addSmallBtnText}>Attach Requirement</Text>
              </Pressable>
            </View>

            {activeRequirements.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No document requirements attached for this variant.</Text>
              </View>
            ) : (
              <View style={styles.reqsList}>
                {activeRequirements.map((req) => (
                  <View key={req.id} style={styles.reqCard}>
                    <View style={styles.reqInfo}>
                      <Lucide name="file" size={16} color={COLORS.brand[600]} />
                      <Text style={styles.reqName}>{req.name}</Text>
                    </View>

                    <View style={styles.reqActions}>
                      <View
                        style={[
                          styles.reqBadge,
                          req.isRequired ? styles.reqBadgeMandatory : styles.reqBadgeOptional,
                        ]}
                      >
                        <Text
                          style={[
                            styles.reqBadgeText,
                            req.isRequired ? styles.reqBadgeTextMandatory : styles.reqBadgeTextOptional,
                          ]}
                        >
                          {req.isRequired ? 'Mandatory' : 'Optional'}
                        </Text>
                      </View>
                      <Pressable
                        style={styles.deleteIconBtn}
                        onPress={() => handleDeleteRequirement(req.id)}
                      >
                        <Lucide name="trash-2" size={14} color={COLORS.semantic.error} />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* WORKSPACE TAB 2: GUIDANCE NOTES */}
        {variantWorkspaceTab === 'notes' && (
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderTitleRow}>
                <Lucide name="file-text" size={18} color={COLORS.brand[600]} />
                <Text style={styles.cardTitle}>
                  Guidance Notes for {activeService.name} ({activeVariant?.name})
                </Text>
              </View>
              <Pressable style={styles.addSmallBtn} onPress={() => setIsAddingNote(true)}>
                <Lucide name="plus" size={14} color={COLORS.brand[700]} />
                <Text style={styles.addSmallBtnText}>Add Note</Text>
              </Pressable>
            </View>

            {activeNotes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No guidance notes configured for this variant.</Text>
              </View>
            ) : (
              <View style={styles.notesList}>
                {activeNotes.map((noteText, idx) => (
                  <View key={idx} style={styles.noteCard}>
                    <View style={styles.noteNumberBox}>
                      <Text style={styles.noteNumber}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.noteContentText}>{noteText}</Text>
                    <Pressable style={styles.deleteIconBtn} onPress={() => handleDeleteNote(idx)}>
                      <Lucide name="trash-2" size={14} color={COLORS.semantic.error} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* WORKSPACE TAB 3: SERVICE ELEMENTS LIST */}
        {variantWorkspaceTab === 'elements' && (
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderTitleRow}>
                <Lucide name="box" size={18} color={COLORS.brand[600]} />
                <Text style={styles.cardTitle}>
                  Service Elements under {activeVariant?.name}
                </Text>
              </View>
              <Pressable style={styles.addSmallBtn} onPress={() => setIsAddingElement(true)}>
                <Lucide name="plus" size={14} color={COLORS.brand[700]} />
                <Text style={styles.addSmallBtnText}>Add Element</Text>
              </Pressable>
            </View>

            {currentElements.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No elements configured under this service variant.</Text>
              </View>
            ) : (
              <View style={styles.elementsList}>
                {currentElements.map((element) => {
                  const elementTotalFees = element.fees.reduce((acc, f) => acc + f.amount, 0);
                  return (
                    <View key={element.id} style={styles.elementCardItem}>
                      <View style={styles.elementMainInfo}>
                        <View style={styles.elementIconSmallBox}>
                          <Lucide name="box" size={18} color={COLORS.brand[600]} />
                        </View>
                        <View style={styles.elementTextGroup}>
                          <View style={styles.elementTitleRow}>
                            <Text style={styles.elementNameText}>{element.name}</Text>
                            <Text style={styles.elementCodeBadge}>{element.code}</Text>
                          </View>
                          <Text style={styles.elementDescText}>{element.description}</Text>
                        </View>
                      </View>

                      <View style={styles.elementRightControl}>
                        <View style={styles.elementStatColumn}>
                          <Text style={styles.elementFeeCountText}>{element.fees.length} Fee Items</Text>
                          <Text style={styles.elementTotalFeeText}>
                            ₱{elementTotalFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </Text>
                        </View>

                        <Pressable
                          style={styles.drillFeeBtn}
                          onPress={() => setSelectedElementId(element.id)}
                        >
                          <Text style={styles.drillFeeBtnText}>Configure Fees & Payments</Text>
                          <Lucide name="chevron-right" size={14} color={COLORS.brand[700]} />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* MODAL DIALOG: CREATE VARIANT */}
        <Modal
          visible={isAddingVariant}
          transparent
          animationType="fade"
          onRequestClose={() => setIsAddingVariant(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Service Variant</Text>
                <Pressable onPress={() => setIsAddingVariant(false)}>
                  <Lucide name="x" size={20} color={COLORS.neutral[500]} />
                </Pressable>
              </View>
              <Text style={styles.modalSubtext}>
                Define a new transaction variant under {activeService.name}.
              </Text>

              <View style={styles.modalForm}>
                <Text style={styles.modalLabel}>Variant Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. New Commercial Application, Permit Renewal..."
                  value={newVariantName}
                  onChangeText={setNewVariantName}
                />

                <Text style={styles.modalLabel}>Variant Code</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. NEW, RENEW, MOD..."
                  value={newVariantCode}
                  onChangeText={setNewVariantCode}
                />
              </View>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setIsAddingVariant(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={styles.modalSubmitBtn}
                  onPress={() => handleAddVariant(activeService.id)}
                >
                  <Text style={styles.modalSubmitBtnText}>Create Variant</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL DIALOG: CREATE ELEMENT */}
        <Modal
          visible={isAddingElement}
          transparent
          animationType="fade"
          onRequestClose={() => setIsAddingElement(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Service Element</Text>
                <Pressable onPress={() => setIsAddingElement(false)}>
                  <Lucide name="x" size={20} color={COLORS.neutral[500]} />
                </Pressable>
              </View>
              <Text style={styles.modalSubtext}>
                Add a new component element under "{activeVariant?.name}".
              </Text>

              <View style={styles.modalForm}>
                <Text style={styles.modalLabel}>Element Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Transmitter Unit, Spectrum Channel..."
                  value={newElementName}
                  onChangeText={setNewElementName}
                />

                <Text style={styles.modalLabel}>Description</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Element details..."
                  value={newElementDesc}
                  onChangeText={setNewElementDesc}
                />
              </View>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setIsAddingElement(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalSubmitBtn} onPress={handleAddElement}>
                  <Text style={styles.modalSubmitBtnText}>Save Service Element</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL DIALOG: ATTACH REQUIREMENT */}
        <Modal
          visible={isAddingReq}
          transparent
          animationType="fade"
          onRequestClose={() => setIsAddingReq(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Attach Application Requirement</Text>
                <Pressable onPress={() => setIsAddingReq(false)}>
                  <Lucide name="x" size={20} color={COLORS.neutral[500]} />
                </Pressable>
              </View>
              <Text style={styles.modalSubtext}>
                Attach a document requirement to "{activeVariant?.name}".
              </Text>

              <View style={styles.modalForm}>
                <Text style={styles.modalLabel}>Document Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. SEC Registration, PECE Engineering Diagram..."
                  value={newReqName}
                  onChangeText={setNewReqName}
                />

                <View style={styles.toggleRow}>
                  <Text style={styles.modalLabel}>Mandatory Requirement:</Text>
                  <Switch
                    value={newReqMandatory}
                    onValueChange={setNewReqMandatory}
                    trackColor={{ false: COLORS.neutral[200], true: COLORS.brand[500] }}
                    thumbColor={newReqMandatory ? COLORS.brand[600] : COLORS.neutral[400]}
                  />
                </View>
              </View>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setIsAddingReq(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalSubmitBtn} onPress={handleAddRequirement}>
                  <Text style={styles.modalSubmitBtnText}>Attach Requirement</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL DIALOG: ADD GUIDANCE NOTE */}
        <Modal
          visible={isAddingNote}
          transparent
          animationType="fade"
          onRequestClose={() => setIsAddingNote(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Guidance Note</Text>
                <Pressable onPress={() => setIsAddingNote(false)}>
                  <Lucide name="x" size={20} color={COLORS.neutral[500]} />
                </Pressable>
              </View>
              <Text style={styles.modalSubtext}>
                Add compliance instruction notes for "{activeVariant?.name}".
              </Text>

              <View style={styles.modalForm}>
                <Text style={styles.modalLabel}>Instructions / Notes *</Text>
                <TextInput
                  style={[styles.modalInput, { height: 80 }]}
                  placeholder="Enter detailed compliance guidance notes..."
                  value={newNoteText}
                  onChangeText={setNewNoteText}
                  multiline
                />
              </View>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setIsAddingNote(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalSubmitBtn} onPress={handleAddNote}>
                  <Text style={styles.modalSubmitBtnText}>Save Guidance Note</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // =======================================================
  // LEVEL 1: SERVICES CATALOG GRID VIEW
  // =======================================================
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Level 1: System Services Catalog</Text>
        <Text style={styles.sectionSubtitle}>
          List of all available services configured by the System Administrator. Toggle service activation for your region and drill down into activated services to configure their variants, guidance notes, requirements, and element fees.
        </Text>
      </View>

      {isServicesLoading && services.length === 0 ? (
        <View style={styles.servicesGrid}>
          <SkeletonLoader height={140} borderRadius={RADIUS.card} />
          <SkeletonLoader height={140} borderRadius={RADIUS.card} />
        </View>
      ) : (
        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <View
              key={service.id}
              style={[
                styles.serviceCard,
                service.isActive ? styles.serviceCardActive : styles.serviceCardInactive,
              ]}
            >
              <View style={styles.serviceCardHeader}>
                <View style={styles.serviceIconBox}>
                  <Lucide
                    name="layers"
                    size={20}
                    color={service.isActive ? COLORS.brand[600] : COLORS.neutral[400]}
                  />
                </View>

                <View style={styles.activationBox}>
                  <View
                    style={[
                      styles.badge,
                      service.isActive ? styles.badgeActive : styles.badgeInactive,
                    ]}
                  >
                    <View
                      style={[
                        styles.badgeDot,
                        service.isActive ? styles.badgeDotActive : styles.badgeDotInactive,
                      ]}
                    />
                    <Text
                      style={[
                        styles.badgeText,
                        service.isActive ? styles.badgeTextActive : styles.badgeTextInactive,
                      ]}
                    >
                      {service.isActive ? 'Activated' : 'Inactive'}
                    </Text>
                  </View>

                  <Switch
                    value={service.isActive}
                    onValueChange={() => handleToggleServiceActive(service.id)}
                    trackColor={{ false: COLORS.neutral[200], true: COLORS.brand[500] }}
                    thumbColor={service.isActive ? COLORS.brand[600] : COLORS.neutral[400]}
                  />
                </View>
              </View>

              <View style={styles.serviceCardBody}>
                <Text style={styles.serviceCategoryText}>{service.category}</Text>
                <Text style={styles.serviceTitle}>{service.name}</Text>
                <Text style={styles.serviceCode}>Code: {service.code}</Text>
                <Text style={styles.serviceDescription} numberOfLines={2}>
                  {service.description}
                </Text>
              </View>

              <View style={styles.serviceCardFooter}>
                <Pressable
                  disabled={!service.isActive}
                  style={({ pressed }: { pressed: boolean }) => [
                    styles.configureBtn,
                    service.isActive ? styles.configureBtnActive : styles.configureBtnDisabled,
                    pressed && service.isActive && styles.configureBtnPressed,
                  ]}
                  onPress={() => setSelectedServiceId(service.id)}
                >
                  <Lucide
                    name="settings"
                    size={14}
                    color={service.isActive ? COLORS.brand[700] : COLORS.neutral[400]}
                  />
                  <Text
                    style={[
                      styles.configureBtnText,
                      service.isActive ? styles.configureBtnTextActive : styles.configureBtnTextDisabled,
                    ]}
                  >
                    Drill into Variants & Configurations
                  </Text>
                  <Lucide
                    name="chevron-right"
                    size={14}
                    color={service.isActive ? COLORS.brand[700] : COLORS.neutral[400]}
                  />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING[20],
  },
  loadingContainer: {
    padding: SPACING[40],
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[12],
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.neutral[500],
  },
  sectionHeader: {
    gap: 4,
    marginBottom: SPACING[8],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.neutral[500],
    lineHeight: 18,
  },

  // LEVEL 1: SERVICES CATALOG GRID
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[16],
  },
  serviceCard: {
    width: '48%',
    minWidth: 320,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING[20],
    gap: SPACING[12],
    ...SHADOWS.card,
  },
  serviceCardActive: {
    borderColor: COLORS.brand[500],
  },
  serviceCardInactive: {
    borderColor: COLORS.neutral[200],
    opacity: 0.85,
  },
  serviceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.brand.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.circle,
    gap: 6,
  },
  badgeActive: {
    backgroundColor: COLORS.semantic.successBg,
  },
  badgeInactive: {
    backgroundColor: COLORS.neutral[100],
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeDotActive: {
    backgroundColor: COLORS.semantic.success,
  },
  badgeDotInactive: {
    backgroundColor: COLORS.neutral[400],
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: COLORS.semantic.successText,
  },
  badgeTextInactive: {
    color: COLORS.neutral[600],
  },
  serviceCardBody: {
    gap: 4,
  },
  serviceCategoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.brand[700],
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  serviceCode: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.neutral[500],
  },
  serviceDescription: {
    fontSize: 13,
    color: COLORS.neutral[600],
    lineHeight: 18,
    marginTop: 4,
  },
  serviceCardFooter: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[100],
    paddingTop: SPACING[12],
  },
  configureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  configureBtnActive: {
    backgroundColor: COLORS.brand.light,
    borderColor: COLORS.brand[500],
  },
  configureBtnDisabled: {
    backgroundColor: COLORS.neutral[50],
    borderColor: COLORS.neutral[200],
  },
  configureBtnPressed: {
    backgroundColor: COLORS.brand.light,
  },
  configureBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  configureBtnTextActive: {
    color: COLORS.brand[700],
  },
  configureBtnTextDisabled: {
    color: COLORS.neutral[400],
  },

  // BREADCRUMBS & BANNERS
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.brand[700],
  },
  breadcrumbDivider: {
    color: COLORS.neutral[400],
  },
  breadcrumbCurrent: {
    fontSize: 13,
    color: COLORS.neutral[600],
    fontWeight: '500',
  },
  serviceBanner: {
    backgroundColor: COLORS.brand[900],
    borderRadius: RADIUS.card,
    padding: SPACING[20],
  },
  serviceBannerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[16],
  },
  bannerIconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.button,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitleBox: {
    gap: 2,
  },
  bannerCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.brand[500],
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.neutral.white,
  },
  bannerSubtext: {
    fontSize: 12,
    color: COLORS.neutral[300],
  },

  // LEVEL 2: VARIANTS CARD
  variantsCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[20],
    gap: SPACING[16],
    ...SHADOWS.card,
  },
  cardHeaderNoBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  variantsHeader: {
    gap: 2,
    flex: 1,
    marginRight: SPACING[16],
  },
  variantsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  variantsSubtitle: {
    fontSize: 12,
    color: COLORS.neutral[500],
  },
  variantList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[12],
  },
  variantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    gap: SPACING[12],
  },
  variantPillSelected: {
    backgroundColor: COLORS.brand.light,
    borderColor: COLORS.brand[500],
  },
  variantPillUnselected: {
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
  },
  variantSelectClick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  variantPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  variantPillTextSelected: {
    color: COLORS.brand[800],
  },
  variantPillTextUnselected: {
    color: COLORS.neutral[700],
  },
  variantToggleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.neutral[200],
    paddingLeft: SPACING[12],
  },
  variantToggleLabel: {
    fontSize: 11,
    color: COLORS.neutral[500],
  },

  // WORKSPACE TAB STRIP
  workspaceTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    paddingBottom: SPACING[4],
  },
  workspaceTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  workspaceTabActive: {
    backgroundColor: COLORS.brand.light,
    borderColor: COLORS.brand[500],
  },
  workspaceTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.neutral[600],
  },
  workspaceTabTextActive: {
    color: COLORS.brand[700],
  },

  // SECTION CARDS
  sectionCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[20],
    gap: SPACING[16],
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
    paddingBottom: SPACING[12],
  },
  cardHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: SPACING[16],
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.brand.light,
    paddingHorizontal: SPACING[12],
    paddingVertical: 6,
    borderRadius: RADIUS.circle,
    borderWidth: 1,
    borderColor: COLORS.brand[500],
  },
  addSmallBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.brand[700],
  },
  emptyState: {
    paddingVertical: SPACING[24],
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.neutral[400],
  },

  // MODAL OVERLAY STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[20],
  },
  modalContent: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    padding: SPACING[24],
    gap: SPACING[16],
    ...SHADOWS.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  modalSubtext: {
    fontSize: 13,
    color: COLORS.neutral[500],
    marginTop: -8,
  },
  modalForm: {
    gap: SPACING[12],
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.neutral[700],
  },
  modalInput: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.neutral[900],
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING[12],
    marginTop: SPACING[8],
  },
  modalCancelBtn: {
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.neutral[600],
  },
  modalSubmitBtn: {
    backgroundColor: COLORS.brand[600],
    paddingHorizontal: SPACING[20],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
  },
  modalSubmitBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral.white,
  },

  // LISTS & CARDS
  notesList: {
    gap: 10,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.neutral[50],
    borderRadius: RADIUS.button,
    padding: SPACING[12],
    gap: SPACING[12],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  noteNumberBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.brand[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteNumber: {
    color: COLORS.neutral.white,
    fontSize: 11,
    fontWeight: '700',
  },
  noteContentText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.neutral[800],
    lineHeight: 18,
  },
  deleteIconBtn: {
    padding: 4,
  },
  reqsList: {
    gap: 10,
  },
  reqCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.neutral[50],
    borderRadius: RADIUS.button,
    padding: SPACING[12],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  reqInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  reqName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.neutral[800],
  },
  reqActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  reqBadge: {
    paddingHorizontal: SPACING[8],
    paddingVertical: 3,
    borderRadius: RADIUS.circle,
  },
  reqBadgeMandatory: {
    backgroundColor: COLORS.semantic.errorBg,
  },
  reqBadgeOptional: {
    backgroundColor: COLORS.brand.light,
  },
  reqBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reqBadgeTextMandatory: {
    color: COLORS.semantic.errorText,
  },
  reqBadgeTextOptional: {
    color: COLORS.brand[700],
  },
  elementsList: {
    gap: SPACING[12],
  },
  elementCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.neutral[50],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[16],
  },
  elementMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flex: 1,
  },
  elementIconSmallBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.brand.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  elementTextGroup: {
    gap: 2,
    flex: 1,
  },
  elementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  elementNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  elementCodeBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.brand[700],
    backgroundColor: COLORS.brand.light,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  elementDescText: {
    fontSize: 12,
    color: COLORS.neutral[500],
  },
  elementRightControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[16],
  },
  elementStatColumn: {
    alignItems: 'flex-end',
  },
  elementFeeCountText: {
    fontSize: 11,
    color: COLORS.neutral[500],
  },
  elementTotalFeeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.semantic.success,
  },
  drillFeeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.brand.light,
    borderColor: COLORS.brand[500],
    borderWidth: 1,
    paddingHorizontal: SPACING[12],
    paddingVertical: 8,
    borderRadius: RADIUS.button,
  },
  drillFeeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.brand[700],
  },

  // LEVEL 3: ELEMENT FEES BANNER & TABLE
  elementBanner: {
    backgroundColor: COLORS.neutral[900],
    borderRadius: RADIUS.card,
    padding: SPACING[20],
  },
  elementBannerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  elementIconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.button,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  elementBannerContent: {
    flex: 1,
    marginLeft: SPACING[16],
    gap: 2,
  },
  elementBannerTag: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.brand[500],
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  elementBannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.neutral.white,
  },
  elementBannerSub: {
    fontSize: 12,
    color: COLORS.neutral[400],
  },
  totalFeeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    alignItems: 'flex-end',
  },
  totalFeeLabel: {
    fontSize: 11,
    color: COLORS.neutral[400],
  },
  totalFeeAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.semantic.success,
  },
  feeItemsTable: {
    gap: SPACING[8],
  },
  feeTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.neutral[50],
    paddingHorizontal: 14,
    paddingVertical: SPACING[12],
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  feeRowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  feeIndexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.semantic.successBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feeIndexText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.semantic.successText,
  },
  feeNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.neutral[800],
  },
  feeTypeText: {
    fontSize: 11,
    color: COLORS.neutral[500],
  },
  feeRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[16],
  },
  feeAmountText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
});
